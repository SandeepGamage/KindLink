/**
 * KindLink Admin Portal — dashboard API.
 * Shapes mirror mobile/src/services/admin.service.ts.
 */

import { api } from './client';

export interface DashboardStats {
  activeUsers: number;
  pendingVerification: number;
  newUsersToday: number;
  sentBroadcasts: number;
  draftBroadcasts: number;
  lastBroadcastAt: string | null;
}

/**
 * What happened, as opposed to which collection it came from. Finer than `kind`:
 * a published broadcast and a saved draft share a `kind` but not an `action`.
 */
export type ActivityAction = 'user_joined' | 'broadcast_sent' | 'broadcast_draft';

export interface ActivityItem {
  id: string;
  text: string;
  timestamp: string;
  kind: 'user' | 'notification';
  /** Absent when served by an older API — fall back to `kind`. */
  action?: ActivityAction;
}

/**
 * Breakdown of the user base. Buckets within each group are mutually exclusive
 * and sum to `total`, so they can be rendered as slices directly.
 */
export interface UserDistribution {
  total: number;
  byRole: { volunteer: number; elderly: number; senior: number; admin: number };
  byStatus: { active: number; pending: number; inactive: number };
}

/** Fired after any change that moves the dashboard counts, so badges can refresh. */
export const STATS_CHANGED_EVENT = 'kindlink:stats-changed';

export function notifyStatsChanged() {
  window.dispatchEvent(new Event(STATS_CHANGED_EVENT));
}

export function getDashboardStats(): Promise<DashboardStats> {
  return api.get<DashboardStats>('/admin/stats');
}

export function getRecentActivity(limit = 5): Promise<ActivityItem[]> {
  return api.get<ActivityItem[]>(`/admin/activity?limit=${limit}`);
}

export function getUserDistribution(): Promise<UserDistribution> {
  return api.get<UserDistribution>('/admin/stats/distribution');
}
