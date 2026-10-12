import AsyncStorage from '@react-native-async-storage/async-storage';
import { AdminApiClient } from './admin-api-client';

// The backend has no per-user read tracking, so read/deleted state is kept on
// the device, keyed by user so a shared phone doesn't mix accounts.
const stateKey = (userId: string) => `@kindlink_notification_state_v1:${userId}`;

interface ClientNotificationState {
  read: string[];
  hidden: string[];
}

const loadState = async (userId: string): Promise<ClientNotificationState> => {
  try {
    const raw = await AsyncStorage.getItem(stateKey(userId));
    if (raw) {
      const parsed = JSON.parse(raw);
      return { read: parsed.read ?? [], hidden: parsed.hidden ?? [] };
    }
  } catch (err) {
    console.log('[NotificationService] Load state error:', err);
  }
  return { read: [], hidden: [] };
};

const saveState = async (userId: string, state: ClientNotificationState) => {
  try {
    await AsyncStorage.setItem(stateKey(userId), JSON.stringify(state));
  } catch (err) {
    console.log('[NotificationService] Save state error:', err);
  }
};

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
  /**
   * Notifications addressed to the signed-in user (backend filters by role),
   * with this device's read/deleted state applied.
   */
  getClientNotifications: async (userId: string): Promise<Notification[]> => {
    const [data, state] = await Promise.all([
      AdminApiClient.get<Notification[]>('/notifications'),
      loadState(userId),
    ]);
    const read = new Set(state.read);
    const hidden = new Set(state.hidden);
    return (data || [])
      .filter((n) => !hidden.has(n._id))
      .map((n) => ({ ...n, read: read.has(n._id) }));
  },

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

  // --- Client-side read/dismiss state (stored on device, see loadState) ---
  toggleReadStatus: async (userId: string, id: string): Promise<{ read: boolean }> => {
    const state = await loadState(userId);
    const isRead = state.read.includes(id);
    state.read = isRead ? state.read.filter((r) => r !== id) : [...state.read, id];
    await saveState(userId, state);
    return { read: !isRead };
  },

  markAllAsRead: async (userId: string, ids: string[]): Promise<void> => {
    const state = await loadState(userId);
    state.read = Array.from(new Set([...state.read, ...ids]));
    await saveState(userId, state);
  },

  hideClientNotification: async (userId: string, id: string): Promise<void> => {
    const state = await loadState(userId);
    if (!state.hidden.includes(id)) state.hidden.push(id);
    await saveState(userId, state);
  },
};
