import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { type Href, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';

const upcomingCommitment = {
  title: 'Companionship Visit',
  time: 'Tomorrow, 10:00 AM',
  location: 'Kandy Central',
  details: 'Meet Mr. Chandrasena and spend time chatting over tea.',
};

const recommendedRequests = [
  {
    id: 1,
    title: 'Grocery Assistance',
    description: 'Help with weekly grocery shopping.',
    distance: '2.1 km away',
    date: 'Today, 4:00 PM',
    duration: 'Approx. 1 hour',
    category: 'Errands',
  },
  {
    id: 2,
    title: 'Companionship Visit',
    description: 'Have tea and spend some time talking with an elderly person.',
    distance: '1.5 km away',
    date: 'Tomorrow, 10:00 AM',
    duration: 'Approx. 1.5 hours',
    category: 'Companionship',
  },
  {
    id: 3,
    title: 'Medication Pickup',
    description: 'Collect prescriptions from the local pharmacy for a senior resident.',
    distance: '3.2 km away',
    date: 'Wednesday, 2:30 PM',
    duration: 'Approx. 45 mins',
    category: 'Support',
  },
];

const impactSummary = [
  { label: 'Hours contributed', value: '28.5h' },
  { label: 'Tasks completed', value: '17' },
  { label: 'People helped', value: '24' },
];

const activeTask = {
  title: 'Community Meal Delivery',
  time: 'Today · 5:30 PM',
  summary: 'Deliver prepared meals to 3 households in the neighborhood.',
};

export default function VolunteerDashboardScreen() {
  const router = useRouter();
  const [isAvailable, setIsAvailable] = useState(true);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={styles.dashboard}>
            <View style={styles.frameHeader}>
              <TextBadge>☰</TextBadge>
              <ThemedText type="title" style={styles.brandText}>
                KindLink
              </ThemedText>
              <View style={styles.headerActions}>
                <TextBadge>🔔</TextBadge>
                <TextBadge>👤</TextBadge>
              </View>
            </View>

            <View style={styles.greetingCard}>
              <ThemedText type="default" style={styles.greetingText}>
                Good Morning, Shanaka! 👋
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.subGreetingText}>
                Ready to make a difference today?
              </ThemedText>
            </View>

            <View style={styles.locationRow}>
              <View style={styles.locationWrap}>
                <ThemedText type="small" style={styles.locationDot}>
                  •
                </ThemedText>
                <ThemedText type="smallBold" style={styles.locationText}>
                  Kandy
                </ThemedText>
              </View>

              <Pressable>
                <ThemedText type="small" themeColor="textSecondary" style={styles.changeLocationText}>
                  Change Location
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.availabilityRow}>
              <ThemedText type="smallBold" style={styles.availabilityLabel}>
                Available for tasks
              </ThemedText>
              <Switch
                value={isAvailable}
                onValueChange={setIsAvailable}
                trackColor={{ false: '#D5D5D5', true: '#2F2F2F' }}
                thumbColor={isAvailable ? '#FFFFFF' : '#F5F5F5'}
                ios_backgroundColor="#D5D5D5"
              />
            </View>

            <View style={styles.commitmentCard}>
              <View style={styles.cardHeaderRow}>
                <ThemedText type="smallBold" style={styles.sectionTitle}>
                  Next upcoming commitment
                </ThemedText>
              </View>

              <View style={styles.commitmentBody}>
                <View style={styles.iconBadge}>
                  <ThemedText style={styles.iconGlyph}>◌</ThemedText>
                </View>
                <View style={styles.commitmentContent}>
                  <ThemedText type="default" style={styles.commitmentTitle}>
                    {upcomingCommitment.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={styles.metaText}>
                    {upcomingCommitment.details}
                  </ThemedText>
                  <View style={styles.metaStack}>
                    <MetaRow label={upcomingCommitment.location} />
                    <MetaRow label={upcomingCommitment.time} />
                  </View>
                </View>
              </View>
              <Pressable
                style={styles.scheduleButton}
                onPress={() => router.push('/volunteer/schedule' as Href)}>
                <ThemedText type="smallBold" style={styles.scheduleButtonText}>
                  View my schedule
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.sectionHeaderRow}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Find volunteering opportunities
              </ThemedText>
            </View>

            <View style={styles.searchBox}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.searchText}>
                Search requests...
              </ThemedText>
            </View>

            <View style={styles.filterRow}>
              {['All', 'Companionship', 'Errands', 'Shopping'].map((tag, index) => (
                <Pressable
                  key={tag}
                  style={[styles.filterChip, index === 0 && styles.filterChipActive]}>
                  <ThemedText
                    type="small"
                    style={[styles.filterChipText, index === 0 && styles.filterChipTextActive]}>
                    {tag}
                  </ThemedText>
                </Pressable>
              ))}
            </View>

            <View style={styles.nearbyHeader}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Nearby requests
              </ThemedText>
              <Pressable onPress={() => router.push('/volunteer/requests' as Href)}>
                <ThemedText type="small" style={styles.seeAllText}>
                  See all
                </ThemedText>
              </Pressable>
            </View>

            <View style={styles.requestList}>
              {recommendedRequests.map((request) => (
                <View key={request.id} style={styles.requestCard}>
                  <View style={styles.requestHeader}>
                    <View style={styles.requestIcon}>
                      <ThemedText style={styles.iconGlyph}>✦</ThemedText>
                    </View>
                    <View style={styles.requestTextWrap}>
                      <ThemedText type="default" style={styles.requestTitle}>
                        {request.title}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary" style={styles.requestDescription}>
                        {request.description}
                      </ThemedText>
                    </View>
                  </View>

                  <View style={styles.requestMetaList}>
                    <MetaRow label={request.distance} />
                    <MetaRow label={request.date} />
                    <MetaRow label={request.duration} />
                  </View>

                  <Pressable style={styles.primaryButton}>
                    <ThemedText type="smallBold" style={styles.primaryButtonText}>
                      View Request
                    </ThemedText>
                  </Pressable>
                </View>
              ))}
            </View>

            <View style={styles.impactSection}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Impact summary
              </ThemedText>

              <View style={styles.impactGrid}>
                {impactSummary.map((item) => (
                  <View key={item.label} style={styles.metricCard}>
                    <ThemedText type="small" themeColor="textSecondary" style={styles.metricLabel}>
                      {item.label}
                    </ThemedText>
                    <ThemedText type="subtitle" style={styles.metricValue}>
                      {item.value}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.activeTaskCard}>
              <ThemedText type="smallBold" style={styles.sectionTitle}>
                Quick access to active task
              </ThemedText>
              <View style={styles.activeTaskHeader}>
                <View style={styles.taskIcon}>
                  <ThemedText style={styles.iconGlyph}>⬢</ThemedText>
                </View>
                <View>
                  <ThemedText type="default" style={styles.requestTitle}>
                    {activeTask.title}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary">
                    {activeTask.time}
                  </ThemedText>
                </View>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.activeTaskSummary}>
                {activeTask.summary}
              </ThemedText>
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="smallBold" style={styles.secondaryButtonText}>
                  Open task
                </ThemedText>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function MetaRow({ label }: { label: string }) {
  return (
    <View style={styles.metaRow}>
      <ThemedText type="small" style={styles.metaGlyph}>
        •
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.metaRowText}>
        {label}
      </ThemedText>
    </View>
  );
}

