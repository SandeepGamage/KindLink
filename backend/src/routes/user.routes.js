const express = require('express');
const router = express.Router();
const { getAllUsers, getUserById } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// All user management routes are admin-protected
router.get('/', protect, getAllUsers);
router.get('/:id', protect, getUserById);

module.exports = router;
