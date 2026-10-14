/**
 * (auth)/set-password.tsx
 *
 * KindLink Set Password Screen (Step 5 of 5)
 * Final step of the signup flow:
 * - Top header with Back button, "5 of 5" capsule badge, and 5 filled progress bars
 * - Bold "Set your password" section title
 * - Password input with 4 segmented strength indicator bars
 * - Confirm password input with real-time match indicator
 * - Password validation (length >= 8, uppercase + lowercase, number, special char)
 * - Toast messages for validation errors matching profile editing
 * - "Create account" primary button and safety footer note
 */

import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ScrollView,
} from 'react-native';
import { AppText as Text } from '@/components/ui/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Lock, Eye, EyeOff, Check, ShieldCheck } from 'lucide-react-native';

import {
  SignupStepHeader,
  SignupSectionTitle,
  SignupInfoBanner,
  SignupPrimaryButton,
  SignupFooterNote,
} from '@/components/auth/signup-wizard-ui';
import { useSignup } from '@/context/signup-context';
import { useToast } from '@/context/toast-context';
import { useFontSize } from '@/context/font-size-context';
import { authService, SignUpPayload } from '@/services/auth.service';
import { Palette, FunctionalColors } from '@/constants/theme';

export default function SetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();
  const { fontSizeMode } = useFontSize();
  const { draft, photo, idDocument, clear } = useSignup();
  const submitting = useRef(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  // -------------------------------------------------------------------------
  // Password Conditions Evaluation
  // -------------------------------------------------------------------------
  const conditions = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasMixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9\s]/.test(password),
    };
  }, [password]);

  // Total conditions met (0 to 4)
  const strengthScore = useMemo(() => {
    let score = 0;
    if (conditions.minLength) score++;
    if (conditions.hasMixedCase) score++;
    if (conditions.hasNumber) score++;
    if (conditions.hasSpecialChar) score++;
    return score;
  }, [conditions]);

  const strengthColor = useMemo(() => {
    switch (strengthScore) {
      case 1:
        return FunctionalColors.danger;
      case 2:
        return Palette.accent;
      case 3:
        return Palette.secondary;
      case 4:
        return FunctionalColors.success;
      default:
        return Palette.blueTint;
    }
  }, [strengthScore]);

  const strengthLabel = useMemo(() => {
    if (!password) return '';
    switch (strengthScore) {
      case 1:
        return 'Weak password';
      case 2:
        return 'Moderate';
      case 3:
        return 'Good';
      case 4:
        return 'Strong password';
      default:
        return '';
    }
  }, [password, strengthScore]);

  const isMatching = useMemo(() => {
    return confirmPassword.length > 0 && confirmPassword === password;
  }, [confirmPassword, password]);

  const isMismatch = useMemo(() => {
    return confirmPassword.length > 0 && confirmPassword !== password;
  }, [confirmPassword, password]);

  // -------------------------------------------------------------------------
  // Handlers
  // -------------------------------------------------------------------------
  const handleCreateAccount = useCallback(async () => {
    if (submitting.current || photo.busy || idDocument.busy) return;

    if (!draft) {
      showToast('Your signup session has expired. Please go back and enter your details.', {
        type: 'error',
      });
      return;
    }

    // 1. Password presence
    if (!password) {
      showToast('Please enter a password.', { type: 'error' });
      return;
    }

    // 2. Conditions check
    if (!conditions.minLength) {
      showToast('Password must be at least 8 characters long.', { type: 'error' });
      return;
    }
    if (!conditions.hasMixedCase) {
      showToast('Password must contain both uppercase and lowercase letters.', { type: 'error' });
      return;
    }
    if (!conditions.hasNumber) {
      showToast('Password must include at least one number.', { type: 'error' });
      return;
    }
    if (!conditions.hasSpecialChar) {
      showToast('Password must include at least one special character (!@#$%^&*).', {
        type: 'error',
      });
      return;
    }

    // 3. Confirmation check
    if (!confirmPassword) {
      showToast('Please re-enter your password to confirm.', { type: 'error' });
      return;
    }
    if (confirmPassword !== password) {
      showToast('Passwords do not match. Please verify and try again.', { type: 'error' });
      return;
    }

    // 4. Terms agreement check
    if (!agreedToTerms) {
      showToast('Please agree to the KindLink terms to create your account.', {
        type: 'error',
      });
      return;
    }

    setIsLoading(true);
    submitting.current = true;
    const payload: SignUpPayload = { ...draft, password };

    try {
      await authService.register(payload, undefined, {
        photoUri: photo.localUri || undefined,
        idDocumentUri: idDocument.localUri || undefined,
        persistSession: false,
      });

      const submittedEmail = payload.email;
      clear();
      showToast('Account created successfully!', { type: 'success' });
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: submittedEmail },
      } as any);
    } catch (err: unknown) {
      const msg =
        (err instanceof Error ? err.message : undefined) ??
        'Account creation failed. Please try again.';
      showToast(msg, { type: 'error' });
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  }, [
    password,
    confirmPassword,
    conditions,
    agreedToTerms,
    draft,
    photo,
    idDocument,
    clear,
    router,
    showToast,
  ]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* Top Header with Progress Bar (Step 5 of 5) */}
      <SignupStepHeader
        currentStep={5}
        totalSteps={5}
        onBack={() => router.back()}
      />

      <KeyboardAvoidingView
        style={styles.keyboardFlex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          {/* Section Title */}
          <SignupSectionTitle
            icon={<Lock size={24} color={Palette.secondary} strokeWidth={2.4} />}
            title="Secure your account"
            subtitle="Create a password, then review your choices."
          />

          {/* Form Card */}
          <View style={styles.formCard}>
            {/* Create Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Lock size={16} color={Palette.secondary} strokeWidth={2.4} />
                <Text style={styles.label}>
                  Create password <Text style={styles.requiredStar}>*</Text>
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  isPasswordFocused && styles.inputContainerFocused,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="At least 8 characters"
                  placeholderTextColor="#8E9CAE"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="newPassword"
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
                  accessibilityLabel="Create password"
                  returnKeyType="next"
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <EyeOff size={20} color="#8E9CAE" strokeWidth={2.2} />
                  ) : (
                    <Eye size={20} color="#8E9CAE" strokeWidth={2.2} />
                  )}
                </Pressable>
              </View>

              {/* 4 Segmented Strength Indicator Bars */}
              <View style={styles.strengthBarsContainer}>
                {[0, 1, 2, 3].map((index) => {
                  const isFilled = index < strengthScore;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.strengthBar,
                        {
                          backgroundColor: isFilled ? strengthColor : '#E2E8F0',
                        },
                      ]}
                    />
                  );
                })}
              </View>

              {/* Strength Label */}
              {password.length > 0 && (
                <View style={styles.strengthMetaRow}>
                  <Text style={[styles.strengthMetaText, { color: strengthColor }]}>
                    {strengthLabel}
                  </Text>
                </View>
              )}
            </View>

            {/* Confirm Password Field */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <ShieldCheck size={16} color={Palette.secondary} strokeWidth={2.4} />
                <Text style={styles.label}>
                  Confirm password <Text style={styles.requiredStar}>*</Text>
                </Text>
              </View>

              <View
                style={[
                  styles.inputContainer,
                  isConfirmFocused && styles.inputContainerFocused,
                  isMismatch && styles.inputContainerError,
                  isMatching && styles.inputContainerSuccess,
                ]}>
                <TextInput
                  style={styles.input}
                  placeholder="Type your password again"
                  placeholderTextColor="#8E9CAE"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  spellCheck={false}
                  textContentType="newPassword"
                  onFocus={() => setIsConfirmFocused(true)}
                  onBlur={() => setIsConfirmFocused(false)}
                  accessibilityLabel="Confirm password"
                  returnKeyType="done"
                  onSubmitEditing={handleCreateAccount}
                />
                <Pressable
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showConfirmPassword ? 'Hide password' : 'Show password'
                  }>
                  {showConfirmPassword ? (
                    <EyeOff size={20} color="#8E9CAE" strokeWidth={2.2} />
                  ) : (
                    <Eye size={20} color="#8E9CAE" strokeWidth={2.2} />
                  )}
                </Pressable>
              </View>
            </View>
          </View>

          {/* Ready to join Review Card (Image 3) */}
          <View style={styles.readyToJoinCard}>
            <Text style={styles.readyToJoinTitle}>Ready to join</Text>
            <View style={styles.checklistList}>
              <View style={styles.checkItemRow}>
                <View style={styles.checkItemBadge}>
                  <Check size={14} color="#16A34A" strokeWidth={3} />
                </View>
                <Text style={styles.checkItemText}>
                  {draft?.role === 'elderly' ? 'Elderly member' : 'Volunteer member'}
                </Text>
              </View>

              {draft?.role === 'elderly' ? (
                <View style={styles.checkItemRow}>
                  <View style={styles.checkItemBadge}>
                    <Check size={14} color="#16A34A" strokeWidth={3} />
                  </View>
                  <Text style={styles.checkItemText}>
                    {fontSizeMode === 'large' ? 'Large text (+20%)' : 'Standard text'}
                  </Text>
                </View>
              ) : (
                <View style={styles.checkItemRow}>
                  <View style={styles.checkItemBadge}>
                    <Check size={14} color="#16A34A" strokeWidth={3} />
                  </View>
                  <Text style={styles.checkItemText}>
                    ID verification document submitted
                  </Text>
                </View>
              )}

              <View style={styles.checkItemRow}>
                <View style={styles.checkItemBadge}>
                  <Check size={14} color="#16A34A" strokeWidth={3} />
                </View>
                <Text style={styles.checkItemText}>
                  Privacy and safety settings applied
                </Text>
              </View>
            </View>
          </View>

          {/* Terms Agreement Checkbox */}
          <Pressable
            style={styles.termsRow}
            onPress={() => setAgreedToTerms((prev) => !prev)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: agreedToTerms }}
            accessibilityLabel="I agree to the KindLink terms and understand how my information is used.">
            <View style={[styles.termsCheckbox, agreedToTerms && styles.termsCheckboxChecked]}>
              {agreedToTerms && <Check size={14} color="#FFFFFF" strokeWidth={3.2} />}
            </View>
            <Text style={styles.termsText}>
              I agree to the KindLink terms and understand how my information is used.
            </Text>
          </Pressable>
        </ScrollView>

        {/* Bottom Actions (Pinned at bottom) */}
        <View style={styles.bottomSection}>
          <SignupPrimaryButton
            label="Create my KindLink account"
            onPress={handleCreateAccount}
            loading={isLoading}
            showChevron={true}
          />
          <SignupFooterNote />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

