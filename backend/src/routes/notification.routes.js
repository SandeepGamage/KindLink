const express = require('express');
const router = express.Router();
// TODO: After merging teammate's branch, re-add auth & role middleware:
const { protect } = require('../middleware/auth.middleware');
// const { authorizeRoles } = require('../middleware/role.middleware');
const {
  createNotification,
  getAllNotifications,
  updateNotification,
  deleteNotification,
  publishNotification,
  getClientNotifications,
  markAsRead,
  markAllAsRead,
  hideClientNotification,
  getUnreadCount
} = require('../controllers/notification.controller');

// ─────────────────────────────────────────────
// CLIENT ROUTES (must be before admin routes to avoid path conflicts)
// TODO: Add 'protect' middleware after merge → e.g. router.get('/', protect, getClientNotifications)
// ─────────────────────────────────────────────

// GET /api/notifications/unread-count — Get unread notification count
router.get('/unread-count', protect, getUnreadCount);

// PATCH /api/notifications/mark-all-read — Mark all notifications as read
router.patch('/mark-all-read', protect, markAllAsRead);

// GET /api/notifications — Get notifications for the current user
router.get('/', protect, getClientNotifications);

// PATCH /api/notifications/:id/read — Mark a single notification as read
router.patch('/:id/read', protect, markAsRead);

// DELETE /api/notifications/:id — Hide/dismiss a notification (soft delete)
router.delete('/:id', protect, hideClientNotification);

// ─────────────────────────────────────────────
// ADMIN ROUTES
// TODO: Add 'protect, authorizeRoles("admin")' middleware after merge
// ─────────────────────────────────────────────

// POST /api/notifications/admin — Create a new notification
router.post('/admin', protect, createNotification);

// GET /api/notifications/admin — Get all notifications (admin view)
router.get('/admin', protect, getAllNotifications);

// PUT /api/notifications/admin/:id — Update a draft notification
router.put('/admin/:id', protect, updateNotification);

// DELETE /api/notifications/admin/:id — Delete a draft notification
router.delete('/admin/:id', protect, deleteNotification);

// PATCH /api/notifications/admin/:id/publish — Publish a draft notification
router.patch('/admin/:id/publish', protect, publishNotification);

module.exports = router;
