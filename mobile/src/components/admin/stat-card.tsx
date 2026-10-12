import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { Radius } from './tokens';

interface StatCardProps {
  title: string;
  value: string;
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    // The strip stretches every card to the tallest one, so pin the number to
    // the bottom — values line up even when one title wraps to two lines.
    justifyContent: 'space-between',
    gap: 6,
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
});
