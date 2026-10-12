import { useCallback, useEffect, useState } from 'react';
import { messageEvents, messageService } from '@/services/message.service';
import { ApiError } from '@/services/admin-api-client';
import type { ConversationSummary } from '@/types/message';
import { useLivePolling } from './use-live-polling';

const INBOX_POLL_MS = 10000;

/**
 * The inbox: one entry per approved elder–volunteer connection, kept live
 * while `enabled` (pass the screen's focus state).
 */
export function useConversations(enabled: boolean) {
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await messageService.getConversations();
      setConversations(data ?? []);
      setError(null);
    } catch (err) {
      // Keep showing what we had; only an empty first load becomes an error screen.
      setError(err instanceof ApiError ? err.message : 'Could not load your messages.');
    } finally {
      setLoaded(true);
    }
  }, []);

  useLivePolling(load, INBOX_POLL_MS, enabled);

  // A chat being read elsewhere clears its badge here straight away.
  useEffect(() => messageEvents.onUnreadChanged(load), [load]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }, [load]);

  return { conversations, loading: !loaded, refreshing, error, refresh, retry: load };
}

/** Total unread messages across every chat, for the Messages tab badge. */
export function useUnreadMessageCount(enabled: boolean) {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      setCount(await messageService.getUnreadCount());
    } catch {
      // A badge is best-effort: keep the last known count.
    }
  }, []);

  useLivePolling(load, 20000, enabled);
  useEffect(() => messageEvents.onUnreadChanged(load), [load]);

  return enabled ? count : 0;
}
