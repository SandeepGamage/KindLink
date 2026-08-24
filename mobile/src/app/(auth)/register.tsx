/**
 * (auth)/register.tsx
 *
 * KindLink Sign Up Screen (Elderly member sign up & Volunteer Sign Up)
 * 100% matched to the Figma design for iPhone 15 display specifications:
 * - Soothing soft ice-blue background (#F0F6FE)
 * - Top header with "← Back" button
 * - Clean white input fields with smooth light-blue borders (#93C5FD)
 * - Bold headings and clean subtitles
 * - Interactive dashed upload area for volunteer ID card
 * - Pill chips for volunteer availability
 * - 52px royal blue "Send verification code" button
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { DocumentUploadIcon } from '@/components/ui/onboarding-icons';
import { OnboardingColors, Palette, FunctionalColors } from '@/constants/theme';
import { authService, SignUpPayload } from '@/services/auth.service';

export default function RegisterScreen() {
  const router = useRouter();
  const { role = 'elderly' } = useLocalSearchParams<{ role?: string }>();
  const isVolunteer = role === 'volunteer';

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [idDocumentName, setIdDocumentName] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const toggleAvailability = (opt: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt],
    );
  };

  const handleDocumentPick = () => {
    Alert.alert(
      'ID / Student Card Upload',
      'Select document to upload for volunteer verification.',
      [
        {
          text: 'Upload Student_ID.pdf',
          onPress: () => setIdDocumentName('Student_ID_Card.pdf (Attached)'),
        },
        {
          text: 'Upload National_ID.jpg',
          onPress: () => setIdDocumentName('National_Identity_Card.jpg (Attached)'),
        },
        { text: 'Cancel', style: 'cancel' },
      ],
    );
  };

  const handleContinueToPassword = useCallback(() => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    setErrorMessage(null);

    const formattedEmergencyContact =
      emergencyContactName.trim() && emergencyContactNumber.trim()
        ? `${emergencyContactName.trim()} - ${emergencyContactNumber.trim()}`
        : emergencyContactName.trim() || emergencyContactNumber.trim() || '';

    router.push({
      pathname: '/(auth)/set-password',
      params: {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: isVolunteer ? 'volunteer' : 'elderly',
        age: age.trim() || '',
        address: address.trim() || '',
        emergencyContact: formattedEmergencyContact,
        emergencyContactName: emergencyContactName.trim() || '',
        emergencyContactNumber: emergencyContactNumber.trim() || '',
        idDocument: idDocumentName || '',
        availability: JSON.stringify(isVolunteer ? selectedAvailability : []),
      },
    });
  }, [
    fullName,
    email,
    age,
    address,
    emergencyContactName,
    emergencyContactNumber,
    idDocumentName,
    selectedAvailability,
    isVolunteer,
    router,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.content}>
            {/* ─── Top Header: Back Button ─── */}
            <View style={styles.topHeader}>
              <Pressable
                onPress={() => router.back()}
                hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                style={styles.backButton}
                accessibilityRole="button"
                accessibilityLabel="Go back">
                <Text style={styles.backText}>← Back</Text>
              </Pressable>
            </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* ─── Screen Title & Subtitle ─── */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
                {isVolunteer ? 'Volunteer Sign Up' : 'Create your account'}
              </Text>
              <Text style={styles.subtitle}>
                {isVolunteer
                  ? 'Join as a verified community helper'
                  : 'Elderly member sign up'}
              </Text>
            </View>

            {/* Error Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* ─── Form Fields ─── */}
            {isVolunteer ? (
              /* ─── VOLUNTEER FORM ─── */
              <View style={styles.form}>
                {/* Full name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. David Miller"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    autoCapitalize="words"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. test123@test.com"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* ID / Student Card Upload */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>ID / Student Card Upload</Text>
                  <Pressable
                    style={({ pressed }) => [
                      styles.uploadBox,
                      pressed && styles.uploadBoxPressed,
                    ]}
                    onPress={handleDocumentPick}
                    accessibilityRole="button"
                    accessibilityLabel="Upload ID document">
                    <DocumentUploadIcon size={30} color={OnboardingColors.primary} />
                    <Text style={styles.uploadText}>
                      {idDocumentName ?? 'Tap to upload ID document'}
                    </Text>
                  </Pressable>
                </View>

                {/* Availability */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Availability</Text>
                  <View style={styles.availabilityGrid}>
                    <View style={styles.availabilityRow}>
                      {['Weekends', 'Evenings'].map((opt) => {
                        const isSelected = selectedAvailability.includes(opt);
                        return (
                          <Pressable
                            key={opt}
                            style={({ pressed }) => [
                              styles.chip,
                              isSelected ? styles.chipSelected : styles.chipUnselected,
                              pressed && styles.chipPressed,
                            ]}
                            onPress={() => toggleAvailability(opt)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isSelected }}
                            accessibilityLabel={opt}>
                            <Text
                              style={[
                                styles.chipText,
                                isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                              ]}>
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>

                    <View style={styles.availabilityRow}>
                      {['Mornings', 'Flexible'].map((opt) => {
                        const isSelected = selectedAvailability.includes(opt);
                        return (
                          <Pressable
                            key={opt}
                            style={({ pressed }) => [
                              styles.chip,
                              isSelected ? styles.chipSelected : styles.chipUnselected,
                              pressed && styles.chipPressed,
                            ]}
                            onPress={() => toggleAvailability(opt)}
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: isSelected }}
                            accessibilityLabel={opt}>
                            <Text
                              style={[
                                styles.chipText,
                                isSelected ? styles.chipTextSelected : styles.chipTextUnselected,
                              ]}>
                              {opt}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                </View>
              </View>
            ) : (
              /* ─── ELDERLY MEMBER FORM ─── */
              <View style={styles.form}>
                {/* Full name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Margaret Evans"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={fullName}
                    onChangeText={(text) => {
                      setFullName(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    autoCapitalize="words"
                  />
                </View>

                {/* Age */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Age</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 72"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={age}
                    onChangeText={setAge}
                    keyboardType="numeric"
                  />
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. test123@test.com"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={email}
                    onChangeText={(text) => {
                      setEmail(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>

                {/* Home address */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Home address</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 14 High Street, Bristol"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                {/* Emergency contact name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency contact name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Sarah Evans (Daughter)"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={emergencyContactName}
                    onChangeText={setEmergencyContactName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Emergency contact phone number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency contact phone number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 07987 654321"
                    placeholderTextColor={FunctionalColors.textMuted}
                    value={emergencyContactNumber}
                    onChangeText={setEmergencyContactNumber}
                    keyboardType="phone-pad"
                  />
                </View>
              </View>
            )}

          </ScrollView>

            {/* ─── Bottom CTA ─── */}
            <View style={styles.bottomContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={handleContinueToPassword}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Continue to set password">
                {isLoading ? (
                  <ActivityIndicator color={Palette.primary} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Continue</Text>
                )}
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  topHeader: {
    paddingTop: 0,
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 4,
    paddingBottom: 8,
  },
  titleBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: Palette.ink,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: FunctionalColors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: FunctionalColors.danger,
  },
  errorText: {
    color: FunctionalColors.dangerText,
    fontSize: 13,
    fontWeight: '600',
  },
  form: {
    gap: 14,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Palette.ink,
    fontWeight: '500',
  },
  uploadBox: {
    height: 110,
    borderRadius: 14,
    backgroundColor: Palette.blueTint,
    borderWidth: 1.5,
    borderColor: Palette.secondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  uploadBoxPressed: {
    opacity: 0.85,
  },
  uploadText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.secondary,
    marginTop: 8,
    textAlign: 'center',
  },
  availabilityGrid: {
    gap: 12,
    marginTop: 4,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chip: {
    flex: 1,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  chipSelected: {
    backgroundColor: Palette.primary,
    borderWidth: 1.5,
    borderColor: Palette.border,
  },
  chipUnselected: {
    backgroundColor: Palette.secondary,
    borderWidth: 1.5,
    borderColor: Palette.secondary,
  },
  chipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  chipText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  chipTextSelected: {
    color: Palette.secondary,
  },
  chipTextUnselected: {
    color: Palette.primary,
  },
  bottomContainer: {
    width: '100%',
    paddingTop: 16,
    paddingBottom: 16,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Palette.secondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  primaryButtonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: Palette.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
