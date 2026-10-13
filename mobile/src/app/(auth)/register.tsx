/**
 * (auth)/register.tsx
 *
 * KindLink Multi-Step Registration Screen (Steps 2, 3, 4 of 5)
 * Fully aligned with the design mockups:
 * - Step 2 (Image 4): "Tell us about yourself" (Full name *, Email *, Mobile *)
 * - Step 3 (Image 1): "Verify your identity" (Photo ID upload card with dashed border)
 * - Step 4 (Image 2): "When can you help?" (Availability schedule options with checkmarks)
 * - Step 3 & 4 also gracefully support Elderly members (care needs, address, emergency contact)
 * - Complete validation with toast messages matching profile editing standards
 * - Top back buttons, 5-bar progress indicators, info banners, continue button & footers
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Platform,
  StatusBar,
  ScrollView,
  Modal,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';
import { AppText as Text } from '@/components/ui/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Image } from 'expo-image';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  FileText,
  Clock,
  Heart,
  Check,
  MapPin,
  Calendar,
  X,
  Camera,
  ChevronDown,
  Image as ImageIcon,
} from 'lucide-react-native';

import {
  SignupStepHeader,
  SignupSectionTitle,
  SignupInfoBanner,
  SignupPrimaryButton,
  SignupFooterNote,
} from '@/components/auth/signup-wizard-ui';
import { CareNeedsPicker } from '@/components/profile/care-needs-picker';
import { ProfilePhotoField } from '@/components/profile/profile-photo-field';
import { IdDocumentField } from '@/components/auth/id-document-field';
import { KeyboardAwareScrollView } from '@/components/ui/keyboard-aware-scroll-view';
import { useSignup } from '@/context/signup-context';
import { useToast } from '@/context/toast-context';
import { useFontSize } from '@/context/font-size-context';
import { Palette, FunctionalColors } from '@/constants/theme';
import {
  validateEmailAddress,
  validateFullName,
  validateMobileNumber,
  validateAge,
  validateAddress,
  validateEmergencyName,
  validateEmergencyPhone,
} from '@/utils/validation';

const AVAILABILITY_OPTIONS = [
  'Weekday mornings',
  'Weekday afternoons',
  'Evenings',
  'Weekends',
  'Flexible',
];

const CONTACT_PERSON_OPTIONS = [
  'Wife',
  'Husband',
  'Daughter',
  'Son',
  'Another person',
] as const;

type ContactPersonOption = (typeof CONTACT_PERSON_OPTIONS)[number];

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { fontSizeMode, setFontSizeMode } = useFontSize();
  const { idDocument, setDraft } = useSignup();

  const { role = 'volunteer' } = useLocalSearchParams<{ role?: string }>();
  const isVolunteer = role === 'volunteer';

  // Current wizard step in register (2, 3, or 4)
  const [currentStep, setCurrentStep] = useState<2 | 3 | 4>(2);

  // Form State: Step 2 (Personal Info)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');

  // Form State: Volunteer Step 4 (Availability)
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>(['Weekends']);

  // Form State: Elderly specific fields
  const [age, setAge] = useState('');
  const [address, setAddress] = useState('');
  const [selectedCareNeeds, setSelectedCareNeeds] = useState<string[]>([]);
  const [contactPerson, setContactPerson] = useState<ContactPersonOption>('Another person');
  const [isContactDropdownOpen, setIsContactDropdownOpen] = useState(false);
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactNumber, setEmergencyContactNumber] = useState('');

  // Field focus states
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Field error states for inline feedback
  const [fullNameError, setFullNameError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [mobileError, setMobileError] = useState<string | null>(null);
  const [ageError, setAgeError] = useState<string | null>(null);
  const [addressError, setAddressError] = useState<string | null>(null);
  const [emergencyContactNameError, setEmergencyContactNameError] = useState<string | null>(null);
  const [emergencyContactNumberError, setEmergencyContactNumberError] = useState<string | null>(null);

  // Preview modal for uploaded ID document
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Navigation & Step Control
  // ---------------------------------------------------------------------------

  const handleBack = useCallback(() => {
    if (currentStep === 2) {
      router.back();
    } else if (currentStep === 3) {
      setCurrentStep(2);
    } else if (currentStep === 4) {
      setCurrentStep(3);
    }
  }, [currentStep, router]);

  // Toggle availability options (Step 4 for volunteers)
  const toggleAvailability = (opt: string) => {
    setSelectedAvailability((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt],
    );
  };

  // ---------------------------------------------------------------------------
  // Validations
  // ---------------------------------------------------------------------------

  const validateStep2 = (): boolean => {
    // 1. Name validation
    const nameErr = validateFullName(fullName);
    if (nameErr) {
      setFullNameError(nameErr);
      showToast(nameErr, { type: 'error' });
      return false;
    }

    // 2. Age validation (elderly: optional, but if entered must be 40-120)
    if (!isVolunteer && age.trim()) {
      const aErr = validateAge(age, true);
      if (aErr) {
        setAgeError(aErr);
        showToast(aErr, { type: 'error' });
        return false;
      }
    }

    // 3. Email validation
    const emailErr = validateEmailAddress(email);
    if (emailErr) {
      setEmailError(emailErr);
      showToast(emailErr, { type: 'error' });
      return false;
    }

    // 4. Mobile validation
    const mobileErr = validateMobileNumber(mobile);
    if (mobileErr) {
      setMobileError(mobileErr);
      showToast(mobileErr, { type: 'error' });
      return false;
    }

    // 5. Address validation (elderly: optional, but if entered must be valid length)
    if (!isVolunteer && address.trim()) {
      const addrErr = validateAddress(address);
      if (addrErr) {
        setAddressError(addrErr);
        showToast(addrErr, { type: 'error' });
        return false;
      }
    }

    setFullNameError(null);
    setAgeError(null);
    setEmailError(null);
    setMobileError(null);
    setAddressError(null);
    return true;
  };

  const validateStep3 = (): boolean => {
    if (isVolunteer) {
      if (!idDocument.localUri && !idDocument.uri) {
        showToast('Please upload a photo of your ID document to continue.', { type: 'error' });
        return false;
      }
      return true;
    }

    return true;
  };

  const validateStep4 = (): boolean => {
    if (isVolunteer) {
      if (selectedAvailability.length === 0) {
        showToast('Please select at least one availability schedule option.', { type: 'error' });
        return false;
      }
      return true;
    }

    // Elderly Step 4: Emergency contact validations
    const eNameErr = validateEmergencyName(emergencyContactName);
    if (eNameErr) {
      setEmergencyContactNameError(eNameErr);
      showToast(eNameErr, { type: 'error' });
      return false;
    }

    const ePhoneErr = validateEmergencyPhone(emergencyContactNumber);
    if (ePhoneErr) {
      setEmergencyContactNumberError(ePhoneErr);
      showToast(ePhoneErr, { type: 'error' });
      return false;
    }

    setEmergencyContactNameError(null);
    setEmergencyContactNumberError(null);
    return true;
  };

  // ---------------------------------------------------------------------------
  // Step Progression Handler
  // ---------------------------------------------------------------------------

  const handleContinue = useCallback(() => {
    if (currentStep === 2) {
      if (!validateStep2()) return;
      setCurrentStep(3);
      return;
    }

    if (currentStep === 3) {
      if (!validateStep3()) return;
      setCurrentStep(4);
      return;
    }

    if (currentStep === 4) {
      if (!validateStep4()) return;

      const formattedEmergencyContact =
        emergencyContactName.trim() && emergencyContactNumber.trim()
          ? `${emergencyContactName.trim()} (${contactPerson}) - ${emergencyContactNumber.trim()}`
          : emergencyContactName.trim() || emergencyContactNumber.trim() || '';

      // Commit draft to context
      setDraft({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        role: isVolunteer ? 'volunteer' : 'elderly',
        age: age.trim() || '',
        mobile: mobile.trim(),
        address: address.trim() || '',
        emergencyContact: isVolunteer ? '' : formattedEmergencyContact,
        emergencyContactName: isVolunteer ? '' : emergencyContactName.trim(),
        emergencyContactNumber: isVolunteer ? '' : emergencyContactNumber.trim(),
        careNeeds: isVolunteer ? [] : selectedCareNeeds,
        idDocument: '',
        availability: isVolunteer ? selectedAvailability : [],
      });

      router.push('/(auth)/set-password');
    }
  }, [
    currentStep,
    fullName,
    email,
    mobile,
    age,
    address,
    selectedCareNeeds,
    contactPerson,
    emergencyContactName,
    emergencyContactNumber,
    isVolunteer,
    idDocument.localUri,
    idDocument.uri,
    selectedAvailability,
    setDraft,
    router,
  ]);

  // ---------------------------------------------------------------------------
  // Render Step 2: "Tell us about yourself" (Image 1 for elderly, Image 4 for volunteer)
  // ---------------------------------------------------------------------------

  const renderStep2 = () => (
    <View>
      <SignupSectionTitle
        icon={<User size={24} color={Palette.secondary} strokeWidth={2.4} />}
        title="Tell us about yourself"
        subtitle="Only the basics for now. You can add more later."
      />

      {/* Form Card */}
      <View style={styles.formCard}>
        {/* Full Name */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <User size={16} color={Palette.secondary} strokeWidth={2.4} />
            <Text style={styles.label}>
              Full name <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedField === 'fullName' && styles.inputFocused,
              !!fullNameError && styles.inputError,
            ]}
            placeholder={isVolunteer ? 'e.g. David Miller' : 'e.g. Margaret Evans'}
            placeholderTextColor="#8E9CAE"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) setFullNameError(null);
            }}
            onFocus={() => setFocusedField('fullName')}
            onBlur={() => {
              setFocusedField(null);
              if (fullName.trim()) {
                setFullNameError(validateFullName(fullName));
              }
            }}
            autoCapitalize="words"
            returnKeyType="next"
          />
          {!!fullNameError && (
            <Text style={styles.fieldErrorText}>⚠️ {fullNameError}</Text>
          )}
        </View>

        {/* Age (Heart icon) - Elderly Flow */}
        {!isVolunteer && (
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Heart size={16} color={Palette.secondary} strokeWidth={2.4} />
              <Text style={styles.label}>Age</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedField === 'age' && styles.inputFocused,
                !!ageError && styles.inputError,
              ]}
              placeholder="e.g. 74"
              placeholderTextColor="#8E9CAE"
              value={age}
              onChangeText={(text) => {
                setAge(text);
                if (ageError) setAgeError(null);
              }}
              onFocus={() => setFocusedField('age')}
              onBlur={() => {
                setFocusedField(null);
                if (age.trim()) {
                  setAgeError(validateAge(age, true));
                }
              }}
              keyboardType="numeric"
              maxLength={3}
              returnKeyType="next"
            />
            {!!ageError && (
              <Text style={styles.fieldErrorText}>⚠️ {ageError}</Text>
            )}
          </View>
        )}

        {/* Email Address */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Mail size={16} color={Palette.secondary} strokeWidth={2.4} />
            <Text style={styles.label}>
              Email address <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedField === 'email' && styles.inputFocused,
              !!emailError && styles.inputError,
            ]}
            placeholder="yourname@example.com"
            placeholderTextColor="#8E9CAE"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError(null);
            }}
            onFocus={() => setFocusedField('email')}
            onBlur={() => {
              setFocusedField(null);
              if (email.trim()) {
                setEmailError(validateEmailAddress(email));
              }
            }}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
          {!!emailError && (
            <Text style={styles.fieldErrorText}>⚠️ {emailError}</Text>
          )}
        </View>

        {/* Mobile Number */}
        <View style={styles.inputGroup}>
          <View style={styles.labelRow}>
            <Phone size={16} color={Palette.secondary} strokeWidth={2.4} />
            <Text style={styles.label}>
              Mobile number <Text style={styles.requiredStar}>*</Text>
            </Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedField === 'mobile' && styles.inputFocused,
              !!mobileError && styles.inputError,
            ]}
            placeholder="e.g. 077 123 4567"
            placeholderTextColor="#8E9CAE"
            value={mobile}
            onChangeText={(text) => {
              setMobile(text);
              if (mobileError) setMobileError(null);
            }}
            onFocus={() => setFocusedField('mobile')}
            onBlur={() => {
              setFocusedField(null);
              if (mobile.trim()) {
                setMobileError(validateMobileNumber(mobile));
              }
            }}
            keyboardType="phone-pad"
            returnKeyType={isVolunteer ? 'done' : 'next'}
          />
          {!!mobileError && (
            <Text style={styles.fieldErrorText}>⚠️ {mobileError}</Text>
          )}
        </View>

        {/* Home address (MapPin icon) - Elderly Flow */}
        {!isVolunteer && (
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <MapPin size={16} color={Palette.secondary} strokeWidth={2.4} />
              <Text style={styles.label}>Home address</Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedField === 'address' && styles.inputFocused,
                !!addressError && styles.inputError,
              ]}
              placeholder="Street and town"
              placeholderTextColor="#8E9CAE"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                if (addressError) setAddressError(null);
              }}
              onFocus={() => setFocusedField('address')}
              onBlur={() => {
                setFocusedField(null);
                if (address.trim()) {
                  setAddressError(validateAddress(address));
                }
              }}
              autoCapitalize="words"
              returnKeyType="done"
            />
            {!!addressError && (
              <Text style={styles.fieldErrorText}>⚠️ {addressError}</Text>
            )}
          </View>
        )}
      </View>

      {/* Info Banner */}
      <SignupInfoBanner
        text="Your personal information is encrypted and only shared when needed for your care."
        variant="blue"
      />
    </View>
  );

  // ---------------------------------------------------------------------------
  // Render Step 3: Volunteer ID Upload OR Elderly Care Preferences
  // ---------------------------------------------------------------------------

  const renderStep3 = () => {
    if (isVolunteer) {
      const hasDoc = !!idDocument.uri || !!idDocument.localUri;

      return (
        <View>
          <SignupSectionTitle
            icon={<ShieldCheck size={24} color={Palette.secondary} strokeWidth={2.4} />}
            title="Verify your identity"
            subtitle="This helps elderly members feel safe when accepting support."
          />

          {/* Upload Card with Dashed Border */}
          <View style={styles.dashedUploadCard}>
            <View style={styles.uploadIconCircle}>
              <FileText size={26} color={Palette.secondary} strokeWidth={2.2} />
            </View>

            <Text style={styles.uploadCardTitle}>Upload a photo ID</Text>
            <Text style={styles.uploadCardSubtitle}>
              National ID, driving licence, or another government-issued document
            </Text>

            {hasDoc ? (
              <View style={styles.attachedDocBox}>
                <View style={styles.attachedHeader}>
                  <View style={styles.attachedBadge}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    <Text style={styles.attachedBadgeText}>ID Document Attached</Text>
                  </View>
                  <Pressable
                    onPress={() => setIsPreviewOpen(true)}
                    hitSlop={8}
                    style={styles.inspectBtn}>
                    <Text style={styles.inspectBtnText}>View photo</Text>
                  </Pressable>
                </View>

                <Text style={styles.attachedFileName} numberOfLines={1} ellipsizeMode="middle">
                  {idDocument.fileName || 'National_Identity_Card.jpg'}
                </Text>

                <View style={styles.attachedActionsRow}>
                  <Pressable
                    style={styles.changeDocBtn}
                    onPress={idDocument.chooseFromLibrary}
                    disabled={idDocument.busy}>
                    <Text style={styles.changeDocBtnText}>Change</Text>
                  </Pressable>
                  <Pressable
                    style={styles.removeDocBtn}
                    onPress={idDocument.removeDocument}
                    disabled={idDocument.busy}>
                    <Text style={styles.removeDocBtnText}>Remove</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                style={({ pressed }) => [
                  styles.chooseDeviceBtn,
                  pressed && styles.chooseDeviceBtnPressed,
                  idDocument.busy && styles.chooseDeviceBtnDisabled,
                ]}
                onPress={idDocument.chooseFromLibrary}
                disabled={idDocument.busy}>
                {idDocument.busy ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.chooseDeviceBtnText}>Choose from device</Text>
                )}
              </Pressable>
            )}
          </View>

          {/* Info Banner */}
          <SignupInfoBanner
            text="Your document is securely reviewed and is never shown publicly."
            variant="blue"
          />
        </View>
      );
    }

    // Elderly Step 3: Choose your text size (Matches user mockup 3 of 5)
    return (
      <View>
        <SignupSectionTitle
          icon={<Text style={styles.aaSectionIconText}>Aa</Text>}
          title="Choose your text size"
          subtitle="Select whichever option is easiest for you to read. You can change it later."
        />

        {/* Option 1: Standard text */}
        <Pressable
          style={({ pressed }) => [
            styles.textSizeCard,
            fontSizeMode !== 'large' && styles.textSizeCardSelected,
            pressed && styles.textSizeCardPressed,
          ]}
          onPress={() => setFontSizeMode('normal')}
          accessibilityRole="radio"
          accessibilityState={{ checked: fontSizeMode !== 'large' }}
          accessibilityLabel="Standard text">
          <View style={styles.textSizeCardHeader}>
            <Text style={styles.textSizeCardTitle}>Standard text</Text>
            {fontSizeMode !== 'large' && (
              <View style={styles.textSizeCheckCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3.2} />
              </View>
            )}
          </View>
          <Text style={styles.textSizeCardPreviewStandard} allowScaling={false}>
            KindLink makes everyday support simple.
          </Text>
        </Pressable>

        {/* Option 2: Larger text (+20%) */}
        <Pressable
          style={({ pressed }) => [
            styles.textSizeCard,
            fontSizeMode === 'large' && styles.textSizeCardSelected,
            pressed && styles.textSizeCardPressed,
          ]}
          onPress={() => setFontSizeMode('large')}
          accessibilityRole="radio"
          accessibilityState={{ checked: fontSizeMode === 'large' }}
          accessibilityLabel="Larger text (+20%)">
          <View style={styles.textSizeCardHeader}>
            <Text style={styles.textSizeCardTitle}>Larger text (+20%)</Text>
            {fontSizeMode === 'large' && (
              <View style={styles.textSizeCheckCircle}>
                <Check size={14} color="#FFFFFF" strokeWidth={3.2} />
              </View>
            )}
          </View>
          <Text style={styles.textSizeCardPreviewLarge} allowScaling={false}>
            KindLink makes everyday support simple.
          </Text>
        </Pressable>

        {/* Info Banner */}
        <View style={styles.textSizeInfoBanner}>
          <Text style={styles.textSizeInfoTitle}>Your choice applies immediately</Text>
          <Text style={styles.textSizeInfoDesc}>
            Choosing larger text increases the app text by 20% throughout registration.
          </Text>
        </View>
      </View>
    );
  };

  // ---------------------------------------------------------------------------
  // Render Step 4: Volunteer Availability OR Elderly Emergency Contact (Image 2)
  // ---------------------------------------------------------------------------

  const renderStep4 = () => {
    if (isVolunteer) {
      return (
        <View>
          <SignupSectionTitle
            icon={<Clock size={24} color={Palette.secondary} strokeWidth={2.4} />}
            title="When can you help?"
            subtitle="Choose the times you are generally available. You stay in control of every request."
          />

          {/* Options Card */}
          <View style={styles.optionsCard}>
            {AVAILABILITY_OPTIONS.map((opt) => {
              const isSelected = selectedAvailability.includes(opt);

              return (
                <Pressable
                  key={opt}
                  style={({ pressed }) => [
                    styles.availRow,
                    isSelected ? styles.availRowSelected : styles.availRowUnselected,
                    pressed && styles.availRowPressed,
                  ]}
                  onPress={() => toggleAvailability(opt)}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={opt}>
                  <Text
                    style={[
                      styles.availText,
                      isSelected ? styles.availTextSelected : styles.availTextUnselected,
                    ]}>
                    {opt}
                  </Text>

                  {isSelected ? (
                    <View style={styles.checkedCircle}>
                      <Check size={14} color="#FFFFFF" strokeWidth={3} />
                    </View>
                  ) : (
                    <View style={styles.uncheckCircle} />
                  )}
                </Pressable>
              );
            })}
          </View>

          {/* Peach Info Banner */}
          <SignupInfoBanner
            text="You can update your availability or pause volunteering at any time."
            variant="peach"
          />
        </View>
      );
    }

    // Elderly Step 4: Emergency Contact (Matches Image 2 exactly)
    return (
      <View>
        <SignupSectionTitle
          icon={<Heart size={24} color={Palette.secondary} strokeWidth={2.4} />}
          title="Emergency contact"
          subtitle="Tell us who we should contact if needed."
        />

        <View style={styles.formCard}>
          {/* Inner Emergency Contact Header Banner */}
          <View style={styles.emergencySubCard}>
            <View style={styles.emergencyPeachIcon}>
              <Phone size={20} color="#C4742B" strokeWidth={2.2} />
            </View>
            <View style={styles.emergencySubCardText}>
              <Text style={styles.emergencySubCardTitle}>Emergency contact</Text>
              <Text style={styles.emergencySubCardSubtitle}>
                Choose a family member or add someone else
              </Text>
            </View>
          </View>

          {/* Contact Person Dropdown Selector */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contact person</Text>
            <Pressable
              style={styles.dropdownButton}
              onPress={() => setIsContactDropdownOpen(true)}
              accessibilityRole="button"
              accessibilityLabel={`Contact person: ${contactPerson}`}>
              <Text style={styles.dropdownButtonText}>{contactPerson}</Text>
              <ChevronDown size={20} color="#0F172A" strokeWidth={2.2} />
            </Pressable>
          </View>

          {/* Subtle separator */}
          <View style={styles.cardDivider} />

          {/* Full Name * */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <User size={16} color={Palette.secondary} strokeWidth={2.4} />
              <Text style={styles.label}>
                Full name <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedField === 'eName' && styles.inputFocused,
                !!emergencyContactNameError && styles.inputError,
              ]}
              placeholder="Contact person's name"
              placeholderTextColor="#8E9CAE"
              value={emergencyContactName}
              onChangeText={(text) => {
                setEmergencyContactName(text);
                if (emergencyContactNameError) setEmergencyContactNameError(null);
              }}
              onFocus={() => setFocusedField('eName')}
              onBlur={() => {
                setFocusedField(null);
                if (emergencyContactName.trim()) {
                  setEmergencyContactNameError(validateEmergencyName(emergencyContactName));
                }
              }}
              autoCapitalize="words"
              returnKeyType="next"
            />
            {!!emergencyContactNameError && (
              <Text style={styles.fieldErrorText}>⚠️ {emergencyContactNameError}</Text>
            )}
          </View>

          {/* Phone Number * */}
          <View style={styles.inputGroup}>
            <View style={styles.labelRow}>
              <Phone size={16} color={Palette.secondary} strokeWidth={2.4} />
              <Text style={styles.label}>
                Phone number <Text style={styles.requiredStar}>*</Text>
              </Text>
            </View>
            <TextInput
              style={[
                styles.input,
                focusedField === 'ePhone' && styles.inputFocused,
                !!emergencyContactNumberError && styles.inputError,
              ]}
              placeholder="e.g. 077 123 4567"
              placeholderTextColor="#8E9CAE"
              value={emergencyContactNumber}
              onChangeText={(text) => {
                setEmergencyContactNumber(text);
                if (emergencyContactNumberError) setEmergencyContactNumberError(null);
              }}
              onFocus={() => setFocusedField('ePhone')}
              onBlur={() => {
                setFocusedField(null);
                if (emergencyContactNumber.trim()) {
                  setEmergencyContactNumberError(validateEmergencyPhone(emergencyContactNumber));
                }
              }}
              keyboardType="phone-pad"
              returnKeyType="done"
            />
            {!!emergencyContactNumberError && (
              <Text style={styles.fieldErrorText}>⚠️ {emergencyContactNumberError}</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* Top Header with Progress Bar */}
      <SignupStepHeader
        currentStep={currentStep}
        totalSteps={5}
        onBack={handleBack}
      />

      <KeyboardAvoidingView
        style={styles.keyboardFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Wizard Step Content */}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
        </ScrollView>

        {/* Bottom Actions (Pinned at bottom) */}
        <View style={styles.bottomSection}>
          <SignupPrimaryButton label="Continue" onPress={handleContinue} />
          <SignupFooterNote />
        </View>
      </KeyboardAvoidingView>

      {/* Contact Person Selection Modal (Dropdown for Step 4) */}
      <Modal
        visible={isContactDropdownOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsContactDropdownOpen(false)}>
        <Pressable
          style={styles.dropdownModalBackdrop}
          onPress={() => setIsContactDropdownOpen(false)}>
          <View style={styles.dropdownModalBox}>
            <View style={styles.dropdownModalHeader}>
              <Text style={styles.dropdownModalTitle}>Contact person</Text>
              <Pressable
                onPress={() => setIsContactDropdownOpen(false)}
                hitSlop={8}
                style={styles.dropdownModalCloseBtn}>
                <X size={20} color="#0F172A" strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={styles.dropdownOptionsList}>
              {CONTACT_PERSON_OPTIONS.map((opt) => {
                const isSelected = contactPerson === opt;
                return (
                  <Pressable
                    key={opt}
                    style={[
                      styles.dropdownOptionRow,
                      isSelected && styles.dropdownOptionRowSelected,
                    ]}
                    onPress={() => {
                      setContactPerson(opt);
                      setIsContactDropdownOpen(false);
                    }}>
                    <Text
                      style={[
                        styles.dropdownOptionText,
                        isSelected && styles.dropdownOptionTextSelected,
                      ]}>
                      {opt}
                    </Text>
                    {isSelected && (
                      <View style={styles.dropdownOptionCheck}>
                        <Check size={14} color="#FFFFFF" strokeWidth={3} />
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Modal>

      {/* ID Document Preview Modal */}
      <Modal
        visible={isPreviewOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewOpen(false)}>
        <View style={styles.previewModalBackdrop}>
          <View style={styles.previewModalBox}>
            <View style={styles.previewModalHeader}>
              <Text style={styles.previewModalTitle}>Identity Document</Text>
              <Pressable
                onPress={() => setIsPreviewOpen(false)}
                hitSlop={10}
                style={styles.previewCloseBtn}>
                <X size={20} color="#0F172A" strokeWidth={2.4} />
              </Pressable>
            </View>

            {idDocument.uri ? (
              <Image
                source={{ uri: idDocument.uri }}
                style={styles.previewImage}
                contentFit="contain"
              />
            ) : null}

            <Pressable
              style={styles.previewDoneBtn}
              onPress={() => setIsPreviewOpen(false)}>
              <Text style={styles.previewDoneBtnText}>Close preview</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  keyboardFlex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // Form Card Container
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },

  // Input groups
  inputGroup: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  label: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  requiredStar: {
    color: '#D97706',
    fontWeight: '800',
  },
  input: {
    height: 50,
    backgroundColor: '#F3F6F9',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    fontSize: 15,
    color: '#0F172A',
  },
  inputFocused: {
    borderColor: Palette.secondary,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: FunctionalColors.danger,
    backgroundColor: '#FFF5F5',
  },
  fieldErrorText: {
    fontSize: 12.5,
    color: FunctionalColors.danger,
    marginTop: 2,
    marginLeft: 2,
    fontWeight: '600',
  },

  // Dashed Upload Card (Image 1)
  dashedUploadCard: {
    borderStyle: 'dashed',
    borderWidth: 1.6,
    borderColor: Palette.secondary,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  uploadIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  uploadCardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.secondary,
    letterSpacing: -0.2,
    textAlign: 'center',
  },
  uploadCardSubtitle: {
    fontSize: 13.5,
    color: '#55687C',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  chooseDeviceBtn: {
    marginTop: 18,
    backgroundColor: Palette.secondary,
    height: 44,
    paddingHorizontal: 26,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#174066',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  chooseDeviceBtnPressed: {
    opacity: 0.88,
  },
  chooseDeviceBtnDisabled: {
    opacity: 0.6,
  },
  chooseDeviceBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Attached Document Card
  attachedDocBox: {
    width: '100%',
    marginTop: 18,
    backgroundColor: '#F0F7FE',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CCE0F5',
    padding: 14,
    gap: 10,
  },
  attachedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  attachedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attachedBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  inspectBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inspectBtnText: {
    color: Palette.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  attachedFileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0F172A',
  },
  attachedActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  changeDocBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#CCE0F5',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  changeDocBtnText: {
    color: Palette.secondary,
    fontSize: 13.5,
    fontWeight: '700',
  },
  removeDocBtn: {
    flex: 1,
    height: 38,
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeDocBtnText: {
    color: '#B91C1C',
    fontSize: 13.5,
    fontWeight: '700',
  },

  // Availability Options Card (Image 2)
  optionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  availRow: {
    height: 52,
    borderRadius: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  availRowUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  availRowSelected: {
    backgroundColor: '#EBF4FC',
    borderWidth: 1.8,
    borderColor: Palette.secondary,
  },
  availRowPressed: {
    opacity: 0.9,
  },
  availText: {
    fontSize: 15.5,
    letterSpacing: -0.2,
  },
  availTextUnselected: {
    color: '#0F172A',
    fontWeight: '700',
  },
  availTextSelected: {
    color: '#0F172A',
    fontWeight: '800',
  },
  checkedCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uncheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.8,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },

  // Bottom Actions
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: Palette.surface,
  },

  // Preview Modal
  previewModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  previewModalBox: {
    width: '100%',
    maxHeight: '85%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    alignItems: 'center',
  },
  previewModalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  previewModalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0F172A',
  },
  previewCloseBtn: {
    padding: 4,
  },
  previewImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  previewDoneBtn: {
    marginTop: 16,
    width: '100%',
    height: 44,
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Emergency Sub-card (Image 2)
  emergencySubCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 4,
  },
  emergencyPeachIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3E7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencySubCardText: {
    flex: 1,
  },
  emergencySubCardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  emergencySubCardSubtitle: {
    fontSize: 13,
    color: '#55687C',
    marginTop: 2,
    lineHeight: 18,
  },

  // Dropdown Button
  dropdownButton: {
    height: 50,
    backgroundColor: '#F3F6F9',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#EDF2F7',
    marginVertical: 4,
  },

  // Dropdown Modal
  dropdownModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 22,
  },
  dropdownModalBox: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  dropdownModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownModalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  dropdownModalCloseBtn: {
    padding: 6,
  },
  dropdownOptionsList: {
    gap: 10,
  },
  dropdownOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
  },
  dropdownOptionRowSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: Palette.secondary,
  },
  dropdownOptionText: {
    fontSize: 15.5,
    fontWeight: '600',
    color: '#334155',
  },
  dropdownOptionTextSelected: {
    fontWeight: '800',
    color: Palette.secondary,
  },
  dropdownOptionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Choose your text size styles (Step 3 Image 1)
  aaSectionIconText: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.secondary,
    letterSpacing: -0.5,
  },
  textSizeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  textSizeCardSelected: {
    borderColor: Palette.secondary,
  },
  textSizeCardPressed: {
    opacity: 0.88,
  },
  textSizeCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textSizeCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  textSizeCheckCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textSizeCardPreviewStandard: {
    fontSize: 14.5,
    color: '#55687C',
    marginTop: 10,
    lineHeight: 21,
    fontWeight: '400',
  },
  textSizeCardPreviewLarge: {
    fontSize: 17.5,
    color: '#55687C',
    marginTop: 10,
    lineHeight: 25,
    fontWeight: '400',
  },
  textSizeInfoBanner: {
    backgroundColor: '#E4F0FB',
    borderRadius: 16,
    padding: 18,
    marginTop: 4,
  },
  textSizeInfoTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: Palette.secondary,
    letterSpacing: -0.2,
  },
  textSizeInfoDesc: {
    fontSize: 13.5,
    color: '#20517E',
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '400',
  },
});
