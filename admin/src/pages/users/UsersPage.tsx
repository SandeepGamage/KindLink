import { Users } from 'lucide-react';

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


export default function UsersPage() {

  return (
    <div className="flex flex-col h-full">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 lg:p-8 pb-0">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">Users</h1>
          <p className="text-sm text-text-secondary mt-1">Manage all KindLink platform users</p>
        </div>
        <div className="flex-shrink-0">
          <div className="text-[13px] text-text-secondary">
            {MOCK_USERS.length} total users
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 lg:p-8 overflow-y-auto">
        <div className="bg-bg-card border border-border rounded-xl shadow-sm p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-bg-row flex items-center justify-center text-text-muted mb-4">
              <Users size={32} />
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-1">Coming Soon</h3>
            <p className="text-sm text-text-secondary">User management is currently under development.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
