const express = require('express');
const router = express.Router();
const { register, login, verifyCode, getCurrentUser, updateUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/send-verification-code', register);
router.post('/verify-code', verifyCode);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);
router.put('/update-user', protect, updateUser);
router.put('/profile', protect, updateUser);
router.put('/me', protect, updateUser);

module.exports = router;
