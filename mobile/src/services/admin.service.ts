import { AdminApiClient } from './admin-api-client';

export interface DashboardStats {
  activeUsers: number;
  pendingVerification: number;
  newUsersToday: number;
  sentBroadcasts: number;
  draftBroadcasts: number;
  lastBroadcastAt: string | null;
}

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  kind: 'user' | 'notification';
}

/**
 * Breakdown of the user base for the dashboard chart. Buckets within each
 * breakdown are mutually exclusive and each group sums to `total`, so they can
 * be rendered as slices directly.
 */
export interface UserDistribution {
  total: number;
  byRole: { volunteer: number; elderly: number; senior: number; admin: number };
  byStatus: { active: number; pending: number; inactive: number };
}

export const adminService = {
  getDashboardStats: (): Promise<DashboardStats> =>
    AdminApiClient.get<DashboardStats>('/admin/stats'),

  getRecentActivity: (limit = 5): Promise<ActivityItem[]> =>
    AdminApiClient.get<ActivityItem[]>(`/admin/activity?limit=${limit}`),

  getUserDistribution: (): Promise<UserDistribution> =>
    AdminApiClient.get<UserDistribution>('/admin/stats/distribution'),
};
