const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../controllers/auth.controller');
// TODO: After merging teammate's branch, re-add auth middleware:
// const { protect } = require('../middleware/auth.middleware');

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
// TODO: Add 'protect' middleware after merge → e.g. router.get('/me', protect, getCurrentUser)
router.get('/me', getCurrentUser);

module.exports = router;
