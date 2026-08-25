export interface Notification {
  _id: string;
  title: string;
  message: string;
  targetAudience: string;
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
    return [];
  },
  toggleReadStatus: async (id: string): Promise<{ read: boolean }> => {
    return { read: true };
  },
  deleteNotification: async (id: string): Promise<void> => {},
  getAdminNotifications: async (): Promise<Notification[]> => {
    return [];
  },
  createNotification: async (payload: CreateNotificationPayload): Promise<Notification> => {
    return {} as Notification;
  },
  updateNotification: async (id: string, payload: UpdateNotificationPayload): Promise<Notification> => {
    return {} as Notification;
  },
  deleteAdminNotification: async (id: string): Promise<void> => {},
  publishNotification: async (id: string): Promise<Notification> => {
    return {} as Notification;
  },
  markAllAsRead: async (): Promise<void> => {},
  hideClientNotification: async (id: string): Promise<void> => {},
};
