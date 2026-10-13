import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  Alert,
  Switch,
  Platform,
  Linking,
  StatusBar,
} from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import Svg, { Path, Circle } from 'react-native-svg';
import {
  Heart,
  Phone,
  Clock,
  HeartHandshake,
  ChevronRight,
  Bell,
  Check,
  ShieldCheck,
} from 'lucide-react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { useFontSize } from '@/context/font-size-context';
import { ActionModal } from '@/components/ui/action-modal';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';

/** User Profile Outline Icon matching the mockup */
function UserProfileIcon({ size = 20, color = '#184E82' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <Path
        d="M4 21v-2a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v2"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/** Registered Email Message Square Icon matching the mockup */
function MessageSquareIcon({ size = 20, color = '#184E82' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function ClientProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, logout } = useAuthContext();
  const { showToast } = useToast();
  const { fontSizeMode, setFontSizeMode } = useFontSize();

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  // Name and initials
  const fullName = user?.name || (isElderly ? 'Sapumal Arachchi' : 'Kasun Perera');
  const email = user?.email || 's123@gmail.com';

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

  const roleTitle = isElderly ? 'Senior Care Member' : 'Verified Volunteer';

  // Emergency contact details for elderly
  const emergencyContactName = user?.emergencyContactName || 'Sudesh Arachchi';
  const emergencyContactRelation = user?.emergencyContact || 'Son';
  const emergencyContactNumber = user?.emergencyContactNumber || '076 547 8234';

  const handleCallEmergency = useCallback(() => {
    const cleanPhone = emergencyContactNumber.replace(/[\s-]/g, '');
    const telUrl = `tel:${cleanPhone}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          Linking.openURL(telUrl);
        } else {
          showToast(`Contact ${emergencyContactName}: ${emergencyContactNumber}`);
        }
      })
      .catch(() => {
        showToast(`Contact ${emergencyContactName}: ${emergencyContactNumber}`);
      });
  }, [emergencyContactNumber, emergencyContactName, showToast]);

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
            paddingTop: Math.max(insets.top, 16) + 4,
            backgroundColor: isDark ? '#0F1E2E' : '#184E82',
          },
        ]}
      >
        <Text style={styles.headerTitle}>Profile</Text>
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
        {/* ─── Top Blue Backdrop Banner ─── */}
        <View
          style={[
            styles.topBlueBackdrop,
            {
              backgroundColor: isDark ? '#0F1E2E' : '#184E82',
            },
          ]}
        />

        {/* ─── Main Profile Card ─── */}
        <View
          style={[
            styles.profileCard,
            {
              backgroundColor: isDark ? '#142230' : '#FFFFFF',
              borderColor: isDark ? '#23384B' : '#E8F0F7',
            },
          ]}
        >
          {/* Avatar & User Details Row */}
          <View style={styles.profileHeaderRow}>
            {/* Avatar Circle with Verified Checkmark Badge */}
            <View style={styles.avatarWrapper}>
              <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#1E344B' : '#EDF4FC' }]}>
                {user?.profileImage ? (
                  <Image
                    source={{ uri: user.profileImage }}
                    style={styles.avatarImage}
                    contentFit="cover"
                  />
                ) : (
                  <Text style={styles.avatarInitialsText}>{userInitials}</Text>
                )}
              </View>

              {/* Green Verified Badge */}
              <View style={styles.verifiedBadge}>
                <Check size={12} color="#FFFFFF" strokeWidth={3} />
              </View>
            </View>

            {/* Name, Email, Role Tag */}
            <View style={styles.userInfoCol}>
              <Text
                style={[
                  styles.userName,
                  { color: isDark ? Palette.primary : '#17242E' },
                ]}
                numberOfLines={1}
              >
                {fullName}
              </Text>

              <Text style={styles.userEmail} numberOfLines={1}>
                {email}
              </Text>

              {/* Role Pill Badge */}
              <View
                style={[
                  styles.roleBadge,
                  { backgroundColor: isDark ? '#1C3247' : '#EDF4FC' },
                ]}
              >
                {isElderly ? (
                  <Heart size={13} color="#184E82" strokeWidth={2.4} />
                ) : (
                  <ShieldCheck size={13} color="#184E82" strokeWidth={2.4} />
                )}
                <Text style={styles.roleBadgeText}>{roleTitle}</Text>
              </View>
            </View>
          </View>

          {/* Edit Profile Outlined Button */}
          <Pressable
            onPress={() => router.push('/(client)/edit-profile' as any)}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={({ pressed }) => [
              styles.editProfileButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.editProfileButtonText}>Edit profile</Text>
          </Pressable>
        </View>

        {/* ─── Section 1: Personal & Care / Personal & Volunteer ─── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text
              style={[
                styles.sectionTitle,
                { color: isDark ? Palette.primary : '#17242E' },
              ]}
            >
              {isElderly ? 'Personal & care' : 'Personal & volunteer'}
            </Text>
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>Complete</Text>
            </View>
          </View>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? '#142230' : '#FFFFFF',
                borderColor: isDark ? '#23384B' : '#E8F0F7',
              },
            ]}
          >
            {/* 1. Personal Information */}
            <Pressable
              onPress={() => router.push('/(client)/edit-profile' as any)}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && { opacity: 0.8 },
              ]}
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                <UserProfileIcon size={20} color="#184E82" />
              </View>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuItemTitle,
                    { color: isDark ? Palette.primary : '#17242E' },
                  ]}
                >
                  Personal information
                </Text>
                <Text style={styles.menuItemSub} numberOfLines={1}>
                  {user?.age ? `${user.age} yrs • ${user.mobile || 'Phone added'}` : 'Name, age and phone number'}
                </Text>
              </View>
              <ChevronRight size={18} color="#94A3B8" />
            </Pressable>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : '#F1F5F9' }]} />

            {/* 2. Care Preferences (Elderly) / Skills & Experience (Volunteer) */}
            {isElderly ? (
              <Pressable
                onPress={() => router.push('/(client)/care-preferences' as any)}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                  <Heart size={20} color="#184E82" strokeWidth={2} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                  >
                    Care preferences
                  </Text>
                  <Text style={styles.menuItemSub} numberOfLines={1}>
                    {user?.careNeeds && user.careNeeds.length > 0
                      ? user.careNeeds.join(' • ')
                      : 'Mobility assistance'}
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/(client)/volunteer-skills' as any)}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                  <HeartHandshake size={20} color="#184E82" strokeWidth={2} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                  >
                    Skills & experience
                  </Text>
                  <Text style={styles.menuItemSub} numberOfLines={1}>
                    {user?.careNeeds && user.careNeeds.length > 0
                      ? user.careNeeds.join(' • ')
                      : user?.bio || 'Companionship, Grocery shopping'}
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            )}

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : '#F1F5F9' }]} />

            {/* 3. Emergency Contact (Elderly) / Availability & Schedule (Volunteer) */}
            {isElderly ? (
              <Pressable
                onPress={() => router.push('/(client)/emergency-contact' as any)}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#FEF3E8' }]}>
                  <Phone size={20} color="#D97706" strokeWidth={2} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                  >
                    Emergency contact
                  </Text>
                  <Text style={styles.menuItemSub} numberOfLines={1}>
                    {user?.emergencyContactName
                      ? `${user.emergencyContactName} (${user.emergencyContact || 'Family'})`
                      : 'Sudesh (Son)'}
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            ) : (
              <Pressable
                onPress={() => router.push('/(client)/volunteer-availability' as any)}
                style={({ pressed }) => [
                  styles.menuRow,
                  pressed && { opacity: 0.8 },
                ]}
              >
                <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                  <Clock size={20} color="#184E82" strokeWidth={2} />
                </View>
                <View style={styles.menuTextCol}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                  >
                    Availability & schedule
                  </Text>
                  <Text style={styles.menuItemSub} numberOfLines={1}>
                    {user?.availability && user.availability.length > 0
                      ? user.availability.join(' • ')
                      : 'Weekdays & weekends'}
                  </Text>
                </View>
                <ChevronRight size={18} color="#94A3B8" />
              </Pressable>
            )}
          </View>
        </View>

        {/* ─── Section 2: Text size & readability ─── */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : '#17242E', marginBottom: 12 },
            ]}
          >
            Text size & readability
          </Text>

          <View
            style={[
              styles.readabilityCard,
              {
                backgroundColor: isDark ? '#142230' : '#FFFFFF',
                borderColor: isDark ? '#23384B' : '#E8F0F7',
              },
            ]}
          >
            <View style={[styles.aaIconBox, { backgroundColor: '#EDF4FC' }]}>
              <Text style={styles.aaIconText}>Aa</Text>
            </View>

            <View style={styles.menuTextCol}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: isDark ? Palette.primary : '#17242E' },
                ]}
              >
                Larger text
              </Text>
              <Text style={styles.menuItemSub}>Use 20% larger text</Text>
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
                false: isDark ? '#334155' : '#D1D5DB',
                true: '#184E82',
              }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* ─── Section 3: Dedicated Emergency Contact / Status Card ─── */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : '#17242E', marginBottom: 12 },
            ]}
          >
            {isElderly ? 'Emergency contact' : 'Volunteer status'}
          </Text>

          {isElderly ? (
            <View
              style={[
                styles.contactQuickCard,
                {
                  backgroundColor: isDark ? '#142230' : '#FFFFFF',
                  borderColor: isDark ? '#23384B' : '#E8F0F7',
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.contactLeftCol,
                  pressed && { opacity: 0.8 },
                ]}
                onPress={() => router.push('/(client)/emergency-contact' as any)}
                accessibilityRole="button"
                accessibilityLabel="View emergency contact details"
              >
                <View style={styles.contactAvatarBox}>
                  <UserProfileIcon size={20} color="#D97706" />
                </View>

                <View style={styles.contactTextCol}>
                  <Text
                    style={[
                      styles.contactName,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                    numberOfLines={1}
                  >
                    {emergencyContactName}
                  </Text>
                  <Text style={styles.contactDetailText} numberOfLines={1}>
                    {`${emergencyContactRelation} · ${emergencyContactNumber}`}
                  </Text>
                </View>
              </Pressable>

              {/* Call Button */}
              <Pressable
                onPress={handleCallEmergency}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={`Call ${emergencyContactName}`}
                style={({ pressed }) => [
                  styles.emergencyCallBtn,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Phone size={18} color="#FFFFFF" strokeWidth={2.4} />
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={() => router.push('/(client)/volunteer-skills' as any)}
              style={({ pressed }) => [
                styles.contactQuickCard,
                {
                  backgroundColor: isDark ? '#142230' : '#FFFFFF',
                  borderColor: isDark ? '#23384B' : '#E8F0F7',
                },
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Volunteer skills and status"
            >
              <View style={styles.contactLeftCol}>
                <View style={[styles.contactAvatarBox, { backgroundColor: '#EDF4FC' }]}>
                  <ShieldCheck size={22} color="#184E82" strokeWidth={2} />
                </View>

                <View style={styles.contactTextCol}>
                  <Text
                    style={[
                      styles.contactName,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                    numberOfLines={1}
                  >
                    Active Volunteer Partner
                  </Text>
                  <Text style={styles.contactDetailText} numberOfLines={1}>
                    Verified & approved helper
                  </Text>
                </View>
              </View>

              <View style={styles.verifiedCheckPill}>
                <Check size={16} color="#FFFFFF" strokeWidth={3} />
              </View>
            </Pressable>
          )}
        </View>

        {/* ─── Section 4: Account & Safety ─── */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionTitle,
              { color: isDark ? Palette.primary : '#17242E', marginBottom: 12 },
            ]}
          >
            Account & safety
          </Text>

          <View
            style={[
              styles.menuCard,
              {
                backgroundColor: isDark ? '#142230' : '#FFFFFF',
                borderColor: isDark ? '#23384B' : '#E8F0F7',
              },
            ]}
          >
            {/* Identity verification */}
            <View style={styles.menuRow}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                <UserProfileIcon size={20} color="#184E82" />
              </View>
              <View style={styles.menuTextCol}>
                <View style={styles.rowTitleWithDot}>
                  <Text
                    style={[
                      styles.menuItemTitle,
                      { color: isDark ? Palette.primary : '#17242E' },
                    ]}
                  >
                    Identity verification
                  </Text>
                  <View style={styles.greenDot} />
                </View>
                <Text style={styles.menuItemSub}>Verified and protected</Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : '#F1F5F9' }]} />

            {/* Registered email */}
            <View style={styles.menuRow}>
              <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                <MessageSquareIcon size={20} color="#184E82" />
              </View>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuItemTitle,
                    { color: isDark ? Palette.primary : '#17242E' },
                  ]}
                >
                  Registered email
                </Text>
                <Text style={styles.menuItemSub}>{email}</Text>
              </View>
            </View>

            <View style={[styles.menuDivider, { backgroundColor: isDark ? '#23384B' : '#F1F5F9' }]} />

            {/* Notification preferences */}
            <Pressable
              onPress={() => router.push('/(client)/notifications' as any)}
              style={({ pressed }) => [
                styles.menuRow,
                pressed && { opacity: 0.8 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Notification preferences"
            >
              <View style={[styles.menuIconBox, { backgroundColor: '#EDF4FC' }]}>
                <Bell size={20} color="#184E82" strokeWidth={2} />
              </View>
              <View style={styles.menuTextCol}>
                <Text
                  style={[
                    styles.menuItemTitle,
                    { color: isDark ? Palette.primary : '#17242E' },
                  ]}
                >
                  Notification preferences
                </Text>
                <Text style={styles.menuItemSub}>Push, SMS and in-app alerts</Text>
              </View>
            </Pressable>
          </View>
        </View>

        {/* ─── Section 5: Log out Button ─── */}
        <Pressable
          onPress={handleLogout}
          accessibilityRole="button"
          accessibilityLabel="Log out"
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.logoutButtonText}>Log out</Text>
        </Pressable>
      </ScrollView>

      {/* Confirmation Modal */}
      <ActionModal
        visible={logoutModalVisible}
        onCancel={() => setLogoutModalVisible(false)}
        onConfirm={confirmLogout}
        title="Log Out"
        subtitle="Are you sure you want to log out of your KindLink account?"
        icon={<Ionicons name="log-out-outline" size={32} color={FunctionalColors.danger} />}
        iconContainerStyle={{ backgroundColor: FunctionalColors.dangerBg }}
        confirmText="Log Out"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  headerSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.3,
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
  topBlueBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 52,
  },
  profileCard: {
    marginHorizontal: 18,
    marginTop: 8,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    zIndex: 2,
    ...Platform.select({
      ios: {
        shadowColor: '#1B5080',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 68,
    height: 68,
    borderRadius: 34,
  },
  avatarInitialsText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#184E82',
    letterSpacing: 0.5,
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfoCol: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  userEmail: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
    marginTop: 8,
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#184E82',
  },
  editProfileButton: {
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#184E82',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#184E82',
  },
  sectionContainer: {
    marginTop: 22,
    marginHorizontal: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  completeBadge: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  completeBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },
  menuCard: {
    borderRadius: 20,
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
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  menuTextCol: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  menuItemSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 16,
  },
  readabilityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
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
  aaIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  aaIconText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#184E82',
  },
  contactQuickCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 20,
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
  contactLeftCol: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  contactAvatarBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FEF3E8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactTextCol: {
    flex: 1,
  },
  contactName: {
    fontSize: 15,
    fontWeight: '700',
  },
  contactDetailText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '500',
  },
  emergencyCallBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  verifiedCheckPill: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#184E82',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  rowTitleWithDot: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginLeft: 6,
  },
  logoutButton: {
    marginHorizontal: 18,
    marginTop: 22,
    marginBottom: 32,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: '#FFF5F5',
    borderWidth: 1.5,
    borderColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#DC2626',
  },
  buttonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
