import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  RotateCw,
  Search,
  SearchX,
  Trash2,
  UserCheck,
  UserX,
  Users as UsersIcon,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import SegmentedControl from '../../components/SegmentedControl';
import ActionMenu from '../../components/ActionMenu';
import { ActionModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { deleteUser, getAllUsers, toggleUserActive, type User } from '../../api/users';
import type { UserRole } from '../../api/auth';
import { notifyStatsChanged } from '../../api/admin';
import { formatRelativeTime } from '../../utils/time';

type Filter = 'all' | 'volunteers' | 'elders' | 'active' | 'inactive';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'volunteers', label: 'Volunteers' },
  { key: 'elders', label: 'Elders' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const ROLE_LABELS: Record<UserRole, string> = {
  volunteer: 'Volunteer',
  elderly: 'Elderly',
  senior: 'Senior',
  admin: 'Admin',
};

function matchesFilter(user: User, filter: Filter): boolean {
  switch (filter) {
    case 'volunteers':
      return user.role === 'volunteer';
    case 'elders':
      return user.role === 'elderly' || user.role === 'senior';
    case 'active':
      return user.isActive;
    case 'inactive':
      return !user.isActive;
    default:
      return true;
  }
}

function statusFor(user: User) {
  if (!user.isActive) return { label: 'Inactive', tone: 'danger' } as const;
  if (user.isVerified) return { label: 'Verified', tone: 'success' } as const;
  return { label: 'Pending', tone: 'warning' } as const;
}

type PendingAction = { user: User; kind: 'toggle' | 'delete' };

export default function UsersPage() {
  const toast = useToast();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Filter>('all');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [working, setWorking] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setUsers(await getAllUsers());
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError((err as Error).message || 'Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter(
      (u) =>
        matchesFilter(u, filter) &&
        (!term || u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
    );
  }, [users, search, filter]);

  const confirmAction = async () => {
    if (!pending) return;
    const { user, kind } = pending;
    setWorking(true);
    try {
      if (kind === 'toggle') {
        await toggleUserActive(user._id);
        toast(`${user.name} ${user.isActive ? 'deactivated' : 'activated'}`);
      } else {
        await deleteUser(user._id);
        toast(`${user.name} deleted`);
      }
      setPending(null);
      notifyStatsChanged();
      await loadUsers();
    } catch (err) {
      setPending(null);
      toast(
        (err as Error).message || (kind === 'toggle' ? 'Could not update user.' : 'Could not delete user.'),
        'error'
      );
    } finally {
      setWorking(false);
    }
  };

  const retry = () => {
    setLoading(true);
    loadUsers();
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
  };

  const renderBody = () => {
    if (loading) {
      return (
        <ul className="list" aria-label="Loading users">
          {[0, 1, 2, 3, 4].map((i) => (
            <li key={i} className="list-row">
              <Skeleton width={40} height={40} radius="50%" />
              <div className="list-row-main">
                <Skeleton width="40%" height={14} style={{ marginBottom: 6 }} />
                <Skeleton width="60%" height={12} />
              </div>
              <Skeleton width={70} height={20} radius={999} />
            </li>
          ))}
        </ul>
      );
    }

    if (error && !hasLoaded) {
      return (
        <EmptyState icon={<AlertCircle size={40} />} title="Couldn't load users" message={error} onRetry={retry} />
      );
    }

    if (users.length === 0) {
      return (
        <EmptyState
          icon={<UsersIcon size={40} />}
          title="No users yet"
          message="People who sign up to KindLink will appear here."
        />
      );
    }

    if (visible.length === 0) {
      return (
        <EmptyState
          icon={<SearchX size={40} />}
          title="No matching users"
          message="Try a different search term or filter."
        />
      );
    }

    return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th aria-label="Actions" />
            </tr>
          </thead>
          <tbody>
            {visible.map((user) => {
              const status = statusFor(user);
              return (
                <tr key={user._id} className={user.isActive ? undefined : 'row-dimmed'}>
                  <td>
                    <div className="user-info">
                      <Avatar name={user.name} uri={user.profileImage} size={38} dimmed={!user.isActive} />
                      <div>
                        <div className="user-name">{user.name}</div>
                        <div className="user-email">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <StatusBadge label={ROLE_LABELS[user.role] ?? user.role} uppercase />
                  </td>
                  <td>
                    <StatusBadge label={status.label} tone={status.tone} />
                  </td>
                  <td className="muted">{formatRelativeTime(user.createdAt) || '—'}</td>
                  <td className="cell-actions">
                    <ActionMenu
                      ariaLabel={`Actions for ${user.name}`}
                      items={[
                        {
                          label: user.isActive ? 'Deactivate Account' : 'Activate Account',
                          icon: user.isActive ? <UserX size={16} /> : <UserCheck size={16} />,
                          onSelect: () => setPending({ user, kind: 'toggle' }),
                        },
                        {
                          label: 'Delete Permanently',
                          icon: <Trash2 size={16} />,
                          tone: 'danger',
                          onSelect: () => setPending({ user, kind: 'delete' }),
                        },
                      ]}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const target = pending?.user;

  return (
    <>
      <PageHeader
        title="Users Directory"
        subtitle="Manage users system wide"
        actions={
          <button type="button" className="btn btn-primary" onClick={handleRefresh} disabled={loading || refreshing}>
            <RotateCw size={14} className={refreshing ? 'spin' : undefined} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
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
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search by name or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label="Search users"
              />
            </div>
            <SegmentedControl options={FILTERS} value={filter} onChange={setFilter} ariaLabel="Filter users" />
            {!loading && hasLoaded && (
              <span className="filter-count">
                {visible.length} of {users.length}
              </span>
            )}
          </div>
          {renderBody()}
        </div>
      </div>

      <ActionModal
        open={pending?.kind === 'toggle'}
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
        loading={working}
        tone={target?.isActive ? 'danger' : 'primary'}
        icon={target?.isActive ? <UserX size={28} /> : <UserCheck size={28} />}
        title={target?.isActive ? 'Deactivate User?' : 'Activate User?'}
        message={
          target?.isActive
            ? `${target.name} will lose access to KindLink until reactivated.`
            : `${target?.name} will regain access to KindLink.`
        }
        confirmLabel={target?.isActive ? 'Deactivate' : 'Activate'}
      />
      <ActionModal
        open={pending?.kind === 'delete'}
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
        loading={working}
        tone="danger"
        icon={<Trash2 size={28} />}
        title="Delete User?"
        message={`This permanently removes ${target?.name}'s account. This action cannot be undone.`}
        confirmLabel="Delete Permanently"
      />
    </>
  );
}
