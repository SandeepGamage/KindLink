import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { ElderlyInputField } from '@/components/profile/profile-form-fields';
import { ChevronBackButton } from '@/components/ui/chevron-back-button';
import {
  UserProfileIcon,
  EmergencyPhoneIcon,
  HomePinIcon,
} from '@/components/ui/profile-icons';

export default function EmergencyContactScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuthContext();
  const { showToast } = useToast();
  const submitting = useRef(false);

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

  const [isLoading, setIsLoading] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
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
    }
  }, [user]);

  const validateForm = (): boolean => {
    let isValid = true;

    // 1. Emergency Contact Name validation
    const trimmedName = emergencyContactName.trim();
    if (trimmedName) {
      if (trimmedName.length < 2) {
        setNameError('Contact name must be at least 2 characters');
        isValid = false;
      } else if (!/^[a-zA-Z\s'.\-()]+$/.test(trimmedName)) {
        setNameError('Contact name can only contain letters and relationship in parentheses');
        isValid = false;
      } else {
        setNameError(null);
      }
    } else {
      setNameError(null);
    }

    // 2. Emergency Contact Phone Number validation (10 digits enforced)
    const trimmedPhone = emergencyContactNumber.trim();
    const cleanDigits = trimmedPhone.replace(/\D/g, '');
    if (trimmedPhone) {
      if (!/^[0-9+\-\s()]+$/.test(trimmedPhone)) {
        setPhoneError('Phone number contains invalid characters');
        isValid = false;
      } else {
        const is10Digits = cleanDigits.length === 10;
        const isLKWithCode = cleanDigits.startsWith('94') && cleanDigits.length === 11;
        if (!is10Digits && !isLKWithCode) {
          setPhoneError('Emergency contact phone must be 10 digits (e.g. 0712345678)');
          isValid = false;
        } else {
          setPhoneError(null);
        }
      }
    } else {
      setPhoneError(null);
    }

    // 3. Address validation
    const trimmedAddress = address.trim();
    if (trimmedAddress) {
      if (trimmedAddress.length < 5) {
        setAddressError('Address must be at least 5 characters');
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
    if (submitting.current) return;

    if (!validateForm()) {
      showToast('Please fix the validation errors before saving.', { type: 'error' });
      return;
    }

    submitting.current = true;
    setIsLoading(true);

    try {
      const combinedEmergency =
        emergencyContactName.trim() && emergencyContactNumber.trim()
          ? `${emergencyContactName.trim()} - ${emergencyContactNumber.trim()}`
          : emergencyContactName.trim() || emergencyContactNumber.trim() || '';

      await updateUser({
        address: address.trim(),
        emergencyContact: combinedEmergency,
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactNumber: emergencyContactNumber.trim(),
      });

      showToast('Emergency contact details saved securely.', { type: 'success' });
      router.push('/(client)/profile' as any);
    } catch (err: any) {
      showToast(err?.message || 'Could not update your details. Please try again.', { type: 'error' });
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
            Emergency Contact
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">

          <Text style={[styles.title, { color: isDark ? Palette.primary : Palette.ink }]}>
            Emergency & Safety Details
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
            Section 3: Keep your designated contact person and home address updated for swift community and care support.
          </Text>

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
              🛡️ Safety & Location
            </Text>

            {/* Emergency Contact Name */}
            <ElderlyInputField
              label="Emergency Contact Name"
              sublabel="Name & relationship of family member or contact"
              icon={<UserProfileIcon size={20} color={Palette.secondary} />}
              value={emergencyContactName}
              onChangeText={(text) => {
                setEmergencyContactName(text);
                if (nameError) setNameError(null);
              }}
              placeholder="e.g. Sarah Evans (Daughter)"
              autoCapitalize="words"
              errorMessage={nameError}
            />

            {/* Emergency Contact Phone Number */}
            <ElderlyInputField
              label="Emergency Contact Phone Number"
              sublabel="Direct 10-digit phone number reachable in emergencies"
              icon={<EmergencyPhoneIcon size={20} color={Palette.secondary} />}
              value={emergencyContactNumber}
              onChangeText={(text) => {
                setEmergencyContactNumber(text);
                if (phoneError) setPhoneError(null);
              }}
              placeholder="e.g. 0771234567"
              keyboardType="phone-pad"
              maxLength={15}
              errorMessage={phoneError}
            />

            {/* Home Address */}
            <ElderlyInputField
              label="Home Address"
              sublabel="Your residence address for home visits or deliveries"
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
              <Text style={styles.saveBtnText}>Save Contact Details</Text>
            )}
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
    paddingTop: 10,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 18,
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
});
