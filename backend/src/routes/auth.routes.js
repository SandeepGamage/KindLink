const express = require('express');
const router = express.Router();
const { register, login, verifyCode, getCurrentUser, updateUser } = require('../controllers/auth.controller');
const { parseProfileForm, uploadRateLimit } = require('../middleware/profile-upload.middleware');
const { handleUploadError } = require('../controllers/upload.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', uploadRateLimit, parseProfileForm, register);
router.post('/send-verification-code', uploadRateLimit, parseProfileForm, register);
router.post('/verify-code', verifyCode);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/update-user', protect, uploadRateLimit, parseProfileForm, updateUser);
router.put('/profile', protect, uploadRateLimit, parseProfileForm, updateUser);
router.put('/me', protect, uploadRateLimit, parseProfileForm, updateUser);

router.use(handleUploadError);

module.exports = router;
