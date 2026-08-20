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
import { OnboardingColors } from '@/constants/theme';
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
  const [emergencyContact, setEmergencyContact] = useState('');
  const [idDocumentName, setIdDocumentName] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([
    'Weekends',
    'Evenings',
    'Mornings',
    'Flexible',
  ]);

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

  const handleRegister = useCallback(async () => {
    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }
    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    const payload: SignUpPayload = {
      name: fullName.trim(),
      email: email.trim(),
      role: isVolunteer ? 'volunteer' : 'elderly',
      age: age.trim() || undefined,
      address: address.trim() || undefined,
      emergencyContact: emergencyContact.trim() || undefined,
      idDocument: idDocumentName || undefined,
      availability: isVolunteer ? selectedAvailability : undefined,
    };

    try {
      await authService.register(payload);

      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please log in to continue.',
        [
          {
            text: 'Log In',
            onPress: () => {
              router.replace({
                pathname: '/(auth)/login',
                params: { email: email.trim() },
              });
            },
          },
        ],
      );
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [
    fullName,
    email,
    age,
    address,
    emergencyContact,
    idDocumentName,
    selectedAvailability,
    isVolunteer,
    router,
  ]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={OnboardingColors.screenBg} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          
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
                    placeholderTextColor="#94A3B8"
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
                    placeholderTextColor="#94A3B8"
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
                      {['Weekends', 'Evenings', 'Mornings'].map((opt) => {
                        const isSelected = selectedAvailability.includes(opt);
                        return (
                          <Pressable
                            key={opt}
                            style={[
                              styles.chip,
                              isSelected ? styles.chipSelected : styles.chipUnselected,
                            ]}
                            onPress={() => toggleAvailability(opt)}>
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
                      {['Flexible'].map((opt) => {
                        const isSelected = selectedAvailability.includes(opt);
                        return (
                          <Pressable
                            key={opt}
                            style={[
                              styles.chip,
                              isSelected ? styles.chipSelected : styles.chipUnselected,
                            ]}
                            onPress={() => toggleAvailability(opt)}>
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
                    placeholderTextColor="#94A3B8"
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
                    placeholderTextColor="#94A3B8"
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
                    placeholderTextColor="#94A3B8"
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
                    placeholderTextColor="#94A3B8"
                    value={address}
                    onChangeText={setAddress}
                  />
                </View>

                {/* Emergency contact name & number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Emergency contact name & number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Sarah Evans (Daughter) - 07987 654321"
                    placeholderTextColor="#94A3B8"
                    value={emergencyContact}
                    onChangeText={setEmergencyContact}
                  />
                </View>
              </View>
            )}

            {/* ─── Send verification code Button ─── */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={handleRegister}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Register">
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Register</Text>
                )}
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OnboardingColors.screenBg,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
    color: OnboardingColors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 28,
  },
  titleBlock: {
    marginBottom: 20,
  },
  title: {
    fontSize: 27,
    fontWeight: '900',
    color: OnboardingColors.textHeading,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: OnboardingColors.textSecondary,
    marginTop: 4,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
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
    color: OnboardingColors.textHeading,
  },
  input: {
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    fontSize: 15,
    color: OnboardingColors.textHeading,
    fontWeight: '500',
  },
  uploadBox: {
    height: 110,
    borderRadius: 14,
    backgroundColor: '#DBEAFE',
    borderWidth: 1.5,
    borderColor: OnboardingColors.primary,
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
    color: OnboardingColors.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  availabilityGrid: {
    gap: 10,
    marginTop: 2,
  },
  availabilityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  chip: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: OnboardingColors.primary,
  },
  chipUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '700',
  },
  chipTextSelected: {
    color: '#FFFFFF',
  },
  chipTextUnselected: {
    color: OnboardingColors.primary,
  },
  buttonContainer: {
    marginTop: 22,
  },
  primaryButton: {
    height: 52,
    backgroundColor: OnboardingColors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: OnboardingColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: OnboardingColors.primaryDark,
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
