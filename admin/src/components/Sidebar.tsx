import React, { useEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';
import Avatar from './Avatar';
import { getDashboardStats, STATS_CHANGED_EVENT } from '../api/admin';

type BadgeKey = 'approvals' | 'notifications';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  id: string;
  badge?: BadgeKey;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'nav-dashboard' },
  { to: '/approvals', label: 'Approvals', icon: <ShieldCheck size={20} />, id: 'nav-approvals', badge: 'approvals' },
  { to: '/users', label: 'Users', icon: <Users size={20} />, id: 'nav-users' },
  { to: '/notifications', label: 'Notifications', icon: <Bell size={20} />, id: 'nav-notifications', badge: 'notifications' },
  { to: '/profile', label: 'My Profile', icon: <UserCircle size={20} />, id: 'nav-profile' },
];

/**
 * Surfaces pending-verification and draft counts on the nav, like mobile's tab
 * bar. Failures are silent on purpose — a missing badge should never block navigation.
 */
function useBadgeCounts(): Partial<Record<BadgeKey, number>> {
  const { pathname } = useLocation();
  const [counts, setCounts] = useState<Partial<Record<BadgeKey, number>>>({});
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    window.addEventListener(STATS_CHANGED_EVENT, bump);
    return () => window.removeEventListener(STATS_CHANGED_EVENT, bump);
  }, []);

  useEffect(() => {
    let cancelled = false;
    getDashboardStats()
      .then((stats) => {
        if (!cancelled) {
          setCounts({ approvals: stats.pendingVerification, notifications: stats.draftBroadcasts });
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [pathname, version]);

  return counts;
}

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const badgeCounts = useBadgeCounts();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar${collapsed ? ' collapsed' : ''}`} aria-label="Admin navigation">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" aria-hidden="true"><Heart size={24} fill="currentColor" /></div>
        <div className="sidebar-brand-text">
          <div className="sidebar-brand-name">KindLink</div>
          <div className="sidebar-brand-sub">Admin Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav" aria-label="Main navigation">
        <div className="sidebar-section-label">Main Menu</div>

        {NAV_ITEMS.map((item) => {
          const count = item.badge ? badgeCounts[item.badge] : undefined;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              id={item.id}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-link-icon" aria-hidden="true">{item.icon}</span>
              <span className="nav-link-label">{item.label}</span>
              {count ? (
                <span className={`nav-badge ${item.badge}`} aria-label={`${count} pending`}>
                  {count > 99 ? '99+' : count}
                </span>
              ) : null}
            </NavLink>
          );
        })}

        {/* Admin user info at bottom of nav */}
        <div className="sidebar-spacer" />
        <div className="sidebar-section-label">Signed in as</div>
        <NavLink
          to="/profile"
          className="nav-link sidebar-user"
          title={collapsed ? user?.name ?? 'My Profile' : undefined}
        >
          <Avatar name={user?.name} uri={user?.profileImage} size={28} className="sidebar-user-avatar" />
          <span className="nav-link-label sidebar-user-text">
            <span className="sidebar-user-name">{user?.name ?? 'Administrator'}</span>
            <span className="sidebar-user-email">{user?.email ?? ''}</span>
          </span>
        </NavLink>
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          id="btn-logout"
          className="sidebar-collapse-btn sidebar-logout-btn"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="nav-link-icon" aria-hidden="true"><LogOut size={20} /></span>
          <span className="nav-link-label">Logout</span>
        </button>

        <button
          id="btn-sidebar-collapse"
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="nav-link-icon" aria-hidden="true">{collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</span>
          <span className="nav-link-label">Collapse</span>
        </button>
      </div>
    </aside>
  );
}
