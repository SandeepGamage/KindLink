import { useMemo, useState } from 'react';
import type { UserDistribution } from '../api/admin';
import PieChart, { type PieDatum } from './PieChart';
import SegmentedControl from './SegmentedControl';
import Skeleton from './Skeleton';

type Mode = 'roles' | 'status';

const MODES: { key: Mode; label: string }[] = [
  { key: 'roles', label: 'Roles' },
  { key: 'status', label: 'Status' },
];

/**
 * One blue ramp, darkest to lightest — the light-theme values validated in
 * mobile/src/components/admin/distribution-card.tsx. Re-validate before changing.
 */
const CHART_COLORS = ['#164673', '#2B72B5', '#4E92D4'] as const;

interface DistributionCardProps {
  distribution: UserDistribution | null;
}

/**
 * Breakdown of the user base with a Roles / Status toggle. `elderly` and
 * `senior` are merged into "Elders", matching the users directory.
 */
export default function DistributionCard({ distribution }: DistributionCardProps) {
  const [mode, setMode] = useState<Mode>('roles');

  const slices = useMemo<PieDatum[]>(() => {
    if (!distribution) return [];
    const [c1, c2, c3] = CHART_COLORS;

    const all: PieDatum[] =
      mode === 'roles'
        ? [
            { key: 'volunteers', label: 'Volunteers', value: distribution.byRole.volunteer, color: c1 },
            {
              key: 'elders',
              label: 'Elders',
              value: distribution.byRole.elderly + distribution.byRole.senior,
              color: c2,
            },
            { key: 'admins', label: 'Admins', value: distribution.byRole.admin, color: c3 },
          ]
        : [
            { key: 'active', label: 'Active', value: distribution.byStatus.active, color: c1 },
            { key: 'pending', label: 'Pending', value: distribution.byStatus.pending, color: c2 },
            { key: 'inactive', label: 'Deactivated', value: distribution.byStatus.inactive, color: c3 },
          ];

    return all.filter((slice) => slice.value > 0);
  }, [distribution, mode]);

  return (
    <section className="card panel">
      <div className="panel-header">
        <h2 className="section-title">System Distribution</h2>
        <SegmentedControl options={MODES} value={mode} onChange={setMode} ariaLabel="Breakdown" />
      </div>

      {slices.length === 0 ? (
        <div className="panel-placeholder">
          <h3>Nothing to chart yet</h3>
          <p>The breakdown appears once people have signed up.</p>
        </div>
      ) : (
        // Remount on mode change so a selection doesn't carry across breakdowns.
        <PieChart key={mode} data={slices} />
      )}
    </section>
  );
}

/** Placeholder matching the card's real shape — a ring beside three legend rows. */
export function DistributionSkeleton() {
  return (
    <section className="card panel">
      <div className="panel-header">
        <Skeleton width={180} height={20} />
        <Skeleton width={130} height={30} radius={999} />
      </div>
      <div className="pie">
        <Skeleton width={158} height={158} radius="50%" />
        <div className="pie-legend">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} height={16} style={{ margin: '10px 0' }} />
          ))}
        </div>
      </div>
    </section>
  );
}
