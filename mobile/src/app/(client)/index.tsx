import React from 'react';
import { StyleSheet, View, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: BottomTabInset + Spacing.six },
          ]}
          showsVerticalScrollIndicator={false}>
          {/* Header Banner */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <SymbolView
                tintColor="#0066CC"
                name="heart.fill"
                size={28}
              />
            </View>
            <ThemedText type="title" style={styles.appTitle}>
              KindLink
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.appSubTitle}>
              Elderly Companionship & Micro-Volunteering Platform
            </ThemedText>
          </View>

          {/* Group Info Banner */}
          <ThemedView type="backgroundElement" style={styles.infoCard}>
            <ThemedText type="smallBold" style={styles.groupBadge}>
              Group_033 | HyperStack
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              SDG 3: Good Health & Well-Being | SDG 10: Reduced Inequalities
            </ThemedText>
          </ThemedView>

          {/* Member Modules Grid */}
          <ThemedText type="subtitle" style={styles.sectionHeader}>
            Project Modules by Team Members
          </ThemedText>

          <View style={styles.grid}>
            {/* Member 1 */}
            <Pressable
              style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed]}
              onPress={() => router.push('/profile')}>
              <ThemedText type="smallBold" style={styles.memberNumber}>
                Member 1 (IT23672932)
              </ThemedText>
              <ThemedText type="smallBold">Authentication & Ratings</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                User profile, login & rating feedback system.
              </ThemedText>
            </Pressable>

            {/* Member 2 */}
            <Pressable
              style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed]}
              onPress={() => router.push('/requests')}>
              <ThemedText type="smallBold" style={styles.memberNumber}>
                Member 2 (IT23610620)
              </ThemedText>
              <ThemedText type="smallBold">Assistance Requests</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Elderly assistance request & volunteer management.
              </ThemedText>
            </Pressable>

            {/* Member 3 */}
            <Pressable
              style={({ pressed }) => [styles.moduleCard, pressed && styles.pressed]}
              onPress={() => router.push('/schedule')}>
              <ThemedText type="smallBold" style={styles.memberNumber}>
                Member 3 (IT23594586)
              </ThemedText>
              <ThemedText type="smallBold">Scheduling & Matching</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Appointment booking & location volunteer matching.
              </ThemedText>
            </Pressable>

            {/* Member 4 - Notifications */}
            <Pressable
              style={({ pressed }) => [
                styles.moduleCard,
                styles.highlightCard,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/notifications')}>
              <ThemedText type="smallBold" style={styles.activeTag}>
                Member 4 (You - IT23538214)
              </ThemedText>
              <ThemedText type="smallBold">Notifications (Wireframe 1)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Communication & notification center.
              </ThemedText>
            </Pressable>

            {/* Member 4 - Admin Dashboard (Web) */}
            <Pressable
              style={({ pressed }) => [
                styles.moduleCard,
                styles.highlightCard,
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/admin')}>
              <ThemedText type="smallBold" style={styles.activeTag}>
                Member 4 (Web Portal)
              </ThemedText>
              <ThemedText type="smallBold">Admin Dashboard (Wireframe 2)</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                System management & pending approvals.
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.three,
    gap: Spacing.one,
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E6F0FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  appSubTitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  infoCard: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
    alignItems: 'center',
  },
  groupBadge: {
    color: '#0066CC',
  },
  sectionHeader: {
    marginTop: Spacing.two,
    fontSize: 18,
    fontWeight: '600',
  },
  grid: {
    gap: Spacing.three,
  },
  moduleCard: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    gap: Spacing.one,
  },
  highlightCard: {
    borderColor: '#0066CC',
    borderWidth: 1.5,
    backgroundColor: '#F7FAFC',
  },
  memberNumber: {
    color: '#666666',
    fontSize: 12,
  },
  activeTag: {
    color: '#0066CC',
    fontSize: 12,
  },
  pressed: {
    opacity: 0.8,
  },
});
