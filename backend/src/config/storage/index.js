const { randomUUID } = require('crypto');
const multer = require('multer');
const localDriver = require('./local.driver');
const supabaseDriver = require('./supabase.driver');
const {
  normalizeAvatar, MAX_AVATAR_BYTES, INVALID_FILE_TYPE, ALLOWED_MIME_TYPES
} = require('./validate-avatar');

const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_BYTES, files: 1, fields: 1, parts: 3, fieldSize: 32 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) return cb(null, true);
    const error = new Error('Only JPEG, PNG or WebP images are allowed');
    error.code = INVALID_FILE_TYPE;
    cb(error);
  }
});

const getDriverName = () => supabaseDriver.isConfigured() ? 'Supabase Storage' : 'not configured';
const initStorage = () => {
  console.log(`Avatar storage: ${getDriverName()}`);
  return getDriverName();
};

const storeAvatar = async (file, userId) => {
  const owner = String(userId || '');
  if (!/^[a-f\d]{24}$/i.test(owner)) throw new Error('An avatar owner is required');
  const buffer = await normalizeAvatar(file);
  try {
    if (!supabaseDriver.isConfigured()) throw new Error('Supabase is not configured');
    return await supabaseDriver.store(`avatar-${randomUUID()}.jpg`, buffer, {
      userId: owner, contentType: 'image/jpeg'
    });
  } catch {
    const error = new Error('Photo storage is unavailable. Please try again.');
    error.status = 503;
    throw error;
  }
};

// Users may only attach/delete their own files, even with a server secret key.
// Legacy local avatars remain readable and can be cleaned up on replacement.
const ownsAvatar = (reference, userId) => {
  const owner = String(userId || '');
  if (!/^[a-f\d]{24}$/i.test(owner) || typeof reference !== 'string') return false;
  const objectPath = supabaseDriver.toObjectPath(reference);
  if (objectPath) return new RegExp(`^${owner}/avatar-[a-zA-Z0-9-]+\\.(jpg|jpeg|png|webp)$`).test(objectPath);
  return new RegExp(`^/uploads/avatars/avatar-${owner}-[a-zA-Z0-9-]+\\.(jpg|jpeg|png|webp)$`).test(reference);
};

const removeStoredFile = async (reference, userId) => {
  if (!ownsAvatar(reference, userId)) return false;
  const driver = supabaseDriver.owns(reference) ? supabaseDriver : localDriver;
  // Bounded retry for transient cleanup failures; never undo a successful save.
  for (let attempt = 0; attempt < 3; attempt++) {
    if (await driver.remove(reference)) return true;
  }
  console.error('[avatar cleanup] Could not remove an unused photo for user', String(userId));
  return false;
};

module.exports = {
  UPLOAD_ROOT: localDriver.UPLOAD_ROOT,
  AVATAR_PUBLIC_PREFIX: localDriver.AVATAR_PUBLIC_PREFIX,
  MAX_AVATAR_BYTES, INVALID_FILE_TYPE, initStorage, getDriverName,
  avatarUpload, storeAvatar, ownsAvatar, removeStoredFile
};
