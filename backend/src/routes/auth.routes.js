const express = require('express');
const router = express.Router();
const { register, login, verifyCode, resendVerificationCode, getCurrentUser, updateUser } = require('../controllers/auth.controller');
const { parseProfileForm, uploadRateLimit } = require('../middleware/profile-upload.middleware');
const { handleUploadError } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', parseProfileForm, uploadRateLimit, register);
router.post('/send-verification-code', parseProfileForm, uploadRateLimit, register);
router.post('/verify-code', verifyCode);
router.post('/resend-code', resendVerificationCode);
router.post('/resend-verification-code', resendVerificationCode);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/update-user', protect, parseProfileForm, uploadRateLimit, updateUser);
router.put('/profile', protect, parseProfileForm, uploadRateLimit, updateUser);
router.put('/me', protect, parseProfileForm, uploadRateLimit, updateUser);

router.use(handleUploadError);

module.exports = router;
