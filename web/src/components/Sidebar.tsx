import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Heart,
  LayoutDashboard,
  ShieldCheck,
  UserCircle,
  Users,
} from 'lucide-react';

interface NavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
  id: string;
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={20} />, id: 'nav-dashboard' },
  { to: '/approvals', label: 'Approvals', icon: <ShieldCheck size={20} />, id: 'nav-approvals' },
  { to: '/users', label: 'Users', icon: <Users size={20} />, id: 'nav-users' },
  { to: '/notifications', label: 'Notifications', icon: <Bell size={20} />, id: 'nav-notifications' },
  { to: '/profile', label: 'My Profile', icon: <UserCircle size={20} />, id: 'nav-profile' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

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
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
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
