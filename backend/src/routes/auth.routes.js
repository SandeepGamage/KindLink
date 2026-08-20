const express = require('express');
const router = express.Router();
const { register, login, verifyCode, getCurrentUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/send-verification-code', register);
router.post('/verify-code', verifyCode);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;
