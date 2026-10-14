const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const Appointment = require('../src/models/Appointment');
const Notification = require('../src/models/Notification');
const appointmentController = require('../src/controllers/appointment.controller');

const appointments = new Map();
const notifications = new Map();

Appointment.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = { _id, ...doc, createdAt: new Date(), updatedAt: new Date() };
  appointments.set(String(_id), created);
  return created;
};

Appointment.findById = (id) => {
  const item = appointments.get(String(id));
  if (!item) {
    return {
      populate: () => ({ populate: () => Promise.resolve(null) }),
      then: (resolve) => Promise.resolve(null).then(resolve)
    };
  }

  const obj = {
    ...item,
    isModified: () => false,
    save: async function () {
      appointments.set(String(item._id), { ...item, ...this });
      return this;
    }
  };

  return {
    ...obj,
    populate: () => ({ populate: () => Promise.resolve(obj) }),
    then: (resolve) => Promise.resolve(obj).then(resolve)
  };
};

Appointment.find = (filter) => {
  const results = Array.from(appointments.values()).filter((appointment) => {
    return Object.entries(filter).every(([key, expected]) => {
      if (key === '$or') {
        return expected.some((clause) => Object.entries(clause).every(([clauseKey, clauseValue]) => {
          if (clauseValue && clauseValue.$exists !== undefined) {
            return clauseValue.$exists === (appointment[clauseKey] !== undefined);
          }
          return String(appointment[clauseKey]) === String(clauseValue);
        }));
      }

      if (expected && expected.$ne !== undefined) {
        return Array.isArray(appointment[key])
          ? !appointment[key].some((value) => String(value) === String(expected.$ne))
          : String(appointment[key]) !== String(expected.$ne);
      }

      return String(appointment[key]) === String(expected);
    });
  });

  return {
    populate: () => ({
      populate: () => ({
        sort: async () => results
      })
    })
  };
};

Notification.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = { _id, ...doc, createdAt: new Date() };
  notifications.set(String(_id), created);
  return created;
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

test('acceptAppointment lets a volunteer accept an open elder request', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    taskType: 'Companionship',
    title: 'Tea and conversation',
    requester: elderId,
    provider: null,
    status: 'pending',
    declinedBy: []
  });

  const res = createMockRes();
  await appointmentController.acceptAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, name: 'Open Request Volunteer', role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'accepted');
  assert.equal(String(res.body.data.provider), String(volunteerId));
  assert.match(res.body.data.safetyPin, /^\d{4}$/);
  assert.equal(notifications.size, 1);
  assert.equal(String([...notifications.values()][0].recipient), String(elderId));
});

test('declineAppointment records a volunteer decline without closing an open request', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    taskType: 'Grocery Shopping',
    title: 'Weekly groceries',
    requester: elderId,
    provider: null,
    status: 'pending',
    declinedBy: []
  });

  const res = createMockRes();
  await appointmentController.declineAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'pending');
  assert.deepEqual(res.body.data.declinedBy.map(String), [String(volunteerId)]);
  assert.equal(appointments.get(String(appointment._id)).declinedBy.length, 1);
});

test('declineAppointment does not duplicate a volunteer in declinedBy', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    taskType: 'Pet Care',
    title: 'Feed the cat',
    status: 'pending',
    declinedBy: [volunteerId]
  });

  const res = createMockRes();
  await appointmentController.declineAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.declinedBy.length, 1);
  assert.equal(String(res.body.data.declinedBy[0]), String(volunteerId));
});

test('declineAppointment reopens an accepted request when its volunteer declines', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    taskType: 'Medical Transport',
    title: 'Clinic visit',
    requester: elderId,
    provider: volunteerId,
    status: 'accepted',
    safetyPin: '1234',
    isPinVerified: true,
    declinedBy: []
  });

  const res = createMockRes();
  await appointmentController.declineAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'pending');
  assert.equal(res.body.data.provider, null);
  assert.equal(res.body.data.isPinVerified, false);
  assert.deepEqual(res.body.data.declinedBy.map(String), [String(volunteerId)]);
});

