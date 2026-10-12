/**
 * api-config.ts
 *
 * One place for "where is the API, and how do I turn a stored path into
 * something this device can load".
 *
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Server origin (no `/api`).
 * Automatically adapts to:
 * 1. EXPO_PUBLIC_API_URL or EXPO_PUBLIC_PORT if configured in .env
 * 2. Automatic port extraction from any configured URL
 * 3. Android emulator loopback (10.0.2.2) vs localhost
 * 4. Real physical device LAN IP from Expo Go bundler hostUri
 */
export const API_ORIGIN: string = (() => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  
  // Extract port from env URL if present, or use default backend port
  const portMatch = envUrl ? envUrl.match(/:(\d+)/) : null;
  const configuredPort = process.env.EXPO_PUBLIC_PORT || (portMatch ? portMatch[1] : '5007');

  if (envUrl) {
    let cleaned = envUrl.replace(/\/api\/?$/, '').replace(/\/$/, '');
    // If testing on Android emulator and localhost was provided, rewrite to 10.0.2.2 automatically
    if (Platform.OS === 'android') {
      cleaned = cleaned.replace('://localhost', '://10.0.2.2').replace('://127.0.0.1', '://10.0.2.2');
    }
    return cleaned;
  }

  // Auto-detect host machine IP when running on physical device through Expo Go
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:${configuredPort}`;
    }
  }

  // Android emulator connects to host machine via 10.0.2.2
  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${configuredPort}`;
  }

  // Web / iOS Simulator
  return `http://localhost:${configuredPort}`;
})();

/** API base, e.g. `http://10.0.2.2:5007/api`. */
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
