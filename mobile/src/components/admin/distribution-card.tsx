import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserDistribution } from '@/services/admin.service';
import { PieChart, PieDatum } from './pie-chart';
import { Skeleton } from './skeleton';
import { Radius } from './tokens';

type Mode = 'roles' | 'status';

const MODES: { key: Mode; label: string }[] = [
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Status' },
];

/**
 * Slice colors — a single blue ramp, validated against the chart's fill.
 *
 * Categories are separated by lightness rather than hue, ordered darkest to
 * lightest. Do not substitute a hex by eye — re-validate first. The slices sit
 * on the pie section's own fill (`c.surface`), **not** on the card, so that is
 * what these were measured against. Every value clears 3:1 on that fill and
 * every adjacent pair clears 1.5:1 against its neighbour:
 *
 *   light on #F4F7FA  #164673 9.05:1 · #2B72B5 4.68:1 · #4E92D4 3.06:1
 *   dark  on #131F2A  #A8CDEC 10.03:1 · #63A2D8 6.12:1 · #3B79BE 3.71:1
 *
 * The light ramp's lightest step is tightly boxed in: lighter than `#4E92D4`
 * drops under 3:1 on the fill, darker drops the 1.53:1 gap to `#2B72B5` under
 * 1.5:1. If the fill ever changes, re-derive it rather than nudging the hex.
 *
 * A one-hue ramp is actually safer for colour-vision deficiency than the
 * multi-hue set it replaced, since lightness survives every CVD type — the
 * previous dark red/green pair did not. Identity still never rests on colour
 * alone: the legend labels each row and a 2px gap separates the slices.
 *
 * `#164673` and `#2B72B5` are `FunctionalColors.secondaryDark` / `secondaryLight`.
 */
const CHART_COLORS = {
  light: {
    roles: { volunteers: '#164673', elders: '#2B72B5', admins: '#4E92D4' },
    status: { active: '#164673', pending: '#2B72B5', inactive: '#4E92D4' },
  },
  dark: {
    roles: { volunteers: '#A8CDEC', elders: '#63A2D8', admins: '#3B79BE' },
    status: { active: '#A8CDEC', pending: '#63A2D8', inactive: '#3B79BE' },
  },
} as const;

interface DistributionCardProps {
  distribution: UserDistribution | null;
}

/**
 * Dashboard breakdown of the user base, as bars with a Roles / Status toggle.
 *
 * `elderly` and `senior` are merged into one "Elders" bar, matching how the
 * users directory groups the same two role values — the two screens must not
 * report different totals for the same people.
 */
export function DistributionCard({ distribution }: DistributionCardProps) {
  const c = useAdminTheme();
  const scheme = useColorScheme();
  const [mode, setMode] = useState<Mode>('roles');

  const slices = useMemo<PieDatum[]>(() => {
    if (!distribution) return [];
    const colors = CHART_COLORS[scheme === 'dark' ? 'dark' : 'light'];

    const all: PieDatum[] =
      mode === 'roles'
        ? [
            {
              key: 'volunteers',
              label: 'Volunteers',
              value: distribution.byRole.volunteer,
              color: colors.roles.volunteers,
            },
            {
              key: 'elders',
              label: 'Elders',
              value: distribution.byRole.elderly + distribution.byRole.senior,
              color: colors.roles.elders,
            },
            {
              key: 'admins',
              label: 'Admins',
              value: distribution.byRole.admin,
              color: colors.roles.admins,
            },
          ]
        : [
            {
              key: 'active',
              label: 'Active',
              value: distribution.byStatus.active,
              color: colors.status.active,
            },
            {
              key: 'pending',
              label: 'Pending',
              value: distribution.byStatus.pending,
              color: colors.status.pending,
            },
            {
              key: 'inactive',
              label: 'Deactivated',
              value: distribution.byStatus.inactive,
              color: colors.status.inactive,
            },
          ];

    // An empty bar has nothing to show.
    return all.filter((slice) => slice.value > 0);
  }, [distribution, mode, scheme]);

  const surface = { backgroundColor: c.card, borderColor: c.cardBorder };

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: c.text }]}>System Distribution</Text>

        <View style={[styles.toggle, { backgroundColor: c.tint }]}>
          {MODES.map((option) => {
            const isActive = option.key === mode;
            return (
              <Pressable
                key={option.key}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`Show breakdown by ${option.label.toLowerCase()}`}
                onPress={() => setMode(option.key)}
                style={[styles.toggleOption, isActive && { backgroundColor: c.card }]}
              >
                <Text
                  style={[
                    styles.toggleLabel,
                    { color: isActive ? c.text : c.textSecondary },
                    isActive && styles.toggleLabelActive,
                  ]}
                >
                  {option.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={[styles.card, surface]}>
        {slices.length === 0 ? (
          <View style={styles.placeholder}>
            <Text style={[styles.placeholderTitle, { color: c.text }]}>Nothing to chart yet</Text>
            <Text style={[styles.placeholderMessage, { color: c.textSecondary }]}>
              The breakdown appears once people have signed up.
            </Text>
          </View>
        ) : (
          <PieChart data={slices} />
        )}
      </View>
    </View>
  );
}

/** Placeholder matching the card's real shape — a pie beside three legend rows. */
export function DistributionSkeleton() {
  const c = useAdminTheme();

  return (
    <>
      <View style={[styles.skeletonBody, { backgroundColor: c.surface }]}>
        <Skeleton width={140} height={140} radius={70} />
        <View style={styles.skeletonLegend}>
          {[0, 1, 2].map((i) => (
            <View key={i} style={styles.skeletonLegendRow}>
              <Skeleton width={10} height={10} radius={5} />
              <Skeleton width="70%" height={13} />
            </View>
          ))}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  toggle: {
    flexDirection: 'row',
    borderRadius: Radius.pill,
    padding: 3,
  },
  toggleOption: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: Radius.pill,
  },
  toggleLabel: {
    fontSize: 13,
  },
  toggleLabelActive: {
    fontWeight: '600',
  },
  card: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  placeholder: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  placeholderMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  skeletonBody: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    borderRadius: Radius.md,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  skeletonLegend: {
    // Fixed rather than flexed, matching the centred group in the real chart.
    width: 150,
    gap: 8,
  },
  skeletonLegendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
  },
});
