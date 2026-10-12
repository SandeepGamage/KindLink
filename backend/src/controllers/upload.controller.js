const User = require('../models/User');
const { saveUserWithPhoto } = require('../services/profile-photo.service');
const multer = require('multer');
const {
  MAX_AVATAR_BYTES,
  INVALID_FILE_TYPE
} = require('../config/storage');

/**
 * @desc    Store an uploaded avatar image and return its public path
 * @route   POST /api/uploads/avatar
 * @access  Private (any authenticated user)
 *
 * Compatibility endpoint: stores and attaches the photo in one operation.
 * Signup and profile forms use their own multipart routes to save all fields.
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was received'
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(401).json({ success: false, message: 'Account not found.' });
    await saveUserWithPhoto(user, req.file);
    const url = user.profileImage;

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { url }
    });
  } catch (error) {
    if (error.name === 'VersionError') {
      return res.status(409).json({ success: false, message: 'Your profile changed. Refresh and try again.' });
    }
    if (error.status === 400 || error.name === 'ValidationError' || error.name === 'CastError') {
      return res.status(400).json({ success: false, message: error.message || 'Invalid avatar data' });
    }
    if (error.status === 503) {
      console.error('UploadAvatar storage error:', error.cause || error);
      return res.status(503).json({
        success: false,
        message: 'Image storage is unavailable right now. Please try again.'
      });
    }
    console.error('UploadAvatar error:', error.cause || error);
    return res.status(500).json({
      success: false,
      message: 'Server error updating profile photo'
    });
  }
};

/**
 * Error middleware for the upload router.
 *
 * The app has no global error handler, and multer rejects (oversized file,
 * disallowed type) by calling next(err) rather than answering the request — so
 * without this the client would hang until timeout instead of seeing a reason.
 * Mounted on the upload router only.
 */
exports.handleUploadError = (err, req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const limitMb = Math.round(MAX_AVATAR_BYTES / (1024 * 1024));
      return res.status(400).json({
        success: false,
        message: `Image must be smaller than ${limitMb}MB`
      });
    }
    return res.status(400).json({
      success: false,
      message: 'Only a single image may be uploaded, in the "avatar" field'
    });
  }

  if (err.code === INVALID_FILE_TYPE) {
    return res.status(400).json({
      success: false,
      message: 'Only JPEG, PNG or WebP images are allowed'
    });
  }

  console.error('Upload error:', err);
  return res.status(500).json({
    success: false,
    message: 'Server error uploading image'
  });
};
