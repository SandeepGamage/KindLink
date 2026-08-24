import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { OnboardingColors, MaxContentWidth } from '@/constants/theme';
import {
  RoleElderlyIcon,
  RoleVolunteerIcon,
} from '@/components/ui/onboarding-icons';

export default function ClientProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, logout } = useAuthContext();

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/(auth)/welcome' as any);
    } catch {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#090D16' : '#F0F6FE',
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? '#131D31' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {(user?.name || (isElderly ? 'S' : 'V')).charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.userName,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}>
            {user?.name || (isElderly ? 'Senior Member' : 'Volunteer')}
          </Text>

          <Text
            style={[
              styles.userEmail,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            {user?.email || 'member@kindlink.org'}
          </Text>

          {/* Role Pill */}
          <View
            style={[
              styles.rolePill,
              {
                backgroundColor: isElderly
                  ? isDark ? 'rgba(236, 72, 153, 0.2)' : '#FCE7F3'
                  : isDark ? 'rgba(59, 130, 246, 0.2)' : '#EFF6FF',
              },
            ]}>
            {isElderly ? (
              <RoleElderlyIcon size={16} color={isDark ? '#F472B6' : '#DB2777'} />
            ) : (
              <RoleVolunteerIcon size={16} color={isDark ? '#60A5FA' : '#2563EB'} />
            )}
            <Text
              style={[
                styles.rolePillText,
                {
                  color: isElderly
                    ? isDark ? '#F472B6' : '#DB2777'
                    : isDark ? '#60A5FA' : '#2563EB',
                },
              ]}>
              {isElderly ? 'Senior Care Member' : 'Community Volunteer'}
            </Text>
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}>
            Account & Safety
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                borderColor: isDark ? '#1E293B' : '#E2E8F0',
              },
            ]}>
            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Identity Verification
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Status: Verified & Protected
                </Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>📞</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Emergency Contact
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Configured & Active
                </Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]} />

            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>🔔</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? '#FFFFFF' : '#0F172A' },
                  ]}>
                  Notification Preferences
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  Push, SMS & In-app alerts
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { opacity: pressed ? 0.8 : 1 },
          ]}>
          <Text style={styles.logoutBtnText}>Log Out</Text>
        </Pressable>
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
  profileCard: {
    alignItems: 'center',
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: OnboardingColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    marginTop: 14,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  menuCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  menuIcon: {
    fontSize: 22,
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  menuSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '800',
  },
});
