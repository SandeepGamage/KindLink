import React, { useCallback, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Megaphone, Users as UsersIcon, AlertCircle } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { BadgeTone } from '@/components/admin/status-badge';
import { Avatar } from '@/components/admin/avatar';
import { Button } from '@/components/admin/button';
import { EmptyState } from '@/components/admin/empty-state';
import { StatCard } from '@/components/admin/stat-card';
import { Skeleton } from '@/components/admin/skeleton';
import { DistributionCard, DistributionSkeleton } from '@/components/admin/distribution-card';
import { useAuthContext } from '@/context/auth-context';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import {
  adminService,
  DashboardStats,
  ActivityItem,
  UserDistribution,
} from '@/services/admin.service';
import { formatRelativeTime } from '@/utils/admin-time';

/**
 * Fixed card width for the stat strip. Compact on purpose: at ~168 a phone shows
 * two full cards plus a slice of the third, which is what tells the reader the
 * row scrolls. Widen this (and nothing else) for a one-card-per-screen feel.
 */
const CARD_WIDTH = 168;
const CARD_GAP = 12;

type StatCardData = {
  key: string;
  title: string;
  value: string;
  badge?: { text: string; tone: BadgeTone };
  subtext?: string;
  route: '/(admin)/users' | '/(admin)/notifications';
};

/** Derive the four dashboard cards from live counts. */
function buildStats(stats: DashboardStats): StatCardData[] {
  return [
    {
      key: 'pending',
      title: 'Pending Verification',
      value: String(stats.pendingVerification),
      badge:
        stats.newUsersToday > 0
          ? { text: `${stats.newUsersToday} new today`, tone: 'accent' }
          : undefined,
      subtext: stats.newUsersToday > 0 ? undefined : 'No signups today',
      route: '/(admin)/users',
    },
    {
      key: 'active',
      title: 'Active Users',
      value: stats.activeUsers.toLocaleString(),
      badge: { text: 'Active', tone: 'success' },
      route: '/(admin)/users',
    },
    {
      key: 'sent',
      title: 'Sent Broadcasts',
      value: String(stats.sentBroadcasts),
      subtext: stats.lastBroadcastAt
        ? `Last sent ${formatRelativeTime(stats.lastBroadcastAt)}`
        : 'None sent yet',
      route: '/(admin)/notifications',
    },
    {
      key: 'drafts',
      title: 'Drafts',
      value: String(stats.draftBroadcasts),
      badge:
        stats.draftBroadcasts > 0
          ? { text: 'Unpublished', tone: 'warning' }
          : undefined,
      subtext: stats.draftBroadcasts > 0 ? undefined : 'Nothing pending',
      route: '/(admin)/notifications',
    },
  ];
}

