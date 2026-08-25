import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const requestDetails = {
  'grocery-assistance': { title: 'Grocery Assistance', name: 'Mrs. Kamala Perera', description: 'I need some help carrying my weekly groceries from the nearby supermarket.', date: 'Today, 4:00 PM', duration: 'Approx. 1 hour', distance: '2.1 km away', category: 'Grocery shopping' },
  'companionship-visit': { title: 'Companionship Visit', name: 'Mr. Chandrasena Silva', description: 'I would enjoy a friendly conversation and a cup of tea this week.', date: 'Tomorrow, 10:00 AM', duration: 'Approx. 1.5 hours', distance: '1.5 km away', category: 'Companionship' },
  'medicine-collection': { title: 'Medication Pickup', name: 'Mrs. Nirmala Fernando', description: 'Please collect my prescription from the pharmacy nearby.', date: 'Wednesday, 2:30 PM', duration: 'Approx. 45 mins', distance: '3.2 km away', category: 'Medicine collection' },
  'technology-help': { title: 'Video Call Setup', name: 'Mr. Sunil Jayasinghe', description: 'I need help making a video call with my family overseas.', date: 'Friday, 11:00 AM', duration: 'Approx. 1 hour', distance: '4.0 km away', category: 'Technology assistance' },
};

export default function RequestDetailsScreen() {
  const router = useRouter();
  const { requestId } = useLocalSearchParams<{ requestId: keyof typeof requestDetails }>();
  const request = requestDetails[requestId] ?? requestDetails['grocery-assistance'];
  const [status, setStatus] = useState<'idle' | 'accepted' | 'declined'>('idle');

  return <ThemedView style={styles.container}>
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <View style={styles.header}><Pressable onPress={() => router.back()} hitSlop={12}><ThemedText style={styles.back}>‹</ThemedText></Pressable><ThemedText type="title" style={styles.headerTitle}>Request Details</ThemedText><View style={styles.headerSpacer} /></View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 112 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.personSection}><View style={styles.avatar}><ThemedText style={styles.avatarIcon}>●</ThemedText></View><ThemedText type="subtitle" style={styles.personName}>{request.name}</ThemedText><ThemedText type="small" style={styles.rating}>★ 4.8   ✓ Verified</ThemedText></View>
        <DetailCard label="Request"><ThemedText type="default" style={styles.requestTitle}>{request.title}</ThemedText><ThemedText type="small" style={styles.quote}>“{request.description}”</ThemedText></DetailCard>
        <DetailCard label="When & where"><View style={styles.detailList}><DetailItem label={request.date} /><DetailItem label={request.duration} /><DetailItem label={request.distance} /></View><Pressable style={styles.outlineButton}><ThemedText type="smallBold" style={styles.outlineButtonText}>View Location</ThemedText></Pressable></DetailCard>
        <View style={styles.trustCard}><ThemedText type="smallBold" style={styles.cardLabel}>Safety & trust</ThemedText><ThemedText type="default" style={styles.trustText}>✓  User Identity Verified</ThemedText><ThemedText type="default" style={styles.trustText}>✓  Community Member</ThemedText><ThemedText type="default" style={styles.trustText}>★  4.8 User Rating</ThemedText><Pressable style={styles.profileButton}><ThemedText type="smallBold" style={styles.outlineButtonText}>View Profile</ThemedText></Pressable></View>
        {status !== 'idle' && <View style={styles.confirmation}><ThemedText type="smallBold" style={styles.confirmationText}>{status === 'accepted' ? 'Request accepted. It has been added to your schedule.' : 'Request declined.'}</ThemedText></View>}
      </ScrollView>
      <View style={styles.actionBar}><Pressable style={styles.declineButton} onPress={() => setStatus('declined')}><ThemedText type="smallBold" style={styles.declineText}>Decline</ThemedText></Pressable><Pressable style={styles.acceptButton} onPress={() => setStatus('accepted')}><ThemedText type="smallBold" style={styles.acceptText}>Accept Request</ThemedText></Pressable></View>
    </SafeAreaView>
  </ThemedView>;
}

function DetailCard({ label, children }: { label: string; children: React.ReactNode }) { return <View style={styles.card}><ThemedText type="smallBold" style={styles.cardLabel}>{label}</ThemedText>{children}</View>; }
function DetailItem({ label }: { label: string }) { return <ThemedText type="default" style={styles.detailText}>•  {label}</ThemedText>; }

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000' }, safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth }, header: { height: 96, paddingHorizontal: 28, borderBottomWidth: 1, borderBottomColor: '#2C2C2F', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, back: { color: '#F7F7F8', fontSize: 42, lineHeight: 42 }, headerTitle: { color: '#F7F7F8', fontSize: 28, lineHeight: 34 }, headerSpacer: { width: 26 }, content: { paddingHorizontal: 24, paddingTop: 40, gap: 28 }, personSection: { alignItems: 'center', gap: 8 }, avatar: { width: 150, height: 150, borderRadius: 75, borderWidth: 1, borderColor: '#45454B', alignItems: 'center', justifyContent: 'center' }, avatarIcon: { color: '#B7B7C0', fontSize: 44 }, personName: { color: '#F7F7F8', fontSize: 25, lineHeight: 31 }, rating: { color: '#C3C3C9', fontSize: 17 }, card: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, padding: 26, gap: 16 }, cardLabel: { color: '#C3C3C9', textTransform: 'uppercase', letterSpacing: 0.8 }, requestTitle: { color: '#F7F7F8', fontSize: 23, lineHeight: 29 }, quote: { color: '#F7F7F8', fontSize: 18, lineHeight: 28, fontStyle: 'italic', borderLeftWidth: 3, borderLeftColor: '#606068', paddingLeft: 14 }, detailList: { gap: 14 }, detailText: { color: '#F7F7F8', fontSize: 20, lineHeight: 26 }, outlineButton: { borderWidth: 1, borderColor: '#45454B', borderRadius: 7, paddingVertical: 14, alignItems: 'center', marginTop: 4 }, outlineButtonText: { color: '#F7F7F8', fontSize: 17 }, trustCard: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, padding: 26, gap: 16, backgroundColor: '#202024' }, trustText: { color: '#F7F7F8', fontSize: 18, lineHeight: 25 }, profileButton: { borderWidth: 1, borderColor: '#45454B', borderRadius: 7, paddingVertical: 14, alignItems: 'center', marginTop: 6 }, confirmation: { borderWidth: 1, borderColor: '#6D826E', borderRadius: 10, padding: 14 }, confirmationText: { color: '#F7F7F8', textAlign: 'center' }, actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 24, paddingVertical: 18, flexDirection: 'row', gap: 14, backgroundColor: '#000', borderTopWidth: 1, borderTopColor: '#2C2C2F' }, declineButton: { flex: 1, borderWidth: 1, borderColor: '#45454B', borderRadius: 7, paddingVertical: 17, alignItems: 'center' }, declineText: { color: '#F7F7F8', fontSize: 17 }, acceptButton: { flex: 1, backgroundColor: '#F4F4F5', borderRadius: 7, paddingVertical: 17, alignItems: 'center' }, acceptText: { color: '#111', fontSize: 17 },
});