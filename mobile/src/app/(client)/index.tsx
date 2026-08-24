import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  useColorScheme,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuthContext } from '@/context/auth-context';
import { useAppointments } from '@/hooks/useAppointments';
import { MaxContentWidth } from '@/constants/theme';
import {
  RoleElderlyIcon,
  RoleVolunteerIcon,
  KindLinkLogo,
} from '@/components/ui/onboarding-icons';

const Palette = {
  primary: '#FFFFFF',
  surface: '#F4F7FA',
  border: '#DCE6EF',
  blueTint: '#E3EEF9',
  secondary: '#1F5C96',
  ink: '#17242E',
  accent: '#E08A3C',
};

export default function ClientHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const { requests, loading, refreshRequests } = useAppointments();

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRequests();
    setRefreshing(false);
  };

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';
  const roleTitle = isElderly ? 'Senior Member' : 'Volunteer Partner';

  const activeRequests = requests.filter(
    (r) => r.status?.toLowerCase() !== 'completed' && r.status?.toLowerCase() !== 'cancelled'
  );

  const latestRequest = requests && requests.length > 0 ? requests[0] : null;

  const currentBg = isDark ? '#0D151C' : Palette.surface;
  const currentCard = isDark ? '#141E28' : Palette.primary;
  const currentBorder = isDark ? '#233240' : Palette.border;
  const currentInk = isDark ? '#FFFFFF' : Palette.ink;
  const currentSubtext = isDark ? '#94A3B8' : '#5A6E7F';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentBg,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Palette.secondary]}
          />
        }>
        {/* Top Header Card */}
        <View
          style={[
            styles.headerCard,
            { backgroundColor: currentCard, borderColor: currentBorder },
          ]}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingRow}>
              <Text style={[styles.greetingText, { color: currentSubtext }]}>
                Welcome back,
              </Text>
            </View>
            <Text style={[styles.nameText, { color: currentInk }]}>
              {user?.name || (isElderly ? 'KindLink Senior' : 'KindLink Volunteer')}
            </Text>

            {/* Role Badge */}
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isElderly
                    ? isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3'
                    : isDark ? 'rgba(31, 92, 150, 0.2)' : Palette.blueTint,
                  borderColor: isElderly ? '#F472B6' : Palette.secondary,
                },
              ]}>
              {isElderly ? (
                <RoleElderlyIcon size={14} color={isDark ? '#F472B6' : '#DB2777'} />
              ) : (
                <RoleVolunteerIcon size={14} color={isDark ? '#60A5FA' : Palette.secondary} />
              )}
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color: isElderly
                      ? isDark ? '#F472B6' : '#DB2777'
                      : isDark ? '#60A5FA' : Palette.secondary,
                  },
                ]}>
                {roleTitle}
              </Text>
            </View>
          </View>

          <View style={styles.headerRight}>
            <KindLinkLogo size={46} />
          </View>
        </View>

        {/* Quick Action Hero Card */}
        <View
          style={[
            styles.heroCard,
            { backgroundColor: Palette.secondary },
          ]}>
          <Text style={styles.heroTitle}>
            {isElderly ? 'Need a helping hand today?' : 'Ready to help your community?'}
          </Text>
          <Text style={styles.heroSubtitle}>
            {isElderly
              ? 'Connect with trusted local volunteers for grocery shopping, transport, or friendly check-ins.'
              : 'Browse nearby elderly requests and offer support where it matters most.'}
          </Text>

          <Pressable
            onPress={() => router.push(isElderly ? '/create-request' as any : '/requests' as any)}
            style={({ pressed }) => [
              styles.heroButton,
              {
                backgroundColor: Palette.primary,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <Text style={[styles.heroButtonText, { color: Palette.secondary }]}>
              {isElderly ? '+ Request Assistance' : 'View Open Requests'}
            </Text>
          </Pressable>
        </View>

        {/* Quick Stats / Highlights Connected to Live Data */}
        <View style={styles.statsRow}>
          <TouchableOpacity
            style={[
              styles.statCard,
              { backgroundColor: currentCard, borderColor: currentBorder },
            ]}
            onPress={() => router.push('/requests' as any)}
            activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator size="small" color={Palette.secondary} />
            ) : (
              <Text style={[styles.statNumber, { color: Palette.secondary }]}>
                {activeRequests.length}
              </Text>
            )}
            <Text style={[styles.statLabel, { color: currentSubtext }]}>
              Active Requests
            </Text>
          </TouchableOpacity>

          <View
            style={[
              styles.statCard,
              { backgroundColor: currentCard, borderColor: currentBorder },
            ]}>
            <Text style={[styles.statNumber, { color: '#10B981' }]}>
              100%
            </Text>
            <Text style={[styles.statLabel, { color: currentSubtext }]}>
              Verified Safety
            </Text>
          </View>
        </View>

        {/* Recent Updates - Live Connected */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: currentInk }]}>
            Recent Activity
          </Text>
          {latestRequest && (
            <TouchableOpacity onPress={() => router.push('/requests' as any)}>
              <Text style={[styles.seeAllText, { color: Palette.secondary }]}>View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {latestRequest ? (
          <TouchableOpacity
            style={[
              styles.activityCard,
              { backgroundColor: currentCard, borderColor: currentBorder },
            ]}
            onPress={() => router.push('/requests' as any)}
            activeOpacity={0.8}>
            <View
              style={[
                styles.activityDot,
                {
                  backgroundColor:
                    latestRequest.status?.toLowerCase() === 'completed'
                      ? '#10B981'
                      : latestRequest.status?.toLowerCase() === 'in progress'
                      ? Palette.secondary
                      : Palette.accent,
                },
              ]}
            />
            <View style={styles.activityBody}>
              <Text style={[styles.activityTitle, { color: currentInk }]} numberOfLines={1}>
                {latestRequest.title}
              </Text>
              <Text style={[styles.activityTime, { color: currentSubtext }]}>
                {latestRequest.preferredTime ||
                  (latestRequest.date ? new Date(latestRequest.date).toLocaleDateString() : 'Scheduled')}
                {latestRequest.location ? ` • ${latestRequest.location}` : ''}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={currentSubtext} />
          </TouchableOpacity>
        ) : (
          <View
            style={[
              styles.emptyActivityCard,
              { backgroundColor: currentCard, borderColor: currentBorder },
            ]}>
            <Ionicons name="calendar-outline" size={24} color={Palette.secondary} style={{ marginBottom: 6 }} />
            <Text style={[styles.emptyActivityText, { color: currentSubtext }]}>
              No recent requests yet.
            </Text>
            <TouchableOpacity
              onPress={() => router.push('/create-request' as any)}
              style={styles.emptyCreateLink}>
              <Text style={[styles.emptyCreateText, { color: Palette.secondary }]}>
                Create your first request →
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  greetingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  headerRight: {
    marginLeft: 12,
  },
  heroCard: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 16,
    shadowColor: '#1F5C96',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#E3EEF9',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroButton: {
    borderRadius: 25,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '700',
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyActivityCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyCreateLink: {
    marginTop: 6,
  },
  emptyCreateText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
