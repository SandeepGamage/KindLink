import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const skills = ['Companionship', 'Grocery shopping', 'First aid', 'Technology help'];
const interests = ['Community care', 'Reading', 'Music', 'Wellness'];
const categories = ['Companionship', 'Medicine collection', 'Transportation'];
const badges = ['20 tasks', 'Trusted helper', 'Community star'];

export default function VolunteerProfileScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12}><ThemedText style={styles.back}>‹</ThemedText></Pressable>
          <ThemedText type="title" style={styles.headerTitle}>Volunteer Profile</ThemedText>
          <Pressable hitSlop={12}><ThemedText type="smallBold" style={styles.editText}>Edit</ThemedText></Pressable>
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.avatar}><ThemedText style={styles.avatarInitials}>SM</ThemedText></View>
            <ThemedText type="subtitle" style={styles.name}>Shanaka Mandinu</ThemedText>
            <ThemedText type="small" style={styles.memberSince}>Volunteer since March 2025</ThemedText>
            <View style={styles.ratingRow}><ThemedText type="smallBold" style={styles.rating}>★ 4.9</ThemedText><ThemedText type="small" style={styles.ratingNote}>from 18 reviews</ThemedText></View>
          </View>

          <ProfileCard title="Personal details">
            <InfoRow label="Email" value="shanaka@example.com" />
            <InfoRow label="Phone" value="+94 77 123 4567" />
            <InfoRow label="Location" value="Kandy, Sri Lanka" />
          </ProfileCard>

          <ProfileCard title="Availability & travel">
            <View style={styles.availabilityRow}><View><ThemedText type="default" style={styles.availabilityTitle}>Available for tasks</ThemedText><ThemedText type="small" style={styles.availabilityNote}>{isAvailable ? 'You are visible to nearby requests.' : 'You are currently paused.'}</ThemedText></View><Switch value={isAvailable} onValueChange={setIsAvailable} trackColor={{ false: '#45454B', true: '#F4F4F5' }} thumbColor={isAvailable ? '#111111' : '#F7F7F8'} /></View>
            <InfoRow label="Travel radius" value="Up to 8 km" />
            <InfoRow label="Preferred times" value="Weekday afternoons, weekends" />
          </ProfileCard>

          <ProfileCard title="Skills & interests">
            <ChipGroup label="Skills" items={skills} />
            <ChipGroup label="Interests" items={interests} />
            <ChipGroup label="Preferred assistance" items={categories} />
            <InfoRow label="Languages" value="Sinhala, English" />
          </ProfileCard>

          <ProfileCard title="Verification & training">
            <VerificationRow label="Identity verified" detail="Verified member" />
            <VerificationRow label="Community guidelines" detail="Completed" />
            <VerificationRow label="Volunteer safety training" detail="Completed May 2025" />
          </ProfileCard>

          <ProfileCard title="Volunteer impact">
            <View style={styles.metricsRow}><Metric value="28.5h" label="Hours" /><Metric value="17" label="Tasks" /><Metric value="24" label="People helped" /></View>
            <ThemedText type="smallBold" style={styles.subsectionLabel}>Badges</ThemedText>
            <View style={styles.badgesRow}>{badges.map((badge) => <View key={badge} style={styles.badge}><ThemedText type="small" style={styles.badgeText}>✦ {badge}</ThemedText></View>)}</View>
            <Pressable style={styles.historyButton}><ThemedText type="smallBold" style={styles.historyText}>View volunteer history</ThemedText></Pressable>
          </ProfileCard>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ProfileCard({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.card}><ThemedText type="smallBold" style={styles.cardTitle}>{title}</ThemedText>{children}</View>; }
