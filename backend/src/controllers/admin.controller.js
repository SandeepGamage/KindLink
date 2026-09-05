const User = require('../models/User');
const Notification = require('../models/Notification');

/**
 * @desc    Aggregate counts for the admin dashboard
 * @route   GET /api/admin/stats
 * @access  Private/Admin
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
      activeUsers,
      pendingVerification,
      newUsersToday,
      sentBroadcasts,
      draftBroadcasts,
      lastBroadcast
    ] = await Promise.all([
      // $ne: false is deliberate. Users created before `isActive` was added to the
      // schema have no such key stored, and a missing field never matches
      // { isActive: true } in a raw count -- only Mongoose's find() applies the
      // schema default. Treating "absent" as active keeps this in step with the
      // users directory, which lists those same documents as active.
      User.countDocuments({ isActive: { $ne: false } }),
      User.countDocuments({ isVerified: false }),
      User.countDocuments({ createdAt: { $gte: startOfToday } }),
      Notification.countDocuments({ status: 'sent' }),
      Notification.countDocuments({ status: 'draft' }),
      Notification.findOne({ status: 'sent' }).sort({ createdAt: -1 }).select('createdAt')
    ]);

    return res.status(200).json({
      success: true,
      data: {
        activeUsers,
        pendingVerification,
        newUsersToday,
        sentBroadcasts,
        draftBroadcasts,
        lastBroadcastAt: lastBroadcast ? lastBroadcast.createdAt : null
      }
    });
  } catch (error) {
    console.error('GetDashboardStats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching dashboard stats'
    });
  }
};

/**
 * @desc    Recent admin-relevant activity feed
 * @route   GET /api/admin/activity?limit=5
 * @access  Private/Admin
 *
 * NOTE: there is no audit-log model yet, so the feed is derived by merging the
 * two timestamped sources that do exist (new users and broadcasts). Replace this
 * with a real audit log once one is introduced.
 */
exports.getRecentActivity = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 5, 25);

    const [users, notifications] = await Promise.all([
      User.find().sort({ createdAt: -1 }).limit(limit).select('name role createdAt'),
      Notification.find().sort({ createdAt: -1 }).limit(limit).select('title status createdAt')
    ]);

    const items = [
      ...users.map((u) => ({
        id: `user-${u._id}`,
        text: `${u.name} joined as ${u.role}`,
        timestamp: u.createdAt,
        kind: 'user'
      })),
      ...notifications.map((n) => ({
        id: `notification-${n._id}`,
        text: `"${n.title}" ${n.status === 'sent' ? 'published' : 'saved as draft'}`,
        timestamp: n.createdAt,
        kind: 'notification'
      }))
    ]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items
    });
  } catch (error) {
    console.error('GetRecentActivity error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching recent activity'
    });
  }
};

/**
 * @desc    Role and account-status breakdown of the user base
 * @route   GET /api/admin/stats/distribution
 * @access  Private/Admin
 *
 * Feeds the dashboard donut chart, so the buckets within each breakdown must be
 * mutually exclusive and sum to `total` -- otherwise the slices lie. Roles are
 * already exclusive; statuses are not (a user can be both unverified and
 * deactivated), so they are collapsed with an explicit precedence below.
 */
exports.getUserDistribution = async (req, res) => {
  try {
    const [result] = await User.aggregate([
      {
        $facet: {
          byRole: [{ $group: { _id: '$role', count: { $sum: 1 } } }],
          byStatus: [
            {
              $group: {
                // Precedence: deactivated > pending > active. `isActive` is
                // compared against false rather than true for the same reason
                // getDashboardStats does -- documents predating the field have
                // no such key stored, and must still count as active.
                _id: {
                  $cond: [
                    { $eq: ['$isActive', false] },
                    'inactive',
                    { $cond: [{ $eq: ['$isVerified', true] }, 'active', 'pending'] }
                  ]
                },
                count: { $sum: 1 }
              }
            }
          ],
          total: [{ $count: 'n' }]
        }
      }
    ]);

    // Normalise to fixed keys so the client never has to guard for a bucket
    // that simply had no documents.
    const toCounts = (rows, keys) => {
      const counts = Object.fromEntries(keys.map((key) => [key, 0]));
      rows.forEach((row) => {
        if (row._id in counts) counts[row._id] = row.count;
      });
      return counts;
    };

    return res.status(200).json({
      success: true,
      data: {
        total: result.total[0] ? result.total[0].n : 0,
        byRole: toCounts(result.byRole, ['volunteer', 'elderly', 'senior', 'admin']),
        byStatus: toCounts(result.byStatus, ['active', 'pending', 'inactive'])
      }
    });
  } catch (error) {
    console.error('GetUserDistribution error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user distribution'
    });
  }
};

/**
 * @desc    Get all users (admin only)
 * @route   GET /api/admin/users
 * @access  Private/Admin
 *
 * Query params:
 *   ?role=volunteer|elderly|admin
 *   ?search=<name or email substring>
 *   ?status=active|inactive|verified|pending
 */
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, status } = req.query;
    const filter = {};

    // Role filter
    if (role && role !== 'all') {
      filter.role = role.toLowerCase();
    }

    // Status filter. 'active' uses $ne: false so that documents predating the
    // `isActive` field (which have no such key) still count as active; only an
    // explicit deactivation stores false.
    if (status === 'active') filter.isActive = { $ne: false };
    if (status === 'inactive') filter.isActive = false;
    if (status === 'verified') filter.isVerified = true;
    if (status === 'pending') filter.isVerified = false;

    // Search filter (name or email)
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const users = await User.find(filter)
      .select('-password -verificationCode')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('GetAllUsers error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching users'
    });
  }
};

/**
 * @desc    Toggle user active status (activate / deactivate)
 * @route   PUT /api/admin/users/:id/toggle-active
 * @access  Private/Admin
 */
exports.toggleUserActive = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deactivating themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      data: user
    });
  } catch (error) {
    console.error('ToggleUserActive error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error toggling user status'
    });
  }
};

/**
 * @desc    Permanently delete a user
 * @route   DELETE /api/admin/users/:id
 * @access  Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'User permanently deleted',
      data: {}
    });
  } catch (error) {
    console.error('DeleteUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};
