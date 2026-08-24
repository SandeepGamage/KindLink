import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import {
  RoleElderlyIcon,
  RoleVolunteerIcon,
  KindLinkLogo,
} from '@/components/ui/onboarding-icons';

export default function ClientHomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';
  const roleTitle = isElderly ? 'Senior Member' : 'Volunteer Partner';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Header Card */}
        <View
          style={[
            styles.headerCard,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
              borderWidth: 1,
            },
          ]}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingRow}>
              <Text
                style={[
                  styles.greetingText,
                  { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                ]}>
                Welcome back,
              </Text>
            </View>
            <Text
              style={[
                styles.nameText,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              {user?.name || (isElderly ? 'KindLink Senior' : 'KindLink Volunteer')}
            </Text>

            {/* Role Badge */}
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isDark ? 'rgba(31, 92, 150, 0.3)' : Palette.blueTint,
                  borderColor: isDark ? Palette.secondary : Palette.border,
                },
              ]}>
              {isElderly ? (
                <RoleElderlyIcon size={14} color={isDark ? '#60A5FA' : Palette.secondary} />
              ) : (
                <RoleVolunteerIcon size={14} color={isDark ? '#60A5FA' : Palette.secondary} />
              )}
              <Text
                style={[
                  styles.roleBadgeText,
                  {
                    color: isDark ? '#60A5FA' : Palette.secondary,
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
            {
              backgroundColor: isElderly ? Palette.secondary : Palette.ink,
            },
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
            onPress={() => router.push('/requests' as any)}
            style={({ pressed }) => [
              styles.heroButton,
              {
                backgroundColor: isElderly ? Palette.primary : Palette.secondary,
                opacity: pressed ? 0.88 : 1,
              },
            ]}>
            <Text
              style={[
                styles.heroButtonText,
                { color: isElderly ? Palette.secondary : Palette.primary },
              ]}>
              {isElderly ? '+ Request Assistance' : 'View Open Requests'}
            </Text>
          </Pressable>
        </View>

        {/* Quick Stats / Highlights */}
        <View style={styles.statsRow}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
                borderWidth: 1,
              },
            ]}>
            <Text style={[styles.statNumber, { color: Palette.secondary }]}>
              {isElderly ? '2' : '14'}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              {isElderly ? 'Active Requests' : 'Requests Helped'}
            </Text>
          </View>

          <View
            style={[
              styles.statCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
                borderWidth: 1,
              },
            ]}>
            <Text style={[styles.statNumber, { color: Palette.accent }]}>
              {isElderly ? '100%' : '4.9 ★'}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              {isElderly ? 'Verified Safety' : 'Community Rating'}
            </Text>
          </View>
        </View>

        {/* Recent Updates */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            Recent Activity
          </Text>
        </View>

        <View
          style={[
            styles.activityCard,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
              borderWidth: 1,
            },
          ]}>
          <View style={[styles.activityDot, { backgroundColor: Palette.accent }]} />
          <View style={styles.activityBody}>
            <Text
              style={[
                styles.activityTitle,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              {isElderly
                ? 'Grocery delivery scheduled with Volunteer Alex'
                : 'New request matched in your neighborhood'}
            </Text>
            <Text
              style={[
                styles.activityTime,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              Today at 2:30 PM
            </Text>
          </View>
        </View>
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
    borderRadius: 24,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
    letterSpacing: -0.5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  heroCard: {
    padding: 24,
    borderRadius: 24,
    marginTop: 16,
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  heroSubtitle: {
    color: '#E0E7FF',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  heroButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 18,
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
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    padding: 18,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  statNumber: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.secondary,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 18,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 18,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 3,
  },
});
