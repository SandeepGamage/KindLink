import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { FileText, Send, UserPlus, type LucideIcon } from 'lucide-react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Palette, FunctionalColors, AppColors } from '@/constants/theme';
import { ActivityAction, ActivityItem } from '@/services/admin.service';
import { formatRelativeTime } from '@/utils/admin-time';
import { Skeleton } from './skeleton';
import { Radius } from './tokens';

const CHIP_SIZE = 36;

/**
 * Icon and chip colors per activity type.
 *
 * Split by scheme rather than themed at the call site, matching `CHART_COLORS`
 * in `distribution-card.tsx`. The light fills are the ready-made `*Bg`/`*Text`
 * pairs from the palette; the dark ones are translucent so the chip reads as a
 * tint of the card rather than a bright light-mode pill dropped onto it — the
 * same treatment `AppColors.dark.accentBg` already uses. Every glyph clears
 * 4.5:1 on its own fill in both schemes.
 *
 * The glyph never carries meaning on its own: the sentence beside it says the
 * same thing, which is why the chip is hidden from screen readers below.
 */
const ACTIVITY_STYLES: Record<
  'light' | 'dark',
  Record<ActivityAction, { icon: LucideIcon; bg: string; fg: string }>
> = {
  light: {
    user_joined: { icon: UserPlus, bg: Palette.blueTint, fg: Palette.secondary },
    broadcast_sent: {
      icon: Send,
      bg: FunctionalColors.successBg,
      fg: FunctionalColors.successText,
    },
    broadcast_draft: {
      icon: FileText,
      bg: FunctionalColors.warningBg,
      fg: FunctionalColors.warningText,
    },
  },
  dark: {
    user_joined: { icon: UserPlus, bg: AppColors.dark.tint, fg: AppColors.dark.primary },
    broadcast_sent: {
      icon: Send,
      bg: 'rgba(52, 211, 153, 0.16)',
      fg: AppColors.dark.success,
    },
    broadcast_draft: {
      icon: FileText,
      bg: 'rgba(251, 191, 36, 0.16)',
      fg: AppColors.dark.warning,
    },
  },
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
  const scheme = useColorScheme();

  const { icon: Icon, bg, fg } = ACTIVITY_STYLES[scheme === 'dark' ? 'dark' : 'light'][
    resolveAction(item)
  ];

  return (
    <View style={[styles.row, { borderColor: c.divider }, isLast && styles.rowLast]}>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.chip, { backgroundColor: bg }]}
      >
        <Icon size={18} color={fg} />
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
