const express = require('express');
const router = express.Router();
const { getAllUsers, toggleUserActive, deleteUser } = require('../controllers/admin.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

// All routes require authentication + admin role
router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.put('/users/:id/toggle-active', toggleUserActive);
router.delete('/users/:id', deleteUser);

module.exports = router;
