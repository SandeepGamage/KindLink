import React, { useState } from 'react';
import { Search, Key, User, Users } from 'lucide-react';

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
  'linear-gradient(135deg,#1e3a8a,#0ea5e9)',
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
          <div className="empty-state">
            <div className="empty-state-icon"><Users size={40} /></div>
            <h3>Coming Soon</h3>
            <p>User management is currently under development.</p>
          </div>
        </div>
      </div>
    </>
  );
}
