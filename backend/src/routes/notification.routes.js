const express = require('express');
const {
  getNotifications,
  createNotification,
  deleteNotification,
  updateNotification
} = require('../controllers/notification.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// Reading requires a signed-in user (the controller narrows results by role).
// Every write is admin-only — these are platform-wide broadcasts.
router.route('/')
  .get(protect, getNotifications)
  .post(protect, adminOnly, createNotification);

router.route('/:id')
  .put(protect, adminOnly, updateNotification)
  .delete(protect, adminOnly, deleteNotification);

module.exports = router;
