import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BellOff,
  FileText,
  Pencil,
  Plus,
  Search,
  SearchX,
  Send,
  Target,
  Trash2,
} from 'lucide-react';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import StatusBadge, { type BadgeTone } from '../../components/StatusBadge';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import SegmentedControl from '../../components/SegmentedControl';
import { ActionModal } from '../../components/Modal';
import { useToast } from '../../components/Toast';
import { notifyStatsChanged } from '../../api/admin';
import {
  AUDIENCE_LABELS,
  deleteNotification,
  getNotifications,
  publishNotification,
  type Broadcast,
  type NotificationAudience,
  type NotificationType,
} from '../../api/notifications';
import { formatRelativeTime } from '../../utils/time';

const TYPE_TONES: Record<NotificationType, BadgeTone> = {
  INFO: 'info',
  SYSTEM: 'neutral',
  WELCOME: 'success',
  ALERT: 'warning',
};

type Tab = 'all' | 'sent' | 'draft';

type PendingAction = { broadcast: Broadcast; kind: 'publish' | 'delete' };

// Anything narrower than `all` is a targeted broadcast.
const isTargeted = (audience?: NotificationAudience) => audience === 'volunteer' || audience === 'elder';

export default function NotificationsPage() {
  const navigate = useNavigate();
  const toast = useToast();

  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pending, setPending] = useState<PendingAction | null>(null);
  const [working, setWorking] = useState(false);

  const loadBroadcasts = useCallback(async () => {
    try {
      setBroadcasts(await getNotifications());
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError((err as Error).message || 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBroadcasts();
  }, [loadBroadcasts]);

  const sentCount = broadcasts.filter((b) => b.status === 'sent').length;
  const draftCount = broadcasts.filter((b) => b.status === 'draft').length;
  const targetedCount = broadcasts.filter((b) => isTargeted(b.audience)).length;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: `All (${broadcasts.length})` },
    { key: 'sent', label: `Sent (${sentCount})` },
    { key: 'draft', label: `Drafts (${draftCount})` },
  ];

  const visible = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return broadcasts.filter(
      (b) =>
        (activeTab === 'all' || b.status === activeTab) &&
        (!term || b.title.toLowerCase().includes(term) || b.message.toLowerCase().includes(term))
    );
  }, [broadcasts, activeTab, searchTerm]);

  const confirmAction = async () => {
    if (!pending) return;
    const { broadcast, kind } = pending;
    setWorking(true);
    try {
      if (kind === 'publish') {
        const updated = await publishNotification(broadcast._id);
        setBroadcasts((prev) => prev.map((b) => (b._id === updated._id ? { ...b, ...updated } : b)));
        toast(`"${broadcast.title}" published`);
      } else {
        await deleteNotification(broadcast._id);
        setBroadcasts((prev) => prev.filter((b) => b._id !== broadcast._id));
        toast('Notification deleted');
      }
      notifyStatsChanged();
    } catch (err) {
      toast(
        (err as Error).message ||
          (kind === 'publish' ? 'Could not publish notification.' : 'Could not delete notification.'),
        'error'
      );
    } finally {
      setWorking(false);
      setPending(null);
    }
  };

  const retry = () => {
    setLoading(true);
    loadBroadcasts();
  };

  const renderList = () => {
    if (loading) {
      return (
        <ul className="list">
          {[0, 1, 2].map((i) => (
            <li key={i} className="broadcast-row">
              <div className="broadcast-main">
                <Skeleton width={160} height={18} style={{ marginBottom: 10 }} />
                <Skeleton width="50%" height={16} style={{ marginBottom: 6 }} />
                <Skeleton width="80%" height={12} />
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (error && !hasLoaded) {
      return (
        <EmptyState
          icon={<AlertCircle size={40} />}
          title="Couldn't load notifications"
          message={error}
          onRetry={retry}
        />
      );
    }

    if (broadcasts.length === 0) {
      return (
        <EmptyState
          icon={<BellOff size={40} />}
          title="No notifications yet"
          message="Create a broadcast to reach volunteers and elders."
        />
      );
    }

    if (visible.length === 0) {
      return searchTerm.trim() ? (
        <EmptyState icon={<SearchX size={40} />} title="No matching notifications" message="Try a different search term." />
      ) : (
        <EmptyState
          icon={<BellOff size={40} />}
          title={`No ${activeTab === 'draft' ? 'draft' : 'sent'} notifications`}
        />
      );
    }

    return (
      <ul className="list">
        {visible.map((broadcast) => {
          // Broadcasts stored before `audience` existed have no value; those are platform-wide.
          const audience = broadcast.audience || 'all';
          const isDraft = broadcast.status === 'draft';
          return (
            <li key={broadcast._id} className="broadcast-row">
              <div className="broadcast-main">
                <div className="broadcast-meta">
                  <StatusBadge label={isDraft ? 'Draft' : 'Sent'} tone={isDraft ? 'warning' : 'success'} />
                  {broadcast.type && (
                    <StatusBadge label={broadcast.type} tone={TYPE_TONES[broadcast.type] ?? 'neutral'} uppercase />
                  )}
                  <span className="broadcast-audience">
                    <Target size={12} /> {AUDIENCE_LABELS[audience]}
                  </span>
                  <span className="broadcast-time">
                    {isDraft
                      ? `Saved ${formatRelativeTime(broadcast.updatedAt ?? broadcast.createdAt)}`
                      : formatRelativeTime(broadcast.createdAt)}
                  </span>
                </div>
                <div className="broadcast-title">{broadcast.title}</div>
                <div className="broadcast-message">{broadcast.message}</div>
              </div>

              <div className="broadcast-actions">
                {isDraft && (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => setPending({ broadcast, kind: 'publish' })}
                    >
                      <Send size={14} /> Publish Now
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost btn-sm"
                      onClick={() => navigate(`/notifications/${broadcast._id}/edit`)}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  onClick={() => setPending({ broadcast, kind: 'delete' })}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <>
      <PageHeader
        title="Notifications"
        subtitle="Manage platform announcements"
        actions={
          <button type="button" className="btn btn-primary" onClick={() => navigate('/notifications/create')}>
            <Plus size={16} /> New Broadcast
          </button>
        }
      />

      <div className="page-body page-animate">
        {error && hasLoaded && (
          <div className="banner banner-danger" role="alert">
            <AlertCircle size={16} /> Showing older data — {error}
          </div>
        )}

        <div className="stat-cards-grid">
          <StatCard icon={<Send size={24} color="#1f5c96" />} value={broadcasts.length} label="Total Broadcasts" accent="blue" />
          <StatCard
            icon={<Send size={24} color="#059669" />}
            value={sentCount}
            label="Sent"
            accent="green"
            onClick={() => setActiveTab('sent')}
          />
          <StatCard
            icon={<FileText size={24} color="#d97706" />}
            value={draftCount}
            label="Drafts"
            accent="orange"
            badge={draftCount > 0 ? { text: 'Unpublished', tone: 'warning' } : undefined}
            onClick={() => setActiveTab('draft')}
          />
          <StatCard icon={<Target size={24} color="#7c3aed" />} value={targetedCount} label="Targeted" accent="purple" />
        </div>

        <div className="card">
          <div className="filter-bar">
            <SegmentedControl options={tabs} value={activeTab} onChange={setActiveTab} ariaLabel="Filter by status" />
            <div className="search-input-wrapper">
              <Search size={16} className="search-icon" />
              <input
                type="search"
                className="search-input"
                placeholder="Search title or message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                aria-label="Search notifications"
              />
            </div>
          </div>
          {renderList()}
        </div>
      </div>

      <ActionModal
        open={pending?.kind === 'publish'}
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
        loading={working}
        icon={<Send size={28} />}
        title="Publish Notification?"
        message={`"${pending?.broadcast.title}" will be sent to ${
          AUDIENCE_LABELS[pending?.broadcast.audience || 'all']
        } right away.`}
        confirmLabel="Publish"
      />
      <ActionModal
        open={pending?.kind === 'delete'}
        onClose={() => setPending(null)}
        onConfirm={confirmAction}
        loading={working}
        tone="danger"
        icon={<Trash2 size={28} />}
        title="Delete Notification?"
        message={`"${pending?.broadcast.title}" will be permanently removed.`}
        confirmLabel="Delete"
      />
    </>
  );
}
