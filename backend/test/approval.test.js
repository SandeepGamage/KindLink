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
// Minimal in-memory query matcher: equality plus the $ne / $gte operators the
// admin controller uses.
const matches = (doc, filter) => Object.entries(filter).every(([key, cond]) => {
  const value = doc[key];
  if (cond && typeof cond === 'object' && !(cond instanceof Date)) {
    if ('$ne' in cond) return value !== cond.$ne;
    if ('$gte' in cond) return value >= cond.$gte;
    return false;
  }
  return value === cond;
});
User.find = (filter = {}) => {
  const docs = [...users.values()].filter((doc) => matches(doc, filter)).map((doc) => User.hydrate(doc));
  const chain = { select: () => chain, sort: () => chain, then: (resolve, reject) => Promise.resolve(docs).then(resolve, reject) };
  return chain;
};
User.countDocuments = async (filter = {}) => [...users.values()].filter((doc) => matches(doc, filter)).length;

const Notification = require('../src/models/Notification');
Notification.countDocuments = async () => 0;
Notification.findOne = () => ({ sort: () => ({ select: async () => null }) });

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
    assert.ok(reloaded.approvalReviewedAt instanceof Date);
    assert.equal(String(reloaded.approvalReviewedBy), String(admin._id));
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
    assert.ok(reloaded.approvalReviewedAt instanceof Date);
  });

  await t.test('moving back to pending clears the review fields', async () => {
    const res = await request(`/admin/users/${volunteer._id}/approval`, {
      method: 'PUT',
      token: adminToken,
      payload: { status: 'pending' }
    });

    assert.equal(res.status, 200, res.json.message);
    const reloaded = load(volunteer._id);
    assert.equal(reloaded.approvalStatus, 'pending');
    assert.equal(reloaded.approvalReviewedAt, null);
    assert.equal(reloaded.approvalReviewedBy, null);
  });

  await t.test('approval status cannot be set on a non-volunteer', async () => {
    const res = await request(`/admin/users/${admin._id}/approval`, {
      method: 'PUT',
      token: adminToken,
      payload: { status: 'rejected' }
    });

    assert.equal(res.status, 400);
    assert.match(res.json.message, /volunteer/i);
  });

  await t.test('users list filters by approval status', async () => {
    const pending = await request('/admin/users?role=volunteer&approval=pending', {
      method: 'GET',
      token: adminToken
    });
    assert.equal(pending.status, 200, pending.json.message);
    assert.deepEqual(pending.json.data.map((u) => u._id), [String(volunteer._id)]);

    const approved = await request('/admin/users?role=volunteer&approval=approved', {
      method: 'GET',
      token: adminToken
    });
    assert.equal(approved.status, 200);
    assert.equal(approved.json.data.length, 0);
  });

  await t.test('dashboard stats count pending volunteer approvals', async () => {
    const res = await request('/admin/stats', { method: 'GET', token: adminToken });

    assert.equal(res.status, 200, res.json.message);
    assert.equal(res.json.data.pendingApprovals, 1);
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
