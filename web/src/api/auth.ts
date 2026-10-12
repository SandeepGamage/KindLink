/**
 * KindLink Admin Portal — Auth API
 */

import { api } from './client';

export type UserRole = 'volunteer' | 'elderly' | 'senior' | 'admin';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  mobile?: string;
  address?: string;
  bio?: string;
  profileImage?: string;
}

export interface LoginResponse {
  token: string;
  user: AdminUser;
}

/**
 * POST /api/auth/login
 * Backend returns: { success, data: { user, token } }
 */
export function login(email: string, password: string): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', { email, password });
}

/**
 * GET /api/auth/me
 * Backend returns: { success, data: { user } }
 */
export async function getMe(): Promise<AdminUser> {
  const { user } = await api.get<{ user: AdminUser }>('/auth/me');
  return user;
}
