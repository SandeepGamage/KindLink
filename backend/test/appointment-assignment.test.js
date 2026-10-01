const { test, before, after } = require('node:test');
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
const notifications = new Map();

// Mock Mongoose models for testing controller logic
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

Notification.find = (filter) => {
  let list = Array.from(notifications.values());
  if (filter.$or) {
    list = list.filter((n) => {
      return filter.$or.some((clause) => {
        if (clause.recipient) {
          return String(n.recipient) === String(clause.recipient);
        }
        if (clause.recipient === null) {
          return !n.recipient;
        }
        return true;
      });
    });
  }
  return {
    sort: () => Promise.resolve(list)
  };
};

test('createAppointment delivers targeted notification when provider is specified', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const volunteerId = new mongoose.Types.ObjectId();

  const req = {
    user: { _id: elderId, name: 'Mrs. Perera', role: 'elderly' },
    body: {
      taskType: 'Grocery Shopping',
      title: 'Weekly Groceries',
      preferredTime: 'Tomorrow 10am',
      location: 'Kandy',
      provider: volunteerId
    }
  };

  let responseData = null;
  let statusCode = 200;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };

  await appointmentController.createAppointment(req, res);

  assert.equal(statusCode, 201);
  assert.ok(responseData.success);
  assert.equal(String(responseData.data.provider), String(volunteerId));

  // Verify targeted notification was created
  const notifs = Array.from(notifications.values());
  assert.equal(notifs.length, 1);
  assert.equal(String(notifs[0].recipient), String(volunteerId));
  assert.equal(notifs[0].title, 'New Assistance Request Assigned');
  assert.equal(notifs[0].audience, 'volunteer');
});

test('createAppointment delivers broadcast notification when provider is not specified', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();

  const req = {
    user: { _id: elderId, name: 'Mr. Silva', role: 'elderly' },
    body: {
      taskType: 'Companionship',
      title: 'Tea & Chat',
      preferredTime: 'Friday 3pm',
      location: 'Colombo'
    }
  };

  let responseData = null;
  let statusCode = 200;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };

  await appointmentController.createAppointment(req, res);

  assert.equal(statusCode, 201);
  assert.ok(responseData.success);
  assert.equal(responseData.data.provider, null);

  // Verify broadcast notification was created
  const notifs = Array.from(notifications.values());
  assert.equal(notifs.length, 1);
  assert.equal(notifs[0].recipient, null);
  assert.equal(notifs[0].title, 'New Assistance Request Available');
  assert.equal(notifs[0].audience, 'volunteer');
});

test('acceptAppointment rejects non-assigned volunteer if appointment was reserved', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const designatedVolunteerId = new mongoose.Types.ObjectId();
  const otherVolunteerId = new mongoose.Types.ObjectId();

  const appointment = await Appointment.create({
    taskType: 'Medical Transport',
    title: 'Clinic Visit',
    requester: elderId,
    provider: designatedVolunteerId,
    status: 'pending'
  });

  const req = {
    params: { id: String(appointment._id) },
    user: { _id: otherVolunteerId, name: 'Other Volunteer', role: 'volunteer' }
  };

  let responseData = null;
  let statusCode = 200;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };

  await appointmentController.acceptAppointment(req, res);

  assert.equal(statusCode, 403);
  assert.equal(responseData.success, false);
});

test('acceptAppointment accepts and delivers notification to elder when accepted by assigned volunteer', async () => {
  appointments.clear();
  notifications.clear();

  const elderId = new mongoose.Types.ObjectId();
  const designatedVolunteerId = new mongoose.Types.ObjectId();

  const appointment = await Appointment.create({
    taskType: 'Medical Transport',
    title: 'Clinic Visit',
    requester: elderId,
    provider: designatedVolunteerId,
    status: 'pending'
  });

  const req = {
    params: { id: String(appointment._id) },
    user: { _id: designatedVolunteerId, name: 'Shanaka', role: 'volunteer' }
  };

  let responseData = null;
  let statusCode = 200;
  const res = {
    status: (code) => {
      statusCode = code;
      return {
        json: (data) => {
          responseData = data;
        }
      };
    }
  };

  await appointmentController.acceptAppointment(req, res);

  assert.equal(statusCode, 200);
  assert.equal(responseData.success, true);
  assert.equal(responseData.data.status, 'accepted');

  // Verify notification delivered to elder requester
  const notifs = Array.from(notifications.values());
  assert.equal(notifs.length, 1);
  assert.equal(String(notifs[0].recipient), String(elderId));
  assert.equal(notifs[0].title, 'Assistance Request Accepted');
  assert.equal(notifs[0].audience, 'elder');
});
