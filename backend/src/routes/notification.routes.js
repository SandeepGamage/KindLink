const express = require('express');
const {
  getNotifications,
  createNotification,
  deleteNotification,
  updateNotification,
  setReadStatus,
  markAllAsRead,
  hideNotification
} = require('../controllers/notification.controller');
const { protect, adminOnly } = require('../middleware/auth.middleware');

const router = express.Router();

// Reading requires a signed-in user (the controller narrows results by role).
// Writes to the broadcasts themselves are admin-only.
router.route('/')
  .get(protect, getNotifications)
  .post(protect, adminOnly, createNotification);

// Per-user inbox state: each user's read/removed flags, never the broadcast.
// read-all is declared before /:id so it isn't taken as an id.
router.put('/read-all', protect, markAllAsRead);
router.put('/:id/read', protect, setReadStatus);
router.put('/:id/hide', protect, hideNotification);

router.route('/:id')
  .put(protect, adminOnly, updateNotification)
  .delete(protect, adminOnly, deleteNotification);

module.exports = router;
