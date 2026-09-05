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

export const adminService = {
  getDashboardStats: (): Promise<DashboardStats> =>
    AdminApiClient.get<DashboardStats>('/admin/stats'),

  getRecentActivity: (limit = 5): Promise<ActivityItem[]> =>
    AdminApiClient.get<ActivityItem[]>(`/admin/activity?limit=${limit}`),
};