function ConditionItem({ met, label }: { met: boolean; label: string }) {
  return (
    <View style={styles.conditionRow}>
      <View style={[styles.conditionDot, met && styles.conditionDotMet]}>
        {met && <Check size={10} color="#FFFFFF" strokeWidth={3.5} />}
      </View>
      <Text style={[styles.conditionText, met && styles.conditionTextMet]}>
        {label}
      </Text>
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
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 18,
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
  inputContainer: {
    height: 50,
    backgroundColor: '#F3F6F9',
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
  },
  inputContainerFocused: {
    borderColor: Palette.secondary,
    backgroundColor: '#FFFFFF',
  },
  inputContainerError: {
    borderColor: FunctionalColors.danger,
    backgroundColor: '#FFF5F5',
  },
  inputContainerSuccess: {
    borderColor: '#10B981',
    backgroundColor: '#F0FDF4',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15,
    color: '#0F172A',
  },
  eyeButton: {
    padding: 6,
  },
  matchIconBadge: {
    padding: 6,
  },
  strengthBarsContainer: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthMetaRow: {
    marginTop: 2,
  },
  strengthMetaText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  conditionsList: {
    marginTop: 6,
    gap: 6,
  },
  conditionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  conditionDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conditionDotMet: {
    backgroundColor: '#10B981',
  },
  conditionText: {
    fontSize: 13,
    color: '#64748B',
  },
  conditionTextMet: {
    color: '#0F172A',
    fontWeight: '600',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    backgroundColor: Palette.surface,
  },

  // Ready to join Review Card (Image 3)
  readyToJoinCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1.2,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 14,
    marginTop: 14,
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
  readyToJoinTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  checklistList: {
    gap: 12,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkItemBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
  },

  // Terms Agreement
  termsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginTop: 18,
    marginHorizontal: 2,
  },
  termsCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1.6,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  termsCheckboxChecked: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  termsText: {
    flex: 1,
    fontSize: 13.5,
    color: '#334155',
    lineHeight: 20,
    fontWeight: '500',
  },
});
