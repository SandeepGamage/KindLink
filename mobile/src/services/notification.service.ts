import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'kindlink_auth_token';

const getApiUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  const constantsObj = Constants as unknown as Record<string, any>;
  const hostUri =
    Constants.expoConfig?.hostUri ??
    constantsObj.manifest2?.extra?.expoGo?.developer?.extra?.hostUri ??
    constantsObj.manifest?.debuggerHost;

  if (typeof hostUri === 'string') {
    const hostIp = hostUri.split(':')[0];
    if (hostIp) {
      return `http://${hostIp}:5000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:5000/api';
  }

  return 'http://localhost:5000/api';
};

const API_URL = getApiUrl();

async function getStoredToken(): Promise<string | null> {
  if (Platform.OS === 'web') {
    return sessionStorage.getItem(TOKEN_KEY);
  }
  return SecureStore.getItemAsync(TOKEN_KEY);
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  _id: string;
  title: string;
  message: string;
  targetAudience: 'all' | 'volunteer' | 'elder';
  status: 'draft' | 'sent';
  type: 'system' | 'match' | 'booking' | 'message' | 'payment';
  createdBy: string;
  publishedAt?: string | null;
  readBy: string[];
  hiddenBy: string[];
  createdAt: string;
  updatedAt: string;
  read?: boolean;
}

export interface CreateNotificationPayload {
  title: string;
  message: string;
  targetAudience?: 'all' | 'volunteer' | 'elder';
  saveAsDraft?: boolean;
}

export interface UpdateNotificationPayload {
  title?: string;
  message?: string;
  targetAudience?: 'all' | 'volunteer' | 'elder';
}

export class NotificationError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

// ---------------------------------------------------------------------------
// Helper for Fetch Headers
// ---------------------------------------------------------------------------

async function getHeaders(token?: string): Promise<Record<string, string>> {
  const authToken = token ?? (await getStoredToken());
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  return headers;
}

// ---------------------------------------------------------------------------
// Client API Methods
// ---------------------------------------------------------------------------

async function getClientNotifications(token?: string): Promise<Notification[]> {
  const headers = await getHeaders(token);
  try {
    const response = await fetch(`${API_URL}/notifications`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.data?.notifications ?? [];
  } catch {
    return [];
  }
}

async function getUnreadCount(token?: string): Promise<number> {
  const headers = await getHeaders(token);
  try {
    const response = await fetch(`${API_URL}/notifications/unread-count`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return 0;
    const data = await response.json();
    return data?.data?.unreadCount ?? 0;
  } catch {
    return 0;
  }
}

async function markAsRead(id: string, token?: string): Promise<void> {
  const headers = await getHeaders(token);
  try {
    await fetch(`${API_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers,
    });
  } catch (err) {
    console.error('Error marking as read:', err);
  }
}

async function toggleReadStatus(id: string, token?: string): Promise<{ read: boolean }> {
  const headers = await getHeaders(token);
  try {
    const response = await fetch(`${API_URL}/notifications/${id}/toggle-read`, {
      method: 'PATCH',
      headers,
    });
    const data = await response.json();
    return { read: data.read };
  } catch (err) {
    console.error('Error toggling read status:', err);
    throw err;
  }
}

async function markAllAsRead(token?: string): Promise<void> {
  const headers = await getHeaders(token);
  try {
    await fetch(`${API_URL}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers,
    });
  } catch (err) {
    console.error('Error marking all as read:', err);
  }
}

async function hideClientNotification(id: string, token?: string): Promise<void> {
  const headers = await getHeaders(token);
  try {
    await fetch(`${API_URL}/notifications/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    console.error('Error hiding notification:', err);
  }
}

// ---------------------------------------------------------------------------
// Admin API Methods
// ---------------------------------------------------------------------------

async function getAllNotifications(token?: string): Promise<Notification[]> {
  const headers = await getHeaders(token);
  try {
    const response = await fetch(`${API_URL}/notifications/admin`, {
      method: 'GET',
      headers,
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data?.data?.notifications ?? [];
  } catch {
    return [];
  }
}

async function createNotification(payload: CreateNotificationPayload, token?: string): Promise<Notification> {
  const headers = await getHeaders(token);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/notifications/admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new NotificationError('Unable to connect to server.', 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new NotificationError(data?.message ?? 'Failed to create notification.', response.status);
  }
  return data.data;
}

async function updateNotification(id: string, payload: UpdateNotificationPayload, token?: string): Promise<Notification> {
  const headers = await getHeaders(token);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/notifications/admin/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(payload),
    });
  } catch (err) {
    throw new NotificationError('Unable to connect to server.', 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new NotificationError(data?.message ?? 'Failed to update notification.', response.status);
  }
  return data.data;
}

async function deleteNotification(id: string, token?: string): Promise<void> {
  const headers = await getHeaders(token);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/notifications/admin/${id}`, {
      method: 'DELETE',
      headers,
    });
  } catch (err) {
    throw new NotificationError('Unable to connect to server.', 0);
  }

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new NotificationError(data?.message ?? 'Failed to delete notification.', response.status);
  }
}

async function publishNotification(id: string, token?: string): Promise<Notification> {
  const headers = await getHeaders(token);
  let response: Response;
  try {
    response = await fetch(`${API_URL}/notifications/admin/${id}/publish`, {
      method: 'PATCH',
      headers,
    });
  } catch (err) {
    throw new NotificationError('Unable to connect to server.', 0);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new NotificationError(data?.message ?? 'Failed to publish notification.', response.status);
  }
  return data.data;
}

export const notificationService = {
  getClientNotifications,
  getUnreadCount,
  markAsRead,
  toggleReadStatus,
  markAllAsRead,
  hideClientNotification,
  getAllNotifications,
  createNotification,
  updateNotification,
  deleteNotification,
  publishNotification,
};
