const Notification = require('../models/Notification');

/**
 * Map a User `role` onto the Notification `audience` enum.
 * User roles are senior|elderly|volunteer|admin; audiences are all|volunteer|elder.
 */
const audienceForRole = (role) => (role === 'volunteer' ? 'volunteer' : 'elder');

/**
 * Query filter for the notifications a non-admin user can see: messages
 * addressed to them, plus sent broadcasts for their audience from after they
 * joined, minus anything they removed from their inbox.
 */
const inboxFilter = (user) => {
  const userId = user._id || user.id;
  const broadcast = { recipient: null, audience: { $in: ['all', audienceForRole(user.role), null] } };
  // Broadcasts sent before the account existed weren't meant for this user,
  // so a new account starts with an empty inbox. A draft published after they
  // joined still counts as new, hence sentAt rather than createdAt.
  if (user.createdAt) {
    broadcast.$or = [
      { sentAt: { $gte: user.createdAt } },
      { sentAt: null, createdAt: { $gte: user.createdAt } }
    ];
  }
  return {
    status: 'sent',
    hiddenBy: { $ne: userId },
    $or: [{ recipient: userId }, broadcast]
  };
};

// @desc    Get notifications visible to the caller
// @route   GET /api/notifications
// @access  Private — admins see every admin broadcast (incl. drafts), clients
//          see only sent notifications addressed to them
exports.getNotifications = async (req, res) => {
  try {
    const isAdmin = !req.user || req.user.role === 'admin';
    // Admins manage broadcasts only. Automatic per-user messages (appointment
    // updates) are private to their recipient and must not appear here.
    const filter = isAdmin ? { ...Notification.BROADCAST_FILTER } : inboxFilter(req.user);
    const userId = req.user && String(req.user._id || req.user.id);

    // lean() so a missing `source` stays missing instead of becoming the
    // schema default; resolveSource then labels legacy rows correctly.
    // Per-user tracking lists are reduced to the caller's own `read` flag so
    // users never see who else read a broadcast.
    const sort = isAdmin ? { createdAt: -1 } : { sentAt: -1, createdAt: -1 };
    const notifications = (await Notification.find(filter).sort(sort).lean())
      .map(({ readBy = [], hiddenBy, ...n }) => ({
        ...n,
        source: Notification.resolveSource(n),
        read: !isAdmin && readBy.some((id) => String(id) === userId)
      }));
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

// @desc    Mark one notification read or unread for the caller
// @route   PUT /api/notifications/:id/read   body: { read: boolean }
// @access  Private
exports.setReadStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const read = req.body.read !== false;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...inboxFilter(req.user) },
      read ? { $addToSet: { readBy: userId } } : { $pull: { readBy: userId } },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: { _id: notification._id, read } });
  } catch (error) {
    console.error('Error updating read status:', error);
    const isCast = error.name === 'CastError';
    res.status(isCast ? 400 : 500).json({
      success: false,
      message: isCast ? 'Invalid notification id' : 'Server error updating read status'
    });
  }
};

// @desc    Mark every notification in the caller's inbox as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    await Notification.updateMany(inboxFilter(req.user), { $addToSet: { readBy: userId } });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error marking notifications read:', error);
    res.status(500).json({ success: false, message: 'Server error marking notifications read' });
  }
};

// @desc    Remove a notification from the caller's inbox only
// @route   PUT /api/notifications/:id/hide
// @access  Private
exports.hideNotification = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, ...inboxFilter(req.user) },
      { $addToSet: { hiddenBy: userId } }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error('Error hiding notification:', error);
    const isCast = error.name === 'CastError';
    res.status(isCast ? 400 : 500).json({
      success: false,
      message: isCast ? 'Invalid notification id' : 'Server error hiding notification'
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
      status,
      source: 'admin'
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
    const notification = await Notification.findOne({ _id: req.params.id, ...Notification.BROADCAST_FILTER });

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
    // Only admin broadcasts are editable; automatic messages 404 like a missing id.
    let notification = await Notification.findOne({ _id: req.params.id, ...Notification.BROADCAST_FILTER });

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
    // Publishing a draft is when it actually reaches users.
    if (update.status === 'sent' && notification.status !== 'sent') update.sentAt = new Date();

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