test('getAppointments hides pending requests previously declined by the volunteer', async () => {
  appointments.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const declinedRequest = await Appointment.create({
    title: 'Declined request',
    status: 'pending',
    provider: null,
    declinedBy: [volunteerId]
  });
  const availableRequest = await Appointment.create({
    title: 'Available request',
    status: 'pending',
    provider: null,
    declinedBy: []
  });

  let capturedFilter;
  const originalFind = Appointment.find;
  Appointment.find = (filter) => {
    capturedFilter = filter;
    return originalFind(filter);
  };

  const res = createMockRes();
  await appointmentController.getAppointments({
    user: { _id: volunteerId, role: 'volunteer' },
    query: { status: 'pending' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.count, 1);
  assert.deepEqual(capturedFilter.declinedBy, { $ne: volunteerId });
  assert.equal(res.body.data.some((item) => String(item._id) === String(declinedRequest._id)), false);
  assert.deepEqual(res.body.data.map((item) => item._id), [
    availableRequest._id
  ]);
});

test('getAppointments requests only the volunteer accepted tasks for a non-pending status', async () => {
  appointments.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const otherVolunteerId = new mongoose.Types.ObjectId();
  await Appointment.create({
    title: 'Volunteer completed task',
    status: 'completed',
    provider: volunteerId,
    declinedBy: []
  });
  await Appointment.create({
    title: 'Another volunteer task',
    status: 'completed',
    provider: otherVolunteerId,
    declinedBy: []
  });

  let capturedFilter;
  const originalFind = Appointment.find;
  Appointment.find = (filter) => {
    capturedFilter = filter;
    return originalFind(filter);
  };

  const res = createMockRes();
  await appointmentController.getAppointments({
    user: { _id: volunteerId, role: 'volunteer' },
    query: { status: 'completed' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.count, 1);
  assert.equal(String(res.body.data[0].provider), String(volunteerId));
  assert.deepEqual(capturedFilter, {
    status: 'completed',
    provider: volunteerId
  });
});

test('acceptAppointment rejects a request that is no longer pending', async () => {
  appointments.clear();
  notifications.clear();

  const appointment = await Appointment.create({
    title: 'Already completed',
    status: 'completed',
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.acceptAppointment({
    params: { id: String(appointment._id) },
    user: { _id: new mongoose.Types.ObjectId(), role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /completed/i);
  assert.equal(notifications.size, 0);
});

test('acceptAppointment returns not found for an unknown request', async () => {
  appointments.clear();
  notifications.clear();

  const res = createMockRes();
  await appointmentController.acceptAppointment({
    params: { id: new mongoose.Types.ObjectId().toString() },
    user: { _id: new mongoose.Types.ObjectId(), role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not found/i);
});

test('declineAppointment does not release an accepted request belonging to another volunteer', async () => {
  appointments.clear();
  notifications.clear();

  const assignedVolunteerId = new mongoose.Types.ObjectId();
  const otherVolunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Assigned task',
    status: 'accepted',
    provider: assignedVolunteerId,
    isPinVerified: true,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.declineAppointment({
    params: { id: String(appointment._id) },
    user: { _id: otherVolunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'accepted');
  assert.equal(String(res.body.data.provider), String(assignedVolunteerId));
  assert.equal(res.body.data.isPinVerified, true);
  assert.deepEqual(res.body.data.declinedBy.map(String), [String(otherVolunteerId)]);
});

test('verifyArrivalPin rejects a volunteer who is not assigned to the request', async () => {
  appointments.clear();
  notifications.clear();

  const assignedVolunteerId = new mongoose.Types.ObjectId();
  const otherVolunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Transport to clinic',
    status: 'accepted',
    provider: assignedVolunteerId,
    safetyPin: '2468',
    isPinVerified: false,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: String(appointment._id) },
    body: { pin: '2468' },
    user: { _id: otherVolunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /assigned volunteer/i);
  assert.equal(notifications.size, 0);
});

test('verifyArrivalPin rejects a missing PIN before looking up the request', async () => {
  appointments.clear();
  notifications.clear();
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: new mongoose.Types.ObjectId().toString() },
    body: {},
    user: { _id: new mongoose.Types.ObjectId(), role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /4-digit arrival PIN/i);
});

test('verifyArrivalPin marks an accepted request in progress and notifies the elder', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Visit the pharmacy',
    requester: elderId,
    status: 'accepted',
    provider: volunteerId,
    safetyPin: '2468',
    isPinVerified: false,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: String(appointment._id) },
    body: { pin: '2468' },
    user: { _id: volunteerId, name: 'Helpful Volunteer', role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'in_progress');
  assert.equal(res.body.data.isPinVerified, true);
  assert.ok(res.body.data.verifiedAt instanceof Date);
  assert.equal(notifications.size, 1);
  const notification = [...notifications.values()][0];
  assert.equal(notification.title, 'Volunteer Arrived & Verified');
  assert.equal(String(notification.recipient), String(elderId));
  assert.equal(notification.audience, 'elder');
});

test('verifyArrivalPin returns not found for an unknown request', async () => {
  appointments.clear();
  notifications.clear();
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: new mongoose.Types.ObjectId().toString() },
    body: { pin: '2468' },
    user: { _id: new mongoose.Types.ObjectId(), role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not found/i);
});

test('completeAppointment rejects a volunteer who is not assigned to the task', async () => {
  appointments.clear();
  notifications.clear();

  const assignedVolunteerId = new mongoose.Types.ObjectId();
  const otherVolunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Repair a light',
    status: 'in_progress',
    provider: assignedVolunteerId,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.completeAppointment({
    params: { id: String(appointment._id) },
    user: { _id: otherVolunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /assigned volunteer/i);
  assert.equal(notifications.size, 0);
});

test('completeAppointment marks the task completed and notifies the elder', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Grocery delivery',
    requester: elderId,
    status: 'in_progress',
    provider: volunteerId,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.completeAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, name: 'Helpful Volunteer', role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(res.body.data.status, 'completed');
  assert.equal(notifications.size, 1);
  const notification = [...notifications.values()][0];
  assert.equal(notification.title, 'Assistance Task Completed');
  assert.equal(String(notification.recipient), String(elderId));
  assert.equal(notification.audience, 'elder');
});

test('acceptAppointment resets PIN verification when a pending request is accepted', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Repeat assistance',
    status: 'pending',
    provider: null,
    safetyPin: '1357',
    isPinVerified: true,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.acceptAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, name: 'Returning Volunteer', role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'accepted');
  assert.equal(res.body.data.safetyPin, '1357');
  assert.equal(res.body.data.isPinVerified, false);
});

test('acceptAppointment does not notify an elder when the request has no requester', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Community task',
    status: 'pending',
    provider: null,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.acceptAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, name: 'Community Volunteer', role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.success, true);
  assert.equal(notifications.size, 0);
});

test('declineAppointment returns not found for an unknown request', async () => {
  appointments.clear();
  notifications.clear();
  const res = createMockRes();

  await appointmentController.declineAppointment({
    params: { id: new mongoose.Types.ObjectId().toString() },
    user: { _id: new mongoose.Types.ObjectId(), role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not found/i);
});

test('verifyArrivalPin rejects an incorrect PIN', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Incorrect PIN test',
    status: 'accepted',
    provider: volunteerId,
    safetyPin: '1357',
    isPinVerified: false,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: String(appointment._id) },
    body: { pin: '9999' },
    user: { _id: volunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /invalid 4-digit pin/i);
  assert.equal(notifications.size, 0);
});

test('verifyArrivalPin rejects an appointment without a generated PIN', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Missing PIN test',
    status: 'accepted',
    provider: volunteerId,
    safetyPin: null,
    isPinVerified: false,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: String(appointment._id) },
    body: { pin: '1357' },
    user: { _id: volunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /no safety pin/i);
});

test('verifyArrivalPin accepts surrounding whitespace in the correct PIN', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Whitespace PIN test',
    status: 'accepted',
    provider: volunteerId,
    safetyPin: '1357',
    isPinVerified: false,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.verifyArrivalPin({
    params: { id: String(appointment._id) },
    body: { pin: ' 1357 ' },
    user: { _id: volunteerId, role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.isPinVerified, true);
  assert.equal(res.body.data.status, 'in_progress');
});

test('completeAppointment returns not found for an unknown request', async () => {
  appointments.clear();
  notifications.clear();
  const res = createMockRes();

  await appointmentController.completeAppointment({
    params: { id: new mongoose.Types.ObjectId().toString() },
    user: { _id: new mongoose.Types.ObjectId(), role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 404);
  assert.equal(res.body.success, false);
  assert.match(res.body.message, /not found/i);
});

test('completeAppointment does not notify an elder when the request has no requester', async () => {
  appointments.clear();
  notifications.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  const appointment = await Appointment.create({
    title: 'Unlinked task',
    status: 'in_progress',
    provider: volunteerId,
    declinedBy: []
  });
  const res = createMockRes();

  await appointmentController.completeAppointment({
    params: { id: String(appointment._id) },
    user: { _id: volunteerId, name: 'Task Volunteer', role: 'volunteer' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.status, 'completed');
  assert.equal(notifications.size, 0);
});

test('getAppointments applies the volunteer pending filter and excludes declined requests', async () => {
  appointments.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  let capturedFilter;
  const originalFind = Appointment.find;
  Appointment.find = (filter) => {
    capturedFilter = filter;
    return originalFind(filter);
  };

  const res = createMockRes();
  await appointmentController.getAppointments({
    user: { _id: volunteerId, role: 'volunteer' },
    query: { status: 'pending' }
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(capturedFilter.status, 'pending');
  assert.deepEqual(capturedFilter.declinedBy, { $ne: volunteerId });
  assert.equal(capturedFilter.$or.length, 3);
});

test('getAppointments without a status includes volunteer-owned and open requests', async () => {
  appointments.clear();

  const volunteerId = new mongoose.Types.ObjectId();
  let capturedFilter;
  const originalFind = Appointment.find;
  Appointment.find = (filter) => {
    capturedFilter = filter;
    return originalFind(filter);
  };

  const res = createMockRes();
  await appointmentController.getAppointments({
    user: { _id: volunteerId, role: 'volunteer' },
    query: {}
  }, res);

  assert.equal(res.statusCode, 200);
  assert.equal(capturedFilter.status, undefined);
  assert.equal(capturedFilter.$or.length, 4);
  assert.deepEqual(capturedFilter.$or[0], { provider: volunteerId });
  assert.deepEqual(capturedFilter.$or[1], { declinedBy: volunteerId });
  assert.deepEqual(capturedFilter.$or[2], { provider: null, status: 'pending' });
  assert.deepEqual(capturedFilter.$or[3], { provider: { $exists: false }, status: 'pending' });
});
