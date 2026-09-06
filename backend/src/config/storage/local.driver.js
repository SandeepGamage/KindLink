/**
 * local.driver.js
 *
 * Stores avatars on the server's own disk, under <backend>/uploads/avatars,
 * and serves them through the `express.static` mount in server.js.
 *
 * This is the fallback driver: it needs no credentials and no network, so the
 * project runs out of the box for anyone without a Supabase account. It is also
 * what keeps images uploaded before the Supabase switch working, since the
 * delete path is chosen by the shape of a stored reference rather than by
 * whichever driver happens to be active.
 */

const fs = require('fs');
const path = require('path');

/** Root of the publicly served upload tree. */
const UPLOAD_ROOT = path.join(__dirname, '..', '..', '..', 'uploads');

/** Where avatars are written. */
const AVATAR_DIR = path.join(UPLOAD_ROOT, 'avatars');

/** URL prefix the static mount serves AVATAR_DIR from. */
const AVATAR_PUBLIC_PREFIX = '/uploads/avatars/';

// Created once at require-time so the first upload never races on a missing dir.
fs.mkdirSync(AVATAR_DIR, { recursive: true });

/** True for a reference this driver owns (and may therefore delete). */
const owns = (value) =>
  typeof value === 'string' &&
  value.startsWith(AVATAR_PUBLIC_PREFIX) &&
  !value.includes('..');

/**
 * Writes the buffer to disk and returns the path clients persist and request.
 */
const store = async (filename, buffer) => {
  await fs.promises.writeFile(path.join(AVATAR_DIR, filename), buffer);
  return `${AVATAR_PUBLIC_PREFIX}${filename}`;
};

/**
 * Best-effort delete. Never throws: a file that is already gone is not an error,
 * and cleanup must not fail the user's save.
 */
const remove = async (reference) => {
  if (!owns(reference)) return false;

  try {
    await fs.promises.unlink(path.join(AVATAR_DIR, path.basename(reference)));
    return true;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.error('[storage:local] delete failed:', error.message);
    }
    return false;
  }
};

module.exports = {
  name: 'local disk',
  UPLOAD_ROOT,
  AVATAR_DIR,
  AVATAR_PUBLIC_PREFIX,
  owns,
  store,
  remove
};
