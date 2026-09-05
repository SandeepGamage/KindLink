import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { UserDistribution } from '@/services/admin.service';
import { DonutChart, DonutSlice } from './donut-chart';
import { DonutLegend } from './donut-legend';
import { Skeleton } from './skeleton';
import { Radius } from './tokens';

type Mode = 'roles' | 'status';

const MODES: { key: Mode; label: string }[] = [
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Status' },
];

/**
 * Slice colors, validated for both surfaces.
 *
 * Each set was checked against this app's card colors (`#FFFFFF` light,
 * `#17242E` dark) for lightness band, chroma, colour-vision-deficiency
 * separation and contrast. Do not substitute a hex by eye — re-validate first.
 * The two advisories that remain are covered by this design: light `#EDA100`
 * falls under 3:1 contrast, and the dark red/green pair sits in the CVD floor
 * band — both are relieved by the always-present labelled legend and the 2px
 * gap between slices, so colour never carries identity alone.
 */
const CHART_COLORS = {
  light: {
    roles: { volunteers: '#1F5C96', elders: '#C4742B', admins: '#0F9D6E' },
    status: { active: '#0F9D6E', pending: '#EDA100', inactive: '#B91C1C' },
  },
  dark: {
    roles: { volunteers: '#4D8EC9', elders: '#D9772E', admins: '#14A97B' },
    status: { active: '#14A97B', pending: '#C98500', inactive: '#D64541' },
  },
} as const;

interface DistributionCardProps {
  distribution: UserDistribution | null;
}

/**
 * Dashboard breakdown of the user base, as a donut with a Roles / Status toggle.
 *
 * `elderly` and `senior` are merged into one "Elders" slice, matching how the
 * users directory groups the same two role values — the two screens must not
 * report different totals for the same people.
 */
export function DistributionCard({ distribution }: DistributionCardProps) {
  const c = useAdminTheme();
  const scheme = useColorScheme();
  const [mode, setMode] = useState<Mode>('roles');
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const slices = useMemo<DonutSlice[]>(() => {
    if (!distribution) return [];
    const colors = CHART_COLORS[scheme === 'dark' ? 'dark' : 'light'];

    const all: DonutSlice[] =
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
              label: 'Pending verification',
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

    // An empty slice has nothing to show and nothing to tap.
    return all.filter((slice) => slice.value > 0);
  }, [distribution, mode, scheme]);

  const handleModeChange = useCallback((next: Mode) => {
    setMode(next);
    // The old selection names a slice that may not exist in the new breakdown.
    setActiveKey(null);
  }, []);

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
                onPress={() => handleModeChange(option.key)}
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
          <>
            <DonutChart
              slices={slices}
              activeKey={activeKey}
              onSelectSlice={setActiveKey}
              centerValue={String(distribution?.total ?? 0)}
              centerLabel={distribution?.total === 1 ? 'user' : 'users'}
            />
            <DonutLegend slices={slices} activeKey={activeKey} onSelectSlice={setActiveKey} />
          </>
        )}
      </View>
    </View>
  );
}

/** Placeholder matching the card's real shape — a ring above three legend rows. */
export function DistributionSkeleton() {
  return (
    <>
      <Skeleton width={180} height={180} radius={90} />
      <View style={styles.skeletonLegend}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <Skeleton width={10} height={10} radius={3} />
            <Skeleton width="45%" height={12} />
            <View style={styles.skeletonSpacer} />
            <Skeleton width={40} height={12} />
          </View>
        ))}
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
    gap: 16,
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
  skeletonLegend: {
    width: '100%',
    gap: 14,
  },
  skeletonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 10,
  },
  skeletonSpacer: {
    flex: 1,
  },
});
