
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
  Volunteer:    'bg-info/20 text-info border border-info/20',
  'Elderly User': 'bg-purple-500/20 text-purple-400 border border-purple-500/20',
  Caregiver:    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20',
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
    <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-bg-row hover:bg-bg-row-hover border border-transparent hover:border-border transition-colors" role="listitem">
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium shadow-sm flex-shrink-0"
        style={{ background: avatarGrad(approval.name) }}
        aria-hidden="true"
      >
        {initials(approval.name)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-semibold text-text-primary mb-0.5 truncate">{approval.name}</div>
        <div className="text-xs text-text-secondary truncate">
          {approval.email} · Requested {approval.date}
        </div>
      </div>

      {/* Role badge */}
      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE[approval.role]}`}>
        {approval.role}
      </span>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0 mt-3 sm:mt-0">
        <button
          id={`btn-approve-${approval.id}`}
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-app disabled:opacity-50 disabled:cursor-not-allowed bg-success/10 text-success hover:bg-success/20 border border-success/20 hover:border-success/30 px-3 py-1.5 text-xs"
          onClick={() => onApprove(approval.id)}
          aria-label={`Approve ${approval.name}`}
        >
          <Check size={14} className="mr-1.5" /> Approve
        </button>
        <button
          id={`btn-reject-${approval.id}`}
          className="inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-app disabled:opacity-50 disabled:cursor-not-allowed bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 hover:border-danger/30 px-3 py-1.5 text-xs"
          onClick={() => onReject(approval.id)}
          aria-label={`Reject ${approval.name}`}
        >
          <X size={14} className="mr-1.5" /> Reject
        </button>
      </div>
    </div>
  );
}
