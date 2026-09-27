const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const sharp = require('sharp');

process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = 'https://photos.example.test';
process.env.SUPABASE_SECRET_KEY = 'test-only';
process.env.JWT_SECRET = 'test-only-secret';

const User = require('../src/models/User');
const driver = require('../src/config/storage/supabase.driver');
const { ownsDocument, ownsAvatar } = require('../src/config/storage');
const users = new Map();
const files = new Map();
let storageFailure = false;
let saveFailure = false;

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
  if (!user) return false;
  if (query.profileImage && user.profileImage !== query.profileImage) return false;
  if (query.idDocument && user.idDocument !== query.idDocument) return false;
  return true;
};
User.prototype.save = async function () {
  await this.validate();
  if (saveFailure) throw new Error('Simulated database failure');
  users.set(String(this._id), this.toObject());
  return this;
};

driver.store = async (filename, buffer, { userId }) => {
  if (storageFailure) throw new Error('Simulated storage failure');
  const url = `${process.env.SUPABASE_URL}/storage/v1/object/public/avatars/${userId}/${filename}`;
  files.set(url, buffer);
  return url;
};
driver.remove = async (url) => { files.delete(url); return true; };

let server;
let origin;
let nicImage;
let avatarPhoto;
let volunteerUser;

before(async () => {
  // Create rectangular ID card image (1600x1000, 1.6:1 aspect ratio like an NIC card)
  nicImage = await sharp({
    create: { width: 1600, height: 1000, channels: 3, background: 'green' }
  }).png().toBuffer();

  avatarPhoto = await sharp({
    create: { width: 800, height: 800, channels: 3, background: 'blue' }
  }).png().toBuffer();

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

async function request(path, { payload = {}, avatar, idDocument, token, method = 'POST' } = {}) {
  if (path === '/auth/register') payload = { password: 'Example@123', ...payload };
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  let body;
  if (avatar || idDocument) {
    body = new FormData();
    body.append('payload', JSON.stringify(payload));
    if (avatar) body.append('avatar', new Blob([avatar], { type: 'image/png' }), 'avatar.png');
    if (idDocument) body.append('idDocument', new Blob([idDocument], { type: 'image/png' }), 'nic_card.png');
  } else {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(payload);
  }
  const response = await fetch(`${origin}${path}`, { method, headers, body });
  return { status: response.status, json: await response.json() };
}

test('volunteer NIC / ID document upload and security', async (t) => {
  await t.test('volunteer signup accepts real NIC image and preserves aspect ratio', async () => {
    const result = await request('/auth/register', {
      payload: {
        name: 'Volunteer With NIC',
        email: 'volunteer.nic@example.test',
        role: 'volunteer',
        availability: ['Weekends']
      },
      idDocument: nicImage,
      avatar: avatarPhoto
    });

    assert.equal(result.status, 201, result.json.message);
    const user = result.json.data.user;
    volunteerUser = result.json.data;

    // Verify avatar was stored and square-cropped
    assert.ok(ownsAvatar(user.profileImage, user._id));
    const avatarMeta = await sharp(files.get(user.profileImage)).metadata();
    assert.equal(avatarMeta.width, avatarMeta.height);

    // Verify NIC document was stored, ownership is verified, and rectangular aspect ratio is preserved
    assert.ok(ownsDocument(user.idDocument, user._id));
    assert.ok(files.has(user.idDocument));

    const nicMeta = await sharp(files.get(user.idDocument)).metadata();
    assert.equal(nicMeta.format, 'jpeg');
    // Aspect ratio: 1600 / 1000 = 1.6
    assert.notEqual(nicMeta.width, nicMeta.height);
    const ratio = nicMeta.width / nicMeta.height;
    assert.ok(Math.abs(ratio - 1.6) < 0.05, `Expected aspect ratio ~1.6, got ${ratio}`);
  });

  await t.test('passing an idDocument URL string instead of a file is rejected', async () => {
    const result = await request('/auth/register', {
      payload: {
        name: 'Spoof Test',
        email: 'spoof@example.test',
        role: 'volunteer',
        idDocument: 'https://malicious-site.com/fake-nic.jpg'
      }
    });

    assert.equal(result.status, 400);
    assert.match(result.json.message, /Attach an ID document image file/i);
  });

  await t.test('idDocument is immutable and cannot be updated in updateUser', async () => {
    const fakeToken = require('jsonwebtoken').sign({ id: volunteerUser.user._id }, process.env.JWT_SECRET);

    // Attempting to send an idDocument file on profile update
    const fileAttempt = await request('/auth/profile', {
      method: 'PUT',
      token: fakeToken,
      payload: { name: 'New Name' },
      idDocument: nicImage
    });
    assert.equal(fileAttempt.status, 400);
    assert.match(fileAttempt.json.message, /cannot be modified/i);

    // Attempting to send idDocument field in JSON
    const jsonAttempt = await request('/auth/profile', {
      method: 'PUT',
      token: fakeToken,
      payload: { idDocument: 'something-else' }
    });
    assert.equal(jsonAttempt.status, 400);
    assert.match(jsonAttempt.json.message, /cannot be modified/i);
  });

  await t.test('corrupted or non-image files for idDocument are rejected', async () => {
    const badBuffer = Buffer.from('NOT_AN_IMAGE_FILE_DATA');
    const result = await request('/auth/register', {
      payload: {
        name: 'Corrupt Document',
        email: 'corrupt@example.test',
        role: 'volunteer'
      },
      idDocument: badBuffer
    });

    assert.equal(result.status, 400);
  });

  await t.test('database failure cleans up newly uploaded document', async () => {
    saveFailure = true;
    try {
      const result = await request('/auth/register', {
        payload: {
          name: 'Fail DB Save',
          email: 'dbfail@example.test',
          role: 'volunteer'
        },
        idDocument: nicImage
      });

      assert.equal(result.status, 500);
    } finally {
      saveFailure = false;
    }
  });
});
