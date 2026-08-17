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
    <aside className={`flex flex-col h-full bg-gradient-to-br from-[#0ea5e9] to-[#1e3a8a] border-r border-border transition-all duration-250 ${collapsed ? 'w-16' : 'w-60'}`} aria-label="Admin navigation">
      {/* Brand */}
      <div className={`flex items-center p-5 border-b border-border text-white ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="text-brand-light flex-shrink-0" aria-hidden="true"><Heart size={24} fill="currentColor" /></div>
        <div className={`flex flex-col overflow-hidden whitespace-nowrap ${collapsed ? 'hidden' : 'block'}`}>
          <div className="text-lg font-bold tracking-tight">KindLink</div>
          <div className="text-xs text-brand-light font-medium uppercase tracking-wider">Admin Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col p-3 overflow-y-auto overflow-x-hidden gap-1" aria-label="Main navigation">
        <div className={`text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 mt-2 mb-1 ${collapsed ? 'hidden' : 'block'}`}>Main Menu</div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            id={item.id}
            end={item.to === '/'}
            className={({ isActive }) => `flex items-center px-3 py-2.5 rounded-lg transition-colors ${collapsed ? 'justify-center' : 'gap-3'} ${isActive ? 'bg-white/20 text-white font-medium' : 'text-white hover:bg-white/10'}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="flex-shrink-0 flex items-center justify-center" aria-hidden="true">{item.icon}</span>
            <span className={`whitespace-nowrap ${collapsed ? 'hidden' : 'block'}`}>{item.label}</span>
          </NavLink>
        ))}

        {/* Admin user info at bottom of nav */}
        <div className="flex-1" />
        <div className={`text-xs font-semibold text-white uppercase tracking-wider px-3 py-2 mt-auto mb-1 ${collapsed ? 'hidden' : 'block'}`}>
          Signed in as
        </div>
        <div className={`flex items-center px-3 py-2 rounded-lg cursor-default ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div
            className="flex items-center justify-center rounded-full bg-white/20 border border-white/20 text-white font-medium flex-shrink-0"
            style={{ width: 32, height: 32, fontSize: '12px' }}
            aria-hidden="true"
          >
            {initials}
          </div>
          <div className={`flex flex-col overflow-hidden ${collapsed ? 'hidden' : 'block'}`}>
            <div className="text-sm font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.name ?? 'Administrator'}
            </div>
            <div className="text-xs text-white/70 whitespace-nowrap overflow-hidden text-ellipsis">
              {user?.email ?? ''}
            </div>
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border flex flex-col gap-1">
        <button
          id="btn-logout"
          className={`flex items-center px-3 py-2.5 rounded-lg text-danger hover:bg-danger-bg transition-colors w-full text-left ${collapsed ? 'justify-center' : 'gap-3'}`}
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
        >
          <span className="flex-shrink-0 flex items-center justify-center" aria-hidden="true"><LogOut size={20} /></span>
          <span className={`whitespace-nowrap ${collapsed ? 'hidden' : 'block'}`}>Logout</span>
        </button>

        <button
          id="btn-sidebar-collapse"
          className={`flex items-center px-3 py-2.5 rounded-lg text-white hover:bg-white/10 transition-colors w-full text-left ${collapsed ? 'justify-center' : 'gap-3'}`}
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className="flex-shrink-0 flex items-center justify-center" aria-hidden="true">{collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}</span>
          <span className={`whitespace-nowrap ${collapsed ? 'hidden' : 'block'}`}>Collapse</span>
        </button>
      </div>
    </aside>
  );
}
