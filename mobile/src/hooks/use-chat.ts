import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createClientId, messageService } from '@/services/message.service';
import { ApiError } from '@/services/admin-api-client';
import type { ChatMessage, ConversationDetail, DisplayMessage } from '@/types/message';
import { useLivePolling } from './use-live-polling';

const CHAT_POLL_MS = 3000;

const byCreatedAt = (a: ChatMessage, b: ChatMessage) =>
  a.createdAt === b.createdAt ? a._id.localeCompare(b._id) : a.createdAt.localeCompare(b.createdAt);

const toDisplay = (m: ChatMessage): DisplayMessage => ({
  ...m,
  // Same key as the optimistic bubble it replaces, so the row doesn't re-mount.
  key: m.clientId ?? m._id,
  deliveryStatus: 'sent',
});

/**
 * One live chat room: history, optimistic sending, and incoming messages.
 *
 * `enabled` should be the screen's focus state — incoming messages are only
 * marked read while the person can actually see them.
 */
export function useChat(conversationId: string, myId: string, enabled: boolean) {
  const [detail, setDetail] = useState<ConversationDetail | null>(null);
  const [serverMessages, setServerMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<DisplayMessage[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);

  // createdAt of the newest message from the server — the live-sync cursor.
  const cursorRef = useRef<string | undefined>(undefined);
  const loadedRef = useRef(false);
  const enabledRef = useRef(enabled);
  enabledRef.current = enabled;

  const merge = useCallback((incoming: ChatMessage[]) => {
    if (incoming.length === 0) return;

    setServerMessages((prev) => {
      const byId = new Map(prev.map((m) => [m._id, m]));
      incoming.forEach((m) => byId.set(m._id, m));
      return [...byId.values()].sort(byCreatedAt);
    });

    const confirmed = new Set(incoming.map((m) => m.clientId).filter(Boolean));
    if (confirmed.size > 0) {
      setPending((prev) => prev.filter((p) => !confirmed.has(p.clientId)));
    }

    const newest = incoming.reduce((max, m) => (m.createdAt > max ? m.createdAt : max), cursorRef.current ?? '');
    if (newest) cursorRef.current = newest;
  }, []);

  const markReadIfNeeded = useCallback(
    async (batch: ChatMessage[]) => {
      if (!enabledRef.current) return;
      if (!batch.some((m) => m.recipient === myId && !m.isRead)) return;
      try {
        await messageService.markRead(conversationId);
        setServerMessages((prev) =>
          prev.map((m) => (m.recipient === myId && !m.isRead ? { ...m, isRead: true } : m))
        );
      } catch {
        // Retried naturally: the next batch still carries the unread flag.
      }
    },
    [conversationId, myId]
  );

  const loadInitial = useCallback(async () => {
    loadedRef.current = false;
    cursorRef.current = undefined;
    setLoading(true);
    setError(null);
    try {
      const [conversation, page] = await Promise.all([
        messageService.getConversation(conversationId),
        messageService.getMessages(conversationId),
      ]);
      setDetail(conversation);
      setIsActive(page.isActive);
      setHasMore(page.hasMore);
      setServerMessages([]);
      merge(page.messages);
      setOffline(false);
      loadedRef.current = true;
      markReadIfNeeded(page.messages);
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 404
          ? 'This conversation is not available.'
          : err instanceof ApiError
          ? err.message
          : 'Could not open this conversation.'
      );
    } finally {
      setLoading(false);
    }
  }, [conversationId, merge, markReadIfNeeded]);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  const sync = useCallback(async () => {
    if (!loadedRef.current) return;
    try {
      const page = await messageService.getMessages(
        conversationId,
        cursorRef.current ? { after: cursorRef.current } : {}
      );
      setOffline(false);
      setIsActive(page.isActive);
      merge(page.messages);
      markReadIfNeeded(page.messages);
    } catch (err) {
      if (err instanceof ApiError && err.isNetworkError) setOffline(true);
    }
  }, [conversationId, merge, markReadIfNeeded]);

  useLivePolling(sync, CHAT_POLL_MS, enabled);

  const deliver = useCallback(
    async (message: DisplayMessage) => {
      try {
        const result = await messageService.sendMessage(conversationId, message.content, message.clientId!);
        merge([result.message]);
        setOffline(false);
      } catch (err) {
        if (err instanceof ApiError && err.status === 403) setIsActive(false);
        if (err instanceof ApiError && err.isNetworkError) setOffline(true);
        setPending((prev) =>
          prev.map((p) => (p.clientId === message.clientId ? { ...p, deliveryStatus: 'failed' } : p))
        );
      }
    },
    [conversationId, merge]
  );

  const send = useCallback(
    (text: string) => {
      const content = text.trim();
      if (!content) return;
      const clientId = createClientId();
      const optimistic: DisplayMessage = {
        _id: clientId,
        key: clientId,
        clientId,
        conversation: conversationId,
        sender: myId,
        recipient: detail?.otherUser?._id ?? '',
        content,
        isRead: false,
        readAt: null,
        createdAt: new Date().toISOString(),
        deliveryStatus: 'sending',
      };
      setPending((prev) => [...prev, optimistic]);
      deliver(optimistic);
    },
    [conversationId, myId, detail, deliver]
  );

  const retry = useCallback(
    (clientId: string) => {
      const message = pending.find((p) => p.clientId === clientId);
      if (!message) return;
      setPending((prev) => prev.map((p) => (p.clientId === clientId ? { ...p, deliveryStatus: 'sending' } : p)));
      deliver(message);
    },
    [pending, deliver]
  );

  const discard = useCallback((clientId: string) => {
    setPending((prev) => prev.filter((p) => p.clientId !== clientId));
  }, []);

  const loadOlder = useCallback(async () => {
    if (loadingOlder || !hasMore || serverMessages.length === 0) return;
    setLoadingOlder(true);
    try {
      const page = await messageService.getMessages(conversationId, { before: serverMessages[0].createdAt });
      merge(page.messages);
      setHasMore(page.hasMore);
    } catch {
      // Leave hasMore as is; scrolling up again retries.
    } finally {
      setLoadingOlder(false);
    }
  }, [conversationId, hasMore, loadingOlder, merge, serverMessages]);

  /** Oldest first; messages still being sent come last. */
  const messages = useMemo(() => [...serverMessages.map(toDisplay), ...pending], [serverMessages, pending]);

  return {
    detail,
    messages,
    isActive,
    hasMore,
    loading,
    loadingOlder,
    error,
    offline,
    send,
    retry,
    discard,
    loadOlder,
    reload: loadInitial,
  };
}
