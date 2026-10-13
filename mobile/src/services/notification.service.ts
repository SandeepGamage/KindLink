import { AdminApiClient } from './admin-api-client';

/** Automatic messages (appointment updates etc.), as opposed to admin broadcasts. */
export const isSystemNotification = (n: Notification): boolean =>
  n.source === 'system' || n.type === 'SYSTEM';

/** Matches the Notification enum on the backend model. */
export type NotificationAudience = 'all' | 'volunteer' | 'elder';
export type NotificationStatus = 'sent' | 'draft';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  /** Canonical backend field — see backend/src/models/Notification.js */
  audience: NotificationAudience;
  status: NotificationStatus;
  type?: string;
  /** 'admin' = broadcast, 'system' = automatic message (e.g. appointment update). */
  source?: 'admin' | 'system';
  /** Set on automatic messages addressed to one user; null for broadcasts. */
  recipient?: string | null;
  sender?: string;
  /** Whether the signed-in user has read it (tracked per user on the backend). */
  read?: boolean;
  /** When it went out to users; later than createdAt for a published draft. */
  sentAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NotificationPayload {
  title: string;
  message: string;
  audience: NotificationAudience;
  saveAsDraft: boolean;
}

export const notificationService = {
  /** Notifications addressed to the signed-in user, with their own read state. */
  getClientNotifications: (): Promise<Notification[]> =>
    AdminApiClient.get<Notification[]>('/notifications'),

  /** Every broadcast including drafts — the backend only returns these to admins. */
  getAdminNotifications: (): Promise<Notification[]> =>
    AdminApiClient.get<Notification[]>('/notifications'),

  createNotification: (payload: NotificationPayload): Promise<Notification> =>
    AdminApiClient.post<Notification>('/notifications', {
      title: payload.title,
      message: payload.message,
      audience: payload.audience,
      type: 'INFO',
      sender: 'Admin',
      status: payload.saveAsDraft ? 'draft' : 'sent',
    }),

  updateNotification: (id: string, payload: NotificationPayload): Promise<Notification> =>
    AdminApiClient.put<Notification>(`/notifications/${id}`, {
      title: payload.title,
      message: payload.message,
      audience: payload.audience,
      status: payload.saveAsDraft ? 'draft' : 'sent',
    }),

  /** Publishes a draft. The backend applies only the fields sent, so the rest is preserved. */
  publishNotification: (id: string): Promise<Notification> =>
    AdminApiClient.put<Notification>(`/notifications/${id}`, { status: 'sent' }),

  deleteNotification: (id: string): Promise<void> =>
    AdminApiClient.delete<void>(`/notifications/${id}`),

  deleteAdminNotification: (id: string): Promise<void> =>
    AdminApiClient.delete<void>(`/notifications/${id}`),

  // --- Per-user inbox state (stored on the backend for the signed-in user) ---
  setReadStatus: (id: string, read: boolean): Promise<{ read: boolean }> =>
    AdminApiClient.put<{ read: boolean }>(`/notifications/${id}/read`, { read }),

  markAllAsRead: (): Promise<void> => AdminApiClient.put<void>('/notifications/read-all'),

  /** Removes it from this user's inbox only; the notification itself is kept. */
  hideClientNotification: (id: string): Promise<void> =>
    AdminApiClient.put<void>(`/notifications/${id}/hide`),
};
