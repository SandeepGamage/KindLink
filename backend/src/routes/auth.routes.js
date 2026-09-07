const express = require('express');
const router = express.Router();
const { rateLimit } = require('express-rate-limit');
const { register, login, verifyCode, resendVerificationCode, getCurrentUser, updateUser } = require('../controllers/auth.controller');
const { parseProfileForm, uploadRateLimit } = require('../middleware/profile-upload.middleware');
const { handleUploadError } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

const verifyCodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many verification attempts from this IP. Please try again later.' }
});

const resendCodeRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { success: false, message: 'Too many resend requests from this IP. Please try again later.' }
});

// Public routes
router.post('/register', parseProfileForm, uploadRateLimit, register);
router.post('/send-verification-code', parseProfileForm, uploadRateLimit, register);
router.post('/verify-code', verifyCodeRateLimit, verifyCode);
router.post('/resend-code', resendCodeRateLimit, resendVerificationCode);
router.post('/resend-verification-code', resendCodeRateLimit, resendVerificationCode);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/update-user', protect, parseProfileForm, uploadRateLimit, updateUser);
router.put('/profile', protect, parseProfileForm, uploadRateLimit, updateUser);
router.put('/me', protect, parseProfileForm, uploadRateLimit, updateUser);

router.use(handleUploadError);

module.exports = router;
