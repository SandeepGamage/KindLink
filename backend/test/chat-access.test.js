const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const Appointment = require('../src/models/Appointment');
const Conversation = require('../src/models/Conversation');
const Message = require('../src/models/Message');
const User = require('../src/models/User');
const controller = require('../src/controllers/conversation.controller');

// --- In-memory store -------------------------------------------------------

let appointments = [];
let conversations = [];
let messages = [];
let users = [];

const same = (a, b) => String(a && a._id ? a._id : a) === String(b && b._id ? b._id : b);

/** A thenable query stub supporting the chain methods the code under test uses. */
const query = (resolve) => {
  const q = {
    select: () => q,
    sort: () => q,
    limit: () => q,
    populate: () => q,
    lean: () => q,
    then: (onOk, onErr) => Promise.resolve().then(resolve).then(onOk, onErr)
  };
  return q;
};

Appointment.findOne = (filter) =>
  query(() =>
    appointments.find(
      (a) => same(a.requester, filter.requester) && same(a.provider, filter.provider) && filter.status.$in.includes(a.status)
    ) || null
  );
Appointment.find = (filter) =>
  query(() =>
    appointments.filter((a) => {
      const field = filter.provider ? 'provider' : 'requester';
      return same(a[field], filter[field]) && filter.status.$in.includes(a.status);
    })
  );

Conversation.findById = async (id) => conversations.find((c) => same(c._id, id)) || null;
Conversation.updateOne = async (filter, update) => {
  const c = conversations.find((x) => same(x._id, filter._id));
  Object.assign(c, update.$set);
};

User.findById = (id) => query(() => users.find((u) => same(u._id, id)) || null);

Message.findOne = (filter) =>
  query(() => messages.find((m) => same(m.sender, filter.sender) && m.clientId === filter.clientId) || null);
Message.find = (filter) => query(() => messages.filter((m) => same(m.conversation, filter.conversation)));
Message.create = async (doc) => {
  const m = { _id: new mongoose.Types.ObjectId(), isRead: false, readAt: null, createdAt: new Date(), ...doc };
  messages.push(m);
  return m;
};
Message.updateMany = async (filter, update) => {
  let modifiedCount = 0;
  for (const m of messages) {
    if (same(m.conversation, filter.conversation) && same(m.recipient, filter.recipient) && !m.isRead) {
      Object.assign(m, update.$set);
      modifiedCount += 1;
    }
  }
  return { modifiedCount };
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

async function call(handler, user, { params = {}, body = {}, query: q = {} } = {}) {
  const res = createMockRes();
  await handler({ user, params, body, query: q }, res);
  return res;
}

// --- Fixtures --------------------------------------------------------------

let elder;
let volunteer;
let outsider;
let conversation;
let appointment;

beforeEach(() => {
  elder = { _id: new mongoose.Types.ObjectId(), role: 'elderly', name: 'Mary', isActive: true };
  volunteer = { _id: new mongoose.Types.ObjectId(), role: 'volunteer', name: 'Alex', isActive: true };
  outsider = { _id: new mongoose.Types.ObjectId(), role: 'volunteer', name: 'Eve', isActive: true };
  users = [elder, volunteer, outsider];

  appointment = { _id: new mongoose.Types.ObjectId(), requester: elder._id, provider: volunteer._id, status: 'accepted' };
  appointments = [appointment];

  conversation = { _id: new mongoose.Types.ObjectId(), elder: elder._id, volunteer: volunteer._id, connection: appointment._id };
  conversations = [conversation];
  messages = [];
});

const send = (user, content, clientId) =>
  call(controller.sendMessage, user, { params: { id: String(conversation._id) }, body: { content, clientId } });

// --- Tests -----------------------------------------------------------------

test('participants of an approved connection can message each other', async () => {
  const sent = await send(elder, '  Hello Alex  ');
  assert.equal(sent.statusCode, 201);
  assert.equal(sent.body.data.message.content, 'Hello Alex');
  assert.ok(same(sent.body.data.message.recipient, volunteer._id));
  assert.equal(conversation.lastMessageSnippet, 'Hello Alex');

  const reply = await send(volunteer, 'Hi Mary');
  assert.equal(reply.statusCode, 201);
  assert.ok(same(reply.body.data.message.recipient, elder._id));
});

test('users outside the pair can neither read nor post', async () => {
  await send(elder, 'Private');
  const params = { id: String(conversation._id) };

  const read = await call(controller.getMessages, outsider, { params });
  assert.equal(read.statusCode, 404);

  const post = await send(outsider, 'Let me in');
  assert.equal(post.statusCode, 404);

  const detail = await call(controller.getConversation, outsider, { params });
  assert.equal(detail.statusCode, 404);

  const markRead = await call(controller.markConversationRead, outsider, { params });
  assert.equal(markRead.statusCode, 404);
  assert.equal(messages[0].isRead, false);
});

test('malformed conversation ids are answered with 404', async () => {
  const res = await call(controller.getMessages, elder, { params: { id: 'not-an-id' } });
  assert.equal(res.statusCode, 404);
});

test('chat locks once the connection is no longer approved', async (t) => {
  for (const status of ['pending', 'completed', 'cancelled']) {
    await t.test(`status ${status}`, async () => {
      appointment.status = status;
      const post = await send(volunteer, 'Are you there?');
      assert.equal(post.statusCode, 403);
      assert.equal(post.body.isChatClosed, true);

      // History stays readable, flagged as closed so the app disables the input.
      const read = await call(controller.getMessages, volunteer, { params: { id: String(conversation._id) } });
      assert.equal(read.statusCode, 200);
      assert.equal(read.body.data.isActive, false);
    });
  }
});

test('chat locks when the other participant is deactivated', async () => {
  volunteer.isActive = false;
  const post = await send(elder, 'Hello?');
  assert.equal(post.statusCode, 403);
});

test('empty and oversized messages are rejected', async () => {
  assert.equal((await send(elder, '   ')).statusCode, 400);
  assert.equal((await send(elder, 'x'.repeat(Message.MAX_LENGTH + 1))).statusCode, 400);
  assert.equal(messages.length, 0);
});

test('a retried send with the same clientId is stored once', async () => {
  const first = await send(elder, 'Only once', 'device-123');
  const retry = await send(elder, 'Only once', 'device-123');
  assert.equal(first.statusCode, 201);
  assert.equal(retry.statusCode, 200);
  assert.equal(messages.length, 1);
  assert.ok(same(first.body.data.message._id, retry.body.data.message._id));
});

test('marking read only affects messages addressed to the caller', async () => {
  await send(elder, 'From elder');
  await send(volunteer, 'From volunteer');

  const res = await call(controller.markConversationRead, elder, { params: { id: String(conversation._id) } });
  assert.equal(res.statusCode, 200);
  assert.equal(res.body.data.updated, 1);

  const fromElder = messages.find((m) => m.content === 'From elder');
  const fromVolunteer = messages.find((m) => m.content === 'From volunteer');
  assert.equal(fromElder.isRead, false);
  assert.equal(fromVolunteer.isRead, true);
});
