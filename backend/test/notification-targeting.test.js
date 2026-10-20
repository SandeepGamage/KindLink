// Notification targeting tests: who receives which notifications, per-user
// read/hidden state, and admin-only broadcast management.
//
// Test types:
//   [Positive]  - valid input / authorised user, expects success
//   [Negative]  - invalid input / unauthorised user, expects rejection
//   [Edge case] - boundary values, state transitions, retries or legacy data
const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const Appointment = require('../src/models/Appointment');
const Notification = require('../src/models/Notification');
const appointmentController = require('../src/controllers/appointment.controller');
const notificationController = require('../src/controllers/notification.controller');

// In-memory store for mocks
const appointments = new Map();
let created = [];

Appointment.findById = async (id) => {
  const item = appointments.get(String(id));
  if (!item) return null;
  return {
    ...item,
    save: async function () {
      appointments.set(String(item._id), { ...item, ...this });
      return this;
    }
  };
};

Notification.create = async (doc) => {
  created.push(doc);
  return { _id: new mongoose.Types.ObjectId(), ...doc };
};

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

function seedAppointment(elderId, volunteerId) {
  const _id = new mongoose.Types.ObjectId();
  appointments.set(String(_id), {
    _id,
    title: 'Grocery run',
    preferredTime: '10:00 AM',
    requester: elderId,
    provider: volunteerId,
    status: 'accepted'
  });
  return _id;
}

async function cancelAs(user, appointmentId) {
  created = [];
  const res = createMockRes();
  await appointmentController.cancelAppointment(
    { params: { id: appointmentId }, body: { reason: 'Personal emergency' }, user },
    res
  );
  assert.equal(res.statusCode, 200);
  return created;
}

test('Cancellation notifies only the other party of the appointment', async (t) => {
  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();

  // [Positive] Elder cancels: only the volunteer gets a notification.
  await t.test('elder cancels: only the assigned volunteer is notified', async () => {
    const id = seedAppointment(elderId, volunteerId);
    const sent = await cancelAs({ _id: elderId, role: 'elderly', name: 'Mary' }, id);
    assert.equal(sent.length, 1);
    assert.equal(String(sent[0].recipient), String(volunteerId));
    assert.equal(sent[0].audience, 'volunteer');
  });

  // [Positive] Volunteer cancels: only the elder gets a notification.
  await t.test('volunteer cancels: only the elder is notified', async () => {
    const id = seedAppointment(elderId, volunteerId);
    const sent = await cancelAs({ _id: volunteerId, role: 'volunteer', name: 'Sam' }, id);
    assert.equal(sent.length, 1);
    assert.equal(String(sent[0].recipient), String(elderId));
    assert.equal(sent[0].audience, 'elder');
  });

  // [Positive] Admin cancels: elder and volunteer each get their own notification.
  await t.test('admin cancels: both parties are notified individually', async () => {
    const id = seedAppointment(elderId, volunteerId);
    const sent = await cancelAs({ _id: new mongoose.Types.ObjectId(), role: 'admin', name: 'Admin' }, id);
    assert.deepEqual(
      sent.map((n) => String(n.recipient)).sort(),
      [String(elderId), String(volunteerId)].sort()
    );
    assert.ok(sent.every((n) => n.recipient));
  });
});

test('Notification feed is scoped to the caller role and identity', async (t) => {
  let capturedFilter;
  Notification.find = (filter) => {
    capturedFilter = filter;
    return { sort: () => ({ lean: async () => [] }) };
  };

  const fetchAs = async (user) => {
    await notificationController.getNotifications({ user }, createMockRes());
    return capturedFilter;
  };

  // [Positive] Volunteer feed = direct messages + volunteer/all broadcasts.
  await t.test('volunteer sees own messages and volunteer/all broadcasts', async () => {
    const userId = new mongoose.Types.ObjectId();
    const filter = await fetchAs({ _id: userId, role: 'volunteer' });
    assert.equal(filter.status, 'sent');
    assert.deepEqual(filter.$or, [
      { recipient: userId },
      { recipient: null, audience: { $in: ['all', 'volunteer', null] } }
    ]);
  });

  // [Edge case] Broadcasts older than the account (incl. legacy rows with no sentAt) are hidden.
  await t.test('broadcasts sent before the account was created are hidden', async () => {
    const userId = new mongoose.Types.ObjectId();
    const createdAt = new Date('2026-10-01T00:00:00Z');
    const filter = await fetchAs({ _id: userId, role: 'volunteer', createdAt });
    assert.deepEqual(filter.$or, [
      { recipient: userId },
      {
        recipient: null,
        audience: { $in: ['all', 'volunteer', null] },
        $or: [
          { sentAt: { $gte: createdAt } },
          { sentAt: null, createdAt: { $gte: createdAt } }
        ]
      }
    ]);
  });

  // [Positive] Elder feed = direct messages + elder/all broadcasts ('senior' is a role alias).
  for (const role of ['elderly', 'senior']) {
    await t.test(`${role} sees own messages and elder/all broadcasts`, async () => {
      const userId = new mongoose.Types.ObjectId();
      const filter = await fetchAs({ _id: userId, role });
      assert.deepEqual(filter.$or[1].audience, { $in: ['all', 'elder', null] });
    });
  }
});

