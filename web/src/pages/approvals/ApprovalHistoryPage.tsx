import { useState } from 'react';
import { Inbox } from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import SegmentedControl from '../../components/SegmentedControl';
import { MOCK_APPROVAL_HISTORY } from './mockApplications';

type HistoryFilter = 'All' | 'Approved' | 'Rejected';

const FILTER_OPTIONS: { key: HistoryFilter; label: string }[] = [
  { key: 'All', label: 'All' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
];

export default function ApprovalHistoryPage() {
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('All');

  const visible = MOCK_APPROVAL_HISTORY.filter(
    (entry) => activeFilter === 'All' || entry.status === activeFilter
  );

  return (
    <>
      <PageHeader title="Approval History" subtitle="Past decisions on volunteer applications" backTo="/approvals" />

      <div className="page-body page-animate">
        <div className="toolbar">
          <SegmentedControl
            options={FILTER_OPTIONS}
            value={activeFilter}
            onChange={setActiveFilter}
            ariaLabel="Filter history by decision"
          />
        </div>

        <div className="card">
          {visible.length === 0 ? (
            <EmptyState
              icon={<Inbox size={40} />}
              title={`No ${activeFilter === 'All' ? '' : `${activeFilter.toLowerCase()} `}applications`}
              message="Decisions you make on volunteer applications will appear here."
            />
          ) : (
            <ul className="list">
              {visible.map((entry) => (
                <li key={entry.id} className="list-row">
                  <Avatar name={entry.name} size={40} />
                  <div className="list-row-main">
                    <div className="user-name">{entry.name}</div>
                    <div className="user-email">
                      {entry.role} • {entry.time}
                    </div>
                  </div>
                  <StatusBadge label={entry.status} tone={entry.status === 'Approved' ? 'success' : 'danger'} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
