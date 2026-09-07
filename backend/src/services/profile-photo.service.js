const User = require('../models/User');
const { storeAvatar, removeStoredFile } = require('../config/storage');

/** One persistence path for signup, profile forms and the legacy avatar route. */
const saveUserWithPhoto = async (user, file, profileImage) => {
  const previousImage = user.profileImage;
  let uploadedImage;
  if (profileImage !== undefined) {
    // Only keep or clear an existing reference. Accepting arbitrary paths, even
    // owned ones, could reattach a retired file while another save deletes it.
    if (file || typeof profileImage !== 'string' ||
        (profileImage !== '' && profileImage !== previousImage)) {
      const error = new Error('Attach a photo file instead of an image URL.');
      error.status = 400;
      throw error;
    }
    user.profileImage = profileImage;
  }

  try {
    await user.validate();
    if (file) {
      uploadedImage = await storeAvatar(file, user._id);
      user.profileImage = uploadedImage;
    }
    await user.save();
  } catch (error) {
    // A database acknowledgement can be lost after a successful commit. Keep
    // the file unless we can establish that it is no longer referenced.
    if (uploadedImage) {
      try {
        if (!await User.exists({ _id: user._id, profileImage: uploadedImage })) {
          await removeStoredFile(uploadedImage, user._id);
        }
      } catch (cleanupError) {
        console.error('[avatar cleanup] Database unavailable; retained photo for reconciliation:', cleanupError.cause || cleanupError);
      }
    }
    throw error;
  }

  if (previousImage && previousImage !== user.profileImage) {
    await removeStoredFile(previousImage, user._id);
  }
  return user;
};

module.exports = { saveUserWithPhoto };
