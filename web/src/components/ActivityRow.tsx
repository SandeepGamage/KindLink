import { UserPlus, Send, FileText, Bell } from 'lucide-react';
import type { ActivityAction, ActivityItem } from '../api/admin';
import { formatRelativeTime } from '../utils/time';
import Skeleton from './Skeleton';

const ACTION_ICONS: Record<ActivityAction, typeof UserPlus> = {
  user_joined: UserPlus,
  broadcast_sent: Send,
  broadcast_draft: FileText,
};

/** Icon for an activity entry; falls back to `kind` for APIs that predate `action`. */
function iconFor(item: ActivityItem) {
  if (item.action) return ACTION_ICONS[item.action];
  return item.kind === 'user' ? UserPlus : Bell;
}

export default function ActivityRow({ item }: { item: ActivityItem }) {
  const Icon = iconFor(item);

  return (
    <li className="activity-row">
      <div className={`activity-icon ${item.kind}`} aria-hidden="true">
        <Icon size={16} />
      </div>
      <div className="activity-text">{item.text}</div>
      <time className="activity-time" dateTime={item.timestamp}>
        {formatRelativeTime(item.timestamp)}
      </time>
    </li>
  );
}

export function ActivityRowSkeleton() {
  return (
    <li className="activity-row">
      <Skeleton width={34} height={34} radius={10} />
      <Skeleton height={14} style={{ flex: 1 }} />
      <Skeleton width={50} height={12} />
    </li>
  );
}
