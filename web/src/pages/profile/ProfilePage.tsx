import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Pencil } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { ActionModal } from '../../components/Modal';

export default function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  // Pick up changes made elsewhere (e.g. the mobile app). The cached user shows meanwhile.
  useEffect(() => {
    refreshUser().catch(() => {});
  }, [refreshUser]);

  const fields = [
    { label: 'Full Name', value: user?.name },
    { label: 'Email', value: user?.email },
    { label: 'Mobile', value: user?.mobile },
    { label: 'Address', value: user?.address },
    { label: 'About', value: user?.bio },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Your administrator account"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/profile/edit')}>
            <Pencil size={14} /> Edit Profile
          </button>
        }
      />

      <div className="page-body page-animate">
        <div className="profile-layout">
          <section className="card profile-identity">
            <Avatar name={user?.name} uri={user?.profileImage} size={112} />
            <h2>{user?.name || 'Administrator'}</h2>
            <p>{user?.email || 'admin@kindlink.com'}</p>
            <StatusBadge label="Administrator" tone="neutral" uppercase />
            <button type="button" className="btn btn-danger btn-lg profile-signout" onClick={() => setConfirmSignOut(true)}>
              <LogOut size={16} /> Sign Out
            </button>
          </section>

          <section className="card panel">
            <div className="panel-header">
              <h2 className="section-title">Account Details</h2>
            </div>
            <dl className="details-list">
              {fields.map((field) => (
                <div key={field.label} className="details-list-row">
                  <dt>{field.label}</dt>
                  <dd>{field.value?.trim() ? field.value : <span className="muted">—</span>}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <ActionModal
        open={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        onConfirm={handleSignOut}
        tone="danger"
        icon={<LogOut size={28} />}
        title="Sign out?"
        message="You'll need to sign in again to access the admin portal."
        confirmLabel="Sign Out"
      />
    </>
  );
}
