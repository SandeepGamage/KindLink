import { useMemo, useState } from 'react';
import { AlertCircle, Inbox } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import SegmentedControl from '../../components/SegmentedControl';
import { decidedAt } from '../../api/volunteerApplications';
import { useVolunteerApplications } from '../../hooks/useVolunteerApplications';
import { formatRelativeTime } from '../../utils/time';

type HistoryFilter = 'All' | 'Approved' | 'Rejected';

const FILTER_OPTIONS: { key: HistoryFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
];

export default function ApprovalHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('All');
  const { applications, loading, error, hasLoaded, retry } = useVolunteerApplications();

  // Most recent decision first. Pending applications have no decision yet.
  const decided = useMemo(
    () =>
      applications
        .filter((a) => a.status !== 'Pending')
        .sort((a, b) => Date.parse(decidedAt(b)) - Date.parse(decidedAt(a))),
    [applications]
  );

  const visible = decided.filter((entry) => activeFilter === 'All' || entry.status === activeFilter);

  const renderBody = () => {
    if (loading) {
      return (
        <ul className="list" aria-label="Loading history">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="list-row">
              <Skeleton width={40} height={40} radius="50%" />
              <div className="list-row-main">
                <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="25%" height={12} />
              </div>
              <Skeleton width={70} height={20} radius={999} />
            </li>
          ))}
        </ul>
      );
    }

    if (error && !hasLoaded) {
      return <EmptyState icon={<AlertCircle size={40} />} title="Couldn't load history" message={error} onRetry={retry} />;
    }

    if (visible.length === 0) {
      return (
        <EmptyState
          icon={<Inbox size={40} />}
          title={`No ${activeFilter === 'All' ? '' : `${activeFilter.toLowerCase()} `}applications`}
          message="Decisions you make on volunteer applications will appear here."
        />
      );
    }

    return (
      <ul className="list">
        {visible.map((entry) => (
          <li key={entry.id} className="list-row">
            <Avatar name={entry.name} uri={entry.profileImage} size={40} />
            <div className="list-row-main">
              <div className="user-name">{entry.name}</div>
              <div className="user-email">Volunteer • {formatRelativeTime(decidedAt(entry))}</div>
            </div>
            <StatusBadge label={entry.status} tone={entry.status === 'Approved' ? 'success' : 'danger'} />
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <PageHeader title="Approval History" subtitle="Past decisions on volunteer applications" backTo="/approvals" />

      <div className="page-body page-animate">
        {error && hasLoaded && (
          <div className="banner banner-danger" role="alert">
            <AlertCircle size={16} /> Showing older data — {error}
          </div>
        )}

        <div className="toolbar">
          <SegmentedControl
            options={FILTER_OPTIONS}
            value={activeFilter}
            onChange={setActiveFilter}
            ariaLabel="Filter history by decision"
          />
        </div>

        <div className="card">{renderBody()}</div>
      </div>
    </>
  );
}
