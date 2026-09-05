import React, { useMemo } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { Radius } from './tokens';
import type { DonutSlice } from './donut-chart';

interface DonutLegendProps {
  slices: DonutSlice[];
  activeKey?: string | null;
  onSelectSlice?: (key: string | null) => void;
}

/**
 * Legend for `DonutChart`.
 *
 * Always rendered alongside the chart: the labels and counts here are what keep
 * a slice identifiable without relying on its color, and they double as a
 * full-width tap target for selecting a slice that is too thin to hit on the ring.
 */
export const DonutLegend = React.memo(function DonutLegend({
  slices,
  activeKey,
  onSelectSlice,
}: DonutLegendProps) {
  const c = useAdminTheme();
  const total = useMemo(() => slices.reduce((acc, s) => acc + s.value, 0), [slices]);

  return (
    <View style={styles.container}>
      {slices.map((slice) => {
        const percent = total > 0 ? (slice.value / total) * 100 : 0;
        const isActive = slice.key === activeKey;

        return (
          <Pressable
            key={slice.key}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={`${slice.label}: ${slice.value}, ${percent.toFixed(1)} percent`}
            onPress={() => onSelectSlice?.(isActive ? null : slice.key)}
            style={({ pressed }) => [
              styles.row,
              isActive && { backgroundColor: c.tint },
              pressed && styles.pressed,
            ]}
          >
            <View style={[styles.swatch, { backgroundColor: slice.color }]} />
            <Text style={[styles.label, { color: c.text }]} numberOfLines={1}>
              {slice.label}
            </Text>
            <Text style={[styles.count, { color: c.text }]}>{slice.value}</Text>
            <Text style={[styles.percent, { color: c.textSecondary }]}>
              {percent.toFixed(1)}%
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: Radius.sm,
  },
  pressed: {
    opacity: 0.7,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  count: {
    fontSize: 14,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  percent: {
    fontSize: 13,
    width: 52,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },
});