export default function AdminDashboardScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  const { user } = useAuthContext();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [distribution, setDistribution] = useState<UserDistribution | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const [statsData, activityData, distributionData] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getRecentActivity(5),
        adminService.getUserDistribution(),
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

  useFocusEffect(
    useCallback(() => {
      // Only block the screen on the very first load; later focuses refresh in place.
      loadDashboard(stats === null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadDashboard])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadDashboard(false);
    setRefreshing(false);
  }, [loadDashboard]);

  const statCards = stats ? buildStats(stats) : [];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Dashboard"
        subtitleTop={`Welcome back, ${user?.name?.split(' ')[0] || 'Admin'}`}
        rightContent={
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open your admin profile"
            style={({ pressed }) => [pressed && styles.pressed]}
            onPress={() => router.push('/(admin)/profile')}
          >
            <Avatar name={user?.name} uri={user?.profileImage} size={44} />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.primary} />
        }
      >
        {loading ? (
          <DashboardSkeleton />
        ) : error && !stats ? (
          <EmptyState
            icon={<AlertCircle size={32} color={c.danger} />}
            title="Couldn't load the dashboard"
            message={error}
            onRetry={() => loadDashboard(true)}
          />
        ) : (
          <>
            {error && (
              <View style={[styles.errorBanner, { backgroundColor: FunctionalColors.dangerBg }]}>
                <AlertCircle size={16} color={FunctionalColors.dangerText} />
                <Text style={styles.errorBannerText}>
                  Showing older data — {error}
                </Text>
              </View>
            )}

            {/* Stat Cards — horizontal strip. Bleeds past the screen padding so
                cards can scroll to the edge, then re-inset by the content padding. */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={CARD_WIDTH + CARD_GAP}
              snapToAlignment="start"
              style={styles.statsStrip}
              contentContainerStyle={styles.statsStripContent}
            >
              {statCards.map((stat) => (
                <StatCard
                  key={stat.key}
                  title={stat.title}
                  value={stat.value}
                  badge={stat.badge}
                  subtext={stat.subtext}
                  width={CARD_WIDTH}
                  onPress={() => router.push(stat.route)}
                />
              ))}
            </ScrollView>

            {/* System Distribution */}
            <DistributionCard distribution={distribution} />

            {/* Quick Actions */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionHeaderTitle, { color: c.primary }]}>
                QUICK ACTIONS
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.quickActionsScroll}
              >
                <Button
                  label="Send Notice"
                  icon={<Megaphone size={16} color={Palette.primary} />}
                  onPress={() => router.push('/(admin)/notifications')}
                />
                <Button
                  label="Review Users"
                  icon={<UsersIcon size={16} color={Palette.primary} />}
                  onPress={() => router.push('/(admin)/users')}
                />
              </ScrollView>
            </View>

            {/* Recent Activity */}
            <View style={styles.sectionContainer}>
              <Text style={[styles.sectionTitle, { color: c.text }]}>Recent Activity</Text>

              <View
                style={[
                  styles.recentActionsCard,
                  { backgroundColor: c.card, borderColor: c.cardBorder },
                ]}
              >
                {activity.length === 0 ? (
                  <View style={styles.recentActionRowLast}>
                    <Text style={[styles.recentActionText, { color: c.textMuted }]}>
                      No recent activity
                    </Text>
                  </View>
                ) : (
                  activity.map((item, index) => (
                    <View
                      key={item.id}
                      style={[
                        styles.recentActionRow,
                        { borderColor: c.divider },
                        index === activity.length - 1 && styles.recentActionRowLast,
                      ]}
                    >
                      <Text style={[styles.recentActionText, { color: c.text }]} numberOfLines={2}>
                        {item.text}
                      </Text>
                      <Text style={[styles.recentActionTime, { color: c.textSecondary }]}>
                        {formatRelativeTime(item.timestamp)}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

/**
 * First-load placeholder in the shape of the real dashboard — a card strip, the
 * distribution chart, then the activity list. Preferred over a centered spinner
 * so nothing shifts position once the data arrives.
 */
function DashboardSkeleton() {
  const c = useAdminTheme();
  const surface = { backgroundColor: c.card, borderColor: c.cardBorder };

  return (
    <View accessibilityLabel="Loading dashboard" accessibilityRole="progressbar">
      <View style={styles.skeletonStrip}>
        {[0, 1, 2].map((i) => (
          <View key={i} style={[styles.skeletonStatCard, surface]}>
            <Skeleton width="80%" height={12} />
            <Skeleton width={64} height={24} />
            <Skeleton width="55%" height={12} />
          </View>
        ))}
      </View>

      <View style={styles.sectionContainer}>
        <Skeleton width={180} height={20} style={styles.skeletonHeading} />
        <View style={[styles.skeletonChartCard, surface]}>
          <DistributionSkeleton />
        </View>
      </View>

      <View style={styles.sectionContainer}>
        <Skeleton width={140} height={20} style={styles.skeletonHeading} />
        <View style={[styles.skeletonListCard, surface]}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} width="70%" height={14} />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  pressed: {
    opacity: 0.8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AdminSpacing.screenEdge,
    paddingBottom: AdminSpacing.scrollBottom,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: FunctionalColors.dangerText,
  },
  statsStrip: {
    // Cancel the scroll view's own horizontal padding so cards reach the screen
    // edge; the content container puts the inset back on the first/last card.
    marginHorizontal: -AdminSpacing.screenEdge,
  },
  statsStripContent: {
    gap: CARD_GAP,
    paddingHorizontal: AdminSpacing.screenEdge,
  },
  skeletonStrip: {
    flexDirection: 'row',
    gap: CARD_GAP,
    overflow: 'hidden',
  },
  skeletonStatCard: {
    width: CARD_WIDTH,
    minHeight: 120,
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'center',
    gap: 10,
  },
  skeletonHeading: {
    marginBottom: 12,
  },
  skeletonChartCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 16,
  },
  skeletonListCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 16,
    gap: 22,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 12,
  },
  quickActionsScroll: {
    gap: 12,
    paddingRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  recentActionsCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  recentActionRowLast: {
    borderBottomWidth: 0,
    padding: 16,
  },
  recentActionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  recentActionTime: {
    fontSize: 13,
  },
});
