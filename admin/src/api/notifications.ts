/**
 * KindLink Admin Portal — Notifications API
 */

import { api } from './client';

/** Matches the Notification enum on the backend model. */
export type NotificationAudience = 'all' | 'volunteer' | 'elder';
export type NotificationStatus = 'sent' | 'draft';
export type NotificationType = 'INFO' | 'ALERT' | 'WELCOME' | 'SYSTEM';

/** Display labels for the backend's `audience` enum. */
export const AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  all: 'All Users',
  volunteer: 'Volunteers',
  elder: 'Elders',
};

export const TYPE_LABELS: Record<NotificationType, string> = {
  INFO: 'Info',
  ALERT: 'Alert',
  WELCOME: 'Welcome',
  SYSTEM: 'System',
};

export interface Broadcast {
  _id: string;
  title: string;
  message: string;
  type: NotificationType;
  audience: NotificationAudience;
  sender: string;
  status: NotificationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface BroadcastInput {
  title: string;
  message: string;
  type: NotificationType;
  audience: NotificationAudience;
  sender?: string;
  status: NotificationStatus;
}

/**
 * GET /api/notifications
 * Admins get every broadcast including drafts; the backend narrows by role.
 */
export function getNotifications(): Promise<Broadcast[]> {
  return api.get<Broadcast[]>('/notifications');
}

/** POST /api/notifications — admin only. */
export function createNotification(input: BroadcastInput): Promise<Broadcast> {
  return api.post<Broadcast>('/notifications', input);
}

/** PUT /api/notifications/:id — admin only. Partial update. */
export function updateNotification(
  id: string,
  input: Partial<BroadcastInput>
): Promise<Broadcast> {
  return api.put<Broadcast>(`/notifications/${id}`, input);
}

/** Publishes a draft. */
export function publishNotification(id: string): Promise<Broadcast> {
  return updateNotification(id, { status: 'sent' });
}

/** DELETE /api/notifications/:id — admin only. */
export async function deleteNotification(id: string): Promise<void> {
  await api.del(`/notifications/${id}`);
}
