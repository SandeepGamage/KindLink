import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { StatusBadge, BadgeTone } from './status-badge';
import { Radius } from './tokens';

interface StatCardProps {
  title: string;
  value: string;
  badge?: { text: string; tone: BadgeTone };
  subtext?: string;
  /** Fixed width, so a row of cards snaps to a consistent interval. */
  width: number;
  onPress?: () => void;
}

/**
 * A single headline metric on the admin dashboard.
 *
 * Non-pressable when `onPress` is omitted — the card then renders as a plain
 * view rather than a button that does nothing.
 */
export const StatCard = React.memo(function StatCard({
  title,
  value,
  badge,
  subtext,
  width,
  onPress,
}: StatCardProps) {
  const c = useAdminTheme();

  const body = (
    <>
      <Text style={[styles.title, { color: c.textSecondary }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.value, { color: c.text }]}>{value}</Text>
      {badge && <StatusBadge label={badge.text} tone={badge.tone} />}
      {subtext && (
        <Text style={[styles.subtext, { color: c.textMuted }]} numberOfLines={1}>
          {subtext}
        </Text>
      )}
    </>
  );

  const surface = { backgroundColor: c.card, borderColor: c.cardBorder };

  if (!onPress) {
    return <View style={[styles.card, { width }, surface]}>{body}</View>;
  }

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width }, surface, pressed && styles.pressed]}
    >
      {body}
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.card,
    padding: 16,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
    gap: 8,
  },
  pressed: {
    opacity: 0.8,
  },
  title: {
    fontSize: 13,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtext: {
    fontSize: 12,
  },
});
