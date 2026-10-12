import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProfilePhotoField } from '@/components/profile/profile-photo-field';
import { ChevronBackButton } from '@/components/ui/chevron-back-button';
import { useAvatarPicker } from '@/hooks/use-avatar-picker';
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import {
  ElderlyInputField,
  ElderlyLockedEmailField,
} from '@/components/profile/profile-form-fields';
import {
  UserProfileIcon,
  EmergencyPhoneIcon,
  HomePinIcon,
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
  const { showToast } = useToast();
  const photo = useAvatarPicker(user?.profileImage);
  const submitting = useRef(false);

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';
  const isVolunteer = user?.role?.toLowerCase() === 'volunteer';

  // Form State initialized from authenticated user
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age ? String(user.age) : '');
  const [mobile, setMobile] = useState(user?.mobile || '');
  const [address, setAddress] = useState(user?.address || '');

  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setAge(user.age ? String(user.age) : '');
      setMobile(user.mobile || '');
      setAddress(user.address || '');
    }
  }, [user]);

  const validateForm = (): boolean => {
    let isValid = true;

    // 1. Name validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setNameError('Full name is required');
      isValid = false;
    } else if (trimmedName.length < 2) {
      setNameError('Full name must be at least 2 characters');
      isValid = false;
    } else if (trimmedName.length > 60) {
      setNameError('Full name must be 60 characters or fewer');
      isValid = false;
    } else if (!/^[a-zA-Z\s'.\-]+$/.test(trimmedName)) {
      setNameError('Full name can only contain letters and spaces (no numbers)');
      isValid = false;
    } else {
      setNameError(null);
    }

    // 2. Mobile validation (10 digits enforced)
    const trimmedMobile = mobile.trim();
    const cleanDigits = trimmedMobile.replace(/\D/g, '');
    if (isVolunteer && !trimmedMobile) {
      setMobileError('Mobile number is required for volunteers');
      isValid = false;
    } else if (trimmedMobile) {
      if (!/^[0-9+\-\s()]+$/.test(trimmedMobile)) {
        setMobileError('Mobile number contains invalid characters');
        isValid = false;
      } else {
        const is10Digits = cleanDigits.length === 10;
        const isLKWithCode = cleanDigits.startsWith('94') && cleanDigits.length === 11;
        if (!is10Digits && !isLKWithCode) {
          setMobileError('Mobile number must be exactly 10 digits (e.g. 0712345678)');
          isValid = false;
        } else {
          setMobileError(null);
        }
      }
    } else {
      setMobileError(null);
    }

    // 3. Age validation
    const trimmedAge = age.trim();
    if (trimmedAge) {
      if (!/^\d+$/.test(trimmedAge)) {
        setAgeError('Age must be a valid whole number');
        isValid = false;
      } else {
        const parsedAge = parseInt(trimmedAge, 10);
        if (isVolunteer && (parsedAge < 16 || parsedAge > 100)) {
          setAgeError('Volunteer age must be between 16 and 100 years');
          isValid = false;
        } else if (isElderly && (parsedAge < 40 || parsedAge > 120)) {
          setAgeError('Senior age must be between 40 and 120 years');
          isValid = false;
        } else if (parsedAge < 12 || parsedAge > 120) {
          setAgeError('Please enter a realistic age between 12 and 120');
          isValid = false;
        } else {
          setAgeError(null);
        }
      }
    } else {
      setAgeError(null);
    }

    // 4. Address validation
    const trimmedAddress = address.trim();
    if (trimmedAddress) {
      if (trimmedAddress.length < 5) {
        setAddressError('Address must be at least 5 characters');
        isValid = false;
      } else if (trimmedAddress.length > 200) {
        setAddressError('Address must be 200 characters or fewer');
        isValid = false;
      } else {
        setAddressError(null);
      }
    } else {
      setAddressError(null);
    }

    return isValid;
  };

  const handleSave = async () => {
    if (submitting.current || photo.busy) return;

    if (!validateForm()) {
      showToast('Please fix the validation errors before saving.', { type: 'error' });
      return;
    }

    submitting.current = true;
    setIsLoading(true);

    try {
      await updateUser({
        ...(photo.isRemoved ? { profileImage: '' } : {}),
        name: name.trim(),
        age: age.trim() ? Number(age.trim()) : null,
        mobile: mobile.trim(),
        address: address.trim(),
        careNeeds: user?.careNeeds,
        careNotes: user?.careNotes,
        bio: user?.bio,
        availability: user?.availability,
      }, photo.localUri || undefined);
      photo.reset();

      showToast('Personal information updated successfully!', { type: 'success' });
      router.push('/(client)/profile' as any);
    } catch (err: any) {
      showToast(err?.message || 'Could not update profile. Please try again.', { type: 'error' });
    } finally {
      submitting.current = false;
      setIsLoading(false);
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header */}
        <View style={styles.header}>
          <ChevronBackButton
            color={isDark ? '#60A5FA' : Palette.secondary}
            targetHref="/(client)/profile"
          />
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            {isVolunteer ? 'Personal Information' : 'Edit Profile'}
          </Text>
          <View style={{ width: 40 }} />
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
            <ProfilePhotoField photo={photo} name={name || user?.name} disabled={isLoading || photo.busy} />

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
          </View>

          {/* Personal Information Card */}
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
              👤 Personal Details
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
              sublabel={
                isVolunteer
                  ? 'Your current age in years (16 - 100)'
                  : 'Your current age in years'
              }
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (ageError) setAgeError(null);
              }}
              placeholder={isVolunteer ? 'e.g. 24' : 'e.g. 74'}
              keyboardType="numeric"
              maxLength={3}
              errorMessage={ageError}
            />

            {/* Mobile Phone */}
            <ElderlyInputField
              label="Phone / Mobile Number"
              sublabel={
                isVolunteer
                  ? 'Required: 10 digits for contact & request updates'
                  : '10 digits for direct contact and community check-ins'
              }
              icon={<EmergencyPhoneIcon size={20} color={Palette.secondary} />}
              value={mobile}
              onChangeText={(text) => {
                setMobile(text);
                if (mobileError) setMobileError(null);
              }}
              placeholder="e.g. 0771234567"
              keyboardType="phone-pad"
              maxLength={15}
              errorMessage={mobileError}
              required={isVolunteer}
            />
          </View>

          {/* Account Security (Locked Email) */}
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

          {/* Location & Address */}
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
              📍 Location & Address
            </Text>

            {/* Home Address */}
            <ElderlyInputField
              label="Home Address"
              sublabel="Your residence address for community tasks or visits"
              icon={<HomePinIcon size={20} color={Palette.secondary} />}
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (addressError) setAddressError(null);
              }}
              placeholder="e.g. 14 High Street, Bristol, BS1 4DJ"
              autoCapitalize="words"
              errorMessage={addressError}
            />
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isLoading || photo.busy}
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
              <Text style={styles.saveBtnText}>
                Save Personal Details
              </Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/(client)/profile' as any)}
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
