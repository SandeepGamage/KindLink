import { AdminApiClient } from './admin-api-client';

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
  sender?: string;
  /** Local-only, not persisted by the backend. */
  read?: boolean;
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
  /** Sent broadcasts addressed to the signed-in user (backend filters by role). */
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

  // --- Client-side read/dismiss state ---
  // The backend has no per-user read tracking, so these are local no-ops that
  // keep the client screen's optimistic UI working. Wire them up if/when a
  // per-user notification state model is added.
  toggleReadStatus: async (_id: string): Promise<{ read: boolean }> => ({ read: true }),
  markAllAsRead: async (): Promise<void> => {},
  hideClientNotification: async (_id: string): Promise<void> => {},
};
