import React, { useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  Switch,
} from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Avatar } from '@/components/ui/avatar';
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useFontSize } from '@/context/font-size-context';
import { ActionModal } from '@/components/ui/action-modal';
import { AaIcon } from '@/components/accessibility/text-resize-overlay';
import Ionicons from '@expo/vector-icons/Ionicons';
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
  const { showToast } = useToast();
  const { fontSizeMode, setFontSizeMode, resetToNormal, scaleFont, isScaled } = useFontSize();

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const handleLogout = () => {
    setLogoutModalVisible(true);
  };

  const confirmLogout = async () => {
    setLogoutModalVisible(false);
    try {
      await logout();
      router.replace('/(auth)/welcome' as any);
    } catch {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
          paddingTop: insets.top,
        },
      }),
    [isDark, insets.top]
  );

  return (
    <View style={[styles.container, dynamicStyles.root]}>
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
          <Pressable
            onPress={() => router.push('/(client)/edit-profile' as any)}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={({ pressed }) => [
              pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
            ]}>
            <Avatar name={user?.name} uri={user?.profileImage} size={96} />
          </Pressable>

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
        </View>

        {/* Personal & Care Details Section */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            {isElderly
              ? 'Personal & Care Information'
              : 'Personal & Volunteer Information'}
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            {/* Personal Information Row */}
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

            {isElderly && (
              <>
                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

                {/* Care Preferences & Needs Row */}
                <Pressable
                  onPress={() => router.push('/(client)/care-preferences' as any)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Text style={styles.menuIcon}>🤲</Text>
                  <View style={styles.menuTextCol}>
                    <Text
                      style={[
                        styles.menuTitle,
                        { color: isDark ? Palette.primary : Palette.ink },
                      ]}>
                      Care Preferences & Needs
                    </Text>
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.menuSub,
                        { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                      ]}>
                      {user?.careNeeds && user.careNeeds.length > 0
                        ? user.careNeeds.join(' • ')
                        : 'Tap to specify your mobility & daily care needs'}
                    </Text>
                  </View>
                  <Text style={[styles.menuChevron, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                    ›
                  </Text>
                </Pressable>
              </>
            )}

            {!isElderly && (
              <>
                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

                {/* Volunteer Skills & Experience Row */}
                <Pressable
                  onPress={() => router.push('/(client)/volunteer-skills' as any)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Text style={styles.menuIcon}>🤝</Text>
                  <View style={styles.menuTextCol}>
                    <Text
                      style={[
                        styles.menuTitle,
                        { color: isDark ? Palette.primary : Palette.ink },
                      ]}>
                      Skills & Experience
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.menuSub,
                        { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                      ]}>
                      {user?.careNeeds && user.careNeeds.length > 0
                        ? user.careNeeds.join(' • ')
                        : user?.bio || 'Tap to configure helper skills, tasks & bio'}
                    </Text>
                  </View>
                  <Text style={[styles.menuChevron, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                    ›
                  </Text>
                </Pressable>

                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

                {/* Volunteer Availability & Schedule Row */}
                <Pressable
                  onPress={() => router.push('/(client)/volunteer-availability' as any)}
                  style={({ pressed }) => [
                    styles.menuRow,
                    { opacity: pressed ? 0.7 : 1 },
                  ]}>
                  <Text style={styles.menuIcon}>⏰</Text>
                  <View style={styles.menuTextCol}>
                    <Text
                      style={[
                        styles.menuTitle,
                        { color: isDark ? Palette.primary : Palette.ink },
                      ]}>
                      Availability & Schedule
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.menuSub,
                        { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                      ]}>
                      {user?.availability && user.availability.length > 0
                        ? user.availability.join(' • ')
                        : 'Tap to configure available days & times'}
                    </Text>
                  </View>
                  <Text style={[styles.menuChevron, { color: isDark ? '#60A5FA' : Palette.secondary }]}>
                    ›
                  </Text>
                </Pressable>
              </>
            )}

            {isElderly && (
              <>
                <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : Palette.border }]} />

                {/* Emergency Contact Row */}
                <Pressable
                  onPress={() => router.push('/(client)/emergency-contact' as any)}
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

        {/* Accessibility & Font Size Section */}
        {isElderly && (
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              👓 Text Size & Readability
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
                <View
                  style={[
                    styles.aaIconBox,
                    { backgroundColor: isDark ? '#1C3247' : Palette.blueTint },
                  ]}>
                  <AaIcon color={isDark ? '#60A5FA' : Palette.secondary} size={19} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text
                    style={[
                      styles.menuTitle,
                      { color: isDark ? Palette.primary : Palette.ink },
                    ]}>
                    Enlarge Text (+20%)
                  </Text>
                  <Text
                    style={[
                      styles.menuSub,
                      { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                    ]}>
                    {fontSizeMode === 'large'
                      ? 'Large text size (+20%) active\nacross all screens'
                      : 'Standard text size (100%)'}
                  </Text>
                </View>
                <Switch
                  value={fontSizeMode === 'large'}
                  onValueChange={async (value) => {
                    await setFontSizeMode(value ? 'large' : 'normal');
                    showToast(
                      value ? 'Text enlarged (+20%)' : 'Text reset to normal size',
                      { type: 'info' }
                    );
                  }}
                  trackColor={{
                    false: isDark ? '#334155' : '#CBD5E1',
                    true: Palette.secondary,
                  }}
                  thumbColor="#FFFFFF"
                />
              </View>
            </View>
          </View>
        )}

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

      <ActionModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Log Out"
        subtitle="Are you sure you want to log out of your account?"
        icon={<Ionicons name="log-out-outline" size={32} color={FunctionalColors.danger} />}
        iconContainerStyle={{ backgroundColor: FunctionalColors.dangerBg }}
        confirmText="Log Out"
      />
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
  menuTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  sectionPill: {
    backgroundColor: Palette.blueTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectionPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: Palette.secondary,
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
  aaIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
});

