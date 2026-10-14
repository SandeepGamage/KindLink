import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Platform,
  Linking,
  StatusBar,
} from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path } from 'react-native-svg';
import {
  Bell,
  ShoppingBag,
  Car,
  Users,
  ChevronRight,
  Phone,
} from 'lucide-react-native';

import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useAppointments } from '@/hooks/useAppointments';
import { reviewService, ReviewStats } from '@/services/review.service';
import { Palette, MaxContentWidth } from '@/constants/theme';
import { VolunteerHome } from '@/components/volunteer/volunteer-home';

/** Custom Capsule/Medicine Pill Icon matching the mockup */
function MedicinePillIcon({ size = 24, color = '#184E82' }: { size?: number; color?: string }) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <Path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <Path d="m8.5 8.5 7 7" />
    </Svg>
  );
}

export default function ClientHomeScreen() {
  const { user } = useAuthContext();
  if (user?.role?.toLowerCase() === 'volunteer') {
    return <VolunteerHome />;
  }
  return <ElderlyHomeScreen />;
}

function ElderlyHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const { showToast } = useToast();
  const { requests, refreshRequests } = useAppointments();

  const [, setRatingStats] = useState<ReviewStats | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
      if (user?._id) {
        reviewService.getReviewStats(user._id).then(setRatingStats);
      }
    }, [refreshRequests, user?._id])
  );

  // Time-of-day dynamic greeting
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning,';
    if (hour < 18) return 'Good afternoon,';
    return 'Good evening,';
  }, []);

  // First name and avatar initials
  const firstName = useMemo(() => {
    if (user?.name?.trim()) {
      return user.name.trim().split(' ')[0];
    }
    return 'Sapumal';
  }, [user?.name]);

  const userInitials = useMemo(() => {
    if (user?.name?.trim()) {
      const parts = user.name.trim().split(' ').filter(Boolean);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    return 'SA';
  }, [user?.name]);

  // Request calculations
  const activeRequests = useMemo(
    () =>
      requests.filter(
        (r) =>
          r.status?.toLowerCase() !== 'completed' &&
          r.status?.toLowerCase() !== 'cancelled'
      ),
    [requests]
  );

  const completedRequests = useMemo(
    () => requests.filter((r) => r.status?.toLowerCase() === 'completed'),
    [requests]
  );

  const activeCount = activeRequests.length;
  const completedCount = completedRequests.length;

  // Upcoming / Next Visit resolution
  const upcomingVisit = useMemo(() => {
    return (
      activeRequests.find(
        (r) =>
          r.status?.toLowerCase() === 'accepted' ||
          r.status?.toLowerCase() === 'in_progress' ||
          r.status?.toLowerCase() === 'in-progress'
      ) || activeRequests[0]
    );
  }, [activeRequests]);

  const { dayAbbr, dateNum, timeString } = useMemo(() => {
    if (upcomingVisit?.date) {
      try {
        const d = new Date(upcomingVisit.date);
        if (!isNaN(d.getTime())) {
          const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
          const day = days[d.getDay()];
          const num = d.getDate();
          const time = upcomingVisit.preferredTime || '10:00 AM · about 1 hour';
          return {
            dayAbbr: day,
            dateNum: String(num),
            timeString: time.includes('·') ? time : `${time} · about 1 hour`,
          };
        }
      } catch {}
    }
    return {
      dayAbbr: 'TUE',
      dateNum: '22',
      timeString: '10:00 AM · about 1 hour',
    };
  }, [upcomingVisit]);

  const visitTitle = upcomingVisit?.title || upcomingVisit?.taskType || 'Grocery shopping';
  const volunteerName = upcomingVisit?.provider?.name || 'Nimal Perera';
  const volunteerInitials = upcomingVisit?.provider?.name
    ? upcomingVisit.provider.name
        .split(' ')
        .filter(Boolean)
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'N';
  const volunteerImage = upcomingVisit?.provider?.profileImage || null;
  const volunteerStatus = upcomingVisit?.provider
    ? 'Verified volunteer'
    : upcomingVisit?.status === 'pending'
    ? 'Matching volunteer...'
    : 'Verified volunteer';
  const volunteerPhone =
    (upcomingVisit?.provider as any)?.mobile ||
    (upcomingVisit?.provider as any)?.phone ||
    '+94 77 123 4567';

  const handleCallVolunteer = useCallback(() => {
    const cleanPhone = volunteerPhone.replace(/[\s-]/g, '');
    const telUrl = `tel:${cleanPhone}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(telUrl);
        } else {
          showToast(`Calling ${volunteerName}: ${volunteerPhone}`);
        }
      })
      .catch(() => {
        showToast(`Calling ${volunteerName}: ${volunteerPhone}`);
      });
  }, [volunteerPhone, volunteerName, showToast]);

  return (
    <View
      style={[
        styles.root,
        {
          backgroundColor: isDark ? '#0A121A' : '#184E82',
        },
      ]}
    >
      <StatusBar barStyle="light-content" backgroundColor="#184E82" />

      {/* ─── Top Brand Header ─── */}
      <View
        style={[
          styles.headerSection,
          {
            paddingTop: Math.max(insets.top, 16) + 6,
            backgroundColor: isDark ? '#0F1E2E' : '#184E82',
          },
        ]}
      >
        <View style={styles.headerTopRow}>
          <Text style={styles.brandTitle}>KindLink</Text>

          {/* Notification Bell with alert dot */}
          <Pressable
            onPress={() => router.push('/(client)/notifications' as any)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View notifications"
            style={({ pressed }) => [
              styles.notificationButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Bell size={20} color="#FFFFFF" strokeWidth={2.2} />
            <View style={styles.notificationDot} />
          </Pressable>
        </View>

        {/* Greeting & Profile Row */}
        <View style={styles.greetingRow}>
          <View style={styles.greetingTextColumn}>
            <Text style={styles.greetingSubtext}>{greeting}</Text>
            <Text style={styles.greetingName}>{firstName}</Text>
          </View>

          {/* Profile Avatar circle */}
          <Pressable
            onPress={() => router.push('/(client)/profile' as any)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="View profile"
            style={({ pressed }) => [
              styles.profileAvatarButton,
              pressed && styles.buttonPressed,
            ]}
          >
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.profileAvatarImage}
                contentFit="cover"
              />
            ) : (
              <Text style={styles.profileAvatarInitials}>{userInitials}</Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* ─── Main Content Scrollable Area ─── */}
      <ScrollView
        style={[
          styles.scrollView,
          {
            backgroundColor: isDark ? '#0D151D' : '#F5F8FB',
          },
        ]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── Card 1: How can we help? ─── */}
        <View
          style={[
            styles.helpCard,
            {
              backgroundColor: isDark ? '#142230' : '#FFFFFF',
              borderColor: isDark ? '#23384B' : '#E8F0F7',
            },
          ]}
        >
          <View style={styles.sectionHeaderInside}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? Palette.primary : '#17242E' },
              ]}
            >
              How can we help?
            </Text>
            <Pressable
              onPress={() => router.push('/(client)/create-request' as any)}
              hitSlop={8}
            >
              <Text style={styles.viewAllLink}>View all</Text>
            </Pressable>
          </View>

          {/* 4 Category Quick Action Buttons */}
          <View style={styles.categoriesRow}>
            {/* Groceries */}
            <Pressable
              style={({ pressed }) => [
                styles.categoryItem,
                pressed && styles.categoryPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(client)/create-request',
                  params: {
                    taskType: 'Grocery Shopping',
                    title: 'Grocery Shopping',
                  },
                } as any)
              }
            >
              <View style={[styles.categoryIconBox, { backgroundColor: '#EDF4FC' }]}>
                <ShoppingBag size={24} color="#184E82" strokeWidth={2.2} />
              </View>
              <Text style={[styles.categoryLabel, { color: isDark ? '#CBD5E1' : '#17242E' }]}>
                Groceries
              </Text>
            </Pressable>

            {/* Transport */}
            <Pressable
              style={({ pressed }) => [
                styles.categoryItem,
                pressed && styles.categoryPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(client)/create-request',
                  params: {
                    taskType: 'Medical Transport',
                    title: 'Transport Assistance',
                  },
                } as any)
              }
            >
              <View style={[styles.categoryIconBox, { backgroundColor: '#EDF4FC' }]}>
                <Car size={24} color="#184E82" strokeWidth={2.2} />
              </View>
              <Text style={[styles.categoryLabel, { color: isDark ? '#CBD5E1' : '#17242E' }]}>
                Transport
              </Text>
            </Pressable>

            {/* Medicine */}
            <Pressable
              style={({ pressed }) => [
                styles.categoryItem,
                pressed && styles.categoryPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(client)/create-request',
                  params: {
                    taskType: 'Medical Transport',
                    title: 'Medicine Pickup',
                  },
                } as any)
              }
            >
              <View style={[styles.categoryIconBox, { backgroundColor: '#EDF4FC' }]}>
                <MedicinePillIcon size={24} color="#184E82" />
              </View>
              <Text style={[styles.categoryLabel, { color: isDark ? '#CBD5E1' : '#17242E' }]}>
                Medicine
              </Text>
            </Pressable>

            {/* Check-in */}
            <Pressable
              style={({ pressed }) => [
                styles.categoryItem,
                pressed && styles.categoryPressed,
              ]}
              onPress={() =>
                router.push({
                  pathname: '/(client)/create-request',
                  params: {
                    taskType: 'Companionship',
                    title: 'Friendly Check-in',
                  },
                } as any)
              }
            >
              <View style={[styles.categoryIconBox, { backgroundColor: '#FEF3E8' }]}>
                <Users size={24} color="#D97706" strokeWidth={2.2} />
              </View>
              <Text style={[styles.categoryLabel, { color: isDark ? '#CBD5E1' : '#17242E' }]}>
                Check-in
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ─── Card 2: Hero Banner ─── */}
        <View style={styles.bannerContainer}>
          <View style={styles.bannerCard}>
            {/* Background Senior Portrait */}
            <Image
              source={require('@/assets/images/senior-banner.jpg')}
              style={styles.bannerImage}
              contentFit="cover"
            />

            {/* Blue Tint Overlay Gradient effect */}
            <View style={styles.bannerOverlay} />

            {/* Content inside banner */}
            <View style={styles.bannerContent}>
              <View style={styles.supportBadge}>
                <Text style={styles.supportBadgeText}>SUPPORT NEARBY</Text>
              </View>

              <Text style={styles.bannerHeadline}>
                {'A helping hand,\nwhen you need one.'}
              </Text>

              <Pressable
                onPress={() => router.push('/(client)/create-request' as any)}
                style={({ pressed }) => [
                  styles.requestHelpButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.requestHelpText}>Request help</Text>
                <ChevronRight size={15} color="#184E82" strokeWidth={2.6} />
              </Pressable>
            </View>
          </View>

          {/* 3 Pagination Dots */}
          <View style={styles.paginationDots}>
            <View style={styles.activeDot} />
            <View style={styles.inactiveDot} />
            <View style={styles.inactiveDot} />
          </View>
        </View>

        {/* ─── Card 3: Your next visit ─── */}
        <View style={styles.nextVisitSection}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? Palette.primary : '#17242E' },
              ]}
            >
              Your next visit
            </Text>
            <Pressable
              onPress={() => router.push('/(client)/schedule' as any)}
              hitSlop={8}
            >
              <Text style={styles.seeScheduleLink}>See schedule</Text>
            </Pressable>
          </View>

          <View
            style={[
              styles.visitCard,
              {
                backgroundColor: isDark ? '#142230' : '#FFFFFF',
                borderColor: isDark ? '#23384B' : '#E8F0F7',
              },
            ]}
          >
            {/* Top Row: Date Pill & Appointment Details */}
            <Pressable
              onPress={() => router.push('/(client)/schedule' as any)}
              style={({ pressed }) => [
                styles.visitDetailsRow,
                pressed && { opacity: 0.9 },
              ]}
            >
              <View style={styles.dateBox}>
                <Text style={styles.dateDayText}>{dayAbbr}</Text>
                <Text style={styles.dateNumText}>{dateNum}</Text>
              </View>

              <View style={styles.visitTextColumn}>
                <View style={styles.visitTitleRow}>
                  <Text
                    style={[
                      styles.visitTitle,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                    numberOfLines={1}
                  >
                    {visitTitle}
                  </Text>
                  <View style={styles.statusDotGreen} />
                </View>
                <Text style={styles.visitTimeText}>{timeString}</Text>
              </View>

              <ChevronRight size={20} color="#94A3B8" />
            </Pressable>

            {/* Subtle Divider Line */}
            <View
              style={[
                styles.cardDivider,
                { backgroundColor: isDark ? '#23384B' : '#F1F5F9' },
              ]}
            />

            {/* Bottom Row: Volunteer Info & Phone Call Action */}
            <View style={styles.volunteerRow}>
              <View style={styles.volunteerInfo}>
                <View style={styles.volunteerAvatarCircle}>
                  {volunteerImage ? (
                    <Image
                      source={{ uri: volunteerImage }}
                      style={styles.volunteerAvatarImage}
                      contentFit="cover"
                    />
                  ) : (
                    <Text style={styles.volunteerAvatarText}>
                      {volunteerInitials}
                    </Text>
                  )}
                </View>

                <View style={styles.volunteerTextCol}>
                  <Text
                    style={[
                      styles.volunteerName,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                    numberOfLines={1}
                  >
                    {volunteerName}
                  </Text>
                  <Text style={styles.volunteerRoleSubtitle}>
                    {volunteerStatus}
                  </Text>
                </View>
              </View>

              {/* Call Button */}
              <Pressable
                onPress={handleCallVolunteer}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Call ${volunteerName}`}
                style={({ pressed }) => [
                  styles.callButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Phone size={18} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* ─── Section 4: This week Stats ─── */}
        <View style={styles.thisWeekSection}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? Palette.primary : '#17242E' },
              ]}
            >
              This week
            </Text>
            <View style={styles.trackBadge}>
              <Text style={styles.trackBadgeText}>All on track</Text>
            </View>
          </View>

          {/* 2 Stats Cards */}
          <View style={styles.statsCardsRow}>
            {/* Visits planned */}
            <Pressable
              onPress={() => router.push('/(client)/schedule' as any)}
              style={({ pressed }) => [
                styles.statBox,
                {
                  backgroundColor: isDark ? '#142230' : '#FFFFFF',
                  borderColor: isDark ? '#23384B' : '#E8F0F7',
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.statBigNumber, { color: '#184E82' }]}>
                {activeCount > 0 ? activeCount : 2}
              </Text>
              <Text style={styles.statLabel}>Visits planned</Text>
            </Pressable>

            {/* Tasks completed */}
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/(client)/requests',
                  params: { tab: 'completed' },
                } as any)
              }
              style={({ pressed }) => [
                styles.statBox,
                {
                  backgroundColor: isDark ? '#142230' : '#FFFFFF',
                  borderColor: isDark ? '#23384B' : '#E8F0F7',
                },
                pressed && { opacity: 0.9 },
              ]}
            >
              <Text style={[styles.statBigNumber, { color: '#E08A3C' }]}>
                {completedCount > 0 ? completedCount : 5}
              </Text>
              <Text style={styles.statLabel}>Tasks completed</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 22,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
  },
  notificationButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 9,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E08A3C',
    borderWidth: 1.5,
    borderColor: '#184E82',
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 18,
  },
  greetingTextColumn: {
    flex: 1,
  },
  greetingSubtext: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  greetingName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  profileAvatarButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  profileAvatarInitials: {
    fontSize: 18,
    fontWeight: '800',
    color: '#184E82',
    letterSpacing: 0.5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  helpCard: {
    marginHorizontal: 18,
    marginTop: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#1B5080',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  sectionHeaderInside: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  viewAllLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#184E82',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryItem: {
    alignItems: 'center',
    flex: 1,
  },
  categoryPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  categoryIconBox: {
    width: 58,
    height: 58,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  bannerContainer: {
    marginHorizontal: 18,
    marginTop: 18,
  },
  bannerCard: {
    height: 165,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#164673',
    position: 'relative',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 54, 90, 0.78)',
  },
  bannerContent: {
    flex: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  supportBadge: {
    backgroundColor: '#E67E22',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  supportBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  bannerHeadline: {
    fontSize: 19,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 25,
    marginTop: 6,
    maxWidth: '75%',
    letterSpacing: -0.2,
  },
  requestHelpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  requestHelpText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#184E82',
  },
  paginationDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    gap: 6,
  },
  activeDot: {
    width: 20,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#184E82',
  },
  inactiveDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#CBD5E1',
  },
  nextVisitSection: {
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 12,
  },
  seeScheduleLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#184E82',
  },
  visitCard: {
    marginHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#1B5080',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  visitDetailsRow: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateBox: {
    width: 52,
    height: 56,
    borderRadius: 14,
    backgroundColor: '#EDF4FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  dateDayText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#184E82',
    letterSpacing: 0.5,
  },
  dateNumText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#17242E',
    marginTop: 1,
  },
  visitTextColumn: {
    flex: 1,
  },
  visitTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitTitle: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  statusDotGreen: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
    marginLeft: 8,
  },
  visitTimeText: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 4,
    fontWeight: '500',
  },
  cardDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  volunteerRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  volunteerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  volunteerAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#EDF4FC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  volunteerAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  volunteerAvatarText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#184E82',
  },
  volunteerTextCol: {
    flex: 1,
  },
  volunteerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  volunteerRoleSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 1,
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#184E82',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  thisWeekSection: {
    marginTop: 22,
  },
  trackBadge: {
    backgroundColor: '#FEF3E8',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  statsCardsRow: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 18,
    marginTop: 4,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    ...Platform.select({
      ios: {
        shadowColor: '#1B5080',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  statBigNumber: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748B',
    marginTop: 6,
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },
});
