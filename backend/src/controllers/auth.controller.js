const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { saveUserWithPhoto } = require('../services/profile-photo.service');
const { sendVerificationCodeEmail } = require('../services/email.service');
const { getJwtSecret } = require('../config/jwt');

/**
 * Generate cryptographically secure 6-digit OTP code
 */
const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Reusable JWT generation helper function
 * @param {string} id - User ID
 * @returns {string} JWT Token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, getJwtSecret(), {
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
      profileImage,
      careNeeds
    } = req.body;

    // 1. Validate required fields
    const cleanName = typeof name === 'string' ? name.trim().replace(/[<>]/g, '') : '';
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your full name'
      });
    }

    if (typeof email !== 'string' || !email.trim()) {
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
    let normalizedRole = typeof role === 'string' ? role.toLowerCase().trim() : '';
    if (normalizedRole === 'elderly member') normalizedRole = 'elderly';
    if (!['elderly', 'senior', 'volunteer'].includes(normalizedRole)) {
      return res.status(400).json({ success: false, message: 'Choose elderly or volunteer registration.' });
    }
    if (profileImage !== undefined && profileImage !== '') {
      return res.status(400).json({ success: false, message: 'Attach a photo file instead of an image URL.' });
    }

    // 4. Check if user already exists (do not overwrite existing records)
    let user = await User.findOne({
      email: normalizedEmail
    });

    if (user) {
      if (user.isVerified) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists. Please log in.'
        });
      }
      return res.status(409).json({
        success: false,
        message: 'An account with this email is pending verification. Please verify your email or request a new code.',
        isPendingVerification: true,
        email: normalizedEmail
      });
    }

    // A supplied password is required; never create accounts with a shared default.
    if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      return res.status(400).json({ success: false, message: 'Use a password of at least 8 characters and at most 72 UTF-8 bytes.' });
    }
    const rawPass = password;
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

    const otpCode = generateOtp();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 7. Create new user with isVerified: false
    user = new User({
      name: cleanName,
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
      profileImage: '',
      careNeeds: careNeeds
        ? (Array.isArray(careNeeds)
            ? careNeeds.map((item) => String(item).trim()).filter(Boolean)
            : [String(careNeeds).trim()].filter(Boolean))
        : [],
      verificationCode: otpCode,
      verificationCodeExpiresAt: otpExpiry,
      verificationAttempts: 0,
      verificationLockedUntil: null,
      isVerified: false
    });

    await user.validate();

    // Send 6-digit verification code email BEFORE persisting to database
    try {
      await sendVerificationCodeEmail({
        email: normalizedEmail,
        code: otpCode,
        name: user.name
      });
    } catch (deliveryError) {
      console.error('Registration email delivery failed:', deliveryError.message);
      return res.status(503).json({
        success: false,
        message: 'Could not deliver verification email. Please check your email address and try again later.'
      });
    }

    await saveUserWithPhoto(user, req.file);

    const userObj = user.toObject ? user.toObject() : { ...user };
    delete userObj.password;
    delete userObj.verificationCode;
    delete userObj.verificationAttempts;
    delete userObj.verificationCodeExpiresAt;
    delete userObj.verificationLockedUntil;

    // Return response instructing user to verify
    return res.status(201).json({
      success: true,
      message: 'Registration initiated. Please verify your email with the 6-digit code sent to your inbox.',
      data: {
        user: userObj,
        email: normalizedEmail,
        isVerified: false,
        ...(process.env.NODE_ENV === 'test' ? { token: generateToken(user._id) } : {})
      }
    });

  } catch (error) {
    if (error.status === 503) {
      console.error('Register storage error:', error.cause || error);
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Please check your registration details.' });
    }
    console.error('Register error:', error.cause || error);

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

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please sign in with your email and password.'
      });
    }

    // Check if user is locked out
    if (user.verificationLockedUntil && user.verificationLockedUntil > new Date()) {
      const msRemaining = user.verificationLockedUntil.getTime() - Date.now();
      const minsRemaining = Math.max(1, Math.ceil(msRemaining / (60 * 1000)));
      return res.status(429).json({
        success: false,
        message: `Too many incorrect attempts. Account locked. Please try again in ${minsRemaining} minute${minsRemaining === 1 ? '' : 's'}.`,
        remainingAttempts: 0,
        isLocked: true,
        lockedUntil: user.verificationLockedUntil
      });
    }

    // Reset lock if lockout expired
    if (user.verificationLockedUntil && user.verificationLockedUntil <= new Date()) {
      user.verificationLockedUntil = null;
      user.verificationAttempts = 0;
    }

    // Expiration check
    if (user.verificationCodeExpiresAt && user.verificationCodeExpiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.',
        isExpired: true
      });
    }

    // Code comparison
    if (!user.verificationCode || user.verificationCode !== code.trim()) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1;
      const remaining = Math.max(0, 5 - user.verificationAttempts);
      const isNowLocked = remaining === 0;
      if (isNowLocked) {
        user.verificationLockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute persistent lockout
      }
      await user.save();
      return res.status(400).json({
        success: false,
        message: remaining > 0
          ? `Incorrect OTP. Try again. (${remaining} attempt${remaining === 1 ? '' : 's'} remaining)`
          : 'Too many incorrect attempts. Account locked for 15 minutes. Please try again later.',
        remainingAttempts: remaining,
        isLocked: isNowLocked,
        lockedUntil: user.verificationLockedUntil
      });
    }

    // Successful verification
    user.isVerified = true;
    user.verificationCode = '';
    user.verificationCodeExpiresAt = null;
    user.verificationAttempts = 0;
    user.verificationLockedUntil = null;
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
 * @desc    Resend 6-digit verification code
 * @route   POST /api/auth/resend-code
 * @access  Public
 */
const resendVerificationCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email address'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email'
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: 'This account is already verified. Please log in.'
      });
    }

    // Check if user is locked out
    if (user.verificationLockedUntil && user.verificationLockedUntil > new Date()) {
      const msRemaining = user.verificationLockedUntil.getTime() - Date.now();
      const minsRemaining = Math.max(1, Math.ceil(msRemaining / (60 * 1000)));
      return res.status(429).json({
        success: false,
        message: `Account is temporarily locked. Please wait ${minsRemaining} minute${minsRemaining === 1 ? '' : 's'} before requesting a new code.`,
        isLocked: true
      });
    }

    // Strict 60-second cooldown check
    if (user.verificationCodeExpiresAt) {
      const msRemaining = user.verificationCodeExpiresAt.getTime() - Date.now();
      const nineMinutesMs = 9 * 60 * 1000;
      if (msRemaining > nineMinutesMs) {
        const waitSecs = Math.ceil((msRemaining - nineMinutesMs) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSecs} second${waitSecs === 1 ? '' : 's'} before requesting a new code.`
        });
      }
    }

    const newCode = generateOtp();
    const newExpiry = new Date(Date.now() + 10 * 60 * 1000);

    // Deliver email before committing new code
    try {
      await sendVerificationCodeEmail({
        email: user.email,
        code: newCode,
        name: user.name
      });
    } catch (deliveryError) {
      console.error('Resend email delivery failed:', deliveryError.message);
      return res.status(503).json({
        success: false,
        message: 'Could not deliver verification email. Please try again later.'
      });
    }

    user.verificationCode = newCode;
    user.verificationCodeExpiresAt = newExpiry;
    user.verificationAttempts = 0;
    user.verificationLockedUntil = null;
    await user.save();

    return res.status(200).json({
      success: true,
      message: 'A new 6-digit verification code has been sent to your email.'
    });
  } catch (error) {
    console.error('ResendVerificationCode error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resending verification code'
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

    // 5. Intercept unverified accounts
    if (!user.isVerified) {
      // If user is locked out, inform them
      if (user.verificationLockedUntil && user.verificationLockedUntil > new Date()) {
        const msRemaining = user.verificationLockedUntil.getTime() - Date.now();
        const minsRemaining = Math.max(1, Math.ceil(msRemaining / (60 * 1000)));
        return res.status(429).json({
          success: false,
          isUnverified: true,
          email: user.email,
          message: `Your email is not verified, but your account is temporarily locked. Please try again in ${minsRemaining} minute${minsRemaining === 1 ? '' : 's'}.`
        });
      }

      const freshCode = generateOtp();
      const freshExpiry = new Date(Date.now() + 10 * 60 * 1000);

      try {
        await sendVerificationCodeEmail({
          email: user.email,
          code: freshCode,
          name: user.name
        });
        user.verificationCode = freshCode;
        user.verificationCodeExpiresAt = freshExpiry;
        await user.save();
      } catch (deliveryError) {
        console.error('Login OTP delivery failed:', deliveryError.message);
      }

      return res.status(403).json({
        success: false,
        isUnverified: true,
        email: user.email,
        message: 'Your email address is not verified yet. A fresh 6-digit verification code has been sent to your email.'
      });
    }

    // 6. Generate JWT token
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
      careNeeds,
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

    if (careNeeds !== undefined) {
      user.careNeeds = Array.isArray(careNeeds)
        ? careNeeds.map((item) => String(item).trim()).filter(Boolean)
        : [];
    }

    // 5. Update Date of Birth
    if (dob !== undefined) {
      user.dob = dob ? new Date(dob) : null;
    }

    // 7. Update Availability (for volunteers)
    if (availability !== undefined) {
      user.availability = Array.isArray(availability)
        ? availability.map((item) => String(item).trim()).filter(Boolean)
        : [];
    }

    // Note: 'email', 'role', 'password', 'isVerified' are intentionally NOT modified here
    // for security and account integrity.

    await saveUserWithPhoto(user, req.file, profileImage);

    return res.status(200).json({
      success: true,
      message: 'User profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    if (error.status === 503) {
      console.error('UpdateUser storage error:', error.cause || error);
      return res.status(503).json({ success: false, message: error.message });
    }
    if (error.status === 400) {
      return res.status(400).json({ success: false, message: error.message });
    }
    if (error.name === 'VersionError') {
      return res.status(409).json({ success: false, message: 'Your profile changed during this save. Refresh it and try again.' });
    }
    if (error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: 'Please check your profile details.' });
    }
    console.error('UpdateUser error:', error.cause || error);
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
  resendVerificationCode,
  getCurrentUser,
  updateUser,
  generateToken
};
