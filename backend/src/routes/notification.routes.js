const express = require('express');
const {
  getNotifications,
  createNotification,
  deleteNotification,
  updateNotification
} = require('../controllers/notification.controller');

const router = express.Router();

router.route('/')
  .get(getNotifications)
  .post(createNotification);

router.route('/:id')
  .put(updateNotification)
  .delete(deleteNotification);

module.exports = router;
