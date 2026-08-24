import React from 'react';
import { Check, X } from 'lucide-react';

export type ApprovalRole = 'Volunteer' | 'Elderly User' | 'Caregiver';

export interface Approval {
  id: string;
  name: string;
  email: string;
  role: ApprovalRole;
  date: string;
}

const ROLE_BADGE: Record<ApprovalRole, string> = {
  Volunteer:    'badge-volunteer',
  'Elderly User': 'badge-elderly',
  Caregiver:    'badge-caregiver',
};

// Deterministic colour from name
const AVATAR_COLOURS = [
  'linear-gradient(135deg,#1e3a8a,#0ea5e9)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#db2777,#f472b6)',
];

function avatarGrad(name: string): string {
  const idx = name.charCodeAt(0) % AVATAR_COLOURS.length;
  return AVATAR_COLOURS[idx];
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface ApprovalRowProps {
  approval: Approval;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function ApprovalRow({ approval, onApprove, onReject }: ApprovalRowProps) {
  return (
    <div className="approval-row" role="listitem">
      {/* Avatar */}
      <div
        className="user-avatar"
        style={{ background: avatarGrad(approval.name) }}
        aria-hidden="true"
      >
        {initials(approval.name)}
      </div>

      {/* Info */}
      <div className="approval-info">
        <div className="approval-name">{approval.name}</div>
        <div className="approval-meta">
          {approval.email} · Requested {approval.date}
        </div>
      </div>

      {/* Role badge */}
      <span className={`badge ${ROLE_BADGE[approval.role]}`} style={{ marginRight: '12px' }}>
        {approval.role}
      </span>

      {/* Actions */}
      <div className="approval-actions">
        <button
          id={`btn-approve-${approval.id}`}
          className="btn btn-success btn-sm"
          onClick={() => onApprove(approval.id)}
          aria-label={`Approve ${approval.name}`}
        >
          <Check size={16} style={{ display: 'inline', marginRight: '4px' }} /> Approve
        </button>
        <button
          id={`btn-reject-${approval.id}`}
          className="btn btn-danger btn-sm"
          onClick={() => onReject(approval.id)}
          aria-label={`Reject ${approval.name}`}
        >
          <X size={16} style={{ display: 'inline', marginRight: '4px' }} /> Reject
        </button>
      </div>
    </div>
  );
}