// [Edge case] Old notifications without a 'source' field are classified correctly.
test('resolveSource labels legacy rows the same way as BROADCAST_FILTER', () => {
  const userId = new mongoose.Types.ObjectId();
  // Explicit source always wins
  assert.equal(Notification.resolveSource({ source: 'admin', recipient: userId }), 'admin');
  assert.equal(Notification.resolveSource({ source: 'system', sender: 'Admin' }), 'system');
  // Legacy admin broadcasts: no recipient, sender 'Admin' or none
  assert.equal(Notification.resolveSource({ recipient: null, sender: 'Admin' }), 'admin');
  assert.equal(Notification.resolveSource({}), 'admin');
  // Legacy automatic messages: addressed to someone, or sent in a user's name
  assert.equal(Notification.resolveSource({ recipient: userId, sender: 'Sam' }), 'system');
  assert.equal(Notification.resolveSource({ recipient: null, sender: 'Mary' }), 'system');
});

test('Read and removed state is tracked per user on the server', async (t) => {
  const userId = new mongoose.Types.ObjectId();
  const otherId = new mongoose.Types.ObjectId();
  const user = { _id: userId, role: 'volunteer' };

  // [Positive] Feed shows the caller's own read flag, never other users' read/hidden lists.
  await t.test('feed reports only the caller\'s read flag and hides tracking lists', async () => {
    let capturedFilter;
    Notification.find = (filter) => {
      capturedFilter = filter;
      return {
        sort: () => ({
          lean: async () => [
            { _id: 'a', source: 'admin', readBy: [userId, otherId], hiddenBy: [otherId] },
            { _id: 'b', source: 'system', readBy: [otherId] }
          ]
        })
      };
    };
    const res = createMockRes();
    await notificationController.getNotifications({ user }, res);
    assert.deepEqual(capturedFilter.hiddenBy, { $ne: userId });
    assert.deepEqual(res.body.data.map((n) => n.read), [true, false]);
    assert.ok(res.body.data.every((n) => !('readBy' in n) && !('hiddenBy' in n)));
  });

  // [Positive] Read/unread toggles only the caller's entry in readBy.
  await t.test('marking read/unread only touches the caller and their own inbox', async () => {
    const calls = [];
    Notification.findOneAndUpdate = async (filter, update) => {
      calls.push({ filter, update });
      return { _id: filter._id };
    };
    const id = new mongoose.Types.ObjectId();

    let res = createMockRes();
    await notificationController.setReadStatus({ user, params: { id }, body: { read: true } }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(calls[0].update, { $addToSet: { readBy: userId } });
    assert.deepEqual(calls[0].filter.hiddenBy, { $ne: userId });
    assert.equal(calls[0].filter.status, 'sent');

    res = createMockRes();
    await notificationController.setReadStatus({ user, params: { id }, body: { read: false } }, res);
    assert.deepEqual(calls[1].update, { $pull: { readBy: userId } });
  });

  // [Negative] Acting on someone else's notification returns 404.
  await t.test('notifications outside the caller\'s inbox return 404', async () => {
    Notification.findOneAndUpdate = async () => null;
    const res = createMockRes();
    await notificationController.hideNotification(
      { user, params: { id: new mongoose.Types.ObjectId() } },
      res
    );
    assert.equal(res.statusCode, 404);
  });

  // [Positive] "Mark all read" only updates notifications in the caller's inbox.
  await t.test('mark all read is scoped to the caller\'s inbox', async () => {
    let captured;
    Notification.updateMany = async (filter, update) => {
      captured = { filter, update };
    };
    const res = createMockRes();
    await notificationController.markAllAsRead({ user }, res);
    assert.equal(res.statusCode, 200);
    assert.deepEqual(captured.update, { $addToSet: { readBy: userId } });
    assert.deepEqual(captured.filter.$or[0], { recipient: userId });
  });
});

test('sentAt records when a notification actually reaches users', async (t) => {
  // [Positive] sentAt is set for sent notifications and left null for drafts.
  await t.test('set on creation unless saved as a draft', () => {
    assert.ok(new Notification({ title: 't', message: 'm' }).sentAt instanceof Date);
    assert.equal(new Notification({ title: 't', message: 'm', status: 'draft' }).sentAt, null);
  });

  // [Edge case] Draft -> sent stamps sentAt; re-saving an already sent one keeps the original.
  await t.test('publishing a draft stamps sentAt; editing a sent one does not', async () => {
    let update;
    Notification.findByIdAndUpdate = async (id, u) => {
      update = u;
      return { _id: id, ...u };
    };
    const publish = async (status) => {
      Notification.findOne = async () => ({ _id: 'x', status });
      await notificationController.updateNotification(
        { params: { id: 'x' }, body: { status: 'sent' } },
        createMockRes()
      );
      return update;
    };
    assert.ok((await publish('draft')).sentAt instanceof Date);
    assert.equal((await publish('sent')).sentAt, undefined);
  });
});

test('Admin notification management only touches admin broadcasts', async (t) => {
  const admin = { _id: new mongoose.Types.ObjectId(), role: 'admin' };

  // [Positive] Admin feed lists broadcasts only and strips per-user state.
  await t.test('admin feed lists broadcasts only, with no per-user state', async () => {
    let capturedFilter;
    Notification.find = (filter) => {
      capturedFilter = filter;
      return {
        sort: () => ({
          lean: async () => [
            { _id: 'a', source: 'admin', status: 'draft', readBy: [admin._id], hiddenBy: [admin._id] }
          ]
        })
      };
    };
    const res = createMockRes();
    await notificationController.getNotifications({ user: admin }, res);
    assert.deepEqual(capturedFilter, Notification.BROADCAST_FILTER);
    assert.equal(res.body.data[0].read, false);
    assert.ok(!('readBy' in res.body.data[0]) && !('hiddenBy' in res.body.data[0]));
  });

  // [Negative] A client-supplied source: 'system' is ignored; admin-created rows are 'admin'.
  await t.test('created notifications are always marked as admin broadcasts', async () => {
    created = [];
    const res = createMockRes();
    await notificationController.createNotification(
      { user: admin, body: { title: 't', message: 'm', audience: 'all', source: 'system' } },
      res
    );
    assert.equal(res.statusCode, 201);
    assert.equal(created[0].source, 'admin');
  });

  // [Negative] Admin cannot delete automatic (system) messages.
  await t.test('deleting an automatic message 404s and deletes nothing', async () => {
    let filter;
    Notification.findOne = async (f) => {
      filter = f;
      return null;
    };
    const res = createMockRes();
    await notificationController.deleteNotification(
      { user: admin, params: { id: new mongoose.Types.ObjectId() } },
      res
    );
    assert.equal(res.statusCode, 404);
    assert.deepEqual(filter.$or, Notification.BROADCAST_FILTER.$or);
  });

  // [Positive] Admin can delete their own broadcasts.
  await t.test('deleting a broadcast removes it', async () => {
    let deleted = false;
    Notification.findOne = async () => ({ deleteOne: async () => { deleted = true; } });
    const res = createMockRes();
    await notificationController.deleteNotification(
      { user: admin, params: { id: new mongoose.Types.ObjectId() } },
      res
    );
    assert.equal(res.statusCode, 200);
    assert.ok(deleted);
  });

  // [Negative] Admin cannot edit automatic (system) messages.
  await t.test('editing an automatic message 404s without updating', async () => {
    let updated = false;
    Notification.findOne = async () => null;
    Notification.findByIdAndUpdate = async () => {
      updated = true;
    };
    const res = createMockRes();
    await notificationController.updateNotification(
      { user: admin, params: { id: 'x' }, body: { title: 'new' } },
      res
    );
    assert.equal(res.statusCode, 404);
    assert.equal(updated, false);
  });

  // [Negative] Protected fields (source, readBy, recipient) in an edit are dropped.
  await t.test('edits apply only the allowed fields that were sent', async () => {
    let update;
    Notification.findOne = async () => ({ _id: 'x', status: 'sent' });
    Notification.findByIdAndUpdate = async (id, u) => {
      update = u;
      return { _id: id, ...u };
    };
    await notificationController.updateNotification(
      {
        user: admin,
        params: { id: 'x' },
        body: { title: 'new', source: 'system', readBy: [admin._id], recipient: admin._id }
      },
      createMockRes()
    );
    assert.deepEqual(update, { title: 'new' });
  });
});

// [Positive + Negative] Create/edit/delete routes require adminOnly; inbox routes stay open to all users.
test('Broadcast create, edit and delete routes are admin-only', () => {
  const router = require('../src/routes/notification.routes');
  const { adminOnly } = require('../src/middleware/auth.middleware');
  const handlersFor = (path, method) => {
    const layer = router.stack.find((l) => l.route && l.route.path === path && l.route.methods[method]);
    return layer.route.stack.filter((s) => s.method === method).map((s) => s.handle);
  };

  for (const [path, method] of [['/', 'post'], ['/:id', 'put'], ['/:id', 'delete']]) {
    assert.ok(handlersFor(path, method).includes(adminOnly), `${method.toUpperCase()} ${path}`);
  }
  // Inbox actions stay open to every signed-in user
  assert.ok(!handlersFor('/', 'get').includes(adminOnly));
  assert.ok(!handlersFor('/:id/read', 'put').includes(adminOnly));
});

// [Negative + Positive] Anonymous, volunteer and elderly users get 403; an admin passes through.
test('adminOnly rejects non-admins with 403', () => {
  const { adminOnly } = require('../src/middleware/auth.middleware');
  for (const user of [undefined, { role: 'volunteer' }, { role: 'elderly' }]) {
    const res = createMockRes();
    let called = false;
    adminOnly({ user }, res, () => { called = true; });
    assert.equal(res.statusCode, 403);
    assert.equal(called, false);
  }
  let called = false;
  adminOnly({ user: { role: 'admin' } }, createMockRes(), () => { called = true; });
  assert.ok(called);
});
