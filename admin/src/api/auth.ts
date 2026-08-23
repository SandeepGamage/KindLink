/**
 * KindLink Admin Portal — Backend API Client
 * Proxied via Vite dev server: /api/* → http://localhost:5000/api/*
 */

const API_BASE = '/api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  profileImage?: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
}

export interface MeResponse {
  success: boolean;
  user: AdminUser;
}

/**
 * POST /api/auth/login
 * Backend returns: { success, data: { user, token } }
 * We unwrap `data` to return a flat { success, token, user }.
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Login failed. Please try again.');
  }

  // Unwrap the backend's { success, data: { user, token } } envelope
  return {
    success: json.success,
    token: json.data.token,
    user: json.data.user,
  };
}

/**
 * GET /api/auth/me
 * Backend returns: { success, data: { user } }
 * We unwrap `data` to return a flat { success, user }.
 */
export async function getMe(token: string): Promise<MeResponse> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Session expired. Please log in again.');
  }

  // Unwrap the backend's { success, data: { user } } envelope
  return {
    success: json.success,
    user: json.data.user,
  };
}
