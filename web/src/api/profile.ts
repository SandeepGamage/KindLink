/**
 * KindLink Admin Portal — the signed-in admin's own profile.
 */

import { api } from './client';
import type { AdminUser } from './auth';

export interface UpdateUserPayload {
  name?: string;
  mobile?: string;
  address?: string;
  bio?: string;
  /** An `/uploads/...` path or URL; `''` removes the photo. */
  profileImage?: string;
}

/** PUT /api/auth/update-user */
export async function updateUser(payload: UpdateUserPayload): Promise<AdminUser> {
  const { user } = await api.put<{ user: AdminUser }>('/auth/update-user', payload);
  return user;
}

/**
 * POST /api/uploads/avatar — stores the file and returns its URL. It does not
 * touch the user; pass the URL to `updateUser` as `profileImage`.
 */
export async function uploadAvatar(file: File): Promise<string> {
  const form = new FormData();
  form.append('avatar', file);
  const { url } = await api.postForm<{ url: string }>('/uploads/avatar', form);
  return url;
}
