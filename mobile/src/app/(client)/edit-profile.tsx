import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import {
  ElderlyInputField,
  ElderlyLockedEmailField,
  ElderlyTextAreaField,
} from '@/components/profile/profile-form-fields';
import { CareNeedsPicker } from '@/components/profile/care-needs-picker';
import {
  UserProfileIcon,
  EmergencyPhoneIcon,
  HomePinIcon,
  CareHeartNotesIcon,
  CheckCircleIcon,
} from '@/components/ui/profile-icons';
import {
  RoleElderlyIcon,
  RoleVolunteerIcon,
} from '@/components/ui/onboarding-icons';

export default function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuthContext();

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';
  const isVolunteer = user?.role?.toLowerCase() === 'volunteer';

  // Form State initialized from authenticated user
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emergencyContactName, setEmergencyContactName] = useState(
    user?.emergencyContactName ||
      (user?.emergencyContact && user.emergencyContact.includes(' - ')
        ? user.emergencyContact.split(' - ')[0].trim()
        : user?.emergencyContact || '')
  );
  const [emergencyContactNumber, setEmergencyContactNumber] = useState(
    user?.emergencyContactNumber ||
      (user?.emergencyContact && user.emergencyContact.includes(' - ')
        ? user.emergencyContact.split(' - ').slice(1).join(' - ').trim()
        : '')
  );
  const [careNotes, setCareNotes] = useState(
    user?.careNotes || user?.bio || ''
  );
  const [careNeeds, setCareNeeds] = useState<string[]>(
    user?.careNeeds || []
  );
  const [availability, setAvailability] = useState<string[]>(
    user?.availability || ['Weekends', 'Flexible']
  );

  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age ? String(user.age) : '');
      setMobile(user.mobile || '');
      setAddress(user.address || '');
      setEmergencyContactName(
        user.emergencyContactName ||
          (user.emergencyContact && user.emergencyContact.includes(' - ')
            ? user.emergencyContact.split(' - ')[0].trim()
            : user.emergencyContact || '')
      );
      setEmergencyContactNumber(
        user.emergencyContactNumber ||
          (user.emergencyContact && user.emergencyContact.includes(' - ')
            ? user.emergencyContact.split(' - ').slice(1).join(' - ').trim()
            : '')
      );
      setCareNotes(user.careNotes || user.bio || '');
      if (user.careNeeds && Array.isArray(user.careNeeds)) {
        setCareNeeds(user.careNeeds);
      }
      if (user.availability && Array.isArray(user.availability)) {
        setAvailability(user.availability);
      }
    }
  }, [user]);

  const toggleAvailability = (opt: string) => {
    setAvailability((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setNameError('Full name is required');
      Alert.alert('Required Field', 'Please enter your full name.');
      return;
    }
    setNameError(null);

    setIsLoading(true);
    setSaveSuccess(false);

    try {
      const combinedEmergency =
        emergencyContactName.trim() && emergencyContactNumber.trim()
          ? `${emergencyContactName.trim()} - ${emergencyContactNumber.trim()}`
          : emergencyContactName.trim() || emergencyContactNumber.trim() || '';

      await updateUser({
        name: name.trim(),
        age: age.trim() ? Number(age.trim()) : null,
        mobile: mobile.trim(),
        address: address.trim(),
        emergencyContact: combinedEmergency,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactNumber: emergencyContactNumber.trim(),
        careNeeds: isElderly ? careNeeds : undefined,
        careNotes: careNotes.trim(),
        bio: careNotes.trim(),
        availability: isVolunteer ? availability : undefined,
      });

      setSaveSuccess(true);
      Alert.alert(
        'Profile Updated! ✅',
        'Your profile changes have been securely saved.',
        [
          {
            text: 'Back to Profile',
            onPress: () => router.back(),
          },
          {
            text: 'Keep Editing',
            style: 'cancel',
          },
        ]
      );
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err?.message || 'Could not update profile. Please try again.'
      );
    } finally {
      setIsLoading(false);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header */}
        <View style={styles.header}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
            style={styles.backButton}>
            <Text style={[styles.backText, { color: Palette.secondary }]}>
              ← Back
            </Text>
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            Edit Profile
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          {/* Avatar & Persona Banner */}
          <View
            style={[
              styles.avatarCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <View style={[styles.avatar, { backgroundColor: Palette.secondary }]}>
              <Text style={styles.avatarText}>
                {(name || user?.name || (isElderly ? 'S' : 'V'))
                  .charAt(0)
                  .toUpperCase()}
              </Text>
            </View>

            <Text
              style={[
                styles.avatarCardName,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              {name || user?.name || 'Member'}
            </Text>

            <View
              style={[
                styles.rolePill,
                {
                  backgroundColor: isDark
                    ? 'rgba(31, 92, 150, 0.3)'
                    : Palette.blueTint,
                },
              ]}>
              {isElderly ? (
                <RoleElderlyIcon
                  size={16}
                  color={isDark ? '#60A5FA' : Palette.secondary}
                />
              ) : (
                <RoleVolunteerIcon
                  size={16}
                  color={isDark ? '#60A5FA' : Palette.secondary}
                />
              )}
              <Text
                style={[
                  styles.rolePillText,
                  { color: isDark ? '#60A5FA' : Palette.secondary },
                ]}>
                {isElderly ? 'Senior Care Member' : 'Community Volunteer'}
              </Text>
            </View>

            {/* Supabase Storage Notice */}
            <View
              style={[
                styles.photoNoticeBox,
                {
                  backgroundColor: isDark ? '#142230' : '#F0F6FC',
                  borderColor: isDark ? '#23384B' : '#D0E1F2',
                },
              ]}>
              <Text style={styles.photoNoticeIcon}>📷</Text>
              <Text
                style={[
                  styles.photoNoticeText,
                  { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                ]}>
                Profile Picture Cloud Sync (Supabase integration coming soon)
              </Text>
            </View>
          </View>

          {/* Success Banner if just saved */}
          {saveSuccess && (
            <View style={styles.successBanner}>
              <CheckCircleIcon size={22} color="#10B981" />
              <Text style={styles.successBannerText}>
                Profile details successfully updated!
              </Text>
            </View>
          )}

          {/* Section 1: Basic Information */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <Text
              style={[
                styles.sectionHeader,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              👤 Personal Information
            </Text>

            {/* Full Name */}
            <ElderlyInputField
              label="Full Name"
              sublabel="Your complete legal or preferred name"
              icon={<UserProfileIcon size={20} color={Palette.secondary} />}
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Margaret Evans"
              autoCapitalize="words"
              errorMessage={nameError}
              required
            />

            {/* Age */}
            <ElderlyInputField
              label="Age"
              sublabel="Your current age in years"
              value={age}
              onChangeText={setAge}
              placeholder="e.g. 74"
              keyboardType="numeric"
              maxLength={3}
            />

            {/* Mobile Phone */}
            <ElderlyInputField
              label="Phone / Mobile Number"
              sublabel="For direct contact and community check-ins"
              icon={<EmergencyPhoneIcon size={20} color={Palette.secondary} />}
              value={mobile}
              onChangeText={setMobile}
              placeholder="e.g. 07987 654321"
              keyboardType="phone-pad"
            />
          </View>

          {/* Section 2: Account Security (Locked Email) */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <Text
              style={[
                styles.sectionHeader,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              🔒 Account Identity
            </Text>

            <ElderlyLockedEmailField
              email={user?.email || 'member@kindlink.org'}
              label="Registered Email Address"
            />
          </View>

          {/* Section 3: Safety & Emergency Information / Location */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <Text
              style={[
                styles.sectionHeader,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              {isElderly ? '🛡️ Safety & Location' : '📍 Location & Address'}
            </Text>

            {/* Emergency Contacts - Only for Elderly members */}
            {isElderly && (
              <>
                {/* Emergency Contact Name */}
                <ElderlyInputField
                  label="Emergency Contact Name"
                  sublabel="Name & relationship of family member or contact"
                  icon={<UserProfileIcon size={20} color={Palette.secondary} />}
                  value={emergencyContactName}
                  onChangeText={setEmergencyContactName}
                  placeholder="e.g. Sarah Evans (Daughter)"
                  autoCapitalize="words"
                />

                {/* Emergency Contact Phone Number */}
                <ElderlyInputField
                  label="Emergency Contact Phone Number"
                  sublabel="Direct phone number reachable in emergencies"
                  icon={<EmergencyPhoneIcon size={20} color={Palette.secondary} />}
                  value={emergencyContactNumber}
                  onChangeText={setEmergencyContactNumber}
                  placeholder="e.g. 07987 654321"
                  keyboardType="phone-pad"
                />
              </>
            )}

            {/* Home Address */}
            <ElderlyInputField
              label="Home Address"
              sublabel="Your residence address for home visits or deliveries"
              icon={<HomePinIcon size={20} color={Palette.secondary} />}
              value={address}
              onChangeText={setAddress}
              placeholder="e.g. 14 High Street, Bristol, BS1 4DJ"
              autoCapitalize="words"
            />
          </View>

          {/* Section 4: Care Preferences & Needs (Elderly only) */}
          {isElderly && (
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? Palette.ink : Palette.primary,
                  borderColor: isDark ? '#23384B' : Palette.border,
                },
              ]}>
              <Text
                style={[
                  styles.sectionHeader,
                  { color: isDark ? Palette.primary : Palette.ink },
                ]}>
                🤲 Care Preferences & Needs
              </Text>

              <CareNeedsPicker
                selectedNeeds={careNeeds}
                onChangeNeeds={setCareNeeds}
                isDark={isDark}
                hideHeader={true}
              />
            </View>
          )}

          {/* Section 5: Volunteer Bio & Skills (Volunteers only) */}
          {isVolunteer && (
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? Palette.ink : Palette.primary,
                  borderColor: isDark ? '#23384B' : Palette.border,
                },
              ]}>
              <Text
                style={[
                  styles.sectionHeader,
                  { color: isDark ? Palette.primary : Palette.ink },
                ]}>
                📝 Volunteer Bio & Community Skills
              </Text>

              <ElderlyTextAreaField
                label="About You & Helping Skills"
                sublabel="Describe your experience, languages spoken, certifications (e.g. First Aid, driving licence)."
                icon={<CareHeartNotesIcon size={22} color={Palette.secondary} />}
                value={careNotes}
                onChangeText={setCareNotes}
                placeholder="e.g. Passionate about helping seniors with grocery runs and digital tech support. Available on weekends with full UK driving licence."
                minHeight={140}
              />
            </View>
          )}

          {/* Section 5: Volunteer Availability (if Volunteer) */}
          {isVolunteer && (
            <View
              style={[
                styles.sectionCard,
                {
                  backgroundColor: isDark ? Palette.ink : Palette.primary,
                  borderColor: isDark ? '#23384B' : Palette.border,
                },
              ]}>
              <Text
                style={[
                  styles.sectionHeader,
                  { color: isDark ? Palette.primary : Palette.ink },
                ]}>
                ⏰ Helper Availability
              </Text>
              <Text
                style={[
                  styles.sectionSub,
                  { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                ]}>
                Select when you are typically available to support members:
              </Text>

              <View style={styles.chipGrid}>
                {['Weekends', 'Mornings', 'Afternoons', 'Evenings', 'Flexible'].map(
                  (opt) => {
                    const isSelected = availability.includes(opt);
                    return (
                      <Pressable
                        key={opt}
                        onPress={() => toggleAvailability(opt)}
                        style={[
                          styles.availChip,
                          {
                            backgroundColor: isSelected
                              ? Palette.secondary
                              : isDark
                                ? '#1A2938'
                                : Palette.blueTint,
                            borderColor: isSelected
                              ? Palette.secondary
                              : isDark
                                ? '#23384B'
                                : Palette.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.availChipText,
                            {
                              color: isSelected
                                ? '#FFFFFF'
                                : isDark
                                  ? '#93C5FD'
                                  : Palette.secondary,
                            },
                          ]}>
                          {isSelected ? '✓ ' : '+ '}
                          {opt}
                        </Text>
                      </Pressable>
                    );
                  }
                )}
              </View>
            </View>
          )}

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                opacity: pressed || isLoading ? 0.85 : 1,
                backgroundColor: Palette.secondary,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Profile Changes</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              styles.cancelBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text
              style={[
                styles.cancelBtnText,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              Cancel and Return
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  avatarCard: {
    alignItems: 'center',
    padding: 22,
    borderRadius: 24,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 3,
    borderColor: Palette.primary,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
      },
      android: { elevation: 3 },
    }),
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '900',
  },
  avatarCardName: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 8,
    marginTop: 8,
  },
  rolePillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  photoNoticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    gap: 8,
  },
  photoNoticeIcon: {
    fontSize: 15,
  },
  photoNoticeText: {
    fontSize: 12,
    fontWeight: '600',
    flexShrink: 1,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
    padding: 14,
    borderRadius: 14,
    marginBottom: 20,
    gap: 10,
  },
  successBannerText: {
    color: '#15803D',
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.3,
    marginBottom: 16,
  },
  sectionSub: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 12,
    lineHeight: 18,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  availChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  availChipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  saveBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
