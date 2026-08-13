import React, { useState } from 'react';

type UserRole = 'admin' | 'user';
type UserStatus = 'active' | 'inactive' | 'pending';

interface MockUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  userType: 'Volunteer' | 'Elderly User' | 'Caregiver' | 'Administrator';
  status: UserStatus;
  joined: string;
}

const MOCK_USERS: MockUser[] = [
  { id: 'u1', name: 'Alice Johnson',  email: 'alice.j@email.com',    role: 'admin', userType: 'Administrator', status: 'active',   joined: 'Jan 2024' },
  { id: 'u2', name: 'John Doe',       email: 'john.doe@email.com',   role: 'user',  userType: 'Volunteer',     status: 'active',   joined: 'Feb 2024' },
  { id: 'u3', name: 'Sarah Smith',    email: 'sarah.s@email.com',    role: 'user',  userType: 'Volunteer',     status: 'pending',  joined: 'Mar 2024' },
  { id: 'u4', name: 'Michael Brown',  email: 'michael.b@email.com',  role: 'user',  userType: 'Caregiver',     status: 'pending',  joined: 'Mar 2024' },
  { id: 'u5', name: 'Emily Chen',     email: 'emily.c@email.com',    role: 'user',  userType: 'Elderly User',  status: 'active',   joined: 'Apr 2024' },
  { id: 'u6', name: 'David Patel',    email: 'david.p@email.com',    role: 'user',  userType: 'Volunteer',     status: 'active',   joined: 'Apr 2024' },
  { id: 'u7', name: 'Grace Lee',      email: 'grace.l@email.com',    role: 'user',  userType: 'Elderly User',  status: 'inactive', joined: 'May 2024' },
  { id: 'u8', name: 'Robert Wilson',  email: 'robert.w@email.com',   role: 'user',  userType: 'Volunteer',     status: 'active',   joined: 'Jun 2024' },
];

const AVATAR_COLOURS = [
  'linear-gradient(135deg,#0066CC,#0ea5e9)',
  'linear-gradient(135deg,#059669,#34d399)',
  'linear-gradient(135deg,#d97706,#fbbf24)',
  'linear-gradient(135deg,#7c3aed,#a78bfa)',
  'linear-gradient(135deg,#db2777,#f472b6)',
];

function avatarGrad(name: string) {
  return AVATAR_COLOURS[name.charCodeAt(0) % AVATAR_COLOURS.length];
}

function initials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
}

const USER_TYPE_BADGE: Record<string, string> = {
  Volunteer:    'badge-volunteer',
  'Elderly User': 'badge-elderly',
  Caregiver:    'badge-caregiver',
  Administrator:'badge-admin',
};

const STATUS_BADGE: Record<UserStatus, string> = {
  active:   'badge-active',
  inactive: 'badge-inactive',
  pending:  'badge-pending',
};

export default function UsersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filtered = MOCK_USERS.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch =
      !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchesType = typeFilter === 'all' || u.userType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-header-left">
          <h1>Users</h1>
          <p>Manage all KindLink platform users</p>
        </div>
        <div className="page-header-right">
          <div style={{ fontSize: '13px', color: 'var(--color-text-dark-sec)' }}>
            {MOCK_USERS.length} total users
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="page-body page-animate">
        <div className="card">
          {/* Filter bar */}
          <div className="filter-bar">
            <div className="search-input-wrapper">
              <span className="search-icon" aria-hidden="true">🔍</span>
              <input
                id="input-user-search"
                type="search"
                className="search-input"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
            </div>

            <select
              id="filter-status"
              className="filter-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as UserStatus | 'all')}
              aria-label="Filter by status"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              id="filter-type"
              className="filter-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Filter by user type"
            >
              <option value="all">All Types</option>
              <option value="Volunteer">Volunteer</option>
              <option value="Elderly User">Elderly User</option>
              <option value="Caregiver">Caregiver</option>
              <option value="Administrator">Administrator</option>
            </select>

            <div style={{ marginLeft: 'auto', fontSize: '13px', color: 'var(--color-text-dark-sec)' }}>
              Showing {filtered.length} of {MOCK_USERS.length}
            </div>
          </div>

          {/* Table */}
          <div className="table-wrapper">
            {filtered.length > 0 ? (
              <table className="data-table" aria-label="Users table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Role</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <tr key={u.id}>
                      {/* User */}
                      <td>
                        <div className="user-info">
                          <div
                            className="user-avatar"
                            style={{ background: avatarGrad(u.name) }}
                            aria-hidden="true"
                          >
                            {initials(u.name)}
                          </div>
                          <div>
                            <div className="user-name">{u.name}</div>
                            <div className="user-email">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td>
                        <span className={`badge ${USER_TYPE_BADGE[u.userType]}`}>
                          {u.userType}
                        </span>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`badge ${STATUS_BADGE[u.status]}`}>
                          {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                        </span>
                      </td>

                      {/* Role */}
                      <td style={{ fontSize: '13px', color: 'var(--color-text-dark-sec)', fontWeight: 500 }}>
                        {u.role === 'admin' ? '🔑 Admin' : '👤 User'}
                      </td>

                      {/* Joined */}
                      <td style={{ fontSize: '13px', color: 'var(--color-text-dark-sec)' }}>
                        {u.joined}
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            id={`btn-view-user-${u.id}`}
                            className="btn btn-ghost btn-sm"
                            aria-label={`View ${u.name}`}
                          >
                            View
                          </button>
                          {u.status === 'pending' && (
                            <button
                              id={`btn-activate-user-${u.id}`}
                              className="btn btn-success btn-sm"
                              aria-label={`Activate ${u.name}`}
                            >
                              Activate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🔍</div>
                <h3>No users found</h3>
                <p>Try adjusting your search or filter criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
