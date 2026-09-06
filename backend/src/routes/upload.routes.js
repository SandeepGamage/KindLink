const express = require('express');
const { protect } = require('../middleware/auth.middleware');
const { avatarUpload } = require('../config/storage');
const { uploadAvatar, handleUploadError } = require('../controllers/upload.controller');

const router = express.Router();

// `protect` and not `adminOnly`: uploading an avatar is not an admin action.
// Any signed-in user can call this, which is what lets the registration flow
// reuse it later (register returns a token, so a token always exists by then).
router.post('/avatar', protect, avatarUpload.single('avatar'), uploadAvatar);

// Must be last — turns multer's rejections into the app's { success, message } shape.
router.use(handleUploadError);

module.exports = router;
