const multer = require('multer');
const {
  storeAvatar,
  MAX_AVATAR_BYTES,
  INVALID_FILE_TYPE
} = require('../config/storage');

/**
 * @desc    Store an uploaded avatar image and return its public path
 * @route   POST /api/uploads/avatar
 * @access  Private (any authenticated user)
 *
 * Deliberately does NOT write to the User document. This is a pure
 * "store the bytes, hand back a reference" endpoint, so every flow that needs
 * an avatar — the admin profile screen today, account registration later —
 * can call it and then decide for itself what to do with the returned path.
 */
exports.uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file was received'
      });
    }

    const url = await storeAvatar(req.file, req.user?._id);

    return res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: { url }
    });
  } catch (error) {
    // The storage provider refused or was unreachable. 503 rather than 500 so
    // the client can tell "try again shortly" apart from a malformed request.
    console.error('UploadAvatar error:', error);
    return res.status(503).json({
      success: false,
      message: 'Image storage is unavailable right now. Please try again.'
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
