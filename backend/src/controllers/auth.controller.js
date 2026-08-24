const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Reusable JWT generation helper function
 * @param {string} id - User ID
 * @returns {string} JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'default_secret', {
    expiresIn: '30d'
  });
};

/**
 * Helper to validate email format using regex
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * @desc    Register a new user / Send verification code
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = 'elderly',
      age,
      mobile,
      address,
      emergencyContact,
      emergencyContactName,
      emergencyContactNumber,
      idDocument,
      availability,
      dob,
      profileImage
    } = req.body;

    // 1. Validate required fields
    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name'
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your email address'
      });
    }

    // 2. Validate email format
    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // 3. Normalize email and role
    const normalizedEmail = email.toLowerCase().trim();
    let normalizedRole = role ? role.toLowerCase().trim() : 'elderly';
    if (normalizedRole === 'elderly member') normalizedRole = 'elderly';

    // 4. Check if user already exists
    let user = await User.findOne({
      email: normalizedEmail
    });

    if (user) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists. Please log in.'
      });
    }

    // 5. Handle password hashing if provided or default password
    const rawPass = password && password.length >= 6 ? password : 'Password@123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPass, salt);

    // 6. Format Emergency Contact information
    const eName = emergencyContactName ? emergencyContactName.trim() : '';
    const eNum = emergencyContactNumber ? emergencyContactNumber.trim() : '';
    const eFull = emergencyContact
      ? emergencyContact.trim()
      : eName && eNum
      ? `${eName} - ${eNum}`
      : eName || eNum;

    // 7. Create user
    user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole,
      age: age ? Number(age) : null,
      mobile: mobile ? mobile.trim() : '',
      address: address ? address.trim() : '',
      emergencyContact: eFull,
      emergencyContactName: eName,
      emergencyContactNumber: eNum,
      idDocument: idDocument || '',
      availability: availability ? (Array.isArray(availability) ? availability : [availability]) : [],
      dob: dob || null,
      profileImage: profileImage || '',
      isVerified: true
    });

    // 8. Generate JWT
    const token = generateToken(user._id);

    // 9. Return response
    return res.status(201).json({
      success: true,
      message: 'Registration successful. Please log in.',
      data: {
        user,
        token
      }
    });

  } catch (error) {
    console.error('Register error:', error);

    // Handle duplicate email race condition
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

/**
 * @desc    Verify 6-digit code
 * @route   POST /api/auth/verify-code
 * @access  Public
 */
const verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and verification code'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.verificationCode && user.verificationCode !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please try again.'
      });
    }

    user.isVerified = true;
    user.verificationCode = '';
    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: 'Account verified successfully',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('VerifyCode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during verification'
    });
  }
};

/**
 * @desc    Authenticate user & get token
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // 2. Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 4. Compare supplied password with bcryptjs
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // 5. Generate JWT token
    const token = generateToken(user._id);

    // 6. Return safe user information & token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

/**
 * @desc    Get current authenticated user profile
 * @route   GET /api/auth/me
 * @access  Private
 */
const getCurrentUser = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: 'Current user profile fetched successfully',
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('GetCurrentUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching user profile'
    });
  }
};

/**
 * @desc    Update authenticated user profile
 * @route   PUT /api/auth/update-user or PUT /api/auth/profile
 * @access  Private
 */
const updateUser = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access'
      });
    }

    const {
      name,
      age,
      mobile,
      address,
      emergencyContact,
      emergencyContactName,
      emergencyContactNumber,
      bio,
      careNotes,
      dob,
      profileImage,
      availability
    } = req.body;

    // Fetch existing user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // 1. Validate & Update Name (cannot be blank)
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Name cannot be empty'
        });
      }
      user.name = name.trim();
    }

    // 2. Validate & Update Age
    if (age !== undefined) {
      if (age === null || age === '') {
        user.age = null;
      } else {
        const parsedAge = Number(age);
        if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 130) {
          return res.status(400).json({
            success: false,
            message: 'Please provide a valid age between 0 and 130'
          });
        }
        user.age = parsedAge;
      }
    }

    // 3. Update Contact & Address fields
    if (mobile !== undefined) {
      user.mobile = typeof mobile === 'string' ? mobile.trim() : '';
    }

    if (address !== undefined) {
      user.address = typeof address === 'string' ? address.trim() : '';
    }

    if (emergencyContactName !== undefined) {
      user.emergencyContactName = typeof emergencyContactName === 'string' ? emergencyContactName.trim() : '';
    }

    if (emergencyContactNumber !== undefined) {
      user.emergencyContactNumber = typeof emergencyContactNumber === 'string' ? emergencyContactNumber.trim() : '';
    }

    if (emergencyContact !== undefined) {
      user.emergencyContact = typeof emergencyContact === 'string' ? emergencyContact.trim() : '';
    } else if (emergencyContactName !== undefined || emergencyContactNumber !== undefined) {
      const eName = user.emergencyContactName || '';
      const eNum = user.emergencyContactNumber || '';
      user.emergencyContact = eName && eNum ? `${eName} - ${eNum}` : eName || eNum || '';
    }

    // 4. Update Elderly Care & Bio notes (Spacious text fields)
    if (bio !== undefined) {
      user.bio = typeof bio === 'string' ? bio.trim() : '';
    }

    if (careNotes !== undefined) {
      user.careNotes = typeof careNotes === 'string' ? careNotes.trim() : '';
    }

    // 5. Update Date of Birth
    if (dob !== undefined) {
      user.dob = dob ? new Date(dob) : null;
    }

    // 6. Update Profile Image (photo URL / Supabase URL / image string)
    if (profileImage !== undefined) {
      user.profileImage = typeof profileImage === 'string' ? profileImage.trim() : '';
    }

    // 7. Update Availability (for volunteers)
    if (availability !== undefined) {
      user.availability = Array.isArray(availability)
        ? availability.map((item) => String(item).trim()).filter(Boolean)
        : [];
    }

    // Note: 'email', 'role', 'password', 'isVerified' are intentionally NOT modified here
    // for security and account integrity.

    await user.save();

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('UpdateUser error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating user profile'
    });
  }
};

module.exports = {
  register,
  login,
  verifyCode,
  getCurrentUser,
  updateUser,
  generateToken
};
