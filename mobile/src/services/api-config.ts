/**
 * api-config.ts
 *
 * One place for "where is the API, and how do I turn a stored path into
 * something this device can load".
 *
 * NOTE: `auth.service.ts` and the two API clients each still carry their own
 * copy of the base-URL logic. Folding them into this module is deliberately
 * left for the post-merge cleanup already noted in `admin-api-client.ts` —
 * touching them now would conflict with teammates' branches. New code should
 * import from here.
 */
import { Platform } from 'react-native';

/** Server origin (no `/api`), e.g. `http://10.0.2.2:5000`. */
export const API_ORIGIN: string = (() => {
  // 1. Android emulator loopback alias — the emulator cannot see `localhost`.
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000';
  }

  // 2. Explicit environment override, with any trailing `/api` stripped.
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl) {
    return envUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
  }

  // 3. Default for Web / iOS Simulator.
  return 'http://localhost:5000';
})();

/** API base, e.g. `http://10.0.2.2:5000/api`. */
export const API_BASE_URL = `${API_ORIGIN}/api`;

/**
 * Turns a stored media reference into a URL this device can actually load.
 *
 * The backend stores avatars as relative paths (`/uploads/avatars/x.jpg`) so the
 * same database row works for the Android emulator (10.0.2.2), an iOS simulator
 * (localhost) and the admin web app. Anything already absolute — an external
 * `https` URL, a `data:` URI, or a local `file://` preview that has not been
 * uploaded yet — is passed straight through.
 */
export function resolveMediaUrl(value?: string | null): string | undefined {
  if (!value) return undefined;

  const trimmed = value.trim();
  if (!trimmed) return undefined;

  if (/^(https?:|data:|file:|content:|blob:|ph:|assets-library:)/i.test(trimmed)) {
    return trimmed;
  }

  return trimmed.startsWith('/') ? `${API_ORIGIN}${trimmed}` : `${API_ORIGIN}/${trimmed}`;
}
