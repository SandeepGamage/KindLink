const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-secret';

const User = require('../src/models/User');
const users = new Map();

const load = (id) => users.has(String(id)) ? User.hydrate(users.get(String(id))) : null;
User.findOne = async ({ email }) => {
  const found = [...users.values()].find((user) => user.email === email);
  return found ? User.hydrate(found) : null;
};
User.findById = (id) => ({
  then: (resolve, reject) => Promise.resolve(load(id)).then(resolve, reject),
  select: async () => load(id)
});
User.exists = async (query) => {
  const user = load(query._id);
  return Boolean(user);
};
User.prototype.save = async function () {
  await this.validate();
  users.set(String(this._id), this.toObject());
  return this;
};

let server;
let origin;

before(async () => {
  const app = express();
  app.use(express.json());
  app.use('/auth', require('../src/routes/auth.routes'));
  app.use('/admin', require('../src/routes/admin.routes'));
  app.use('/appointments', require('../src/routes/appointment.routes'));
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});

after(() => new Promise((resolve) => server.close(resolve)));

function makeToken(user) {
  return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

async function request(path, { payload = {}, token, method = 'POST' } = {}) {
  if (path === '/auth/register') payload = { password: 'Example@123', ...payload };
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const body = ['GET', 'HEAD'].includes(method) ? undefined : JSON.stringify(payload);
  const response = await fetch(`${origin}${path}`, { method, headers, body });
  return { status: response.status, json: await response.json() };
}

test('volunteer approval status and gating', async (t) => {
  let volunteer;
  let volunteerToken;
  let admin;
  let adminToken;

  await t.test('volunteer registration defaults approvalStatus to pending', async () => {
    const res = await request('/auth/register', {
      payload: {
        name: 'Jane Volunteer',
        email: 'jane.volunteer@example.test',
        role: 'volunteer',
        availability: ['Weekends']
      }
    });

    assert.equal(res.status, 201, res.json.message);
    volunteer = res.json.data.user;
    volunteerToken = res.json.data.token;
    assert.equal(volunteer.approvalStatus, 'pending');
  });

  await t.test('elderly registration defaults approvalStatus to approved', async () => {
    const res = await request('/auth/register', {
      payload: {
        name: 'Senior User',
        email: 'senior.user@example.test',
        role: 'elderly'
      }
    });

    assert.equal(res.status, 201, res.json.message);
    const senior = res.json.data.user;
    assert.equal(senior.approvalStatus, 'approved');
  });

  await t.test('pending volunteer is blocked from volunteerApproved endpoint', async () => {
    const res = await request('/appointments/fake-id/accept', {
      method: 'PUT',
      token: volunteerToken
    });

    assert.equal(res.status, 403);
    assert.equal(res.json.isPendingApproval, true);
    assert.match(res.json.message, /pending admin approval/i);
  });

  await t.test('admin can approve volunteer', async () => {
    // Create admin
    const adminUser = new User({
      name: 'Admin Boss',
      email: 'admin.boss@example.test',
      role: 'admin',
      isVerified: true
    });
    await adminUser.save();
    admin = adminUser.toObject();
    adminToken = makeToken(admin);

    const approveRes = await request(`/admin/users/${volunteer._id}/approval`, {
      method: 'PUT',
      token: adminToken,
      payload: { status: 'approved' }
    });

    assert.equal(approveRes.status, 200, approveRes.json.message);
    assert.equal(approveRes.json.data.approvalStatus, 'approved');

    // Verify stored user is now approved
    const reloaded = load(volunteer._id);
    assert.equal(reloaded.approvalStatus, 'approved');
  });

  await t.test('admin can reject volunteer', async () => {
    const rejectRes = await request(`/admin/users/${volunteer._id}/approval`, {
      method: 'PUT',
      token: adminToken,
      payload: { status: 'rejected' }
    });

    assert.equal(rejectRes.status, 200);
    assert.equal(rejectRes.json.data.approvalStatus, 'rejected');

    const reloaded = load(volunteer._id);
    assert.equal(reloaded.approvalStatus, 'rejected');
  });

  await t.test('non-admin cannot update approval status', async () => {
    const res = await request(`/admin/users/${volunteer._id}/approval`, {
      method: 'PUT',
      token: volunteerToken,
      payload: { status: 'approved' }
    });

    assert.equal(res.status, 403);
  });
});
