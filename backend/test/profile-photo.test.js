const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const sharp = require('sharp');
const jwt = require('jsonwebtoken');

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://photos.example.test';
process.env.SUPABASE_SECRET_KEY = 'test-only';
process.env.JWT_SECRET = 'test-only-secret';

const User = require('../src/models/User');
const driver = require('../src/config/storage/supabase.driver');
const { normalizeAvatar, MAX_AVATAR_BYTES } = require('../src/config/storage/validate-avatar');
const { ownsAvatar, storeAvatar } = require('../src/config/storage');
const { validateStartupConfig } = require('../src/config/jwt');
const users = new Map();
const files = new Map();
let storageFailure = false;
let saveFailure = false;
let lostAcknowledgement = false;

// Exercise real routes, authentication, validation, multipart parsing and image
// decoding. Only MongoDB persistence and the Supabase network boundary are fakes.
const load = (id) => users.has(String(id)) ? User.hydrate(users.get(String(id))) : null;
User.findOne = async ({ email }) => {
  const found = [...users.values()].find((user) => user.email === email);
  return found ? User.hydrate(found) : null;
};
User.findById = (id) => ({
  then: (resolve, reject) => Promise.resolve(load(id)).then(resolve, reject),
  select: async () => load(id)
});
User.exists = async ({ _id, profileImage }) => load(_id)?.profileImage === profileImage;
User.prototype.save = async function () {
  await this.validate();
  if (saveFailure) throw new Error('Simulated database failure');
  const current = users.get(String(this._id));
  if (current && current.__v !== this.__v) {
    const error = new Error('Simulated concurrent edit');
    error.name = 'VersionError';
    throw error;
  }
  if (!current && [...users.values()].some((user) => user.email === this.email)) {
    const error = new Error('Duplicate email');
    error.code = 11000;
    throw error;
  }
  this.__v = (this.__v ?? -1) + 1;
  users.set(String(this._id), this.toObject());
  if (lostAcknowledgement) throw new Error('Database reply lost after commit');
  return this;
};
User.prototype.deleteOne = async function () { users.delete(String(this._id)); };
driver.store = async (filename, buffer, { userId }) => {
  if (storageFailure) throw new Error('Simulated storage failure');
  const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/${filename}`;
  files.set(url, buffer);
  return url;
};
driver.remove = async (url) => { files.delete(url); return true; };

let server;
let origin;
let photo;
let elderly;
let volunteer;

before(async () => {
  photo = await sharp({ create: { width: 1280, height: 960, channels: 3, background: 'blue' } })
    .png().toBuffer();
  const app = express();
  app.use(express.json());
  app.use('/auth', require('../src/routes/auth.routes'));
  app.use('/uploads', require('../src/routes/upload.routes'));
  app.use('/admin', require('../src/routes/admin.routes'));
  server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  origin = `http://127.0.0.1:${server.address().port}`;
});
after(() => new Promise((resolve) => server.close(resolve)));

async function request(path, { payload = {}, image, token, method = 'POST' } = {}) {
  if (path === '/auth/register') payload = { password: 'Example@123', ...payload };
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let body;
  if (image) {
    body = new FormData();
    body.append('payload', JSON.stringify(payload));
    body.append('avatar', new Blob([image], { type: 'image/png' }), 'photo.png');
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }
  const response = await fetch(`${origin}${path}`, { method, headers, body });
  return { status: response.status, json: await response.json() };
}

