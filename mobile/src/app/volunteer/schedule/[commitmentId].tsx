import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

type CommitmentStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

type CommitmentDetail = {
  type: string;
  person: string;
  status: CommitmentStatus;
  dateTime: string;
  duration: string;
  location: string;
  description: string;
};

const commitmentDetails: Record<string, CommitmentDetail> = {
  'companionship-kamala': { type: 'Companionship Visit', person: 'Kamala', status: 'Upcoming', dateTime: 'Tomorrow, 10:00 AM', duration: 'Approx. 1.5 hours', location: 'Kandy Central', description: 'Spend time chatting over tea and help Kamala feel connected to her community.' },
  'meal-delivery-sunil': { type: 'Community Meal Delivery', person: 'Sunil', status: 'In Progress', dateTime: 'Today, 5:30 PM', duration: 'Approx. 1 hour', location: 'Peradeniya', description: 'Deliver prepared meals to three nearby households and confirm each delivery.' },
  'grocery-nirmala': { type: 'Grocery Assistance', person: 'Nirmala', status: 'Completed', dateTime: 'Aug 14, 4:00 PM', duration: 'Approx. 1 hour', location: 'Kandy Lake', description: 'Helped Nirmala complete her regular grocery shopping and carry items home.' },
  'transport-jayalath': { type: 'Medical Transport', person: 'Jayalath', status: 'Cancelled', dateTime: 'Aug 12, 9:00 AM', duration: 'Approx. 2 hours', location: 'Kandy General Hospital', description: 'This transport task was cancelled after Jayalath arranged an alternative ride.' },
};

export default function AcceptedTaskDetailsScreen() {
  const router = useRouter();
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>();
  const commitment = commitmentDetails[commitmentId] ?? commitmentDetails['companionship-kamala'];
  const [notice, setNotice] = useState('');

  const primaryAction = commitment.status === 'Upcoming' ? 'Get directions' : commitment.status === 'In Progress' ? 'Check out and complete' : commitment.status === 'Completed' ? 'Rate experience' : 'View cancellation details';
  const secondaryAction = commitment.status === 'Upcoming' ? 'Reschedule task' : commitment.status === 'In Progress' ? 'Contact support' : commitment.status === 'Completed' ? 'View task summary' : 'Return to commitments';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}><ThemedText style={styles.back}>‹</ThemedText></Pressable>
          <ThemedText type="title" style={styles.headerTitle}>Task Details</ThemedText>
          <View style={styles.headerSpacer} />
        </View>
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 112 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.taskMark}><ThemedText style={styles.taskMarkText}>✦</ThemedText></View>
            <ThemedText type="subtitle" style={styles.taskType}>{commitment.type}</ThemedText>
            <ThemedText type="small" style={styles.helpingText}>Helping {commitment.person}</ThemedText>
            <StatusBadge status={commitment.status} />
          </View>

          <DetailCard label="Task overview"><ThemedText type="small" style={styles.description}>{commitment.description}</ThemedText></DetailCard>
          <DetailCard label="When & where"><View style={styles.detailList}><DetailItem label={commitment.dateTime} /><DetailItem label={commitment.duration} /><DetailItem label={commitment.location} /></View></DetailCard>
          <DetailCard label="Status"><ThemedText type="small" style={styles.statusDescription}>{statusDescription(commitment.status)}</ThemedText></DetailCard>

          {notice ? <View style={styles.notice}><ThemedText type="smallBold" style={styles.noticeText}>{notice}</ThemedText></View> : null}
        </ScrollView>
        <View style={styles.actionBar}>
          <Pressable style={styles.secondaryAction} onPress={() => setNotice(`${secondaryAction} selected.`)}><ThemedText type="smallBold" style={styles.secondaryText}>{secondaryAction}</ThemedText></Pressable>
          <Pressable style={styles.primaryAction} onPress={() => setNotice(primaryAction === 'Check out and complete' ? 'Task completed. Thank you for your help.' : `${primaryAction} selected.`)}><ThemedText type="smallBold" style={styles.primaryText}>{primaryAction}</ThemedText></Pressable>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

function statusDescription(status: CommitmentStatus) {
  if (status === 'Upcoming') return 'Your commitment is confirmed. You can view directions, reschedule, or cancel before the start time.';
  if (status === 'In Progress') return 'This task is currently active. Check out once you have finished helping.';
  if (status === 'Completed') return 'This task was completed. Thank you for making a difference.';
  return 'This task was cancelled. No further action is required.';
}
function DetailCard({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.card}><ThemedText type="smallBold" style={styles.cardLabel}>{label}</ThemedText>{children}</View>; }
function DetailItem({ label }: { label: string }) { return <ThemedText type="default" style={styles.detailText}>•  {label}</ThemedText>; }
function StatusBadge({ status }: { status: CommitmentStatus }) { return <View style={[styles.statusBadge, status === 'In Progress' && styles.statusInProgress, status === 'Completed' && styles.statusCompleted]}><ThemedText type="smallBold" style={styles.statusText}>{status}</ThemedText></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  header: { height: 96, paddingHorizontal: 28, borderBottomWidth: 1, borderBottomColor: '#2C2C2F', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: '#F7F7F8', fontSize: 42, lineHeight: 42 },
  headerTitle: { color: '#F7F7F8', fontSize: 28, lineHeight: 34 },
  headerSpacer: { width: 26 },
  content: { paddingHorizontal: 24, paddingTop: 38, gap: 20 },
  hero: { alignItems: 'center', gap: 9, marginBottom: 8 },
  taskMark: { width: 82, height: 82, borderRadius: 41, borderWidth: 1, borderColor: '#45454B', alignItems: 'center', justifyContent: 'center' },
  taskMarkText: { color: '#F7F7F8', fontSize: 28 },
  taskType: { color: '#F7F7F8', fontSize: 25, lineHeight: 31, textAlign: 'center' },
  helpingText: { color: '#A9A9B0', fontSize: 17 },
  statusBadge: { backgroundColor: '#303036', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  statusInProgress: { backgroundColor: '#735D25' },
  statusCompleted: { backgroundColor: '#2E684B' },
  statusText: { color: '#F7F7F8', fontSize: 12 },
  card: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, padding: 20, gap: 14 },
  cardLabel: { color: '#C3C3C9', textTransform: 'uppercase', letterSpacing: 0.8 },
  description: { color: '#F7F7F8', fontSize: 17, lineHeight: 25 },
  detailList: { gap: 13 },
  detailText: { color: '#F7F7F8', fontSize: 18, lineHeight: 24 },
  statusDescription: { color: '#C3C3C9', fontSize: 16, lineHeight: 23 },
  notice: { borderWidth: 1, borderColor: '#6D826E', borderRadius: 10, padding: 14 },
  noticeText: { color: '#F7F7F8', textAlign: 'center' },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 18, flexDirection: 'row', gap: 12, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#2C2C2F' },
  secondaryAction: { flex: 1, borderWidth: 1, borderColor: '#45454B', borderRadius: 7, paddingVertical: 15, alignItems: 'center' },
  secondaryText: { color: '#F7F7F8', fontSize: 14, textAlign: 'center' },
  primaryAction: { flex: 1, backgroundColor: '#F4F4F5', borderRadius: 7, paddingVertical: 15, alignItems: 'center' },
  primaryText: { color: '#111', fontSize: 14, textAlign: 'center' },
});
