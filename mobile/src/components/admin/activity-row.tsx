import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FileText, Send, UserPlus, type LucideIcon } from 'lucide-react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { ActivityAction, ActivityItem } from '@/services/admin.service';
import { formatRelativeTime } from '@/utils/admin-time';
import { Skeleton } from './skeleton';
import { Radius } from './tokens';

const CHIP_SIZE = 36;

/**
 * The glyph for each activity type.
 *
 * Only the glyph varies. The chip behind it is one colour for every type —
 * `c.tint` under `c.primary`, the same pair `Avatar` uses on the approvals
 * cards — so the two lists read as one system rather than two colour languages.
 *
 * Nothing is lost by dropping the old per-type tints: the glyph never carried
 * the meaning on its own, since the sentence beside it says the same thing.
 * That is also why the chip is hidden from screen readers below.
 */
const ACTIVITY_ICONS: Record<ActivityAction, LucideIcon> = {
  user_joined: UserPlus,
  broadcast_sent: Send,
  broadcast_draft: FileText,
};

/**
 * `action` is optional on the wire, so an API predating it still resolves to a
 * sensible icon instead of leaving a blank chip. Drops the sent/draft split,
 * which is the part only `action` can tell us.
 */
function resolveAction(item: ActivityItem): ActivityAction {
  if (item.action) return item.action;
  return item.kind === 'user' ? 'user_joined' : 'broadcast_sent';
}

interface ActivityRowProps {
  item: ActivityItem;
  /** Drops the divider so the card's last row doesn't draw a line on its edge. */
  isLast?: boolean;
}

/** One entry in the dashboard's Recent Activity card: type chip, sentence, age. */
export function ActivityRow({ item, isLast }: ActivityRowProps) {
  const c = useAdminTheme();
  const Icon = ACTIVITY_ICONS[resolveAction(item)];

  return (
    <View style={[styles.row, { borderColor: c.divider }, isLast && styles.rowLast]}>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.chip, { backgroundColor: c.tint }]}
      >
        <Icon size={18} color={c.primary} />
      </View>

      <Text style={[styles.text, { color: c.text }]} numberOfLines={2}>
        {item.text}
      </Text>
      <Text style={[styles.time, { color: c.textSecondary }]}>
        {formatRelativeTime(item.timestamp)}
      </Text>
    </View>
  );
}

/** Placeholder in the real row's shape — chip circle, then the sentence line. */
export function ActivityRowSkeleton() {
  return (
    <View style={styles.skeletonRow}>
      <Skeleton width={CHIP_SIZE} height={CHIP_SIZE} radius={Radius.pill} />
      <Skeleton width="70%" height={14} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  chip: {
    width: CHIP_SIZE,
    height: CHIP_SIZE,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  time: {
    fontSize: 13,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
