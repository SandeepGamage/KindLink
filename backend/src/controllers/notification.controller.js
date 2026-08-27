const Notification = require('../models/Notification');

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Public (or Admin depending on your auth setup)
exports.getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: notifications.length,
      data: notifications
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching notifications'
    });
  }
};

// @desc    Create a new notification
// @route   POST /api/notifications
// @access  Public (or Admin)
exports.createNotification = async (req, res) => {
  try {
    const { title, message, type, audience, sender, status } = req.body;

    const notification = await Notification.create({
      title,
      message,
      type,
      audience,
      sender,
      status
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error creating notification:', error.message);
    res.status(400).json({
      success: false,
      message: error.message || 'Error creating notification'
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Public (or Admin)
exports.deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting notification'
    });
  }
};

// @desc    Update a notification (e.g. publish a draft)
// @route   PUT /api/notifications/:id
// @access  Public (or Admin)
exports.updateNotification = async (req, res) => {
  try {
    const { title, message, type, audience, status } = req.body;
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { title, message, type, audience, status },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating notification'
    });
  }
};
