import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';

interface AvailabilityChipsProps {
  /** Helper availability slots, e.g. "Weekends", "Mornings". */
  slots: string[];
  /**
   * `compact` truncates to `max` and appends a "+N more" chip — used on the
   * approval card. `full` renders every slot at sign-up size.
   */
  variant?: 'compact' | 'full';
  /** Compact only. */
  max?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Read-only availability pills, matching the toggleable chips on the volunteer
 * sign-up form (`(auth)/register.tsx`). No ✓/+ prefix here — that prefix is a
 * selection affordance and would misread on a display-only badge.
 */
export function AvailabilityChips({
  slots,
  variant = 'full',
  max = 3,
  style,
}: AvailabilityChipsProps) {
  const c = useAdminTheme();
  const isCompact = variant === 'compact';

  if (slots.length === 0) {
    return (
      <View style={style}>
        <Text style={[styles.emptyText, { color: c.textMuted }]}>Not specified</Text>
      </View>
    );
  }

  const shown = isCompact ? slots.slice(0, max) : slots;
  const overflow = slots.length - shown.length;

  return (
    <View style={[styles.grid, isCompact && styles.gridCompact, style]}>
      {shown.map((slot) => (
        <View
          key={slot}
          style={[
            styles.chip,
            isCompact ? styles.chipCompact : styles.chipFull,
            { backgroundColor: c.tint, borderColor: c.border },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              isCompact ? styles.chipTextCompact : styles.chipTextFull,
              { color: c.primary },
            ]}
          >
            {slot}
          </Text>
        </View>
      ))}

      {overflow > 0 && (
        <View
          style={[
            styles.chip,
            styles.chipCompact,
            styles.chipOverflow,
            { backgroundColor: 'transparent', borderColor: c.border },
          ]}
        >
          <Text
            style={[styles.chipText, styles.chipTextCompact, { color: c.textSecondary }]}
          >
            +{overflow} more
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  // Compact stays on one line. Nothing shrinks or ellipsizes — the smaller type
  // and tighter padding below are what buy the row enough width for four chips.
  gridCompact: {
    flexWrap: 'nowrap',
    alignItems: 'center',
    gap: 6,
  },
  chip: {
    // Geometry mirrors the sign-up availability chips.
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipFull: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  chipCompact: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    flexShrink: 0,
  },
  chipOverflow: {
    flexShrink: 0,
  },
  chipText: {
    fontWeight: '700',
  },
  chipTextFull: {
    fontSize: 13.5,
  },
  chipTextCompact: {
    fontSize: 10,
  },
  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
  },
});
