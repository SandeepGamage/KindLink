const Notification = require('../models/Notification');

// ─────────────────────────────────────────────
// ADMIN ENDPOINTS
// ─────────────────────────────────────────────

/**
 * @desc    Create a new notification (draft or sent)
 * @route   POST /api/notifications/admin
 * @access  Private/Admin
 */
const createNotification = async (req, res) => {
  try {
    const { title, message, targetAudience, saveAsDraft } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both title and message'
      });
    }

    // Validate targetAudience if provided
    const validAudiences = ['all', 'volunteer', 'elder'];
    if (targetAudience && !validAudiences.includes(targetAudience.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid target audience. Must be one of: ${validAudiences.join(', ')}`
      });
    }

    const status = saveAsDraft ? 'draft' : 'sent';

    const notification = await Notification.create({
      title: title.trim(),
      message: message.trim(),
      targetAudience: targetAudience ? targetAudience.toLowerCase() : 'all',
      status,
      type: 'system', // Admin-created notifications default to system type
      createdBy: req.user._id,
      publishedAt: status === 'sent' ? new Date() : null
    });

    return res.status(201).json({
      success: true,
      message: status === 'sent'
        ? 'Notification published successfully'
        : 'Notification saved as draft',
      data: { notification }
    });
  } catch (error) {
    console.error('Create notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while creating notification'
    });
  }
};

/**
 * @desc    Get all notifications for admin (supports status filter & pagination)
 * @route   GET /api/notifications/admin?status=draft|sent&page=1&limit=20
 * @access  Private/Admin
 */
const getAllNotifications = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Filter by status if provided
    if (status && ['draft', 'sent'].includes(status)) {
      filter.status = status;
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Notification.countDocuments(filter)
    ]);

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get all notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

/**
 * @desc    Update a draft notification
 * @route   PUT /api/notifications/admin/:id
 * @access  Private/Admin
 */
const updateNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, message, targetAudience } = req.body;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Prevent editing sent notifications
    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Cannot edit a notification that has already been sent'
      });
    }

    // Validate targetAudience if provided
    const validAudiences = ['all', 'volunteer', 'elder'];
    if (targetAudience && !validAudiences.includes(targetAudience.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: `Invalid target audience. Must be one of: ${validAudiences.join(', ')}`
      });
    }

    // Update only provided fields
    if (title) notification.title = title.trim();
    if (message) notification.message = message.trim();
    if (targetAudience) notification.targetAudience = targetAudience.toLowerCase();

    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification updated successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Update notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating notification'
    });
  }
};

/**
 * @desc    Delete a draft notification
 * @route   DELETE /api/notifications/admin/:id
 * @access  Private/Admin
 */
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Prevent deleting sent notifications
    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a notification that has already been sent. Consider archiving instead.'
      });
    }

    await Notification.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deleting notification'
    });
  }
};

/**
 * @desc    Publish a draft notification (change status from draft to sent)
 * @route   PATCH /api/notifications/admin/:id/publish
 * @access  Private/Admin
 */
const publishNotification = async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (notification.status === 'sent') {
      return res.status(400).json({
        success: false,
        message: 'This notification has already been published'
      });
    }

    notification.status = 'sent';
    notification.publishedAt = new Date();
    await notification.save();

    return res.status(200).json({
      success: true,
      message: 'Notification published successfully',
      data: { notification }
    });
  } catch (error) {
    console.error('Publish notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while publishing notification'
    });
  }
};

// ─────────────────────────────────────────────
// CLIENT ENDPOINTS
// ─────────────────────────────────────────────

/**
 * @desc    Get notifications for the current user (sent only, filtered by role/audience)
 * @route   GET /api/notifications?filter=unread|system&page=1&limit=20
 * @access  Private
 */
const getClientNotifications = async (req, res) => {
  try {
    const { filter, page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    const userRole = req.user.role; // 'user', 'admin', 'volunteer', 'elder'

    // Build base query: only sent notifications, not hidden by this user
    const query = {
      status: 'sent',
      hiddenBy: { $nin: [userId] }
    };

    // Filter by target audience: show notifications targeted at 'all' OR the user's specific role
    query.$or = [
      { targetAudience: 'all' },
      { targetAudience: userRole }
    ];

    // Apply client-side filters
    if (filter === 'unread') {
      query.readBy = { $nin: [userId] };
    } else if (filter === 'system') {
      query.type = 'system';
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [notifications, total] = await Promise.all([
      Notification.find(query)
        .select('-readBy -hiddenBy') // Don't send full arrays to client
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Notification.countDocuments(query)
    ]);

    // For each notification, check if the current user has read it.
    // We need a separate query since we excluded readBy from the select above.
    const notificationIds = notifications.map((n) => n._id);
    const readNotifications = await Notification.find({
      _id: { $in: notificationIds },
      readBy: userId
    }).select('_id').lean();

    const readSet = new Set(readNotifications.map((n) => n._id.toString()));

    // Add a computed 'read' boolean to each notification
    const enrichedNotifications = notifications.map((n) => ({
      ...n,
      read: readSet.has(n._id.toString())
    }));

    return res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications: enrichedNotifications,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get client notifications error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/notifications/:id/read
 * @access  Private
 */
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Use $addToSet to prevent duplicate entries
    await Notification.findByIdAndUpdate(id, {
      $addToSet: { readBy: userId }
    });

    return res.status(200).json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while marking notification as read'
    });
  }
};

/**
 * @desc    Mark all notifications as read for the current user
 * @route   PATCH /api/notifications/mark-all-read
 * @access  Private
 */
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Find all sent notifications visible to this user that they haven't read
    const filter = {
      status: 'sent',
      hiddenBy: { $nin: [userId] },
      readBy: { $nin: [userId] },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole }
      ]
    };

    const result = await Notification.updateMany(filter, {
      $addToSet: { readBy: userId }
    });

    return res.status(200).json({
      success: true,
      message: `${result.modifiedCount} notification(s) marked as read`
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while marking all notifications as read'
    });
  }
};

/**
 * @desc    Hide/dismiss a notification for the current user (soft delete)
 * @route   DELETE /api/notifications/:id
 * @access  Private
 */
const hideClientNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const notification = await Notification.findById(id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Use $addToSet to add user to hiddenBy array (soft delete)
    await Notification.findByIdAndUpdate(id, {
      $addToSet: { hiddenBy: userId }
    });

    return res.status(200).json({
      success: true,
      message: 'Notification dismissed'
    });
  } catch (error) {
    console.error('Hide notification error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while dismissing notification'
    });
  }
};

/**
 * @desc    Get unread notification count for the current user
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const count = await Notification.countDocuments({
      status: 'sent',
      hiddenBy: { $nin: [userId] },
      readBy: { $nin: [userId] },
      $or: [
        { targetAudience: 'all' },
        { targetAudience: userRole }
      ]
    });

    return res.status(200).json({
      success: true,
      data: { unreadCount: count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching unread count'
    });
  }
};

module.exports = {
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
};
