/** Mirrors backend/src/controllers/conversation.controller.js responses. */

export interface ChatParticipant {
  _id: string;
  name: string;
  profileImage?: string;
  role?: string;
}

export interface ChatConnection {
  _id: string;
  title?: string;
  status: string;
}

export interface ConversationSummary {
  _id: string;
  otherUser: ChatParticipant;
  connection: ChatConnection | null;
  lastMessageAt: string | null;
  lastMessageSnippet: string;
  lastMessageFromMe: boolean;
  unreadCount: number;
  /** False once the connection is completed/cancelled — the chat is then read-only. */
  isActive: boolean;
}

export interface ConversationDetail {
  _id: string;
  otherUser: ChatParticipant | null;
  connection: ChatConnection | null;
  isActive: boolean;
}

export interface ChatMessage {
  _id: string;
  conversation: string;
  sender: string;
  recipient: string;
  content: string;
  isRead: boolean;
  readAt: string | null;
  clientId: string | null;
  createdAt: string;
}

export interface MessagePage {
  messages: ChatMessage[];
  hasMore: boolean;
  isActive: boolean;
}

/** A message as the chat screen shows it — including ones still on their way. */
export interface DisplayMessage extends ChatMessage {
  /** Stable React key: the clientId while sending, the server id otherwise. */
  key: string;
  deliveryStatus: 'sent' | 'sending' | 'failed';
}
