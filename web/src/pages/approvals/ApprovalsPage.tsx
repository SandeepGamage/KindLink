import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileImage,
  History,
  Inbox,
  Mail,
  Phone,
  Search,
  SearchX,
  XCircle,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Drawer from '../../components/Drawer';
import Modal, { ActionModal } from '../../components/Modal';
import SegmentedControl from '../../components/SegmentedControl';
import AvailabilityChips from '../../components/AvailabilityChips';
import Skeleton from '../../components/Skeleton';
import { useToast } from '../../components/Toast';
import { formatDateTime, formatRelativeTime } from '../../utils/time';
import {
  approveApplication,
  rejectApplication,
  type VolunteerApplication,
  type VolunteerApplicationStatus,
} from '../../api/volunteerApplications';
import { useVolunteerApplications } from '../../hooks/useVolunteerApplications';

const STATUSES: VolunteerApplicationStatus[] = ['Pending', 'Approved', 'Rejected'];

const STATUS_TONE = { Approved: 'success', Rejected: 'danger', Pending: 'warning' } as const;

type Decision = { application: VolunteerApplication; action: 'approve' | 'reject' };

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const { applications, loading, error, hasLoaded, reload, retry } = useVolunteerApplications();
  const [activeTab, setActiveTab] = useState<VolunteerApplicationStatus>('Pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [working, setWorking] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const countFor = (status: VolunteerApplicationStatus) => applications.filter((a) => a.status === status).length;
  const pendingCount = countFor('Pending');
  const tabs = STATUSES.map((status) => ({ key: status, label: `${status} (${countFor(status)})` }));

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return applications.filter(
      (a) =>
        a.status === activeTab &&
        (!term || a.name.toLowerCase().includes(term) || a.email.toLowerCase().includes(term))
    );
  }, [applications, activeTab, searchTerm]);
  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const decide = (application: VolunteerApplication, action: Decision['action']) => {
    setSelectedId(null);
    setDecision({ application, action });
  };

  const confirmDecision = async () => {
    if (!decision) return;
    const { application, action } = decision;
    setWorking(true);
    try {
      await (action === 'approve' ? approveApplication : rejectApplication)(application.id);
      toast(action === 'approve' ? `Approved ${application.name}` : `Rejected ${application.name}'s application`);
      setDecision(null);
      await reload();
    } catch (err) {
      setDecision(null);
      toast(
        (err as Error).message ||
          (action === 'approve' ? 'Could not approve application.' : 'Could not reject application.'),
        'error'
      );
    } finally {
      setWorking(false);
    }
  };

  const renderList = () => {
    if (loading) {
      return (
        <ul className="list" aria-label="Loading applications">
          {[0, 1, 2].map((i) => (
            <li key={i} className="list-row">
              <Skeleton width={44} height={44} radius="50%" />
              <div className="list-row-main">
                <Skeleton width="30%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="45%" height={12} style={{ marginBottom: 10 }} />
                <Skeleton width={160} height={22} radius={999} />
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (error && !hasLoaded) {
      return (
        <EmptyState icon={<AlertCircle size={40} />} title="Couldn't load applications" message={error} onRetry={retry} />
      );
    }

    if (visible.length === 0) {
      return searchTerm.trim() ? (
        <EmptyState icon={<SearchX size={40} />} title="No matching applications" message="Try a different search term." />
      ) : (
        <EmptyState
          icon={<Inbox size={40} />}
          title={`No ${activeTab.toLowerCase()} applications`}
          message={
            activeTab === 'Pending'
              ? "You're all caught up. New volunteer applications will appear here."
              : `Applications you mark as ${activeTab.toLowerCase()} will appear here.`
          }
        />
      );
    }

    return (
      <ul className="list">
        {visible.map((application) => (
          <li key={application.id} className="list-row application-row">
            <Avatar name={application.name} uri={application.profileImage} size={44} />
            <div className="list-row-main">
              <div className="user-name">{application.name}</div>
              <div className="user-email">
                {application.email} • Applied {formatRelativeTime(application.appliedAt)}
              </div>
              <AvailabilityChips availability={application.availability} compact />
            </div>
            {application.status !== 'Pending' && (
              <StatusBadge label={application.status} tone={STATUS_TONE[application.status]} />
            )}
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSelectedId(application.id)}>
              View Details <ChevronRight size={14} />
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <>
      <PageHeader
        title="Volunteer Requests"
        subtitle={
          hasLoaded ? `${pendingCount} pending application${pendingCount === 1 ? '' : 's'}` : 'Volunteer applications'
        }
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/approvals/history')}>
            <History size={16} /> History
          </button>
        }
      />

      <div className="page-body page-animate">
        {error && hasLoaded && (
          <div className="banner banner-danger" role="alert">
            <AlertCircle size={16} /> Showing older data — {error}
          </div>
        )}

        <div className="card">
          <div className="filter-bar">
            <SegmentedControl
              options={tabs}
              value={activeTab}
              onChange={setActiveTab}
              ariaLabel="Filter applications by status"
            />
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search name or email"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search applications"
              />
            </div>
          </div>
          {renderList()}
        </div>
      </div>

      {/* Details */}
      <Drawer
        open={selected !== null}
        onClose={() => setSelectedId(null)}
        title="Application Details"
        footer={
          selected?.status === 'Pending' && (
            <>
              <button type="button" className="btn btn-danger btn-lg" onClick={() => decide(selected, 'reject')}>
                <XCircle size={16} /> Reject
              </button>
              <button type="button" className="btn btn-primary btn-lg" onClick={() => decide(selected, 'approve')}>
                <CheckCircle2 size={16} /> Approve
              </button>
            </>
          )
        }
      >
        {selected && (
          <>
            <div className="details-identity">
              <Avatar name={selected.name} uri={selected.profileImage} size={72} />
              <div>
                <h3>{selected.name}</h3>
                <StatusBadge label={selected.status} tone={STATUS_TONE[selected.status]} />
              </div>
            </div>

            <div className="details-section">
              <div className="details-label">Contact Details</div>
              <div className="details-row">
                <Mail size={16} /> <a href={`mailto:${selected.email}`}>{selected.email}</a>
              </div>
              <div className="details-row">
                <Phone size={16} /> {selected.mobile || <span className="muted">No phone number</span>}
              </div>
            </div>

            <div className="details-section">
              <div className="details-label">Application Time</div>
              <div className="details-row">{formatDateTime(selected.appliedAt)}</div>
            </div>

            <div className="details-section">
              <div className="details-label">Helper Availability</div>
              <AvailabilityChips availability={selected.availability} />
            </div>

            <div className="details-section">
              <div className="details-label">ID Document</div>
              {selected.idDocument.uri ? (
                <button type="button" className="id-document" onClick={() => setPreviewOpen(true)}>
                  <img src={selected.idDocument.uri} alt={`ID document for ${selected.name}`} />
                  <span>
                    <FileImage size={14} /> {selected.idDocument.fileName || 'ID document'}
                  </span>
                </button>
              ) : (
                <div className="muted">No ID document uploaded</div>
              )}
            </div>
          </>
        )}
      </Drawer>

      <Modal
        open={previewOpen && selected !== null}
        onClose={() => setPreviewOpen(false)}
        title={selected?.idDocument.fileName || 'ID document'}
        size="lg"
      >
        {selected && (
          <img className="image-preview" src={selected.idDocument.uri} alt={`ID document for ${selected.name}`} />
        )}
      </Modal>

      {/* Confirmations */}
      <ActionModal
        open={decision?.action === 'approve'}
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
        icon={<CheckCircle2 size={28} />}
        title={`Approve ${decision?.application.name}?`}
        message={`${decision?.application.name} will be granted active volunteer permissions.`}
        confirmLabel="Confirm Approval"
        loading={working}
      />
      <ActionModal
        open={decision?.action === 'reject'}
        onClose={() => setDecision(null)}
        onConfirm={confirmDecision}
        tone="danger"
        icon={<XCircle size={28} />}
        title={`Reject ${decision?.application.name}?`}
        message={`${decision?.application.name}'s application will be declined.`}
        confirmLabel="Reject Application"
        loading={working}
      />
    </>
  );
}
