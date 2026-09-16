const { rateLimit } = require('express-rate-limit');
const { profileFormUpload } = require('../config/storage');

const uploadRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: (req) => !req.file && !req.idDocumentFile && (!req.files || Object.keys(req.files).length === 0),
  message: { success: false, message: 'Too many upload requests. Please try again in 15 minutes.' }
});

// Multipart form parser for signup and profile updates.
// Accepts optional 'avatar' image, optional 'idDocument' image, and a 'payload' JSON field.
// Existing clients can still send ordinary JSON when no file is attached.
const parseProfileForm = (req, res, next) => {
  if (!req.is('multipart/form-data')) return next();

  profileFormUpload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'idDocument', maxCount: 1 }
  ])(req, res, (error) => {
    if (error) return next(error);
    try {
      if (Object.keys(req.body).length !== 1 || typeof req.body.payload !== 'string') {
        throw new Error('Invalid fields');
      }
      const payload = JSON.parse(req.body.payload);
      if (!payload || Array.isArray(payload) || typeof payload !== 'object') {
        throw new Error('Invalid payload');
      }

      // Preserve backward compatibility for controllers reading req.file (avatar)
      req.file = req.files?.avatar?.[0] || null;
      req.idDocumentFile = req.files?.idDocument?.[0] || null;

      if (req.file && Object.hasOwn(payload, 'profileImage')) {
        throw new Error('Conflicting photo changes');
      }

      if (req.idDocumentFile) {
        // ID document file takes precedence; strip any client draft filename string
        delete payload.idDocument;
      }

      req.body = payload;
      return next();
    } catch (err) {
      console.error('[parseProfileForm error]', err.message);
      return res.status(400).json({
        success: false,
        message: err.message === 'Conflicting photo changes' ? err.message : 'Invalid profile form.'
      });
    }
  });
};

module.exports = { parseProfileForm, uploadRateLimit };
