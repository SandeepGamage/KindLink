import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  CheckCircle,
  FileText,
  Megaphone,
  RotateCw,
  Send,
  ShieldCheck,
  Users as UsersIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import StatCard from '../../components/StatCard';
import EmptyState from '../../components/EmptyState';
import Skeleton from '../../components/Skeleton';
import ActivityRow, { ActivityRowSkeleton } from '../../components/ActivityRow';
import DistributionCard, { DistributionSkeleton } from '../../components/DistributionCard';
import type { BadgeTone } from '../../components/StatusBadge';
import {
  getDashboardStats,
  getRecentActivity,
  getUserDistribution,
  type ActivityItem,
  type DashboardStats,
  type UserDistribution,
} from '../../api/admin';
import { formatRelativeTime } from '../../utils/time';

type StatCardData = {
  key: string;
  title: string;
  value: string;
  icon: ReactNode;
  accent: 'blue' | 'green' | 'orange' | 'purple';
  badge?: { text: string; tone: BadgeTone };
  subtext?: string;
  route: string;
};

/** Derive the four dashboard cards from live counts — same wording as mobile. */
function buildStats(stats: DashboardStats): StatCardData[] {
  return [
    {
      key: 'pending',
      title: 'Pending Verification',
      value: String(stats.pendingVerification),
      icon: <ShieldCheck size={24} color="#d97706" />,
      accent: 'orange',
      badge:
        stats.newUsersToday > 0
          ? { text: `${stats.newUsersToday} new today`, tone: 'accent' }
          : undefined,
      subtext: stats.newUsersToday > 0 ? undefined : 'No signups today',
      route: '/approvals',
    },
    {
      key: 'active',
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      icon: <CheckCircle size={24} color="#059669" />,
      accent: 'green',
      badge: { text: 'Active', tone: 'success' },
      route: '/users',
    },
    {
      key: 'sent',
      title: 'Sent Broadcasts',
      value: String(stats.sentBroadcasts),
      icon: <Send size={24} color="#1f5c96" />,
      accent: 'blue',
      subtext: stats.lastBroadcastAt
        ? `Last sent ${formatRelativeTime(stats.lastBroadcastAt)}`
        : 'None sent yet',
      route: '/notifications',
    },
    {
      key: 'drafts',
      title: 'Drafts',
      value: String(stats.draftBroadcasts),
      icon: <FileText size={24} color="#7c3aed" />,
      accent: 'purple',
      badge:
        stats.draftBroadcasts > 0 ? { text: 'Unpublished', tone: 'warning' } : undefined,
      subtext: stats.draftBroadcasts > 0 ? undefined : 'Nothing pending',
      route: '/notifications',
    },
  ];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [distribution, setDistribution] = useState<UserDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const [statsData, activityData, distributionData] = await Promise.all([
        getDashboardStats(),
        getRecentActivity(5),
        getUserDistribution(),
      ]);
      setStats(statsData);
      setActivity(activityData);
      setDistribution(distributionData);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Could not load the dashboard.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  const retry = () => {
    setLoading(true);
    loadDashboard();
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`${greeting}, ${user?.name?.split(' ')[0] || 'Admin'}`}
        actions={
          <>
            <span className="header-date">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRefresh}
              disabled={loading || refreshing}
            >
              <RotateCw size={14} className={refreshing ? 'spin' : undefined} />
              {refreshing ? 'Refreshing…' : 'Refresh'}
            </button>
          </>
        }
      />

      <div className="page-body page-animate">
        {loading ? (
          <DashboardSkeleton />
        ) : error && !stats ? (
          <div className="card">
            <EmptyState
              icon={<AlertCircle size={40} />}
              title="Couldn't load the dashboard"
              message={error}
              onRetry={retry}
            />
          </div>
        ) : (
          <>
            {error && (
              <div className="banner banner-danger" role="alert">
                <AlertCircle size={16} /> Showing older data — {error}
              </div>
            )}

            <div className="stat-cards-grid">
              {stats &&
                buildStats(stats).map((stat) => (
                  <StatCard
                    key={stat.key}
                    icon={stat.icon}
                    value={stat.value}
                    label={stat.title}
                    accent={stat.accent}
                    badge={stat.badge}
                    subtext={stat.subtext}
                    onClick={() => navigate(stat.route)}
                  />
                ))}
            </div>

            <div className="section-block">
              <div className="section-eyebrow">Quick Actions</div>
              <div className="quick-actions">
                <button type="button" className="btn btn-outline" onClick={() => navigate('/notifications/create')}>
                  <Megaphone size={16} /> Send Notice
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/approvals')}>
                  <ShieldCheck size={16} /> Review Applications
                </button>
                <button type="button" className="btn btn-outline" onClick={() => navigate('/users')}>
                  <UsersIcon size={16} /> Review Users
                </button>
              </div>
            </div>

            <div className="two-col-grid">
              <DistributionCard distribution={distribution} />

              <section className="card panel">
                <div className="panel-header">
                  <h2 className="section-title">Recent Activity</h2>
                </div>
                {activity.length === 0 ? (
                  <div className="panel-placeholder">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  <ul className="activity-list">
                    {activity.map((item) => (
                      <ActivityRow key={item.id} item={item} />
                    ))}
                  </ul>
                )}
              </section>
            </div>
          </>
        )}
      </div>
    </>
  );
}

/** First-load placeholder in the shape of the real dashboard. */
function DashboardSkeleton() {
  return (
    <div aria-label="Loading dashboard" role="progressbar">
      <div className="stat-cards-grid">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="stat-card">
            <Skeleton width={48} height={48} radius={10} style={{ marginBottom: 16 }} />
            <Skeleton width={72} height={30} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={12} />
          </div>
        ))}
      </div>
      <div className="two-col-grid">
        <DistributionSkeleton />
        <section className="card panel">
          <div className="panel-header">
            <Skeleton width={140} height={20} />
          </div>
          <ul className="activity-list">
            {[0, 1, 2, 3, 4].map((i) => (
              <ActivityRowSkeleton key={i} />
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
