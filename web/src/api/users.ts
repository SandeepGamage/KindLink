/**
 * KindLink Admin Portal — user management API.
 * Shapes mirror mobile/src/services/user.service.ts.
 */

import { api } from './client';
import type { UserRole } from './auth';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  isActive: boolean;
  age?: number;
  mobile?: string;
  address?: string;
  profileImage?: string;
  /** Stored `/uploads/...` path of a volunteer's ID document. */
  idDocument?: string;
  availability?: string[];
  /** Volunteers only. */
  approvalStatus?: ApprovalStatus;
  /** When the current approved/rejected decision was made. Null while pending. */
  approvalReviewedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserQuery {
  role?: UserRole | 'all';
  search?: string;
  status?: 'active' | 'inactive' | 'verified' | 'pending';
  /** Filters volunteers by approvalStatus. */
  approval?: ApprovalStatus;
}

export function getAllUsers(params: UserQuery = {}): Promise<User[]> {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const qs = query.toString();
  return api.get<User[]>(`/admin/users${qs ? `?${qs}` : ''}`);
}

export function toggleUserActive(id: string): Promise<User> {
  return api.put<User>(`/admin/users/${id}/toggle-active`);
}

export async function deleteUser(id: string): Promise<void> {
  await api.del(`/admin/users/${id}`);
}
