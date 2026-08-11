const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', protect, getCurrentUser);

module.exports = router;
