const User = require('../models/User');

/**
 * @desc    Get all users (supports search, role filter, and pagination)
 * @route   GET /api/users?search=&role=&page=1&limit=20
 * @access  Private/Admin
 */
const getAllUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;

    const filter = {};

    // Filter by role if provided
    const validRoles = ['senior', 'elderly', 'volunteer', 'admin'];
    if (role && validRoles.includes(role.toLowerCase())) {
      filter.role = role.toLowerCase();
    }

    // Search by name or email
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      filter.$or = [
        { name: searchRegex },
        { email: searchRegex }
      ];
    }

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password -verificationCode')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      User.countDocuments(filter)
    ]);

    // Get counts per role for summary stats
    const [totalUsers, volunteerCount, elderlyCount, adminCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'volunteer' }),
      User.countDocuments({ role: { $in: ['elderly', 'senior'] } }),
      User.countDocuments({ role: 'admin' })
    ]);

    return res.status(200).json({
      success: true,
      message: 'Users fetched successfully',
      data: {
        users,
        stats: {
          total: totalUsers,
          volunteers: volunteerCount,
          elderly: elderlyCount,
          admins: adminCount
        },
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
};

/**
 * @desc    Get a single user by ID
 * @route   GET /api/users/:id
 * @access  Private/Admin
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id)
      .select('-password -verificationCode')
      .lean();

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'User fetched successfully',
      data: { user }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching user'
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById
};
