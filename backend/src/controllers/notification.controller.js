const Notification = require('../models/Notification');

/**
 * Map a User `role` onto the Notification `audience` enum.
 * User roles are senior|elderly|volunteer|admin; audiences are all|volunteer|elder.
 */
const audienceForRole = (role) => (role === 'volunteer' ? 'volunteer' : 'elder');

// @desc    Get notifications visible to the caller
// @route   GET /api/notifications
// @access  Private — admins see everything (incl. drafts), clients see only
//          sent broadcasts addressed to them
exports.getNotifications = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.status = 'sent';
      // `null` also matches documents with no `audience` field. Notifications
      // created before the field existed are stored without it — the schema
      // default only applies on hydration, not to the stored document — and
      // those are platform-wide, so they must stay visible.
      filter.audience = { $in: ['all', audienceForRole(req.user.role), null] };
    }

    const notifications = await Notification.find(filter).sort({ createdAt: -1 });
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
// @access  Private/Admin
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
// @access  Private/Admin
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
// @access  Private/Admin
exports.updateNotification = async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Only apply the fields the caller actually sent, so a partial update
    // (e.g. publishing a draft with just { status: 'sent' }) leaves the rest intact.
    const update = {};
    for (const field of ['title', 'message', 'type', 'audience', 'status']) {
      if (req.body[field] !== undefined) update[field] = req.body[field];
    }

    notification = await Notification.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error('Error updating notification:', error);
    // Validation failures are the caller's fault, not the server's
    const isValidation = error.name === 'ValidationError' || error.name === 'CastError';
    res.status(isValidation ? 400 : 500).json({
      success: false,
      message: isValidation ? error.message : 'Server error updating notification'
    });
  }
};
