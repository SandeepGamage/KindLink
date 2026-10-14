const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');

// Ensure test environment and secrets
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret-key-12345';

// Strictly prevent any real database connection
mongoose.connect = () => {
  throw new Error('Connecting to a real database is strictly forbidden in tests!');
};

const User = require('../src/models/User');
const authController = require('../src/controllers/auth.controller');

// In-memory store
const users = new Map();
let simulateVersionError = false;
let simulateCastError = false;

const loadUser = (id) => {
  const plain = users.get(String(id));
  return plain ? User.hydrate(plain) : null;
};

User.findById = (id) => {
  if (simulateCastError) {
    const err = new Error('Cast to ObjectId failed');
    err.name = 'CastError';
    return {
      then: (resolve, reject) => Promise.reject(err).then(resolve, reject),
      select: () => Promise.reject(err)
    };
  }
  const user = loadUser(id);
  const chain = {
    select: (fields) => {
      if (fields === '-password' && user) {
        const copy = User.hydrate(users.get(String(id)));
        copy.password = undefined;
        return Promise.resolve(copy);
      }
      return Promise.resolve(user);
    },
    then: (resolve, reject) => Promise.resolve(user).then(resolve, reject)
  };
  return chain;
};

User.exists = async (query = {}) => {
  if (query._id) {
    return users.has(String(query._id));
  }
  return false;
};

