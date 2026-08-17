import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ApprovalRow, { type Approval } from '../components/ApprovalRow';
import { User, Link as LinkIcon, CheckCircle, Calendar, Lightbulb, PartyPopper, Hand, Users, Handshake, ClipboardList, LayoutDashboard } from 'lucide-react';

const INITIAL_APPROVALS: Approval[] = [
  { id: '1', name: 'John Doe',      email: 'john.doe@email.com',       role: 'Volunteer',    date: 'Today' },
  { id: '2', name: 'Sarah Smith',   email: 'sarah.smith@email.com',    role: 'Volunteer',    date: 'Yesterday' },
  { id: '3', name: 'Michael Brown', email: 'michael.b@email.com',      role: 'Caregiver',    date: '2 days ago' },
  { id: '4', name: 'Emily Chen',    email: 'emily.chen@email.com',     role: 'Elderly User', date: '2 days ago' },
  { id: '5', name: 'David Patel',   email: 'david.patel@email.com',    role: 'Volunteer',    date: '3 days ago' },
];

const RECENT_ACTIVITY = [
  { id: 'a1', text: 'New volunteer registration: James Wilson',        time: '2 min ago',  type: 'join' },
  { id: 'a2', text: 'Assistance request #1042 matched to volunteer',   time: '14 min ago', type: 'match' },
  { id: 'a3', text: 'User Emily Chen approved as Elderly User',        time: '1 hr ago',   type: 'approve' },
  { id: 'a4', text: 'Scheduled session on Aug 14 confirmed',           time: '3 hrs ago',  type: 'schedule' },
  { id: 'a5', text: 'System health check passed — all services OK',    time: '6 hrs ago',  type: 'system' },
];

const ACTIVITY_ICONS: Record<string, React.ReactNode> = {
  join:     <User size={18} />,
  match:    <LinkIcon size={18} />,
  approve:  <CheckCircle size={18} />,
  schedule: <Calendar size={18} />,
  system:   <Lightbulb size={18} />,
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [approvals, setApprovals] = useState<Approval[]>(INITIAL_APPROVALS);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleApprove = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (item) showToast(`✓ Approved ${item.name}'s request`);
  };

  const handleReject = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (item) showToast(`✕ Rejected ${item.name}'s request`);
  };

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Dashboard</h1>
          <p>{greeting}, {user?.name?.split(' ')[0] ?? 'Admin'} <Hand size={20} style={{ display: 'inline', verticalAlign: 'middle', marginLeft: '4px' }} /></p>
        </div>
        <div className="page-header-right">
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-dark-sec)',
              background: 'var(--color-brand-light)',
              border: '1px solid rgba(30, 58, 138, 0.2)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 500,
            }}
          >
            <Calendar size={16} style={{ display: 'inline', verticalAlign: 'text-bottom', marginRight: '6px' }} />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-body page-animate">
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><LayoutDashboard size={40} /></div>
            <h3>Coming Soon</h3>
            <p>The dashboard is currently under development.</p>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toastMsg && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#1a202c',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '10px',
            fontSize: '13px',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            animation: 'fadeInUp 0.25s ease both',
            zIndex: 1000,
          }}
        >
          {toastMsg}
        </div>
      )}
    </>
  );
}
