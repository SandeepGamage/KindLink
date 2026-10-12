import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AdminHeader } from '@/components/ui/admin-header';
import { FilterDropdown } from '@/components/admin/filter-dropdown';
import { Avatar } from '@/components/admin/avatar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { ApplicationListSkeleton } from '@/components/admin/application-list-skeleton';
import { StaleDataBanner } from '@/components/admin/stale-data-banner';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useVolunteerApplications } from '@/hooks/use-volunteer-applications';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { formatRelativeTime } from '@/utils/admin-time';
import { ChevronLeft, ArrowUpDown, Inbox, AlertCircle } from 'lucide-react-native';

/** Sort key for a decision. Volunteers decided before review times were
 * recorded fall back to when they applied. */
const decidedAt = (a: { reviewedAt?: string | null; appliedAt: string }) =>
  a.reviewedAt ?? a.appliedAt;

type HistoryFilter = 'All' | 'Approved' | 'Rejected';
const FILTER_OPTIONS: HistoryFilter[] = ['All', 'Approved', 'Rejected'];

export default function HistoryScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  // This screen hides the tab bar, so the bottom inset is ours to clear.
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('All');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const { applications, loading, refreshing, error, reload, refresh } =
    useVolunteerApplications();

  // Most recent decision first. Pending applications have no decision yet.
  const decided = useMemo(
    () =>
      applications
        .filter((a) => a.status !== 'Pending')
        .sort((a, b) => Date.parse(decidedAt(b)) - Date.parse(decidedAt(a))),
    [applications]
  );

  const filteredData = activeFilter === 'All'
    ? decided
    : decided.filter(req => req.status === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Approval History"
        leftContent={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={c.text} />
          </Pressable>
        }
        rightContent={
          <Pressable
            onPress={() => setIsSortMenuOpen(true)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Filter history by outcome"
          >
            <ArrowUpDown size={24} color={c.text} />
          </Pressable>
        }
      />

      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={{
          paddingBottom: insets.bottom + AdminSpacing.scrollBottomBare,
        }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >
        {error && applications.length > 0 && <StaleDataBanner error={error} />}
        {loading && !refreshing ? (
          <ApplicationListSkeleton />
        ) : error && applications.length === 0 ? (
          <EmptyState
            icon={<AlertCircle size={32} color={c.danger} />}
            title="Couldn't load history"
            message={error}
            onRetry={() => reload(true)}
          />
        ) : filteredData.length === 0 ? (
          <EmptyState
            icon={<Inbox size={32} color={c.textMuted} />}
            title={`No ${activeFilter.toLowerCase()} applications`}
          />
        ) : (
          filteredData.map((request) => {
            return (
              <View
                key={request.id}
                style={[
                  styles.userRow,
                  { backgroundColor: c.card, borderColor: c.cardBorder },
                ]}
              >
                <Avatar
                  name={request.name}
                  uri={request.profileImage}
                  size={48}
                  style={styles.avatar}
                />

                <View style={styles.userInfoContainer}>
                  <Text style={[styles.userName, { color: c.text }]}>{request.name}</Text>
                  <Text style={[styles.userRole, { color: c.textSecondary }]}>
                    Volunteer • {formatRelativeTime(decidedAt(request))}
                  </Text>
                </View>

                <StatusBadge
                  label={request.status}
                  tone={request.status === 'Approved' ? 'success' : 'danger'}
                  style={styles.statusBadge}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      <FilterDropdown
        visible={isSortMenuOpen}
        onClose={() => setIsSortMenuOpen(false)}
        options={FILTER_OPTIONS}
        activeValue={activeFilter}
        onChange={setActiveFilter}
        offsetRight={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: AdminSpacing.screenEdge,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: Radius.card,
    borderWidth: 1,
    marginBottom: 12,
  },
  avatar: {
    marginRight: 16,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
  },
  statusBadge: {
    // StatusBadge defaults to flex-start; center it against the whole card.
    alignSelf: 'center',
  },
});
