import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';

/** The white bar above every admin page: today's date and the signed-in admin. */
export default function TopBar() {
  const { user } = useAuth();
  const today = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="top-bar">
      <span className="top-bar-date">{today}</span>
      <NavLink to="/profile" className="top-bar-user" title="My Profile">
        <Avatar name={user?.name} uri={user?.profileImage} size={36} />
        <span className="top-bar-user-text">
          <span className="top-bar-user-name">{user?.name ?? 'Administrator'}</span>
          <span className="top-bar-user-role">Administrator</span>
        </span>
      </NavLink>
    </header>
  );
}
