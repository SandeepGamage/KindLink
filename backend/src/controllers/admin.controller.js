const User = require('../models/User');

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

    // Status filter
    if (status === 'active') filter.isActive = true;
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
