const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();

const DAY_MS = 86400000;

/** Whole calendar days between `iso` and today (0 = today, 1 = yesterday). */
function daysAgo(iso: string): number {
  return Math.round((startOfDay(new Date()) - startOfDay(new Date(iso))) / DAY_MS);
}

export function isSameDay(a: string, b: string): boolean {
  return startOfDay(new Date(a)) === startOfDay(new Date(b));
}

/** Time of a single message, e.g. "2:30 PM". */
export function formatMessageTime(iso: string): string {
  return new Date(iso).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

/** Inbox timestamp: time today, then "Yesterday", weekday, and date. */
export function formatChatListTime(iso?: string | null): string {
  if (!iso) return '';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const days = daysAgo(iso);
  if (days <= 0) return formatMessageTime(iso);
  if (days === 1) return 'Yesterday';
  if (days < 7) return date.toLocaleDateString(undefined, { weekday: 'long' });
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Divider between days in a chat, e.g. "Today", "Yesterday", "Monday, 5 October". */
export function formatDayLabel(iso: string): string {
  const days = daysAgo(iso);
  if (days <= 0) return 'Today';
  if (days === 1) return 'Yesterday';
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    ...(days > 300 ? { year: 'numeric' } : {}),
  });
}
