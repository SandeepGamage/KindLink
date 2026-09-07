const { rateLimit } = require('express-rate-limit');
const { avatarUpload } = require('../config/storage');

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => !req.file,
  message: { success: false, message: 'Too many photo requests. Please try again in 15 minutes.' }
});

// One JSON field preserves arrays, numbers and explicit empty values.
// Existing clients can still send ordinary JSON when no file is attached.
const parseProfileForm = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();
  avatarUpload.single('avatar')(req, res, (error) => {
    if (error) return next(error);
    try {
      if (Object.keys(req.body).length !== 1 || typeof req.body.payload !== 'string') {
        throw new Error('Invalid fields');
      }
      const payload = JSON.parse(req.body.payload);
      if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
        throw new Error('Invalid payload');
      }
      if (req.file && Object.hasOwn(payload, 'profileImage')) {
        throw new Error('Conflicting photo changes');
      }
      req.body = payload;
      return next();
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid profile form.' });
    }
  });
};

module.exports = { parseProfileForm, uploadRateLimit };
