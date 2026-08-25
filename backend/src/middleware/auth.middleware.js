const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect routes and verify JWT tokens
 */
/**
 * Middleware to optional protect routes - verifies token if present, otherwise continues gracefully
 */
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch (error) {
      // Ignore token errors in optional protect
    }
  }
  return next();
};

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized access, user not found'
        });
      }

      return next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized access, invalid or expired token'
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized access, no token provided'
    });
  }
};

/**
 * Middleware to optionally attach authenticated user if token is present
 */
const optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      // Ignore token failure for optional protect
    }
  }
  return next();
};

module.exports = { protect, optionalProtect };
