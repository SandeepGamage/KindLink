import { AdminApiClient } from './admin-api-client';
import type {
  ChatMessage,
  ConversationDetail,
  ConversationSummary,
  MessagePage,
} from '@/types/message';

// Uses the throwing client: the chat must tell "send failed" apart from "sent",
// and a closed chat (403) apart from a network blip.

// Lets the tab badge refresh the moment a chat is read, instead of on its next poll.
type Listener = () => void;
const unreadListeners = new Set<Listener>();

export const messageEvents = {
  onUnreadChanged(listener: Listener): () => void {
    unreadListeners.add(listener);
    return () => {
      unreadListeners.delete(listener);
    };
  },
  emitUnreadChanged() {
    unreadListeners.forEach((listener) => listener());
  },
};

/** Unique per send, so the server can de-duplicate a retried request. */
export const createClientId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const messageService = {
  getConversations: () => AdminApiClient.get<ConversationSummary[]>('/conversations'),

  getUnreadCount: async (): Promise<number> => {
    const data = await AdminApiClient.get<{ count: number }>('/conversations/unread-count');
    return data?.count ?? 0;
  },

  getConversation: (id: string) => AdminApiClient.get<ConversationDetail>(`/conversations/${id}`),

  /**
   * `after` returns everything since that timestamp (live sync); `before`
   * returns the page preceding it (scrolling back). Neither = latest page.
   */
  getMessages: (id: string, params: { after?: string; before?: string; limit?: number } = {}) => {
    const query = Object.entries(params)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
      .join('&');
    return AdminApiClient.get<MessagePage>(`/conversations/${id}/messages${query ? `?${query}` : ''}`, {
      timeoutMs: 10000,
    });
  },

  sendMessage: (id: string, content: string, clientId: string) =>
    AdminApiClient.post<{ message: ChatMessage; isActive: boolean }>(`/conversations/${id}/messages`, {
      content,
      clientId,
    }),

  markRead: async (id: string) => {
    await AdminApiClient.put<{ updated: number }>(`/conversations/${id}/read`);
    messageEvents.emitUnreadChanged();
  },
};
