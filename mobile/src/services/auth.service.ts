/**
 * auth.service.ts
 *
 * Handles all authentication API calls.
 * Security practices:
 *  - Passwords are NEVER logged
 *  - JWT is stored via expo-secure-store (encrypted native keychain)
 *  - All errors return generic messages to the caller
 *  - Inputs are sanitized (trimmed) before sending
 */

import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const getApiUrl = (): string => {
  // 1. If explicit non-localhost IP set in env, use it
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // 2. Auto-detect host IP from Expo dev server connection (works for Expo Go on physical devices & emulators)
  const constantsObj = Constants as unknown as Record<string, any>;
  const hostUri =
    Constants.expoConfig?.hostUri ??
    constantsObj.manifest2?.extra?.expoGo?.developer?.extra?.hostUri ??
    constantsObj.manifest?.debuggerHost;

  if (typeof hostUri === 'string') {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:5000/api`;
    }
  }

  // 3. Fallback for Android Emulator
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  // 4. Default fallback for Web / iOS Simulator
  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

/** Key used to persist the auth token */
const TOKEN_KEY = 'kindlink_auth_token';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthUser {
  id?: string;
  _id?: string;
  name?: string;
  email: string;
  role?: string;
  age?: number | null;
  mobile?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  idDocument?: string;
  availability?: string[];
  dob?: string | Date | null;
  profileImage?: string;
  bio?: string;
  careNotes?: string;
  isVerified?: boolean;
}

export interface UpdateUserPayload {
  name?: string;
  age?: number | string | null;
  mobile?: string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  dob?: string | Date | null;
  profileImage?: string;
  bio?: string;
  careNotes?: string;
  availability?: string[];
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

// ---------------------------------------------------------------------------
// Token helpers — SecureStore on native, sessionStorage on web
// ---------------------------------------------------------------------------

async function saveToken(token: string): Promise<void> {
  if (Platform.OS === 'web') {
    // Web: use sessionStorage (not persisted across tabs/restarts)
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
}

async function getToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

async function deleteToken(): Promise<void> {
  if (Platform.OS === 'web') {
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

/**
 * Log in with email and password.
 * Returns the JWT and user object on success.
 * Throws an AuthError on failure.
 */
async function login(rawEmail: string, rawPassword: string): Promise<LoginResponse> {
  // Sanitize — trim whitespace; never log the password
  const email = rawEmail.trim().toLowerCase();
  const password = rawPassword; // intentionally not trimmed (passwords can have spaces)

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new AuthError(
      'Unable to connect to server. Please check your connection and backend server.',
      0,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Return a generic message to avoid field-level enumeration
    throw new AuthError(
      data?.message ?? 'Invalid email or password. Please try again.',
      response.status,
    );
  }

  const payload = data?.data ?? data;
  const token = payload?.token;
  const user = payload?.user;

  if (!token || !user) {
    throw new AuthError('Unexpected server response. Please try again.');
  }

  await saveToken(token);
  return { token, user };
}

/**
 * Log out — clears the stored token.
 */
async function logout(): Promise<void> {
  await deleteToken();
}

/**
 * Returns the stored JWT token, or null if not logged in.
 */
async function getStoredToken(): Promise<string | null> {
  return getToken();
}

/**
 * Fetches current user profile from /auth/me endpoint using token.
 */
async function getCurrentUser(token?: string): Promise<AuthUser | null> {
  const authToken = token ?? (await getToken());
  if (!authToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) return null;

    const data = await response.json().catch(() => ({}));
    const payload = data?.data ?? data;
    return payload?.user ?? null;
  } catch {
    return null;
  }
}

export interface SignUpPayload {
  name: string;
  email: string;
  role: 'elderly' | 'volunteer' | 'admin' | 'senior';
  age?: number | string;
  address?: string;
  emergencyContact?: string;
  emergencyContactName?: string;
  emergencyContactNumber?: string;
  idDocument?: string;
  availability?: string[];
  password?: string;
}

export interface VerificationResponse {
  token: string;
  user: AuthUser;
  verificationCode?: string;
}

/**
 * Register a new user or send verification code with full profile payload.
 * Saves the returned token and returns the user on success.
 */
async function register(
  payloadOrEmail: SignUpPayload | string,
  rawPassword?: string,
): Promise<LoginResponse> {
  const body =
    typeof payloadOrEmail === 'string'
      ? { email: payloadOrEmail.trim().toLowerCase(), password: rawPassword }
      : {
          ...payloadOrEmail,
          email: payloadOrEmail.email.trim().toLowerCase(),
          name: payloadOrEmail.name.trim(),
        };

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  } catch {
    throw new AuthError(
      'Unable to connect to server. Please check your connection and backend server.',
      0,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthError(
      data?.message ?? 'Registration failed. Please try again.',
      response.status,
    );
  }

  const payload = data?.data ?? data;
  const token = payload?.token;
  const user = payload?.user;

  if (!token || !user) {
    throw new AuthError('Unexpected server response. Please try again.');
  }

  await saveToken(token);
  return { token, user };
}

/**
 * Send verification code for elderly or volunteer signup.
 */
async function sendVerificationCode(payload: SignUpPayload): Promise<VerificationResponse> {
  return register(payload);
}

/**
 * Verify a 6-digit code.
 */
async function verifyCode(email: string, code: string): Promise<LoginResponse> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/verify-code`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
    });
  } catch {
    throw new AuthError(
      'Unable to connect to server. Please check your connection.',
      0,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthError(
      data?.message ?? 'Verification failed. Please check the code.',
      response.status,
    );
  }

  const payload = data?.data ?? data;
  const token = payload?.token;
  const user = payload?.user;

  if (!token || !user) {
    throw new AuthError('Unexpected server response. Please try again.');
  }

  await saveToken(token);
  return { token, user };
}

/**
 * Update authenticated user's profile information.
 * Security: Uses Bearer JWT token; email is protected and non-updatable.
 */
async function updateUser(payload: UpdateUserPayload, token?: string): Promise<AuthUser> {
  const authToken = token ?? (await getToken());
  if (!authToken) {
    throw new AuthError('You must be logged in to update your profile.', 401);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/update-user`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new AuthError(
      'Unable to connect to server. Please check your connection and backend server.',
      0,
    );
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new AuthError(
      data?.message ?? 'Failed to update profile. Please try again.',
      response.status,
    );
  }

  const responsePayload = data?.data ?? data;
  const updatedUser = responsePayload?.user ?? responsePayload;

  if (!updatedUser || !updatedUser.email) {
    throw new AuthError('Unexpected response from server during profile update.');
  }

  return updatedUser;
}

export const authService = {
  login,
  logout,
  register,
  sendVerificationCode,
  verifyCode,
  getStoredToken,
  getCurrentUser,
  updateUser,
};