function InfoRow({ label, value }: { label: string; value: string }) { return <View style={styles.infoRow}><ThemedText type="small" style={styles.infoLabel}>{label}</ThemedText><ThemedText type="smallBold" style={styles.infoValue}>{value}</ThemedText></View>; }
function ChipGroup({ label, items }: { label: string; items: string[] }) { return <View style={styles.chipGroup}><ThemedText type="small" style={styles.chipLabel}>{label}</ThemedText><View style={styles.chipRow}>{items.map((item) => <View key={item} style={styles.chip}><ThemedText type="small" style={styles.chipText}>{item}</ThemedText></View>)}</View></View>; }
function VerificationRow({ label, detail }: { label: string; detail: string }) { return <View style={styles.verificationRow}><View style={styles.checkMark}><ThemedText style={styles.checkText}>✓</ThemedText></View><View style={styles.verificationText}><ThemedText type="default" style={styles.verificationTitle}>{label}</ThemedText><ThemedText type="small" style={styles.verificationDetail}>{detail}</ThemedText></View></View>; }
function Metric({ value, label }: { value: string; label: string }) { return <View style={styles.metric}><ThemedText type="subtitle" style={styles.metricValue}>{value}</ThemedText><ThemedText type="small" style={styles.metricLabel}>{label}</ThemedText></View>; }

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: '#000' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  header: { height: 96, paddingHorizontal: 24, borderBottomWidth: 1, borderBottomColor: '#2C2C2F', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { color: '#F7F7F8', fontSize: 42, lineHeight: 42 },
  headerTitle: { color: '#F7F7F8', fontSize: 26, lineHeight: 32 },
  editText: { color: '#F7F7F8', textDecorationLine: 'underline' },
  content: { paddingHorizontal: 24, paddingTop: 32, gap: 16 },
  hero: { alignItems: 'center', marginBottom: 8 },
  avatar: { width: 104, height: 104, borderRadius: 52, borderWidth: 1, borderColor: '#606068', alignItems: 'center', justifyContent: 'center', backgroundColor: '#202024' },
  avatarInitials: { color: '#F7F7F8', fontSize: 30, fontWeight: '700' },
  name: { color: '#F7F7F8', fontSize: 26, lineHeight: 33, marginTop: 14 },
  memberSince: { color: '#A9A9B0', marginTop: 2 },
  ratingRow: { marginTop: 10, flexDirection: 'row', alignItems: 'center', gap: 8 },
  rating: { color: '#E9BD59', fontSize: 16 },
  ratingNote: { color: '#C3C3C9' },
  card: { borderWidth: 1, borderColor: '#45454B', borderRadius: 14, padding: 20, gap: 15 },
  cardTitle: { color: '#C3C3C9', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 2 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 16 },
  infoLabel: { color: '#A9A9B0', flex: 1 },
  infoValue: { color: '#F7F7F8', flex: 1, textAlign: 'right' },
  availabilityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 4 },
  availabilityTitle: { color: '#F7F7F8', fontSize: 17 },
  availabilityNote: { color: '#A9A9B0', marginTop: 2 },
  chipGroup: { gap: 8 },
  chipLabel: { color: '#A9A9B0' },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  chip: { borderWidth: 1, borderColor: '#45454B', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 6 },
  chipText: { color: '#F7F7F8', fontSize: 13 },
  verificationRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkMark: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#276447', alignItems: 'center', justifyContent: 'center' },
  checkText: { color: '#F7F7F8', fontSize: 16, fontWeight: '700' },
  verificationText: { flex: 1 },
  verificationTitle: { color: '#F7F7F8', fontSize: 16 },
  verificationDetail: { color: '#A9A9B0', marginTop: 1 },
  metricsRow: { flexDirection: 'row', gap: 8 },
  metric: { flex: 1, borderWidth: 1, borderColor: '#45454B', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  metricValue: { color: '#F7F7F8', fontSize: 22, lineHeight: 28 },
  metricLabel: { color: '#A9A9B0', fontSize: 12 },
  subsectionLabel: { color: '#A9A9B0', marginTop: 4 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { borderWidth: 1, borderColor: '#79632B', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#342E1B' },
  badgeText: { color: '#F0CE71', fontSize: 12 },
  historyButton: { borderWidth: 1, borderColor: '#45454B', borderRadius: 7, paddingVertical: 13, alignItems: 'center', marginTop: 2 },
  historyText: { color: '#F7F7F8' },
});
