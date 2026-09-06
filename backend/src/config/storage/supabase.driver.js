/**
 * supabase.driver.js
 *
 * Stores avatars in a public Supabase Storage bucket and returns the permanent
 * public URL, which is what gets persisted on the user document.
 *
 * Configured entirely by environment (see backend/.env.example):
 *   SUPABASE_URL                 https://<project-ref>.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY    the *secret* key — server only, never shipped
 *   SUPABASE_AVATAR_BUCKET       defaults to "avatars"
 *
 * The bucket must be created as PUBLIC. That is what makes `getPublicUrl` return
 * a URL that works forever in the mobile app and any browser, with no signed
 * token to expire. The secret key bypasses row-level security, so no storage
 * policies need to be written for uploads or deletes.
 */

const { createClient } = require('@supabase/supabase-js');

const BUCKET = process.env.SUPABASE_AVATAR_BUCKET || 'avatars';

/** Segment Supabase puts in every public object URL. */
const PUBLIC_MARKER = '/storage/v1/object/public/';

/**
 * The server-side key.
 *
 * Supabase renamed this: the JWT-based `service_role` key became the
 * `sb_secret_...` secret key, and the legacy pair is deprecated at the end of
 * 2026. Either value works with `createClient`, so both env names are accepted
 * and the modern one wins — an existing .env keeps working untouched.
 */
const getSecretKey = () =>
  process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

/** True when both required credentials are present. */
const isConfigured = () => !!(process.env.SUPABASE_URL && getSecretKey());

// Created lazily so that merely requiring this file (which `index.js` does to
// decide which driver to use) never throws when the project has no credentials.
let client = null;
const getClient = () => {
  if (!client) {
    client = createClient(process.env.SUPABASE_URL, getSecretKey(), {
      // A server has no browser session to persist or refresh.
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return client;
};

/** True for a reference this driver owns (and may therefore delete). */
const owns = (value) =>
  typeof value === 'string' &&
  value.startsWith(`${process.env.SUPABASE_URL || '\0'}${PUBLIC_MARKER}${BUCKET}/`);

/** Recovers the object path from a stored public URL, or null if not ours. */
const toObjectPath = (url) => {
  if (!owns(url)) return null;
  const prefix = `${process.env.SUPABASE_URL}${PUBLIC_MARKER}${BUCKET}/`;
  // Strip any cache-busting query string, then undo the URL encoding Supabase
  // applies to the path it hands back.
  const encoded = url.slice(prefix.length).split('?')[0];
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
};

/**
 * Uploads the buffer and returns its permanent public URL.
 *
 * `objectPath` is `<userId>/<filename>`: a folder per user keeps the storage
 * dashboard readable, and the timestamped filename means every upload gets a
 * fresh URL — which is what stops expo-image serving the previous photo from
 * its cache.
 *
 * Throws on failure. supabase-js reports problems in an `error` field rather
 * than rejecting, so each call has to check it explicitly.
 */
const store = async (filename, buffer, { userId, contentType }) => {
  const objectPath = `${userId}/${filename}`;

  const { error } = await getClient()
    .storage.from(BUCKET)
    .upload(objectPath, buffer, { contentType, upsert: false });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = getClient().storage.from(BUCKET).getPublicUrl(objectPath);

  if (!data?.publicUrl) {
    throw new Error('Supabase did not return a public URL for the uploaded image');
  }

  return data.publicUrl;
};

/** Best-effort delete. Never throws — cleanup must not fail a user's save. */
const remove = async (reference) => {
  const objectPath = toObjectPath(reference);
  if (!objectPath) return false;

  try {
    const { error } = await getClient().storage.from(BUCKET).remove([objectPath]);
    if (error) {
      console.error('[storage:supabase] delete failed:', error.message);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[storage:supabase] delete failed:', error.message);
    return false;
  }
};

module.exports = {
  name: 'Supabase Storage',
  BUCKET,
  isConfigured,
  owns,
  toObjectPath,
  store,
  remove
};
