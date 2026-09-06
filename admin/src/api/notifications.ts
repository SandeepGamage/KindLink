/**
 * KindLink Admin Portal — Notifications API Client
 * Proxied via Vite dev server: /api/* → http://localhost:5000/api/*
 */

const API_BASE = '/api';

/** Matches the Notification enum on the backend model. */
export type NotificationAudience = 'all' | 'volunteer' | 'elder';
export type NotificationStatus = 'sent' | 'draft';

export interface Broadcast {
  _id: string;
  title: string;
  message: string;
  type: string;
  audience: NotificationAudience;
  sender: string;
  status: NotificationStatus;
  createdAt: string;
}

export interface CreateBroadcastInput {
  title: string;
  message: string;
  type: string;
  audience: NotificationAudience;
  sender?: string;
  status: NotificationStatus;
}

function authHeaders(token: string | null) {
  return {
    Authorization: `Bearer ${token ?? ''}`,
    'Content-Type': 'application/json',
  };
}

/**
 * GET /api/notifications
 * Backend returns: { success, count, data: [...] }
 * Admins get every broadcast including drafts; the backend narrows by role.
 */
export async function getNotifications(token: string | null): Promise<Broadcast[]> {
  const res = await fetch(`${API_BASE}/notifications`, {
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Could not load broadcasts.');
  }

  return json.data;
}

/**
 * POST /api/notifications — admin only.
 * Backend returns: { success, data: { ...notification } }
 */
export async function createNotification(
  token: string | null,
  input: CreateBroadcastInput
): Promise<Broadcast> {
  const res = await fetch(`${API_BASE}/notifications`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(input),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Error creating notification.');
  }

  return json.data;
}

/**
 * DELETE /api/notifications/:id — admin only.
 */
export async function deleteNotification(
  token: string | null,
  id: string
): Promise<void> {
  const res = await fetch(`${API_BASE}/notifications/${id}`, {
    method: 'DELETE',
    headers: authHeaders(token),
  });

  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Error deleting broadcast.');
  }
}