function TextBadge({ children }: { children: React.ReactNode }) {
  return (
    <View style={styles.iconBadgeSmall}>
      <ThemedText style={styles.headerIcon}>{children}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  dashboard: {
    backgroundColor: '#000000',
    paddingBottom: 20,
  },
  frameHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2F',
    paddingHorizontal: 40,
    paddingVertical: 22,
    minHeight: 96,
  },
  brandText: {
    fontSize: 28,
    fontWeight: '700',
    lineHeight: 32,
    color: '#F7F7F8',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 10,
  },
  iconBadgeSmall: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  headerIcon: {
    color: '#F7F7F8',
    fontSize: 22,
    lineHeight: 26,
  },
  greetingCard: {
    marginTop: 36,
    paddingHorizontal: 40,
  },
  greetingText: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '600',
    color: '#F7F7F8',
  },
  subGreetingText: {
    marginTop: 2,
    fontSize: 20,
    lineHeight: 26,
    color: '#A9A9B0',
  },
  locationRow: {
    marginTop: 28,
    marginHorizontal: 40,
    paddingVertical: 20,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 14,
  },
  locationWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationDot: {
    fontSize: 18,
    color: '#ECECF0',
  },
  locationText: {
    fontSize: 16,
    color: '#F7F7F8',
  },
  changeLocationText: {
    fontSize: 14,
    color: '#F7F7F8',
    textDecorationLine: 'underline',
  },
  availabilityRow: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availabilityLabel: {
    fontSize: 16,
    color: '#C3C3C9',
  },
  commitmentCard: {
    marginTop: 10,
    marginHorizontal: 40,
    padding: 18,
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 14,
    backgroundColor: '#000000',
  },
  cardHeaderRow: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: '#C3C3C9',
  },
  commitmentBody: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#606068',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0B0B0C',
    fontSize: 18,
  },
  iconGlyph: {
    color: '#F7F7F8',
    fontSize: 18,
    lineHeight: 22,
  },
  commitmentContent: {
    flex: 1,
    gap: 4,
  },
  scheduleButton: {
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 7,
    paddingVertical: 11,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#F7F7F8',
    fontSize: 14,
  },
  commitmentTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: '#F7F7F8',
  },
  metaText: {
    fontSize: 14,
    lineHeight: 18,
  },
  metaStack: {
    marginTop: 6,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaGlyph: {
    fontSize: 12,
    color: '#4a4a4a',
  },
  metaRowText: {
    fontSize: 13,
    lineHeight: 18,
  },
  sectionHeaderRow: {
    marginTop: 38,
    marginBottom: 28,
    paddingHorizontal: 40,
  },
  searchBox: {
    marginHorizontal: 40,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 14,
    paddingVertical: 18,
    paddingHorizontal: 28,
    marginBottom: 24,
  },
  searchText: {
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 52,
    paddingLeft: 40,
    flexWrap: 'nowrap',
    overflow: 'hidden',
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#45454B',
    backgroundColor: '#000000',
  },
  filterChipActive: {
    backgroundColor: '#F4F4F5',
    borderColor: '#F4F4F5',
  },
  filterChipText: {
    fontSize: 13,
    color: '#F7F7F8',
  },
  filterChipTextActive: {
    color: '#111111',
  },
  nearbyHeader: {
    paddingHorizontal: 40,
    marginBottom: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  seeAllText: {
    color: '#F7F7F8',
    textDecorationLine: 'underline',
    fontSize: 16,
  },
  requestList: {
    gap: 12,
    paddingHorizontal: 40,
  },
  requestCard: {
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 14,
    backgroundColor: '#000000',
    padding: 28,
  },
  requestHeader: {
    flexDirection: 'row',
    gap: 12,
  },
  requestIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#45454B',
    backgroundColor: '#000000',
    fontSize: 18,
  },
  requestTextWrap: {
    flex: 1,
  },
  requestTitle: {
    fontSize: 18,
    lineHeight: 22,
    color: '#F7F7F8',
  },
  requestDescription: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
  },
  requestMetaList: {
    marginTop: 10,
    gap: 5,
  },
  primaryButton: {
    marginTop: 26,
    borderRadius: 7,
    paddingVertical: 16,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
  },
  impactSection: {
    marginTop: 38,
    paddingHorizontal: 40,
  },
  impactGrid: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metricCard: {
    flex: 1,
    minWidth: 110,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#45454B',
    backgroundColor: '#000000',
  },
  metricLabel: {
    fontSize: 12,
    lineHeight: 18,
    textTransform: 'none',
  },
  metricValue: {
    marginTop: 6,
    fontSize: 24,
    lineHeight: 30,
    color: '#F7F7F8',
  },
  activeTaskCard: {
    marginTop: 24,
    marginHorizontal: 40,
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 14,
    backgroundColor: '#000000',
    padding: 18,
  },
  activeTaskHeader: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  taskIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#606068',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  activeTaskSummary: {
    marginTop: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  secondaryButton: {
    marginTop: 14,
    borderRadius: 12,
    paddingVertical: 12,
    backgroundColor: '#F4F4F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#111111',
    fontSize: 16,
    lineHeight: 22,
  },
});
