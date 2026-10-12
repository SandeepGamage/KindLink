import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  ChevronRight,
  FileImage,
  History,
  Inbox,
  Mail,
  Phone,
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
import { useToast } from '../../components/Toast';
import { formatDateTime, formatRelativeTime } from '../../utils/time';
import {
  MOCK_VOLUNTEER_APPLICATIONS,
  type VolunteerApplication,
  type VolunteerApplicationStatus,
} from './mockApplications';

const STATUS_OPTIONS: { key: VolunteerApplicationStatus; label: string }[] = [
  { key: 'Pending', label: 'Pending' },
  { key: 'Approved', label: 'Approved' },
  { key: 'Rejected', label: 'Rejected' },
];

const STATUS_TONE = { Approved: 'success', Rejected: 'danger', Pending: 'warning' } as const;

type Decision = { application: VolunteerApplication; action: 'approve' | 'reject' };

export default function ApprovalsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  // TODO: load from `GET /api/admin/volunteer-applications` once it exists.
  const [applications, setApplications] = useState<VolunteerApplication[]>(MOCK_VOLUNTEER_APPLICATIONS);
  const [activeTab, setActiveTab] = useState<VolunteerApplicationStatus>('Pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [decision, setDecision] = useState<Decision | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const pendingCount = applications.filter((a) => a.status === 'Pending').length;
  const visible = applications.filter((a) => a.status === activeTab);
  const selected = applications.find((a) => a.id === selectedId) ?? null;

  const decide = (application: VolunteerApplication, action: Decision['action']) => {
    setSelectedId(null);
    setDecision({ application, action });
  };

  const confirmDecision = () => {
    if (!decision) return;
    const { application, action } = decision;
    const status: VolunteerApplicationStatus = action === 'approve' ? 'Approved' : 'Rejected';

    // TODO: call the approve / reject endpoint; this only updates local state.
    setApplications((prev) => prev.map((a) => (a.id === application.id ? { ...a, status } : a)));
    setDecision(null);
    toast(action === 'approve' ? `Approved ${application.name}` : `Rejected ${application.name}'s application`);
  };

  return (
    <>
      <PageHeader
        title="Volunteer Requests"
        subtitle={`${pendingCount} pending application${pendingCount === 1 ? '' : 's'}`}
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/approvals/history')}>
            <History size={16} /> History
          </button>
        }
      />

      <div className="page-body page-animate">
        <div className="toolbar">
          <SegmentedControl
            options={STATUS_OPTIONS}
            value={activeTab}
            onChange={setActiveTab}
            ariaLabel="Filter applications by status"
          />
        </div>

        {visible.length === 0 ? (
          <div className="card">
            <EmptyState
              icon={<Inbox size={40} />}
              title={`No ${activeTab.toLowerCase()} applications`}
              message={
                activeTab === 'Pending'
                  ? "You're all caught up. New volunteer applications will appear here."
                  : `Applications you mark as ${activeTab.toLowerCase()} will appear here.`
              }
            />
          </div>
        ) : (
          <div className="application-grid">
            {visible.map((application) => (
              <button
                key={application.id}
                type="button"
                className="card application-card"
                onClick={() => setSelectedId(application.id)}
              >
                <div className="application-card-top">
                  <Avatar name={application.name} uri={application.profileImage} size={48} />
                  <div className="application-card-identity">
                    <div className="user-name">{application.name}</div>
                    <div className="user-email">Applied {formatRelativeTime(application.appliedAt)}</div>
                  </div>
                  {application.status !== 'Pending' && (
                    <StatusBadge label={application.status} tone={STATUS_TONE[application.status]} />
                  )}
                </div>
                <AvailabilityChips availability={application.availability} compact />
                <span className="application-card-more">
                  More Details <ChevronRight size={14} />
                </span>
              </button>
            ))}
          </div>
        )}
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
      />
    </>
  );
}
