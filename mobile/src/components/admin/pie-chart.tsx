import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable, type LayoutChangeEvent } from 'react-native';
import { PieChart as ChartKitPieChart } from 'react-native-chart-kit/v2';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { Radius } from './tokens';

/**
 * A type alias rather than an interface on purpose: the chart's generic is
 * constrained to `Record<string, unknown>`, which only type aliases satisfy —
 * interfaces get no implicit index signature.
 */
export type PieDatum = {
  key: string;
  label: string;
  value: number;
  color: string;
};

interface PieChartProps {
  /** Zero-value entries should be filtered out by the caller. */
  data: PieDatum[];
}

/** Upper bound on the pie, and the share of the row it may take. */
const MAX_PIE_SIZE = 150;
const PIE_WIDTH_RATIO = 0.44;

/** How far the selected slice lifts out of the pie. */
const ACTIVE_OFFSET = 6;

/**
 * User breakdown as a pie with a legend column beside it.
 *
 * The legend is built here rather than through the chart's own `legend` prop,
 * which lays items out as a wrapping row *below* the pie — this design needs
 * them stacked to the side.
 *
 * The legend rows are also the accessibility surface: SVG slices carry no role,
 * so the pie itself is hidden from screen readers and each row is a labelled
 * button that selects its slice, which is how the chart stays operable.
 */
export const PieChart = React.memo(function PieChart({ data }: PieChartProps) {
  const c = useAdminTheme();
  const [width, setWidth] = useState(0);
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    setWidth(event.nativeEvent.layout.width);
  }, []);

  const total = useMemo(
    () => data.reduce((sum, datum) => sum + datum.value, 0),
    [data]
  );

  const activeIndex = data.findIndex((datum) => datum.key === activeKey);
  const pieSize = Math.min(MAX_PIE_SIZE, Math.floor(width * PIE_WIDTH_RATIO));

  const handleSelect = useCallback((key: string) => {
    // Re-tapping the selected row clears it, matching the pie's own behaviour.
    setActiveKey((current) => (current === key ? null : key));
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: c.surface }]}
      onLayout={handleLayout}
    >
      {width > 0 && (
        <>
          <View
            style={{ width: pieSize, height: pieSize }}
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
          >
            <ChartKitPieChart
              data={data}
              valueKey="value"
              labelKey="label"
              colorKey="color"
              width={pieSize}
              height={pieSize}
              innerRadius={0}
              legend={false}
              arcLabels={false}
              theme={{
                background: 'transparent',
                plotBackground: 'transparent',
                text: c.text,
                mutedText: c.textSecondary,
              }}
              // Must match the fill behind the pie, not the card — otherwise
              // the gaps read as drawn lines rather than as gaps.
              sliceSeparator={{ visible: true, color: c.surface, width: 2 }}
              selectedIndex={activeIndex >= 0 ? activeIndex : undefined}
              activeSlice={{ activeOffset: ACTIVE_OFFSET, inactiveOpacity: 0.45 }}
              interaction={{
                mode: 'tap',
                onSelect: (event) => setActiveKey(data[event.index]?.key ?? null),
                onDeselect: () => setActiveKey(null),
              }}
            />
          </View>

          <View style={styles.legend}>
            {data.map((datum) => {
              const percent = total > 0 ? (datum.value / total) * 100 : 0;
              const isActive = datum.key === activeKey;

              return (
                <Pressable
                  key={datum.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={`${datum.label}: ${percent.toFixed(1)} percent`}
                  onPress={() => handleSelect(datum.key)}
                  style={({ pressed }) => [styles.row, pressed && styles.pressed]}
                >
                  <View style={[styles.swatch, { backgroundColor: datum.color }]} />
                  <Text style={[styles.percent, { color: c.text }]}>
                    {percent.toFixed(0)}%
                  </Text>
                  {/* With the pill gone, selection shows as a brighter label —
                      the lifted slice in the pie is the other half of the cue. */}
                  <Text
                    style={[
                      styles.label,
                      { color: isActive ? c.text : c.textSecondary },
                      isActive && styles.labelActive,
                    ]}
                    numberOfLines={1}
                  >
                    {datum.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  legend: {
    // Shrinks rather than flexes, so the pie and legend centre as one group
    // instead of the legend stretching to the card's right edge.
    flexShrink: 1,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
  pressed: {
    opacity: 0.7,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  percent: {
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  label: {
    // Sizes to the text but still truncates when a long label would push the
    // group wider than the card.
    flexShrink: 1,
    fontSize: 13,
  },
  labelActive: {
    fontWeight: '600',
  },
});
