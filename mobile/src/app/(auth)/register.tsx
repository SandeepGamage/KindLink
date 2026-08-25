/**
 * (auth)/register.tsx
 *
 * KindLink Sign Up Screen (Elderly member sign up & Volunteer Sign Up)
 * Premium, accessible, high-contrast design tailored for both Elderly seniors and Volunteers:
 * - Soothing soft ice-blue surface background (#F4F7FA)
 * - Structured section cards with crisp borders and subtle shadows
 * - Clear SVG iconography for every input field
 * - High-contrast readable typography
 * - Multi-select Care Preferences & Needs picker with custom Other option
 * - Interactive dashed upload box for volunteer verification
 * - Pill chips for volunteer availability
 * - 54px Royal Blue "Continue to Password Setup" CTA
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

import {
  RoleElderlyIcon,
  RoleVolunteerIcon,
  DocumentUploadIcon,
} from '@/components/ui/onboarding-icons';
import {
  UserProfileIcon,
  EmergencyPhoneIcon,
  HomePinIcon,
  MailOutlineIcon,
  CalendarBirthdayIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
} from '@/components/ui/profile-icons';
import { CareNeedsPicker } from '@/components/profile/care-needs-picker';
import { Palette, FunctionalColors } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const { role = 'elderly' } = useLocalSearchParams<{ role?: string }>();
  const isVolunteer = role === 'volunteer';

  // Form states
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');
  const [selectedCareNeeds, setSelectedCareNeeds] = useState<string[]>([]);
  const [idDocumentName, setIdDocumentName] = useState<string | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([
    'Weekends',
    'Flexible',
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Field focus states for visual feedback
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const toggleAvailability = (opt: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt],
    );
  };

  const handleDocumentPick = () => {
    Alert.alert(
      'Upload ID Document',
      'Select a document to upload for volunteer verification.',
      [
        {
          text: 'Upload Student_ID.pdf',
          onPress: () => setIdDocumentName('Student_ID_Card.pdf (Attached)'),
        },
        {
          text: 'Upload National_ID.jpg',
          onPress: () => setIdDocumentName('National_Identity_Card.jpg (Attached)'),
        },
        {
          text: 'Upload Driving_Licence.png',
          onPress: () => setIdDocumentName('Driving_Licence.png (Attached)'),
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
        mobile: mobile.trim() || '',
        address: address.trim() || '',
        emergencyContact: formattedEmergencyContact,
        emergencyContactName: emergencyContactName.trim() || '',
        emergencyContactNumber: emergencyContactNumber.trim() || '',
        careNeeds: JSON.stringify(isVolunteer ? [] : selectedCareNeeds),
        idDocument: idDocumentName || '',
        availability: JSON.stringify(isVolunteer ? selectedAvailability : []),
      },
    });
  }, [
    fullName,
    email,
    age,
    mobile,
    address,
    emergencyContactName,
    emergencyContactNumber,
    selectedCareNeeds,
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
          
          {/* ─── Top Header: Back Button ─── */}
          <View style={styles.topHeader}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
              style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
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

            {/* ─── Persona Header Card ─── */}
            <View style={styles.personaCard}>
              <View style={styles.personaIconBox}>
                {isVolunteer ? (
                  <RoleVolunteerIcon size={26} color="#FFFFFF" />
                ) : (
                  <RoleElderlyIcon size={26} color="#FFFFFF" />
                )}
              </View>
              <View style={styles.personaTextCol}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>Step 1 of 2 • Profile Setup</Text>
                </View>
                <Text style={styles.personaTitle}>
                  {isVolunteer ? 'Volunteer Sign Up' : 'Elderly Member Sign Up'}
                </Text>
                <Text style={styles.personaSub}>
                  {isVolunteer
                    ? 'Join as a verified helper to support local seniors'
                    : 'Tell us about yourself so volunteers can assist you'}
                </Text>
              </View>
            </View>

            {/* Error Banner */}
            {!!errorMessage && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            )}

            {/* ─── Form Fields ─── */}
            {isVolunteer ? (
              /* ══════════════════════════════════════════════════ */
              /* VOLUNTEER REGISTRATION FORM                        */
              /* ══════════════════════════════════════════════════ */
              <View style={styles.formContainer}>
                {/* Section 1: Basic Details */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>👤 Volunteer Information</Text>

                  {/* Full name */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <UserProfileIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>
                        Full Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'fullName' && styles.inputFocused,
                      ]}
                      placeholder="e.g. David Miller"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={fullName}
                      onChangeText={(text) => {
                        setFullName(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <MailOutlineIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>
                        Email Address <Text style={styles.requiredStar}>*</Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'email' && styles.inputFocused,
                      ]}
                      placeholder="e.g. david.miller@example.com"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Phone / Mobile */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <EmergencyPhoneIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>Mobile Phone Number</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'mobile' && styles.inputFocused,
                      ]}
                      placeholder="e.g. 07987 654321"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={mobile}
                      onChangeText={setMobile}
                      onFocus={() => setFocusedField('mobile')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                {/* Section 2: Verification Document */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>🛡️ Identity Verification</Text>
                  <Text style={styles.cardSectionSub}>
                    Upload your student card, driving licence, or national ID for safety checks:
                  </Text>

                  <Pressable
                    style={({ pressed }) => [
                      styles.uploadBox,
                      idDocumentName ? styles.uploadBoxDone : null,
                      pressed && styles.uploadBoxPressed,
                    ]}
                    onPress={handleDocumentPick}
                    accessibilityRole="button"
                    accessibilityLabel="Upload ID document">
                    {idDocumentName ? (
                      <View style={styles.uploadDoneContent}>
                        <CheckCircleIcon size={32} color="#10B981" />
                        <Text style={styles.uploadDoneText}>{idDocumentName}</Text>
                        <Text style={styles.uploadChangeText}>Tap to change document</Text>
                      </View>
                    ) : (
                      <View style={styles.uploadPendingContent}>
                        <DocumentUploadIcon size={32} color={Palette.secondary} />
                        <Text style={styles.uploadTitle}>Tap to select ID Document</Text>
                        <Text style={styles.uploadSub}>PDF, JPG, or PNG accepted</Text>
                      </View>
                    )}
                  </Pressable>
                </View>

                {/* Section 3: Availability */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>⏰ Helper Availability</Text>
                  <Text style={styles.cardSectionSub}>
                    Select times you are generally free to assist seniors:
                  </Text>

                  <View style={styles.availabilityChipsGrid}>
                    {[
                      'Weekends',
                      'Mornings',
                      'Afternoons',
                      'Evenings',
                      'Flexible',
                    ].map((opt) => {
                      const isSelected = selectedAvailability.includes(opt);
                      return (
                        <Pressable
                          key={opt}
                          style={({ pressed }) => [
                            styles.availChip,
                            isSelected
                              ? styles.availChipSelected
                              : styles.availChipUnselected,
                            pressed && styles.availChipPressed,
                          ]}
                          onPress={() => toggleAvailability(opt)}
                          accessibilityRole="checkbox"
                          accessibilityState={{ checked: isSelected }}
                          accessibilityLabel={opt}>
                          <Text
                            style={[
                              styles.availChipText,
                              isSelected
                                ? styles.availChipTextSelected
                                : styles.availChipTextUnselected,
                            ]}>
                            {isSelected ? '✓ ' : '+ '}
                            {opt}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>

                {/* Safety Guarantee Notice */}
                <View style={styles.trustBadge}>
                  <ShieldCheckIcon size={20} color={Palette.secondary} />
                  <Text style={styles.trustBadgeText}>
                    KindLink safeguards all members. Helper IDs are securely reviewed to ensure trusted community care.
                  </Text>
                </View>
              </View>
            ) : (
              /* ══════════════════════════════════════════════════ */
              /* ELDERLY MEMBER REGISTRATION FORM                   */
              /* ══════════════════════════════════════════════════ */
              <View style={styles.formContainer}>
                {/* Section 1: Personal Details */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>👤 Personal Information</Text>

                  {/* Full name */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <UserProfileIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>
                        Full Name <Text style={styles.requiredStar}>*</Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'fullName' && styles.inputFocused,
                      ]}
                      placeholder="e.g. Margaret Evans"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={fullName}
                      onChangeText={(text) => {
                        setFullName(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField('fullName')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Age */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <CalendarBirthdayIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>Age (Years)</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'age' && styles.inputFocused,
                      ]}
                      placeholder="e.g. 74"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={age}
                      onChangeText={setAge}
                      onFocus={() => setFocusedField('age')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="numeric"
                      maxLength={3}
                    />
                  </View>

                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <MailOutlineIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>
                        Email Address <Text style={styles.requiredStar}>*</Text>
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'email' && styles.inputFocused,
                      ]}
                      placeholder="e.g. margaret.evans@example.com"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      onFocus={() => setFocusedField('email')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>

                  {/* Home address */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <HomePinIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>Home Address</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'address' && styles.inputFocused,
                      ]}
                      placeholder="e.g. 14 High Street, Bristol, BS1 4DJ"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={address}
                      onChangeText={setAddress}
                      onFocus={() => setFocusedField('address')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </View>
                </View>

                {/* Section 2: Care Preferences & Needs */}
                <View style={styles.cardSection}>
                  <CareNeedsPicker
                    selectedNeeds={selectedCareNeeds}
                    onChangeNeeds={setSelectedCareNeeds}
                  />
                </View>

                {/* Section 3: Family Member & Emergency Contacts */}
                <View style={styles.cardSection}>
                  <Text style={styles.cardSectionTitle}>📞 Family & Emergency Contact</Text>
                  <Text style={styles.cardSectionSub}>
                    Person to contact in case of emergency or special assistance:
                  </Text>

                  {/* Emergency contact name */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <UserProfileIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>Emergency Contact Name</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'eName' && styles.inputFocused,
                      ]}
                      placeholder="e.g. Sarah Evans (Daughter)"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={emergencyContactName}
                      onChangeText={setEmergencyContactName}
                      onFocus={() => setFocusedField('eName')}
                      onBlur={() => setFocusedField(null)}
                      autoCapitalize="words"
                    />
                  </View>

                  {/* Emergency contact phone number */}
                  <View style={styles.inputGroup}>
                    <View style={styles.labelRow}>
                      <EmergencyPhoneIcon size={18} color={Palette.secondary} />
                      <Text style={styles.label}>Emergency Contact Phone Number</Text>
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        focusedField === 'eNum' && styles.inputFocused,
                      ]}
                      placeholder="e.g. 07987 654321"
                      placeholderTextColor={FunctionalColors.textMuted}
                      value={emergencyContactNumber}
                      onChangeText={setEmergencyContactNumber}
                      onFocus={() => setFocusedField('eNum')}
                      onBlur={() => setFocusedField(null)}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            )}

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
                  <Text style={styles.primaryButtonText}>Continue to Password Setup →</Text>
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
    backgroundColor: Palette.surface,
  },
  safeArea: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonPressed: {
    opacity: 0.7,
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
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Palette.border,
    padding: 16,
    marginBottom: 18,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  personaIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaTextCol: {
    flex: 1,
  },
  stepBadge: {
    alignSelf: 'flex-start',
    backgroundColor: Palette.blueTint,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 4,
  },
  stepBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: Palette.secondary,
    letterSpacing: -0.2,
  },
  personaTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: Palette.ink,
    letterSpacing: -0.3,
  },
  personaSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  errorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: FunctionalColors.danger,
  },
  errorText: {
    color: FunctionalColors.dangerText,
    fontSize: 13.5,
    fontWeight: '700',
    lineHeight: 18,
  },
  formContainer: {
    gap: 16,
  },
  cardSection: {
    backgroundColor: Palette.primary,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: Palette.border,
    padding: 16,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 5,
      },
      android: { elevation: 1 },
    }),
  },
  cardSectionTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: Palette.ink,
    letterSpacing: -0.2,
  },
  cardSectionSub: {
    fontSize: 12.5,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    marginTop: -6,
    lineHeight: 17,
  },
  inputGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
    letterSpacing: -0.1,
  },
  requiredStar: {
    color: FunctionalColors.danger,
    fontSize: 14,
    fontWeight: '700',
  },
  input: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
    paddingHorizontal: 16,
    fontSize: 15,
    color: Palette.ink,
    fontWeight: '600',
  },
  inputFocused: {
    borderColor: Palette.secondary,
    backgroundColor: Palette.primary,
    borderWidth: 1.8,
  },
  uploadBox: {
    minHeight: 110,
    borderRadius: 16,
    backgroundColor: Palette.blueTint,
    borderWidth: 1.8,
    borderColor: Palette.secondary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  uploadBoxDone: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderStyle: 'solid',
  },
  uploadBoxPressed: {
    opacity: 0.85,
  },
  uploadPendingContent: {
    alignItems: 'center',
    gap: 6,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.secondary,
  },
  uploadSub: {
    fontSize: 12,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
  },
  uploadDoneContent: {
    alignItems: 'center',
    gap: 4,
  },
  uploadDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#047857',
  },
  uploadChangeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.secondary,
    textDecorationLine: 'underline',
  },
  availabilityChipsGrid: {
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
  availChipSelected: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  availChipUnselected: {
    backgroundColor: Palette.blueTint,
    borderColor: Palette.border,
  },
  availChipPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  availChipText: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  availChipTextSelected: {
    color: '#FFFFFF',
  },
  availChipTextUnselected: {
    color: Palette.secondary,
  },
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.blueTint,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 12,
    gap: 10,
  },
  trustBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.secondary,
    flex: 1,
    lineHeight: 16,
  },
  bottomContainer: {
    marginTop: 20,
    paddingBottom: 16,
  },
  primaryButton: {
    width: '100%',
    height: 54,
    backgroundColor: Palette.secondary,
    borderRadius: 16,
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
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
});