test('profile pictures through signup, editing and deletion', async (t) => {
  await t.test('signup stores a real photo for each supported role', async () => {
    for (const role of ['elderly', 'volunteer']) {
      const result = await request('/auth/register', {
        payload: { name: 'Photo Test', email: `${role}@example.test`, password: 'Example@123', role }, image: photo
      });
      assert.equal(result.status, 201, result.json.message);
      const account = result.json.data;
      assert.ok(ownsAvatar(account.user.profileImage, account.user._id));
      assert.ok(files.has(account.user.profileImage));
      assert.equal(account.user.password, undefined);
      const metadata = await sharp(files.get(account.user.profileImage)).metadata();
      assert.equal(metadata.format, 'jpeg');
      assert.equal(metadata.width, metadata.height);
      assert.ok(metadata.width <= 1024);
      if (role === 'elderly') elderly = account;
      else volunteer = account;
    }
  });

  await t.test('a profile picture is optional and arrays survive multipart', async () => {
    const result = await request('/auth/register', {
      payload: { name: 'No Photo', email: 'none@example.test', role: 'elderly', careNeeds: ['Walking'] }
    });
    assert.equal(result.status, 201);
    assert.equal(result.json.data.user.profileImage, '');
    const update = await request('/auth/profile', { method: 'PUT', token: volunteer.token,
      payload: { availability: ['Weekends'], name: 'Updated Volunteer' }, image: photo });
    assert.equal(update.status, 200);
    assert.deepEqual(update.json.data.user.availability, ['Weekends']);
    assert.equal(update.json.data.user.name, 'Updated Volunteer');
  });

  await t.test('new URLs and admin roles cannot be supplied at signup', async () => {
    for (const extra of [{ role: 'admin' }, { profileImage: elderly.user.profileImage }]) {
      const result = await request('/auth/register', {
        payload: { name: 'Invalid', email: 'invalid@example.test', ...extra }
      });
      assert.equal(result.status, 400);
    }
  });

  await t.test('profile updates require authentication and reject another owner’s reference', async () => {
    assert.equal((await request('/auth/profile', { method: 'PUT', image: photo })).status, 401);
    const result = await request('/auth/profile', { method: 'PUT', token: volunteer.token,
      payload: { profileImage: elderly.user.profileImage } });
    assert.equal(result.status, 400);
    assert.ok(files.has(elderly.user.profileImage));
    const forged = jwt.sign({ id: elderly.user._id }, 'default_secret');
    assert.equal((await request('/auth/profile', { method: 'PUT', token: forged, image: photo })).status, 401);
  });

  await t.test('multipart requests reject duplicate files and conflicting photo changes', async () => {
    for (const duplicate of [false, true]) {
      const form = new FormData();
      form.append('payload', JSON.stringify(duplicate ? {} : { profileImage: '' }));
      form.append('avatar', new Blob([photo], { type: 'image/png' }), 'photo.png');
      if (duplicate) form.append('avatar', new Blob([photo], { type: 'image/png' }), 'second.png');
      const response = await fetch(`${origin}/auth/profile`, {
        method: 'PUT', headers: { Authorization: `Bearer ${elderly.token}` }, body: form
      });
      assert.equal(response.status, 400);
    }
  });

  await t.test('malformed, oversized and disguised images are rejected before storage', async () => {
    const count = files.size;
    for (const image of [Buffer.from('<svg></svg>'), Buffer.alloc(MAX_AVATAR_BYTES + 1)]) {
      assert.equal((await request('/auth/profile', { method: 'PUT', token: elderly.token, image })).status, 400);
    }
    await assert.rejects(normalizeAvatar({ buffer: photo, mimetype: 'image/jpeg' }), { status: 400 });
    const svg = Buffer.from('<svg width="10" height="10"><rect width="10" height="10"/></svg>');
    await assert.rejects(normalizeAvatar({ buffer: svg, mimetype: 'image/png' }), { status: 400 });
    assert.equal(files.size, count);
  });

  await t.test('invalid fields are validated before storing the image', async () => {
    const count = files.size;
    assert.equal((await request('/auth/profile', { method: 'PUT', token: elderly.token,
      payload: { age: -10 }, image: photo })).status, 400);
    assert.equal(files.size, count);
  });

  await t.test('storage failure preserves the old profile and signup creates no account', async () => {
    storageFailure = true;
    try {
      const result = await request('/auth/profile', { method: 'PUT', token: elderly.token,
        payload: { name: 'Not Saved' }, image: photo });
      assert.equal(result.status, 503);
      assert.equal(load(elderly.user._id).name, 'Photo Test');
      assert.ok(files.has(elderly.user.profileImage));
      const signup = await request('/auth/register', { payload: {
        name: 'Not Created', email: 'retry@example.test', role: 'volunteer'
      }, image: photo });
      assert.equal(signup.status, 503);
      assert.equal(await User.findOne({ email: 'retry@example.test' }), null);
    } finally { storageFailure = false; }
  });

  await t.test('a failed signup can be retried without duplicate accounts', async () => {
    const payload = { name: 'Retry', email: 'retry@example.test', role: 'volunteer' };
    assert.equal((await request('/auth/register', { payload, image: photo })).status, 201);
    const count = files.size;
    assert.equal((await request('/auth/register', { payload, image: photo })).status, 409);
    assert.equal(files.size, count);
  });

  await t.test('failed database saves clean up the new file and retain the old photo', async () => {
    const count = files.size;
    saveFailure = true;
    try {
      assert.equal((await request('/auth/profile', { method: 'PUT', token: elderly.token, image: photo })).status, 500);
      assert.equal(files.size, count);
      assert.ok(files.has(elderly.user.profileImage));
    } finally { saveFailure = false; }
  });

  await t.test('an uncertain database acknowledgement never deletes a committed photo', async () => {
    lostAcknowledgement = true;
    try {
      assert.equal((await request('/auth/profile', { method: 'PUT', token: volunteer.token, image: photo })).status, 500);
      assert.ok(files.has(load(volunteer.user._id).profileImage));
    } finally { lostAcknowledgement = false; }
  });

  await t.test('replacement removes the old file only after saving; removal clears the photo', async () => {
    const previous = load(elderly.user._id).profileImage;
    const result = await request('/auth/profile', { method: 'PUT', token: elderly.token, image: photo });
    assert.equal(result.status, 200);
    const next = result.json.data.user.profileImage;
    assert.notEqual(previous, next);
    assert.ok(files.has(next));
    assert.ok(!files.has(previous));
    const removed = await request('/auth/profile', { method: 'PUT', token: elderly.token, payload: { profileImage: '' } });
    assert.equal(removed.status, 200);
    assert.equal(removed.json.data.user.profileImage, '');
    assert.ok(!files.has(next));
  });

  await t.test('competing photo saves cannot delete the winning image', async () => {
    const responses = await Promise.all([
      request('/auth/profile', { method: 'PUT', token: elderly.token, image: photo }),
      request('/auth/profile', { method: 'PUT', token: elderly.token, image: photo })
    ]);
    assert.ok(responses.some((response) => response.status === 200));
    assert.ok(responses.every((response) => [200, 409].includes(response.status)));
    const current = load(elderly.user._id).profileImage;
    assert.ok(files.has(current));
    assert.equal([...files.keys()].filter((url) => ownsAvatar(url, elderly.user._id)).length, 1);
  });

  await t.test('the legacy avatar endpoint persists the file without leaving an unattached upload', async () => {
    const previous = load(elderly.user._id).profileImage;
    const form = new FormData();
    form.append('avatar', new Blob([photo], { type: 'image/png' }), 'photo.png');
    const response = await fetch(`${origin}/uploads/avatar`, {
      method: 'POST', headers: { Authorization: `Bearer ${elderly.token}` }, body: form
    });
    assert.equal(response.status, 200);
    const { data } = await response.json();
    assert.equal(load(elderly.user._id).profileImage, data.url);
    assert.ok(files.has(data.url));
    assert.ok(!files.has(previous));
  });

  await t.test('path traversal and other users’ legacy paths fail ownership checks', () => {
    assert.equal(ownsAvatar(`/uploads/avatars/avatar-${elderly.user._id}-123.jpg`, elderly.user._id), true);
    assert.equal(ownsAvatar(`/uploads/avatars/avatar-${volunteer.user._id}-123.jpg`, elderly.user._id), false);
    assert.equal(ownsAvatar(`${elderly.user.profileImage}/../other.jpg`, elderly.user._id), false);
    assert.equal(ownsAvatar('https://untrusted.example/photo.jpg', elderly.user._id), false);
  });

  await t.test('account deletion removes the owner’s stored profile photo', async () => {
    const admin = new User({ name: 'Admin', email: 'admin@example.test', role: 'admin' });
    await admin.save();
    const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET);
    const url = load(volunteer.user._id).profileImage;
    const result = await request(`/admin/users/${volunteer.user._id}`, { method: 'DELETE', token });
    assert.equal(result.status, 200);
    assert.equal(load(volunteer.user._id), null);
    assert.ok(!files.has(url));
  });

  await t.test('startup configuration rejects missing JWT_SECRET', () => {
    const savedSecret = process.env.JWT_SECRET;
    try {
      delete process.env.JWT_SECRET;
      assert.throws(() => validateStartupConfig(), /FATAL: JWT_SECRET/);
    } finally {
      process.env.JWT_SECRET = savedSecret;
    }
  });

  await t.test('legacy avatar endpoint maps database failure to 500 instead of 503', async () => {
    saveFailure = true;
    try {
      const form = new FormData();
      form.append('avatar', new Blob([photo], { type: 'image/png' }), 'photo.png');
      const response = await fetch(`${origin}/uploads/avatar`, {
        method: 'POST', headers: { Authorization: `Bearer ${elderly.token}` }, body: form
      });
      assert.equal(response.status, 500);
    } finally {
      saveFailure = false;
    }
  });

  await t.test('storage failures retain original diagnostic cause', async () => {
    storageFailure = true;
    try {
      await assert.rejects(
        async () => {
          await storeAvatar({ buffer: photo, mimetype: 'image/png' }, elderly.user._id);
        },
        (err) => {
          assert.equal(err.status, 503);
          assert.ok(err.cause);
          assert.match(err.cause.message, /Simulated storage failure/);
          return true;
        }
      );
    } finally {
      storageFailure = false;
    }
  });

  await t.test('upload rate limits are enforced only on requests carrying an avatar', async () => {
    // Ordinary requests without a photo do not count against or trigger photo rate limits
    for (let i = 0; i < 35; i++) {
      const res = await request('/auth/profile', { method: 'PUT', token: elderly.token });
      assert.notEqual(res.status, 429);
    }
    let status;
    for (let attempt = 0; attempt < 31; attempt++) {
      status = (await request('/auth/profile', { method: 'PUT', token: elderly.token, image: photo })).status;
      if (status === 429) break;
    }
    assert.equal(status, 429);
  });
});
