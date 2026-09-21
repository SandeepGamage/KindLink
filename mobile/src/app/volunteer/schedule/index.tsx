import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type Href, useFocusEffect, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest } from '@/types/appointment';

type CommitmentStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

const statuses: CommitmentStatus[] = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];

const actionByStatus: Record<CommitmentStatus, string> = {
  Upcoming: 'View details',
  'In Progress': 'Check out / complete',
  Completed: 'View summary',
  Cancelled: 'View cancellation details',
};

function mapBackendStatusToCommitmentStatus(status?: string): CommitmentStatus {
  if (!status) return 'Upcoming';
  const lower = status.toLowerCase();
  if (lower === 'accepted') return 'Upcoming';
  if (lower === 'in_progress') return 'In Progress';
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Upcoming';
}

export default function MyCommitmentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requests, loading, refreshRequests } = useAppointments();

  const [selectedStatus, setSelectedStatus] = useState<CommitmentStatus>('Upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [refreshRequests])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRequests();
    setRefreshing(false);
  };

  // Only consider non-pending requests for commitments (or accepted requests)
  const commitments = useMemo(() => {
    return requests
      .filter((r) => r.status !== 'pending')
      .map((r) => ({
        id: r._id,
        type: r.taskType || r.title,
        person: r.requester?.name || 'Community Elder',
        dateTime: r.preferredTime || r.date || 'Scheduled time',
        location: r.location || 'Home',
        status: mapBackendStatusToCommitmentStatus(r.status),
        raw: r,
      }));
  }, [requests]);

  const visibleCommitments = useMemo(
    () => commitments.filter((c) => c.status === selectedStatus),
    [commitments, selectedStatus]
  );

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mainWrapper}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFFFFF" />
          }
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              My Commitments
            </ThemedText>
            <ThemedText type="small" style={styles.subtitle}>
              Keep track of the people and tasks you have committed to.
            </ThemedText>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
            {statuses.map((status) => (
              <Pressable
                key={status}
                onPress={() => setSelectedStatus(status)}
                style={[styles.tab, selectedStatus === status && styles.tabActive]}
              >
                <ThemedText
                  type="smallBold"
                  style={[styles.tabText, selectedStatus === status && styles.tabTextActive]}
                >
                  {status}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeading}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>
              {selectedStatus} ({visibleCommitments.length})
            </ThemedText>
          </View>

          {loading && !refreshing && commitments.length === 0 ? (
            <View style={styles.emptyState}>
              <ActivityIndicator size="large" color="#FFFFFF" />
              <ThemedText type="default" style={styles.emptyTitle}>
                Loading commitments...
              </ThemedText>
            </View>
          ) : visibleCommitments.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyIcon}>
                ○
              </ThemedText>
              <ThemedText type="default" style={styles.emptyTitle}>
                No {selectedStatus.toLowerCase()} commitments
              </ThemedText>
              <ThemedText type="small" style={styles.emptyMessage}>
                When you accept a task, it will appear here with everything you need to know.
              </ThemedText>
            </View>
          ) : (
            <View style={styles.commitmentList}>
              {visibleCommitments.map((commitment) => (
                <Pressable
                  key={commitment.id}
                  style={styles.commitmentCard}
                  onPress={() => router.push(`/volunteer/schedule/${commitment.id}` as Href)}
                >
                  <View style={styles.cardTopRow}>
                    <View style={styles.taskIcon}>
                      <ThemedText style={styles.taskIconText}>✦</ThemedText>
                    </View>
                    <View style={styles.cardTitleWrap}>
                      <ThemedText type="small" style={styles.personLabel}>
                        Helping {commitment.person}
                      </ThemedText>
                      <ThemedText type="default" style={styles.commitmentType}>
                        {commitment.type}
                      </ThemedText>
                    </View>
                    <StatusBadge status={commitment.status} />
                  </View>
                  <View style={styles.metaList}>
                    <Meta label={`When: ${commitment.dateTime}`} />
                    <Meta label={`Location: ${commitment.location}`} />
                  </View>
                  <View style={styles.actionButton}>
                    <ThemedText type="smallBold" style={styles.actionText}>
                      {actionByStatus[commitment.status]}
                    </ThemedText>
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </ThemedView>
  );
}

function Meta({ label }: { label: string }) {
  return <ThemedText type="small" style={styles.metaText}>• {label}</ThemedText>;
}

function StatusBadge({ status }: { status: CommitmentStatus }) {
  return (
    <View
      style={[
        styles.statusBadge,
        status === 'In Progress' && styles.statusInProgress,
        status === 'Completed' && styles.statusCompleted,
        status === 'Cancelled' && styles.statusCancelled,
      ]}
    >
      <ThemedText type="smallBold" style={styles.statusText}>
        {status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 38,
    color: '#F7F7F8',
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 4,
    color: '#A9A9B0',
    fontSize: 15,
  },
  tabRow: {
    gap: 8,
    paddingBottom: 20,
  },
  tab: {
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#111114',
  },
  tabActive: {
    backgroundColor: '#F4F4F5',
    borderColor: '#F4F4F5',
  },
  tabText: {
    color: '#F7F7F8',
    fontSize: 13,
  },
  tabTextActive: {
    color: '#111114',
    fontWeight: '600',
  },
  sectionHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionLabel: {
    color: '#C3C3C9',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  commitmentList: {
    gap: 14,
  },
  commitmentCard: {
    borderWidth: 1,
    borderColor: '#38383E',
    borderRadius: 14,
    padding: 18,
    backgroundColor: '#111114',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1E',
  },
  taskIconText: {
    color: '#F7F7F8',
    fontSize: 18,
  },
  cardTitleWrap: {
    flex: 1,
  },
  personLabel: {
    color: '#A9A9B0',
    fontSize: 12,
  },
  commitmentType: {
    color: '#F7F7F8',
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '600',
  },
  statusBadge: {
    backgroundColor: '#303036',
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusInProgress: {
    backgroundColor: '#735D25',
  },
  statusCompleted: {
    backgroundColor: '#2E684B',
  },
  statusCancelled: {
    backgroundColor: '#7A2E2E',
  },
  statusText: {
    color: '#F7F7F8',
    fontSize: 11,
    fontWeight: '600',
  },
  metaList: {
    marginTop: 14,
    gap: 4,
  },
  metaText: {
    color: '#A9A9B0',
    fontSize: 13,
  },
  actionButton: {
    marginTop: 16,
    borderRadius: 8,
    backgroundColor: '#F4F4F5',
    paddingVertical: 12,
    alignItems: 'center',
  },
  actionText: {
    color: '#111114',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    borderWidth: 1,
    borderColor: '#38383E',
    borderRadius: 14,
    alignItems: 'center',
    padding: 36,
    gap: 10,
    backgroundColor: '#111114',
  },
  emptyIcon: {
    color: '#F7F7F8',
    fontSize: 40,
  },
  emptyTitle: {
    color: '#F7F7F8',
    fontSize: 18,
    fontWeight: '600',
  },
  emptyMessage: {
    color: '#A9A9B0',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 14,
  },
});
