const { test } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';

const Appointment = require('../src/models/Appointment');
const Notification = require('../src/models/Notification');
const appointmentController = require('../src/controllers/appointment.controller');

// In-memory store for mocks
const appointments = new Map();
const notifications = new Map();

Appointment.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = {
    _id,
    ...doc,
    status: doc.status || 'pending',
    safetyPin: doc.safetyPin || null,
    isPinVerified: false,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  appointments.set(String(_id), created);
  return created;
};

Appointment.findById = (id) => {
  const item = appointments.get(String(id));
  if (!item) {
    return {
      populate: () => ({ populate: () => Promise.resolve(null) }),
      then: (r) => Promise.resolve(null).then(r)
    };
  }
  const obj = {
    ...item,
    save: async function () {
      appointments.set(String(item._id), { ...item, ...this });
      return this;
    }
  };
  return {
    ...obj,
    populate: () => ({ populate: () => Promise.resolve(obj) }),
    then: (r) => Promise.resolve(obj).then(r)
  };
};

Notification.create = async (doc) => {
  const _id = new mongoose.Types.ObjectId();
  const created = { _id, ...doc, createdAt: new Date() };
  notifications.set(String(_id), created);
  return created;
};

function createMockRes() {
  const res = {
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
  return res;
}

test('Safety PIN Lifecycle: Generate, Verify, and Complete', async (t) => {
  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();

  let appointmentId;

  await t.test('1. Elder creates appointment', async () => {
    const req = {
      user: { _id: elderId, name: 'Alice Elder', role: 'elderly' },
      body: {
        title: 'Grocery Assistance',
        taskType: 'Grocery Shopping',
        location: '123 Care Street',
        preferredTime: 'Tomorrow 10:00 AM'
      }
    };
    const res = createMockRes();
    await appointmentController.createAppointment(req, res);

    assert.equal(res.statusCode, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'pending');
    assert.equal(res.body.data.safetyPin, null);
    appointmentId = String(res.body.data._id);
  });

  let generatedPin;

  await t.test('2. Volunteer accepts appointment -> 4-digit PIN is generated', async () => {
    const req = {
      params: { id: appointmentId },
      user: { _id: volunteerId, name: 'Bob Volunteer', role: 'volunteer' }
    };
    const res = createMockRes();
    await appointmentController.acceptAppointment(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'accepted');
    assert.ok(res.body.data.safetyPin, 'safetyPin should be generated');
    assert.match(res.body.data.safetyPin, /^\d{4}$/, 'safetyPin must be a 4-digit string');
    assert.equal(res.body.data.isPinVerified, false);

    generatedPin = res.body.data.safetyPin;
  });

  await t.test('3. Volunteer enters incorrect PIN -> 400 Bad Request', async () => {
    const req = {
      params: { id: appointmentId },
      user: { _id: volunteerId, name: 'Bob Volunteer', role: 'volunteer' },
      body: { pin: '0000' }
    };
    const res = createMockRes();
    await appointmentController.verifyArrivalPin(req, res);

    assert.equal(res.statusCode, 400);
    assert.equal(res.body.success, false);
    assert.match(res.body.message, /invalid 4-digit pin/i);
  });

  await t.test('4. Volunteer enters correct PIN -> 200 OK, in_progress, verified', async () => {
    const req = {
      params: { id: appointmentId },
      user: { _id: volunteerId, name: 'Bob Volunteer', role: 'volunteer' },
      body: { pin: generatedPin }
    };
    const res = createMockRes();
    await appointmentController.verifyArrivalPin(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'in_progress');
    assert.equal(res.body.data.isPinVerified, true);
    assert.ok(res.body.data.verifiedAt, 'verifiedAt date should be set');
  });

  await t.test('5. Volunteer completes the task -> 200 OK, completed', async () => {
    const req = {
      params: { id: appointmentId },
      user: { _id: volunteerId, name: 'Bob Volunteer', role: 'volunteer' }
    };
    const res = createMockRes();
    await appointmentController.completeAppointment(req, res);

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.status, 'completed');
  });
});
