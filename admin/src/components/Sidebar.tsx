import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Settings, Heart, ChevronLeft, ChevronRight, LogOut, Bell } from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/',         label: 'Dashboard', icon: <LayoutDashboard size={20} />,  id: 'nav-dashboard' },
  { to: '/users',    label: 'Users',     icon: <Users size={20} />, id: 'nav-users' },
  { to: '/notifications', label: 'Notifications', icon: <Bell size={20} />, id: 'nav-notifications' },
  { to: '/settings', label: 'Settings',  icon: <Settings size={20} />, id: 'nav-settings' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Initials for sidebar avatar
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

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

        {NAV_ITEMS.map((item) => (
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
          </NavLink>
        ))}

        {/* Admin user info at bottom of nav */}
        <div style={{ flex: 1 }} />
        <div
          className="sidebar-section-label"
          style={{ marginTop: 'auto' }}
        >
          Signed in as
        </div>
        <div
          className="nav-link"
          style={{ cursor: 'default', alignItems: 'center' }}
        >
          <div
            className="user-avatar"
            style={{ background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.2)', width: 28, height: 28, fontSize: '11px', minWidth: 28 }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <span className="nav-link-label" style={{ overflow: 'hidden' }}>
            <div style={{ fontSize: '12px', fontWeight: 600, color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.name ?? 'Administrator'}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email ?? ''}
            </div>
          </span>
        </div>
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
