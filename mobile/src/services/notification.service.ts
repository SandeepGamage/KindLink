import { ApiClient } from './apiClient';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  targetAudience?: string;
  audience?: string;
  status: 'sent' | 'draft';
  read?: boolean;
  type?: string;
  publishedAt?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  targetAudience: string;
  saveAsDraft: boolean;
}

export interface UpdateNotificationPayload extends CreateNotificationPayload {}

export const notificationService = {
  getClientNotifications: async (): Promise<Notification[]> => {
    const data = await ApiClient.get<Notification[]>('/notifications');
    return data || [];
  },
  toggleReadStatus: async (id: string): Promise<{ read: boolean }> => {
    // Optional placeholder if backend doesn't support this yet
    return { read: true };
  },
  deleteNotification: async (id: string): Promise<void> => {
    await ApiClient.delete(`/notifications/${id}`);
  },
  getAdminNotifications: async (): Promise<Notification[]> => {
    const data = await ApiClient.get<Notification[]>('/notifications');
    return data || [];
  },
  createNotification: async (payload: CreateNotificationPayload): Promise<Notification> => {
    const data = await ApiClient.post<Notification>('/notifications', {
      title: payload.title,
      message: payload.message,
      audience: payload.targetAudience, // mapping to backend field
      type: 'INFO', // Defaulting for now
      sender: 'Admin',
      status: payload.saveAsDraft ? 'draft' : 'sent',
    });
    return data || ({} as Notification);
  },
  updateNotification: async (id: string, payload: UpdateNotificationPayload): Promise<Notification> => {
    const data = await ApiClient.put<Notification>(`/notifications/${id}`, {
      title: payload.title,
      message: payload.message,
      audience: payload.targetAudience,
      status: payload.saveAsDraft ? 'draft' : 'sent',
    });
    return data || ({} as Notification);
  },
  deleteAdminNotification: async (id: string): Promise<void> => {
    await ApiClient.delete(`/notifications/${id}`);
  },
  publishNotification: async (id: string): Promise<Notification> => {
    // We can simulate publishing by updating the status
    const data = await ApiClient.put<Notification>(`/notifications/${id}`, {
      status: 'sent',
    });
    return data || ({} as Notification);
  },
  markAllAsRead: async (): Promise<void> => {},
  hideClientNotification: async (id: string): Promise<void> => {},
};
