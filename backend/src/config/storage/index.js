/**
 * storage/index.js
 *
 * The single place that knows *where uploaded bytes live*. Everything else in
 * the app deals only in the reference string this module hands back, so adding
 * or swapping a storage provider means touching a driver and nothing else.
 *
 * Two drivers ship today, chosen by environment at startup:
 *   - Supabase Storage, when SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.
 *     Stores an absolute public URL.
 *   - Local disk otherwise. Stores a relative path ("/uploads/avatars/<file>")
 *     served by the express.static mount in server.js.
 *
 * Deletes are routed by the *shape of the reference*, not by the active driver,
 * so a database holding a mix of old local paths and new Supabase URLs cleans up
 * correctly after a switch.
 */

const multer = require('multer');
const localDriver = require('./local.driver');
const supabaseDriver = require('./supabase.driver');

/** 5 MB. The client compresses to well under this; the cap is a backstop. */
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const EXTENSION_BY_MIME = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

/** Tag used to recognise our own fileFilter rejection in the error handler. */
const INVALID_FILE_TYPE = 'INVALID_FILE_TYPE';

// Every driver receives a Buffer and decides where it goes, so the multipart
// body is parsed into memory rather than straight to disk. Safe because
// `limits.fileSize` below caps what can ever be buffered.
const avatarUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_BYTES },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    const error = new Error('Unsupported image type');
    error.code = INVALID_FILE_TYPE;
    return cb(error);
  }
});

/**
 * The driver in use, resolved on first use and then cached.
 *
 * Resolved lazily rather than at require-time on purpose: this module would
 * otherwise read process.env before the entry point has had a chance to load
 * `.env`, and a configured project would silently fall back to local disk.
 */
let activeDriver = null;
const getDriver = () => {
  if (!activeDriver) {
    activeDriver = supabaseDriver.isConfigured() ? supabaseDriver : localDriver;
  }
  return activeDriver;
};

/**
 * Resolves the driver and logs it. Called once at startup (after the
 * environment is loaded) so a mistyped .env is obvious immediately, rather than
 * at the first upload someone attempts.
 */
const initStorage = () => {
  const driver = getDriver();
  console.log(`Avatar storage: ${driver.name}`);
  return driver.name;
};

/**
 * Stores an uploaded image and returns the reference to persist on the user.
 *
 * A fresh timestamped filename per upload means the URL changes every time,
 * which is what stops expo-image (or any CDN) serving the previous photo.
 *
 * Throws if the provider rejects the upload; the caller reports that as a 503.
 */
const storeAvatar = async (file, userId) => {
  const owner = userId ? String(userId) : 'anonymous';
  const ext = EXTENSION_BY_MIME[file.mimetype] || '.jpg';
  const filename = `avatar-${owner}-${Date.now()}${ext}`;

  return getDriver().store(filename, file.buffer, {
    userId: owner,
    contentType: file.mimetype
  });
};

/**
 * Best-effort delete of a previously stored avatar.
 *
 * Never throws: a reference no driver recognises (an external URL, an empty
 * string) is ignored, and a file that is already gone is not an error. Callers
 * treat cleanup as housekeeping that must not fail a user's save.
 */
const removeStoredFile = async (reference) => {
  if (!reference) return false;

  if (supabaseDriver.owns(reference)) {
    return supabaseDriver.remove(reference);
  }
  if (localDriver.owns(reference)) {
    return localDriver.remove(reference);
  }
  return false;
};

module.exports = {
  UPLOAD_ROOT: localDriver.UPLOAD_ROOT,
  AVATAR_PUBLIC_PREFIX: localDriver.AVATAR_PUBLIC_PREFIX,
  MAX_AVATAR_BYTES,
  INVALID_FILE_TYPE,
  initStorage,
  getDriverName: () => getDriver().name,
  avatarUpload,
  storeAvatar,
  removeStoredFile
};
