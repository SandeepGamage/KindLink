import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type CommitmentStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

type Commitment = {
  id: string;
  type: string;
  person: string;
  dateTime: string;
  duration: string;
  location: string;
  status: CommitmentStatus;
};

const commitments: Commitment[] = [
  { id: 'companionship-kamala', type: 'Companionship Visit', person: 'Kamala', dateTime: 'Tomorrow, 10:00 AM', duration: 'Approx. 1.5 hours', location: 'Kandy Central', status: 'Upcoming' },
  { id: 'meal-delivery-sunil', type: 'Community Meal Delivery', person: 'Sunil', dateTime: 'Today, 5:30 PM', duration: 'Approx. 1 hour', location: 'Peradeniya', status: 'In Progress' },
  { id: 'grocery-nirmala', type: 'Grocery Assistance', person: 'Nirmala', dateTime: 'Aug 14, 4:00 PM', duration: 'Approx. 1 hour', location: 'Kandy Lake', status: 'Completed' },
  { id: 'transport-jayalath', type: 'Medical Transport', person: 'Jayalath', dateTime: 'Aug 12, 9:00 AM', duration: 'Approx. 2 hours', location: 'Kandy General Hospital', status: 'Cancelled' },
];

const statuses: CommitmentStatus[] = ['Upcoming', 'In Progress', 'Completed', 'Cancelled'];

const actionByStatus: Record<CommitmentStatus, string> = {
  Upcoming: 'View details',
  'In Progress': 'Check out / complete',
  Completed: 'View summary',
  Cancelled: 'View cancellation details',
};

export default function MyCommitmentsScreen() {
  const router = useRouter();
  const [selectedStatus, setSelectedStatus] = useState<CommitmentStatus>('Upcoming');
  const [showEmpty, setShowEmpty] = useState(false);

  const visibleCommitments = useMemo(
    () => (showEmpty ? [] : commitments.filter((commitment) => commitment.status === selectedStatus)),
    [selectedStatus, showEmpty],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>My Commitments</ThemedText>
            <ThemedText type="small" style={styles.subtitle}>Keep track of the people and tasks you have committed to.</ThemedText>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {statuses.map((status) => (
              <Pressable key={status} onPress={() => { setSelectedStatus(status); setShowEmpty(false); }} style={[styles.tab, selectedStatus === status && styles.tabActive]}>
                <ThemedText type="smallBold" style={[styles.tabText, selectedStatus === status && styles.tabTextActive]}>{status}</ThemedText>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sectionHeading}>
            <ThemedText type="smallBold" style={styles.sectionLabel}>{selectedStatus}</ThemedText>
            <Pressable onPress={() => setShowEmpty((current) => !current)}>
              <ThemedText type="small" style={styles.emptyToggle}>{showEmpty ? 'Show commitments' : 'Preview empty state'}</ThemedText>
            </Pressable>
          </View>

          {visibleCommitments.length === 0 ? (
            <View style={styles.emptyState}>
              <ThemedText type="subtitle" style={styles.emptyIcon}>○</ThemedText>
              <ThemedText type="default" style={styles.emptyTitle}>No {selectedStatus.toLowerCase()} commitments</ThemedText>
              <ThemedText type="small" style={styles.emptyMessage}>When you accept a task, it will appear here with everything you need to know.</ThemedText>
            </View>
          ) : (
            <View style={styles.commitmentList}>
              {visibleCommitments.map((commitment) => (
                <Pressable
                  key={commitment.id}
                  style={styles.commitmentCard}
                  onPress={() => router.push(`/volunteer/schedule/${commitment.id}` as Href)}>
                  <View style={styles.cardTopRow}>
                    <View style={styles.taskIcon}><ThemedText style={styles.taskIconText}>✦</ThemedText></View>
                    <View style={styles.cardTitleWrap}>
                      <ThemedText type="small" style={styles.personLabel}>Helping {commitment.person}</ThemedText>
                      <ThemedText type="default" style={styles.commitmentType}>{commitment.type}</ThemedText>
                    </View>
                    <StatusBadge status={commitment.status} />
                  </View>
                  <View style={styles.metaList}>
                    <Meta label={commitment.dateTime} />
                    <Meta label={commitment.duration} />
                    <Meta label={commitment.location} />
                  </View>
                  <View style={styles.actionButton}><ThemedText type="smallBold" style={styles.actionText}>{actionByStatus[commitment.status]}</ThemedText></View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function Meta({ label }: { label: string }) {
  return <ThemedText type="small" style={styles.metaText}>• {label}</ThemedText>;
}

function StatusBadge({ status }: { status: CommitmentStatus }) {
  return <View style={[styles.statusBadge, status === 'In Progress' && styles.statusInProgress, status === 'Completed' && styles.statusCompleted]}><ThemedText type="smallBold" style={styles.statusText}>{status}</ThemedText></View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  content: { paddingHorizontal: 24, paddingTop: 28 },
  header: { marginBottom: 28 },
  title: { fontSize: 32, lineHeight: 40, color: '#F7F7F8' },
  subtitle: { marginTop: 5, color: '#A9A9B0', fontSize: 16, lineHeight: 22 },
  tabRow: { gap: 8, paddingBottom: 28 },
  tab: { borderWidth: 1, borderColor: '#45454B', borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
  tabActive: { backgroundColor: '#F4F4F5', borderColor: '#F4F4F5' },
  tabText: { color: '#F7F7F8', fontSize: 13 },
  tabTextActive: { color: '#111' },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionLabel: { color: '#C3C3C9', textTransform: 'uppercase', letterSpacing: 0.8 },
  emptyToggle: { color: '#A9A9B0', textDecorationLine: 'underline' },
  commitmentList: { gap: 14 },
  commitmentCard: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, padding: 18, backgroundColor: '#000' },
  cardTopRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  taskIcon: { width: 44, height: 44, borderWidth: 1, borderColor: '#45454B', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  taskIconText: { color: '#F7F7F8', fontSize: 18 },
  cardTitleWrap: { flex: 1 },
  personLabel: { color: '#A9A9B0', fontSize: 12 },
  commitmentType: { color: '#F7F7F8', fontSize: 19, lineHeight: 24 },
  statusBadge: { backgroundColor: '#303036', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 },
  statusInProgress: { backgroundColor: '#735D25' },
  statusCompleted: { backgroundColor: '#2E684B' },
  statusText: { color: '#F7F7F8', fontSize: 11 },
  metaList: { marginTop: 16, gap: 6 },
  metaText: { color: '#C3C3C9', fontSize: 14 },
  actionButton: { marginTop: 18, borderRadius: 7, backgroundColor: '#F4F4F5', paddingVertical: 13, alignItems: 'center' },
  actionText: { color: '#111', fontSize: 15 },
  emptyState: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, alignItems: 'center', padding: 36, gap: 10 },
  emptyIcon: { color: '#F7F7F8', fontSize: 44 },
  emptyTitle: { color: '#F7F7F8', fontSize: 19 },
  emptyMessage: { color: '#A9A9B0', textAlign: 'center', lineHeight: 21 },
});