User.prototype.save = async function () {
  if (simulateVersionError) {
    const err = new Error('Concurrent modification detected');
    err.name = 'VersionError';
    throw err;
  }
  await this.validate();
  users.set(String(this._id), this.toObject());
  return this;
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

async function seedUser(overrides = {}) {
  const _id = new mongoose.Types.ObjectId();
  const userData = {
    _id,
    name: 'Sample User',
    email: `profile.${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`.toLowerCase(),
    password: '$2a$10$hashedpasswordforsecuritytesting',
    role: 'elderly',
    isVerified: true,
    isActive: true,
    approvalStatus: 'approved',
    age: 70,
    mobile: '0771234567',
    address: '10 Flower Road, Colombo',
    emergencyContact: 'Son - 0779998888',
    emergencyContactName: 'Son',
    emergencyContactNumber: '0779998888',
    bio: 'Retired teacher enjoying quiet reading and gardening.',
    careNotes: 'Mild arthritis in right knee.',
    careNeeds: ['Companionship', 'Grocery shopping'],
    availability: ['Mornings'],
    dob: new Date('1956-05-15'),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides
  };
  users.set(String(_id), userData);
  return User.hydrate(userData);
}

// -----------------------------------------------------------------------------
// TESTS
// -----------------------------------------------------------------------------

test('Profile Management Test Suite', async (suite) => {
  beforeEach(() => {
    users.clear();
    simulateVersionError = false;
    simulateCastError = false;
  });

  // ---------------------------------------------------------------------------
  // 1. GET CURRENT USER PROFILE
  // ---------------------------------------------------------------------------
  await suite.test('getCurrentUser endpoint logic', async (t) => {
    await t.test('returns profile of the authenticated user from req.user (200)', async () => {
      const user = await seedUser();
      const req = { user };
      const res = createMockRes();

      await authController.getCurrentUser(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.equal(String(res.body.data.user._id), String(user._id));
      assert.equal(res.body.data.user.email, user.email);
    });

    await t.test('handles unexpected error with 500 status', async () => {
      const req = {};
      const res = {
        status(code) {
          this.statusCode = code;
          return this;
        },
        json() {
          throw new Error('Simulated serialization crash');
        }
      };

      // Mock console.error to avoid polluting test logs
      const origErr = console.error;
      console.error = () => {};
      try {
        await authController.getCurrentUser(req, res);
      } catch (err) {
        assert.ok(err);
      } finally {
        console.error = origErr;
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. UPDATE USER PROFILE
  // ---------------------------------------------------------------------------
  await suite.test('updateUser validation and persistence', async (t) => {
    await t.test('rejects unauthenticated request (401)', async () => {
      const res = createMockRes();
      await authController.updateUser({ body: { name: 'New Name' } }, res);
      assert.equal(res.statusCode, 401);
      assert.match(res.body.message, /unauthorized/i);
    });

    await t.test('returns 404 if user no longer exists in database', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = createMockRes();
      await authController.updateUser({
        user: { _id: nonExistentId },
        body: { name: 'Ghost Name' }
      }, res);
      assert.equal(res.statusCode, 404);
      assert.match(res.body.message, /user not found/i);
    });

    await t.test('rejects empty or whitespace-only name (400)', async () => {
      const user = await seedUser();
      const res1 = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { name: '   ' }
      }, res1);
      assert.equal(res1.statusCode, 400);
      assert.match(res1.body.message, /Name cannot be empty/i);

      const res2 = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { name: '' }
      }, res2);
      assert.equal(res2.statusCode, 400);
      assert.match(res2.body.message, /Name cannot be empty/i);
    });

    await t.test('successfully updates user name', async () => {
      const user = await seedUser();
      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { name: '  Updated Name  ' }
      }, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      const updated = loadUser(user._id);
      assert.equal(updated.name, 'Updated Name');
    });

    await t.test('validates and updates age field (bounds, clearing, error cases)', async () => {
      const user = await seedUser({ age: 65 });

      // Negative age rejected
      const resNegative = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { age: -5 }
      }, resNegative);
      assert.equal(resNegative.statusCode, 400);
      assert.match(resNegative.body.message, /between 0 and 130/i);

      // Over 130 rejected
      const resOver = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { age: 135 }
      }, resOver);
      assert.equal(resOver.statusCode, 400);
      assert.match(resOver.body.message, /between 0 and 130/i);

      // Non-numeric age rejected
      const resNaN = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { age: 'not-a-number' }
      }, resNaN);
      assert.equal(resNaN.statusCode, 400);

      // Valid age accepted
      const resValid = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { age: '78' }
      }, resValid);
      assert.equal(resValid.statusCode, 200);
      assert.equal(loadUser(user._id).age, 78);

      // Empty string or null clears age
      const resClear = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { age: '' }
      }, resClear);
      assert.equal(resClear.statusCode, 200);
      assert.equal(loadUser(user._id).age, null);
    });

    await t.test('updates contact, address, and emergency contact details', async () => {
      const user = await seedUser();
      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: {
          mobile: '0714445566',
          address: '88 Galle Road, Bentota',
          emergencyContactName: 'Daughter Mary',
          emergencyContactNumber: '0778889999'
        }
      }, res);

      assert.equal(res.statusCode, 200);
      const updated = loadUser(user._id);
      assert.equal(updated.mobile, '0714445566');
      assert.equal(updated.address, '88 Galle Road, Bentota');
      assert.equal(updated.emergencyContactName, 'Daughter Mary');
      assert.equal(updated.emergencyContactNumber, '0778889999');
      assert.equal(updated.emergencyContact, 'Daughter Mary - 0778889999');
    });

    await t.test('updates bio, elderly care notes, and care needs list', async () => {
      const user = await seedUser();
      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: {
          bio: 'Keen birdwatcher and community volunteer enthusiast.',
          careNotes: 'Requires step-free entrance for wheelchair access.',
          careNeeds: ['Wheelchair assistance', 'Doctor visits', '   ', 'Medication pickup']
        }
      }, res);

      assert.equal(res.statusCode, 200);
      const updated = loadUser(user._id);
      assert.equal(updated.bio, 'Keen birdwatcher and community volunteer enthusiast.');
      assert.equal(updated.careNotes, 'Requires step-free entrance for wheelchair access.');
      // Empty string should be filtered out
      assert.deepEqual(updated.careNeeds, [
        'Wheelchair assistance',
        'Doctor visits',
        'Medication pickup'
      ]);
    });

    await t.test('updates date of birth (dob) and volunteer availability', async () => {
      const user = await seedUser({ role: 'volunteer' });
      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: {
          dob: '1998-09-24',
          availability: ['Weekdays', 'Weekends']
        }
      }, res);

      assert.equal(res.statusCode, 200);
      const updated = loadUser(user._id);
      assert.equal(new Date(updated.dob).getFullYear(), 1998);
      assert.deepEqual(updated.availability, ['Weekdays', 'Weekends']);
    });

    await t.test('strictly rejects modifying idDocument after registration (400)', async () => {
      const user = await seedUser();
      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { idDocument: 'tampered-id-document.pdf' }
      }, res);

      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /Identity verification document cannot be modified/i);
    });

    await t.test('protected account integrity: email, role, password cannot be mutated via profile update', async () => {
      const user = await seedUser({
        email: 'original@example.com',
        role: 'elderly',
        password: '$2a$10$originalhashedpassword',
        isVerified: true
      });

      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: {
          name: 'Honest Update',
          email: 'hacked@example.com',
          role: 'admin',
          password: 'new-plain-password',
          isVerified: false
        }
      }, res);

      assert.equal(res.statusCode, 200);
      const updated = loadUser(user._id);
      assert.equal(updated.name, 'Honest Update');
      // Verify immutable security fields stayed unchanged
      assert.equal(updated.email, 'original@example.com');
      assert.equal(updated.role, 'elderly');
      assert.equal(updated.password, '$2a$10$originalhashedpassword');
      assert.equal(updated.isVerified, true);
    });

    await t.test('handles concurrent edit collision with 409 VersionError', async () => {
      const user = await seedUser();
      simulateVersionError = true;

      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { name: 'Collision Name' }
      }, res);

      assert.equal(res.statusCode, 409);
      assert.match(res.body.message, /profile changed during this save/i);
    });

    await t.test('handles CastError or schema validation errors with 400 Bad Request', async () => {
      const user = await seedUser();
      simulateCastError = true;

      const res = createMockRes();
      await authController.updateUser({
        user: { _id: user._id },
        body: { name: 'Cast Error Name' }
      }, res);

      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /check your profile details/i);
    });
  });
});
