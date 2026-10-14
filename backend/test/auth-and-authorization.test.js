const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Ensure test environment and secrets
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-only-jwt-secret-key-12345';

// Strictly prevent any real database connection
mongoose.connect = () => {
  throw new Error('Connecting to a real database is strictly forbidden in tests!');
};

const User = require('../src/models/User');
const authController = require('../src/controllers/auth.controller');
const authMiddleware = require('../src/middleware/auth.middleware');
const emailService = require('../src/services/email.service');

// In-memory user store
const users = new Map();

const loadUser = (id) => {
  const plain = users.get(String(id));
  return plain ? User.hydrate(plain) : null;
};

// Mock Mongoose model methods on User
User.findOne = async (query = {}) => {
  if (query.email) {
    const found = [...users.values()].find((u) => u.email === query.email.toLowerCase());
    return found ? User.hydrate(found) : null;
  }
  return null;
};

User.findById = (id) => {
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
    const user = users.get(String(query._id));
    return Boolean(user);
  }
  return false;
};

User.prototype.save = async function () {
  await this.validate();
  if (!this._id) {
    this._id = new mongoose.Types.ObjectId();
  }
  const obj = this.toObject();
  users.set(String(this._id), obj);
  return this;
};

// Helper to create mock Express Response
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

// Helper to seed a test user into memory
async function seedUser(overrides = {}) {
  const salt = await bcrypt.genSalt(10);
  const password = await bcrypt.hash('SecurePassword@123', salt);
  const _id = new mongoose.Types.ObjectId();
  const userData = {
    _id,
    name: 'Sample User',
    email: `sample.${Date.now()}.${Math.random().toString(36).substring(7)}@example.com`.toLowerCase(),
    password,
    role: 'elderly',
    isVerified: true,
    isActive: true,
    approvalStatus: 'approved',
    verificationAttempts: 0,
    resetPasswordAttempts: 0,
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

test('Authentication & Authorization Test Suite', async (suite) => {
  beforeEach(() => {
    users.clear();
  });

  // ---------------------------------------------------------------------------
  // 1. REGISTRATION
  // ---------------------------------------------------------------------------
  await suite.test('Registration flow and validation rules', async (t) => {
    await t.test('rejects registration with empty or missing name', async () => {
      const res = createMockRes();
      await authController.register({ body: { email: 'valid@example.com', password: 'Password@123' } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /full name/i);
    });

    await t.test('rejects registration with invalid email format', async () => {
      const res = createMockRes();
      await authController.register({ body: { name: 'Valid Name', email: 'invalid-email', password: 'Password@123' } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /valid email/i);
    });

    await t.test('rejects registration with missing email', async () => {
      const res = createMockRes();
      await authController.register({ body: { name: 'Valid Name', password: 'Password@123' } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /provide your email/i);
    });

    await t.test('rejects invalid roles (only elderly, senior, volunteer allowed)', async () => {
      const res = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'john@example.com', password: 'Password@123', role: 'admin' }
      }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /elderly or volunteer/i);
    });

    await t.test('rejects direct image or idDocument URL parameters (files required)', async () => {
      const res1 = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'john@example.com', password: 'Password@123', profileImage: 'http://hack.com/pic.jpg' }
      }, res1);
      assert.equal(res1.statusCode, 400);
      assert.match(res1.body.message, /Attach a photo file/i);

      const res2 = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'john@example.com', password: 'Password@123', idDocument: 'http://hack.com/id.jpg' }
      }, res2);
      assert.equal(res2.statusCode, 400);
      assert.match(res2.body.message, /Attach an ID document/i);
    });

    await t.test('rejects weak or excessively long passwords', async () => {
      const res1 = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'john@example.com', password: 'short' }
      }, res1);
      assert.equal(res1.statusCode, 400);
      assert.match(res1.body.message, /at least 8 characters/i);

      const res2 = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'john@example.com', password: 'a'.repeat(80) }
      }, res2);
      assert.equal(res2.statusCode, 400);
      assert.match(res2.body.message, /at most 72 UTF-8 bytes/i);
    });

    await t.test('rejects registration if verified account already exists (409 Conflict)', async () => {
      await seedUser({ email: 'existing@example.com', isVerified: true });
      const res = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'existing@example.com', password: 'Password@123', role: 'elderly' }
      }, res);
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /already exists\. Please log in/i);
    });

    await t.test('informs user if account is pending email verification (409 Conflict)', async () => {
      await seedUser({ email: 'pending@example.com', isVerified: false });
      const res = createMockRes();
      await authController.register({
        body: { name: 'John Doe', email: 'pending@example.com', password: 'Password@123', role: 'elderly' }
      }, res);
      assert.equal(res.statusCode, 409);
      assert.equal(res.body.isPendingVerification, true);
    });

    await t.test('successfully initiates elderly registration with approved status and hashed password', async () => {
      const res = createMockRes();
      await authController.register({
        body: {
          name: 'Jane Senior',
          email: 'jane.senior@example.com',
          password: 'Password@123',
          role: 'elderly member',
          age: '72',
          mobile: '0771234567',
          address: '45 Lotus Rd, Colombo',
          emergencyContactName: 'Alice',
          emergencyContactNumber: '0719876543',
          careNeeds: ['Mobility assistance', 'Groceries']
        }
      }, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.isVerified, false);
      assert.equal(res.body.data.user.role, 'elderly');
      assert.equal(res.body.data.user.approvalStatus, 'approved');
      assert.equal(res.body.data.user.password, undefined); // Sensitive field stripped

      // In-memory verification
      const saved = [...users.values()].find((u) => u.email === 'jane.senior@example.com');
      assert.ok(saved);
      assert.equal(saved.age, 72);
      assert.equal(saved.emergencyContact, 'Alice - 0719876543');
      assert.ok(saved.password.startsWith('$2')); // Bcrypt hash
    });

    await t.test('volunteer registration defaults approvalStatus to pending', async () => {
      const res = createMockRes();
      await authController.register({
        body: {
          name: 'Volunteer Bob',
          email: 'bob.volunteer@example.com',
          password: 'Password@123',
          role: 'volunteer',
          availability: ['Weekends', 'Evenings']
        }
      }, res);

      assert.equal(res.statusCode, 201);
      assert.equal(res.body.data.user.role, 'volunteer');
      assert.equal(res.body.data.user.approvalStatus, 'pending');
    });

    await t.test('handles email delivery failure with 503 Service Unavailable', async () => {
      const emailServicePath = require.resolve('../src/services/email.service');
      const authControllerPath = require.resolve('../src/controllers/auth.controller');
      
      const originalEmailModule = require.cache[emailServicePath];
      const originalAuthModule = require.cache[authControllerPath];

      delete require.cache[emailServicePath];
      delete require.cache[authControllerPath];

      require.cache[emailServicePath] = {
        id: emailServicePath,
        filename: emailServicePath,
        loaded: true,
        exports: {
          sendVerificationCodeEmail: async () => {
            throw new Error('SMTP Timeout');
          },
          sendPasswordResetEmail: async () => {
            throw new Error('SMTP Timeout');
          },
          getResendFromAddress: () => 'KindLink <onboarding@resend.dev>',
          escapeHtml: (s) => s
        }
      };

      const freshAuthController = require('../src/controllers/auth.controller');

      try {
        const res = createMockRes();
        await freshAuthController.register({
          body: {
            name: 'Offline Email User',
            email: 'offline@example.com',
            password: 'Password@123'
          }
        }, res);

        assert.equal(res.statusCode, 503);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /Could not deliver verification email/i);
      } finally {
        if (originalEmailModule) require.cache[emailServicePath] = originalEmailModule;
        else delete require.cache[emailServicePath];

        if (originalAuthModule) require.cache[authControllerPath] = originalAuthModule;
        else delete require.cache[authControllerPath];
      }
    });
  });

  // ---------------------------------------------------------------------------
  // 2. LOGIN
  // ---------------------------------------------------------------------------
  await suite.test('User login flow and authentication credentials', async (t) => {
    await t.test('rejects login with missing email or password (400)', async () => {
      const res1 = createMockRes();
      await authController.login({ body: { email: 'test@example.com' } }, res1);
      assert.equal(res1.statusCode, 400);

      const res2 = createMockRes();
      await authController.login({ body: { password: 'Password@123' } }, res2);
      assert.equal(res2.statusCode, 400);
    });

    await t.test('returns 401 when account does not exist', async () => {
      const res = createMockRes();
      await authController.login({ body: { email: 'nonexistent@example.com', password: 'Password@123' } }, res);
      assert.equal(res.statusCode, 401);
      assert.match(res.body.message, /Invalid credentials/i);
    });

    await t.test('returns 401 when password does not match', async () => {
      await seedUser({ email: 'user@example.com' });
      const res = createMockRes();
      await authController.login({ body: { email: 'user@example.com', password: 'WrongPassword@999' } }, res);
      assert.equal(res.statusCode, 401);
      assert.match(res.body.message, /Invalid credentials/i);
    });

    await t.test('intercepts unverified account with 403 and dispatches fresh code', async () => {
      await seedUser({ email: 'unverified@example.com', isVerified: false });
      const res = createMockRes();
      await authController.login({ body: { email: 'unverified@example.com', password: 'SecurePassword@123' } }, res);
      assert.equal(res.statusCode, 403);
      assert.equal(res.body.isUnverified, true);
      assert.match(res.body.message, /not verified yet/i);
    });

    await t.test('returns 429 if unverified user is locked out due to OTP attempts', async () => {
      await seedUser({
        email: 'locked@example.com',
        isVerified: false,
        verificationLockedUntil: new Date(Date.now() + 10 * 60 * 1000)
      });
      const res = createMockRes();
      await authController.login({ body: { email: 'locked@example.com', password: 'SecurePassword@123' } }, res);
      assert.equal(res.statusCode, 429);
      assert.equal(res.body.isUnverified, true);
      assert.match(res.body.message, /account is temporarily locked/i);
    });

    await t.test('successful login returns user object and valid JWT token (200)', async () => {
      const user = await seedUser({ email: 'verified@example.com', isVerified: true });
      const res = createMockRes();
      await authController.login({ body: { email: 'verified@example.com', password: 'SecurePassword@123' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);

      const decoded = jwt.verify(res.body.data.token, process.env.JWT_SECRET);
      assert.equal(decoded.id, String(user._id));
    });
  });

  // ---------------------------------------------------------------------------
  // 3. OTP VERIFICATION
  // ---------------------------------------------------------------------------
  await suite.test('6-digit email verification code flow (verifyCode)', async (t) => {
    await t.test('rejects missing email or code (400)', async () => {
      const res = createMockRes();
      await authController.verifyCode({ body: { email: 'test@example.com' } }, res);
      assert.equal(res.statusCode, 400);
    });

    await t.test('returns 404 for unknown email', async () => {
      const res = createMockRes();
      await authController.verifyCode({ body: { email: 'unknown@example.com', code: '123456' } }, res);
      assert.equal(res.statusCode, 404);
    });

    await t.test('returns 400 if user is already verified', async () => {
      await seedUser({ email: 'done@example.com', isVerified: true });
      const res = createMockRes();
      await authController.verifyCode({ body: { email: 'done@example.com', code: '123456' } }, res);
      assert.equal(res.statusCode, 400);
      assert.match(res.body.message, /already verified/i);
    });

    await t.test('returns 400 if verification code has expired', async () => {
      await seedUser({
        email: 'expired@example.com',
        isVerified: false,
        verificationCode: '123456',
        verificationCodeExpiresAt: new Date(Date.now() - 5000)
      });
      const res = createMockRes();
      await authController.verifyCode({ body: { email: 'expired@example.com', code: '123456' } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.isExpired, true);
    });

    await t.test('tracks incorrect attempts and locks after 5 failed attempts', async () => {
      const user = await seedUser({
        email: 'attempt@example.com',
        isVerified: false,
        verificationCode: '654321',
        verificationCodeExpiresAt: new Date(Date.now() + 600000),
        verificationAttempts: 4
      });

      const res = createMockRes();
      await authController.verifyCode({ body: { email: 'attempt@example.com', code: '000000' } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.remainingAttempts, 0);
      assert.equal(res.body.isLocked, true);

      // Verify persistent lock
      const reloaded = loadUser(user._id);
      assert.ok(reloaded.verificationLockedUntil > new Date());

      // Attempt while locked returns 429
      const lockRes = createMockRes();
      await authController.verifyCode({ body: { email: 'attempt@example.com', code: '654321' } }, lockRes);
      assert.equal(lockRes.statusCode, 429);
      assert.equal(lockRes.body.isLocked, true);
    });

    await t.test('successful verification marks user verified and returns token', async () => {
      const user = await seedUser({
        email: 'verify.success@example.com',
        isVerified: false,
        verificationCode: '778899',
        verificationCodeExpiresAt: new Date(Date.now() + 600000)
      });

      const res = createMockRes();
      await authController.verifyCode({ body: { email: 'verify.success@example.com', code: '778899' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.token);

      const verifiedDoc = loadUser(user._id);
      assert.equal(verifiedDoc.isVerified, true);
      assert.equal(verifiedDoc.verificationCode, '');
    });
  });

  // ---------------------------------------------------------------------------
  // 4. RESEND VERIFICATION CODE
  // ---------------------------------------------------------------------------
  await suite.test('Resend verification code rate limiting and delivery', async (t) => {
    await t.test('rejects missing email (400) or non-existent user (404)', async () => {
      const res1 = createMockRes();
      await authController.resendVerificationCode({ body: {} }, res1);
      assert.equal(res1.statusCode, 400);

      const res2 = createMockRes();
      await authController.resendVerificationCode({ body: { email: 'none@example.com' } }, res2);
      assert.equal(res2.statusCode, 404);
    });

    await t.test('enforces strict 60-second cooldown between resend requests (429)', async () => {
      await seedUser({
        email: 'cooldown@example.com',
        isVerified: false,
        verificationCode: '112233',
        verificationCodeExpiresAt: new Date(Date.now() + 9.8 * 60 * 1000) // Less than 60s elapsed from 10m
      });

      const res = createMockRes();
      await authController.resendVerificationCode({ body: { email: 'cooldown@example.com' } }, res);
      assert.equal(res.statusCode, 429);
      assert.match(res.body.message, /Please wait \d+ seconds/i);
    });

    await t.test('resends code successfully when cooldown has elapsed', async () => {
      await seedUser({
        email: 'ok.resend@example.com',
        isVerified: false,
        verificationCode: '112233',
        verificationCodeExpiresAt: new Date(Date.now() + 8 * 60 * 1000) // 2 mins elapsed
      });

      const res = createMockRes();
      await authController.resendVerificationCode({ body: { email: 'ok.resend@example.com' } }, res);
      assert.equal(res.statusCode, 200);
      assert.equal(res.body.success, true);
    });
  });

  // ---------------------------------------------------------------------------
  // 5. PASSWORD RESET FLOW
  // ---------------------------------------------------------------------------
  await suite.test('Forgot password, verify reset code, and reset password lifecycle', async (t) => {
    await t.test('requestPasswordReset validates email existence and triggers OTP', async () => {
      const res1 = createMockRes();
      await authController.requestPasswordReset({ body: {} }, res1);
      assert.equal(res1.statusCode, 400);

      const res2 = createMockRes();
      await authController.requestPasswordReset({ body: { email: 'notfound@example.com' } }, res2);
      assert.equal(res2.statusCode, 404);

      await seedUser({ email: 'reset@example.com' });
      const res3 = createMockRes();
      await authController.requestPasswordReset({ body: { email: 'reset@example.com' } }, res3);
      assert.equal(res3.statusCode, 200);
      assert.match(res3.body.message, /password reset code has been sent/i);
    });

    await t.test('verifyPasswordResetCode validates OTP and enforces lockout', async () => {
      const user = await seedUser({
        email: 'reset.verify@example.com',
        resetPasswordCode: '556677',
        resetPasswordExpiresAt: new Date(Date.now() + 600000),
        resetPasswordAttempts: 4
      });

      // Wrong code reaches 5 attempts -> lockout
      const res1 = createMockRes();
      await authController.verifyPasswordResetCode({
        body: { email: 'reset.verify@example.com', code: '000000' }
      }, res1);
      assert.equal(res1.statusCode, 400);

      // Now locked out
      const res2 = createMockRes();
      await authController.verifyPasswordResetCode({
        body: { email: 'reset.verify@example.com', code: '556677' }
      }, res2);
      assert.equal(res2.statusCode, 429);
      assert.match(res2.body.message, /Account locked/i);

      // Clear lockout and test success
      user.resetPasswordLockedUntil = null;
      user.resetPasswordAttempts = 0;
      users.set(String(user._id), user.toObject());

      const res3 = createMockRes();
      await authController.verifyPasswordResetCode({
        body: { email: 'reset.verify@example.com', code: '556677' }
      }, res3);
      assert.equal(res3.statusCode, 200);
      assert.equal(res3.body.success, true);
    });

    await t.test('resetPassword sets new bcrypt hashed password and clears reset state', async () => {
      const user = await seedUser({
        email: 'final.reset@example.com',
        resetPasswordCode: '998877',
        resetPasswordExpiresAt: new Date(Date.now() + 600000)
      });

      // Weak new password rejected
      const res1 = createMockRes();
      await authController.resetPassword({
        body: { email: 'final.reset@example.com', code: '998877', newPassword: '123' }
      }, res1);
      assert.equal(res1.statusCode, 400);

      // Wrong code rejected
      const res2 = createMockRes();
      await authController.resetPassword({
        body: { email: 'final.reset@example.com', code: '000000', newPassword: 'BrandNewPassword@2026' }
      }, res2);
      assert.equal(res2.statusCode, 400);

      // Successful password change
      const res3 = createMockRes();
      await authController.resetPassword({
        body: { email: 'final.reset@example.com', code: '998877', newPassword: 'BrandNewPassword@2026' }
      }, res3);
      assert.equal(res3.statusCode, 200);
      assert.match(res3.body.message, /Password has been reset successfully/i);

      const updated = loadUser(user._id);
      assert.equal(updated.resetPasswordCode, '');
      const match = await bcrypt.compare('BrandNewPassword@2026', updated.password);
      assert.equal(match, true);
    });
  });

  // ---------------------------------------------------------------------------
  // 6. AUTHORIZATION MIDDLEWARE
  // ---------------------------------------------------------------------------
  await suite.test('Authorization middleware guard rules and role checking', async (t) => {
    await t.test('protect middleware: blocks request when no Bearer token provided (401)', async () => {
      const req = { headers: {} };
      const res = createMockRes();
      let nextCalled = false;
      await authMiddleware.protect(req, res, () => { nextCalled = true; });
      assert.equal(res.statusCode, 401);
      assert.equal(nextCalled, false);
      assert.match(res.body.message, /no token provided/i);
    });

    await t.test('protect middleware: blocks invalid or expired token (401)', async () => {
      const req = { headers: { authorization: 'Bearer invalid.token.value' } };
      const res = createMockRes();
      let nextCalled = false;
      await authMiddleware.protect(req, res, () => { nextCalled = true; });
      assert.equal(res.statusCode, 401);
      assert.equal(nextCalled, false);
      assert.match(res.body.message, /invalid or expired token/i);
    });

    await t.test('protect middleware: blocks token pointing to removed user (401)', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const token = jwt.sign({ id: fakeId }, process.env.JWT_SECRET);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = createMockRes();
      let nextCalled = false;
      await authMiddleware.protect(req, res, () => { nextCalled = true; });
      assert.equal(res.statusCode, 401);
      assert.equal(nextCalled, false);
      assert.match(res.body.message, /user not found/i);
    });

    await t.test('protect middleware: blocks inactive accounts (403)', async () => {
      const user = await seedUser({ isActive: false });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = createMockRes();
      let nextCalled = false;
      await authMiddleware.protect(req, res, () => { nextCalled = true; });
      assert.equal(res.statusCode, 403);
      assert.equal(nextCalled, false);
      assert.match(res.body.message, /account is inactive/i);
    });

    await t.test('protect middleware: allows active user with valid token and sets req.user', async () => {
      const user = await seedUser({ isActive: true, role: 'elderly' });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const req = { headers: { authorization: `Bearer ${token}` } };
      const res = createMockRes();
      let nextCalled = false;
      await authMiddleware.protect(req, res, () => { nextCalled = true; });
      assert.equal(nextCalled, true);
      assert.ok(req.user);
      assert.equal(String(req.user._id), String(user._id));
    });

    await t.test('optionalProtect middleware: passes without error if token omitted or invalid', async () => {
      const req1 = { headers: {} };
      let next1 = false;
      await authMiddleware.optionalProtect(req1, {}, () => { next1 = true; });
      assert.equal(next1, true);
      assert.equal(req1.user, undefined);

      const req2 = { headers: { authorization: 'Bearer malformed' } };
      let next2 = false;
      await authMiddleware.optionalProtect(req2, {}, () => { next2 = true; });
      assert.equal(next2, true);
      assert.equal(req2.user, undefined);
    });

    await t.test('adminOnly middleware: blocks non-admin and allows admin', async () => {
      const nonAdminRes = createMockRes();
      let nonAdminNext = false;
      authMiddleware.adminOnly({ user: { role: 'volunteer' } }, nonAdminRes, () => { nonAdminNext = true; });
      assert.equal(nonAdminRes.statusCode, 403);
      assert.equal(nonAdminNext, false);

      let adminNext = false;
      authMiddleware.adminOnly({ user: { role: 'admin' } }, {}, () => { adminNext = true; });
      assert.equal(adminNext, true);
    });

    await t.test('authorize middleware: restricts route to specific roles', async () => {
      const guard = authMiddleware.authorize('admin', 'volunteer');

      const elderlyRes = createMockRes();
      let elderlyNext = false;
      guard({ user: { role: 'elderly' } }, elderlyRes, () => { elderlyNext = true; });
      assert.equal(elderlyRes.statusCode, 403);
      assert.equal(elderlyNext, false);

      let volunteerNext = false;
      guard({ user: { role: 'volunteer' } }, {}, () => { volunteerNext = true; });
      assert.equal(volunteerNext, true);
    });

    await t.test('volunteerApproved middleware: blocks pending or rejected volunteers', async () => {
      // Pending volunteer blocked
      const pendingRes = createMockRes();
      let pendingNext = false;
      authMiddleware.volunteerApproved(
        { user: { role: 'volunteer', approvalStatus: 'pending' } },
        pendingRes,
        () => { pendingNext = true; }
      );
      assert.equal(pendingRes.statusCode, 403);
      assert.equal(pendingRes.body.isPendingApproval, true);
      assert.equal(pendingNext, false);

      // Rejected volunteer blocked
      const rejectedRes = createMockRes();
      let rejectedNext = false;
      authMiddleware.volunteerApproved(
        { user: { role: 'volunteer', approvalStatus: 'rejected' } },
        rejectedRes,
        () => { rejectedNext = true; }
      );
      assert.equal(rejectedRes.statusCode, 403);
      assert.match(rejectedRes.body.message, /declined/i);
      assert.equal(rejectedNext, false);

      // Approved volunteer allowed
      let approvedNext = false;
      authMiddleware.volunteerApproved(
        { user: { role: 'volunteer', approvalStatus: 'approved' } },
        {},
        () => { approvedNext = true; }
      );
      assert.equal(approvedNext, true);

      // Elderly unconditionally allowed
      let elderlyNext = false;
      authMiddleware.volunteerApproved(
        { user: { role: 'elderly', approvalStatus: 'pending' } },
        {},
        () => { elderlyNext = true; }
      );
      assert.equal(elderlyNext, true);
    });
  });
});
