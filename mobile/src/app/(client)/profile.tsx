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
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
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
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
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
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
            },
          ]}>
          <View style={[styles.avatar, { backgroundColor: Palette.secondary }]}>
            <Text style={styles.avatarText}>
              {(user?.name || (isElderly ? 'S' : 'V')).charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text
            style={[
              styles.userName,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            {user?.name || (isElderly ? 'Senior Member' : 'Volunteer')}
          </Text>

          <Text
            style={[
              styles.userEmail,
              { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
            ]}>
            {user?.email || 'member@kindlink.org'}
          </Text>

          {/* Role Pill */}
          <View
            style={[
              styles.rolePill,
              {
                backgroundColor: isDark ? 'rgba(31, 92, 150, 0.3)' : Palette.blueTint,
              },
            ]}>
            {isElderly ? (
              <RoleElderlyIcon size={16} color={isDark ? '#60A5FA' : Palette.secondary} />
            ) : (
              <RoleVolunteerIcon size={16} color={isDark ? '#60A5FA' : Palette.secondary} />
            )}
            <Text
              style={[
                styles.rolePillText,
                {
                  color: isDark ? '#60A5FA' : Palette.secondary,
                },
              ]}>
              {isElderly ? 'Senior Care Member' : 'Community Volunteer'}
            </Text>
          </View>
          {/* Edit Profile Quick Button */}
          <Pressable
            onPress={() => router.push('/(client)/edit-profile' as any)}
            style={({ pressed }) => [
              styles.editProfileBtn,
              {
                backgroundColor: isDark ? '#1C3247' : Palette.blueTint,
                borderColor: isDark ? '#2B4A6A' : '#BFDBFE',
                opacity: pressed ? 0.8 : 1,
              },
            ]}>
            <Text style={styles.editProfileBtnIcon}>✏️</Text>
            <Text
              style={[
                styles.editProfileBtnText,
                { color: isDark ? '#93C5FD' : Palette.secondary },
              ]}>
              Edit Profile & Care Notes
            </Text>
          </Pressable>
        </View>

        {/* Personal & Care Details Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            Personal & Care Information
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            {/* Edit Full Profile Row */}
            <Pressable
              onPress={() => router.push('/(client)/edit-profile' as any)}
              style={({ pressed }) => [
                styles.menuRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={styles.menuIcon}>👤</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  Personal Information
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                  ]}>
                  {user?.name || 'Set Name'} {user?.age ? `• ${user.age} yrs` : ''} {user?.mobile ? `• ${user.mobile}` : ''}
                </Text>
              </View>
              <Text style={[styles.menuChevron, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                ›
              </Text>
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

            {/* Care / Health Notes Row */}
            <Pressable
              onPress={() => router.push('/(client)/edit-profile' as any)}
              style={({ pressed }) => [
                styles.menuRow,
                { opacity: pressed ? 0.7 : 1 },
              ]}>
              <Text style={styles.menuIcon}>📋</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  {isElderly ? 'Care & Health Notes' : 'Volunteer Skills & Bio'}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                  ]}>
                  {user?.careNotes || user?.bio || (isElderly ? 'Add allergies, routines or assistance notes' : 'Add your skills and volunteer bio')}
                </Text>
              </View>
              <Text style={[styles.menuChevron, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                ›
              </Text>
            </Pressable>

            {isElderly && (
              <>
                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

                {/* Emergency Contact Row */}
                <Pressable
                  onPress={() => router.push('/(client)/edit-profile' as any)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Text style={styles.menuIcon}>📞</Text>
                  <View style={styles.menuTextCol}>
                    <Text
                      style={[
                        styles.menuTitle,
                        { color: isDark ? Palette.primary : Palette.ink },
                      ]}>
                      Primary Emergency Contact
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.menuSub,
                        { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                      ]}>
                      {user?.emergencyContactName && user?.emergencyContactNumber
                        ? `${user.emergencyContactName} • ${user.emergencyContactNumber}`
                        : user?.emergencyContactName ||
                          user?.emergencyContactNumber ||
                          user?.emergencyContact ||
                          'Tap to configure emergency contact'}
                    </Text>
                  </View>
                  <Text style={[styles.menuChevron, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                    ›
                  </Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Account Details Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            Account & Safety
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>🛡️</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  Identity Verification
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                  ]}>
                  Status: Verified & Protected
                </Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>🔒</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  Registered Email
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                  ]}>
                  {user?.email || 'member@kindlink.org'} (Protected)
                </Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

            <View style={styles.menuRow}>
              <Text style={styles.menuIcon}>🔔</Text>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  Notification Preferences
                </Text>
                <Text
                  style={[
                    styles.menuSub,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
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
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: 18,
    width: '100%',
    gap: 8,
  },
  editProfileBtnIcon: {
    fontSize: 16,
  },
  editProfileBtnText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.1,
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
  menuChevron: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
  },
  menuDivider: {
    height: 1,
    marginVertical: 4,
  },
  logoutBtn: {
    backgroundColor: FunctionalColors.dangerBg,
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: FunctionalColors.dangerText,
    fontSize: 15,
    fontWeight: '800',
  },
});

