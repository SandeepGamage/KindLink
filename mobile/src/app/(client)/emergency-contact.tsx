import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useToast } from '@/context/toast-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { ElderlyInputField } from '@/components/profile/profile-form-fields';
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

  const handleSave = async () => {
    if (submitting.current) return;
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

      showToast('Emergency contact details saved securely.');
      router.push('/(client)/profile' as any);
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err?.message || 'Could not update your details. Please try again.'
      );
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
          <Pressable
            onPress={() => router.push('/(client)/profile' as any)}
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
            Emergency Contact
          </Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
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
});
