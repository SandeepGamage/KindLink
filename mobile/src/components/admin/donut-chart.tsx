import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useAdminTheme } from '@/hooks/use-admin-theme';

export interface DonutSlice {
  key: string;
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  /** Zero-value slices should be filtered out by the caller. */
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  activeKey?: string | null;
  /** Called with the tapped key, or `null` when the active slice is re-tapped. */
  onSelectSlice?: (key: string | null) => void;
  /** Center readout while no slice is selected. */
  centerValue: string;
  centerLabel: string;
}

/** How far the selected slice grows outward, and the padding that reserves it. */
const POP = 6;
/** Surface gap between adjacent slices, in px along the ring's mid-radius. */
const GAP_PX = 2;

const TAU = Math.PI * 2;

function polar(cx: number, cy: number, r: number, angleDeg: number) {
  // Angles run clockwise from 12 o'clock, which is how the slices are ordered.
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

/** Wedge between two radii, swept clockwise from `start` to `end` (degrees). */
function describeArc(
  cx: number,
  cy: number,
  rOuter: number,
  rInner: number,
  start: number,
  end: number
) {
  const largeArc = end - start > 180 ? 1 : 0;
  const o1 = polar(cx, cy, rOuter, start);
  const o2 = polar(cx, cy, rOuter, end);
  const i2 = polar(cx, cy, rInner, end);
  const i1 = polar(cx, cy, rInner, start);

  return [
    `M ${o1.x} ${o1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${o2.x} ${o2.y}`,
    `L ${i2.x} ${i2.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 0 ${i1.x} ${i1.y}`,
    'Z',
  ].join(' ');
}

/**
 * Donut chart for part-to-whole breakdowns, drawn as filled SVG wedges.
 *
 * Wedges rather than a stroked circle so the touch target is the full ring
 * thickness. Selection is surfaced in the center readout instead of a floating
 * tooltip — a bubble anchored to a finger-sized target is unreadable on a phone.
 */
export const DonutChart = React.memo(function DonutChart({
  slices,
  size = 180,
  thickness = 28,
  activeKey,
  onSelectSlice,
  centerValue,
  centerLabel,
}: DonutChartProps) {
  const c = useAdminTheme();

  const { arcs, total, cx, rOuter, rInner } = useMemo(() => {
    const center = size / 2;
    const outer = center - POP;
    const inner = outer - thickness;
    const sum = slices.reduce((acc, s) => acc + s.value, 0);

    if (sum <= 0) {
      return { arcs: [], total: 0, cx: center, rOuter: outer, rInner: inner };
    }

    // A 2px gap expressed as an angle at the ring's mid-radius, so the visual
    // separation is constant regardless of how wide a slice is.
    const rMid = (outer + inner) / 2;
    const gapDeg = slices.length > 1 ? (GAP_PX / (TAU * rMid)) * 360 : 0;

    let cursor = 0;
    const built = slices.map((slice) => {
      const sweep = (slice.value / sum) * 360;
      const start = cursor;
      cursor += sweep;
      // Never let the gap eat a sliver slice entirely.
      const inset = Math.min(gapDeg / 2, sweep / 4);
      return {
        slice,
        start: start + inset,
        end: start + sweep - inset,
        percent: (slice.value / sum) * 100,
      };
    });

    return { arcs: built, total: sum, cx: center, rOuter: outer, rInner: inner };
  }, [slices, size, thickness]);

  const active = activeKey ? arcs.find((a) => a.slice.key === activeKey) : undefined;
  const isSingle = arcs.length === 1;

  const handlePress = (key: string) => {
    onSelectSlice?.(activeKey === key ? null : key);
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G>
          {isSingle ? (
            // A wedge whose start and end coincide degenerates into an invisible
            // arc, so a lone 100% slice is drawn as a ring instead.
            <>
              <Circle cx={cx} cy={cx} r={rOuter} fill={arcs[0].slice.color} />
              <Circle cx={cx} cy={cx} r={rInner} fill={c.card} />
            </>
          ) : (
            arcs.map(({ slice, start, end, percent }) => {
              const isActive = slice.key === activeKey;
              return (
                <Path
                  key={slice.key}
                  d={describeArc(cx, cx, isActive ? rOuter + POP : rOuter, rInner, start, end)}
                  fill={slice.color}
                  opacity={!activeKey || isActive ? 1 : 0.45}
                  onPress={() => handlePress(slice.key)}
                  accessible
                  // SVG primitives take no `accessibilityRole`; the legend rows
                  // are the real buttons for screen-reader users.
                  accessibilityLabel={`${slice.label}: ${slice.value}, ${percent.toFixed(
                    1
                  )} percent`}
                />
              );
            })
          )}
        </G>
      </Svg>

      <View style={styles.center} pointerEvents="none">
        {active ? (
          <>
            <Text style={[styles.centerValue, { color: c.text }]} numberOfLines={1}>
              {active.percent.toFixed(1)}%
            </Text>
            <Text style={[styles.centerLabel, { color: c.textSecondary }]} numberOfLines={2}>
              {active.slice.label}
            </Text>
            <Text style={[styles.centerLabel, { color: c.textMuted }]} numberOfLines={1}>
              {active.slice.value} of {total}
            </Text>
          </>
        ) : (
          <>
            <Text style={[styles.centerValue, { color: c.text }]} numberOfLines={1}>
              {centerValue}
            </Text>
            <Text style={[styles.centerLabel, { color: c.textMuted }]} numberOfLines={1}>
              {centerLabel}
            </Text>
          </>
        )}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 44,
  },
  centerValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  centerLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
});
