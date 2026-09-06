import { AdminApiClient } from './admin-api-client';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'volunteer' | 'elderly' | 'senior' | 'admin';
  isVerified: boolean;
  isActive: boolean;
  age?: number | null;
  mobile?: string;
  address?: string;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const userService = {
  /**
   * Fetch all users (admin only).
   * Supports optional query params for filtering.
   */
  getAllUsers: async (params?: {
    role?: string;
    search?: string;
    status?: string;
  }): Promise<User[]> => {
    const query = new URLSearchParams();
    if (params?.role && params.role !== 'All') query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    if (params?.status) query.append('status', params.status);

    const queryStr = query.toString();
    const endpoint = `/admin/users${queryStr ? `?${queryStr}` : ''}`;
    return AdminApiClient.get<User[]>(endpoint);
  },

  /**
   * Toggle a user's active status (admin only).
   */
  toggleUserActive: (userId: string): Promise<User> =>
    AdminApiClient.put<User>(`/admin/users/${userId}/toggle-active`),

  /**
   * Permanently delete a user (admin only).
   */
  deleteUser: async (userId: string): Promise<void> => {
    await AdminApiClient.delete(`/admin/users/${userId}`);
  },
};
