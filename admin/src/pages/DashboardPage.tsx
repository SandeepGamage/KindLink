import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import ApprovalRow, { type Approval } from '../components/ApprovalRow';

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

const ACTIVITY_ICONS: Record<string, string> = {
  join:     '👤',
  match:    '🔗',
  approve:  '✅',
  schedule: '📅',
  system:   '💡',
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
          <p>{greeting}, {user?.name?.split(' ')[0] ?? 'Admin'} 👋</p>
        </div>
        <div className="page-header-right">
          <div
            style={{
              fontSize: '13px',
              color: 'var(--color-text-dark-sec)',
              background: 'var(--color-brand-light)',
              border: '1px solid rgba(0,102,204,0.2)',
              borderRadius: '6px',
              padding: '6px 14px',
              fontWeight: 500,
            }}
          >
            📅 {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-body page-animate">
        {/* Stats */}
        <div className="stat-cards-grid">
          <StatCard
            id="stat-total-users"
            icon="👥"
            value="3,250"
            label="Total Users"
            trend="12%"
            trendUp
            accent="blue"
          />
          <StatCard
            id="stat-active-volunteers"
            icon="🤝"
            value="2,184"
            label="Active Volunteers"
            trend="8%"
            trendUp
            accent="green"
          />
          <StatCard
            id="stat-pending-requests"
            icon="📋"
            value={approvals.length}
            label="Pending Approvals"
            trend="3"
            trendUp={false}
            accent="orange"
          />
          <StatCard
            id="stat-sessions-today"
            icon="📅"
            value="28"
            label="Sessions Today"
            trend="5%"
            trendUp
            accent="purple"
          />
        </div>

        {/* Two-column section */}
        <div className="two-col-grid">
          {/* Pending Approvals */}
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Pending Approvals</div>
                <div className="section-sub">{approvals.length} awaiting review</div>
              </div>
            </div>
            <div className="card">
              {approvals.length > 0 ? (
                <div className="approvals-list" role="list" aria-label="Pending approvals">
                  {approvals.map((a) => (
                    <ApprovalRow
                      key={a.id}
                      approval={a}
                      onApprove={handleApprove}
                      onReject={handleReject}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-state-icon">🎉</div>
                  <h3>All caught up!</h3>
                  <p>No pending approvals right now. Check back later.</p>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <div className="section-header">
              <div>
                <div className="section-title">Recent Activity</div>
                <div className="section-sub">Platform events</div>
              </div>
            </div>
            <div className="card">
              <div style={{ padding: '0' }}>
                {RECENT_ACTIVITY.map((item, idx) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px 20px',
                      borderBottom: idx < RECENT_ACTIVITY.length - 1 ? '1px solid var(--color-border-light)' : 'none',
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-brand-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '15px',
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    >
                      {ACTIVITY_ICONS[item.type]}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', color: 'var(--color-text-dark)', fontWeight: 500, lineHeight: 1.4 }}>
                        {item.text}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-dark-sec)', marginTop: '3px' }}>
                        {item.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
