/**
 * (auth)/set-password.tsx
 *
 * KindLink Set Password Screen
 * Step 2 of the signup flow:
 * - 100% matched to the Figma design:
 *   - Soft ice-blue background (#F0F6FE)
 *   - Top header with "← Back" button
 *   - Bold "Set your password" title & descriptive subtitle
 *   - Password input with 4 segmented strength indicator bars
 *   - Confirm password input
 *   - Password condition validation (length >= 8, uppercase + lowercase, number, special char)
 *   - "Create account" button
 *   - Navigates to Login page with prefilled email on successful registration
 */

import React, { useState, useMemo, useCallback } from 'react';
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
import Svg, { Path } from 'react-native-svg';

import { OnboardingColors } from '@/constants/theme';
import { authService, SignUpPayload } from '@/services/auth.service';

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function BackArrowIcon({ size = 20, color = OnboardingColors.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EyeIcon({ size = 22, color = '#94A3B8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 15a3 3 0 100-6 3 3 0 000 6z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function EyeOffIcon({ size = 22, color = '#94A3B8' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function CheckIcon({ size = 14, color = '#10B981' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SetPasswordScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    name?: string;
    email?: string;
    role?: string;
    age?: string;
    address?: string;
    emergencyContact?: string;
    idDocument?: string;
    availability?: string;
  }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  // Color of strength indicator based on score
  const strengthColor = useMemo(() => {
    switch (strengthScore) {
      case 1:
        return '#EF4444'; // Weak (Red)
      case 2:
        return '#F59E0B'; // Fair (Amber)
      case 3:
        return '#3B82F6'; // Good (Blue)
      case 4:
        return '#10B981'; // Strong (Emerald)
      default:
        return '#DBEAFE'; // Empty
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
    // 1. Password presence
    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    // 2. Conditions check
    if (!conditions.minLength) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }
    if (!conditions.hasMixedCase) {
      setErrorMessage('Password must contain both uppercase and lowercase letters.');
      return;
    }
    if (!conditions.hasNumber) {
      setErrorMessage('Password must include at least one number.');
      return;
    }
    if (!conditions.hasSpecialChar) {
      setErrorMessage('Password must include at least one special character (!@#$%^&*).');
      return;
    }

    // 3. Confirmation check
    if (!confirmPassword) {
      setErrorMessage('Please re-enter your password to confirm.');
      return;
    }
    if (confirmPassword !== password) {
      setErrorMessage('Passwords do not match. Please verify and try again.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    let parsedAvailability: string[] | undefined;
    if (params.availability) {
      try {
        parsedAvailability = JSON.parse(params.availability);
      } catch {
        parsedAvailability = undefined;
      }
    }

    const payload: SignUpPayload = {
      name: (params.name || 'Member').trim(),
      email: (params.email || '').trim().toLowerCase(),
      role: (params.role as any) || 'elderly',
      age: params.age ? params.age.trim() : undefined,
      address: params.address ? params.address.trim() : undefined,
      emergencyContact: params.emergencyContact ? params.emergencyContact.trim() : undefined,
      idDocument: params.idDocument ? params.idDocument.trim() : undefined,
      availability: parsedAvailability,
      password: password,
    };

    try {
      await authService.register(payload);

      Alert.alert(
        'Account Created Successfully',
        'Your KindLink account has been set up. Please log in with your credentials to continue.',
        [
          {
            text: 'Go to Login',
            onPress: () => {
              router.replace({
                pathname: '/(auth)/login',
                params: { email: payload.email },
              });
            },
          },
        ],
      );
    } catch (err: any) {
      setErrorMessage(err?.message ?? 'Account creation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, conditions, params, router]);

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
              hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back to registration">
              <BackArrowIcon size={20} color={OnboardingColors.primary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            {/* ─── Screen Title & Subtitle ─── */}
            <View style={styles.titleBlock}>
              <Text style={styles.title}>Set your password</Text>
              <Text style={styles.subtitle}>
                Choose a secure password for your{'\n'}account
              </Text>
            </View>

            {/* ─── Error Alert Banner ─── */}
            {!!errorMessage && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            {/* ─── Form Inputs ─── */}
            <View style={styles.form}>

              {/* Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused,
                    !!errorMessage && !password && styles.inputContainerError,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor="#94A3B8"
                    value={password}
                    onChangeText={(text) => {
                      setPassword(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="newPassword"
                    onFocus={() => setIsPasswordFocused(true)}
                    onBlur={() => setIsPasswordFocused(false)}
                    accessibilityLabel="Password"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </Pressable>
                </View>

                {/* ─── 4 Segmented Strength Indicator Bars ─── */}
                <View style={styles.strengthBarsContainer}>
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = index < strengthScore;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor: isFilled ? strengthColor : '#DBEAFE',
                          },
                        ]}
                      />
                    );
                  })}
                </View>

                {/* Optional Strength & Requirement Hints */}
                {password.length > 0 && (
                  <View style={styles.strengthMetaRow}>
                    <Text style={[styles.strengthMetaText, { color: strengthColor }]}>
                      {strengthLabel}
                    </Text>
                  </View>
                )}

                {/* Condition helper hints when typing */}
                {password.length > 0 && strengthScore < 4 && (
                  <View style={styles.conditionsList}>
                    {!conditions.minLength && (
                      <Text style={styles.conditionHintText}>• At least 8 characters</Text>
                    )}
                    {!conditions.hasMixedCase && (
                      <Text style={styles.conditionHintText}>• Upper and lower case letters</Text>
                    )}
                    {!conditions.hasNumber && (
                      <Text style={styles.conditionHintText}>• At least one number</Text>
                    )}
                    {!conditions.hasSpecialChar && (
                      <Text style={styles.conditionHintText}>• Special character (!@#$%^&*)</Text>
                    )}
                  </View>
                )}
              </View>

              {/* Confirm Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Confirm password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    isConfirmFocused && styles.inputContainerFocused,
                    isMismatch && styles.inputContainerError,
                    isMatching && styles.inputContainerSuccess,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Re-enter your password"
                    placeholderTextColor="#94A3B8"
                    value={confirmPassword}
                    onChangeText={(text) => {
                      setConfirmPassword(text);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    secureTextEntry={!showConfirmPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    spellCheck={false}
                    textContentType="newPassword"
                    onFocus={() => setIsConfirmFocused(true)}
                    onBlur={() => setIsConfirmFocused(false)}
                    accessibilityLabel="Confirm password"
                  />
                  {isMatching && (
                    <View style={styles.matchIconContainer}>
                      <CheckIcon size={18} color="#10B981" />
                    </View>
                  )}
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    accessibilityRole="button"
                    accessibilityLabel={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}>
                    {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </Pressable>
                </View>

                {isMismatch && (
                  <Text style={styles.mismatchText}>Passwords do not match</Text>
                )}
              </View>

            </View>

            {/* ─── Create Account Action Button ─── */}
            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={handleCreateAccount}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Create account">
                {isLoading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Create account</Text>
                )}
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    paddingTop: 10,
    paddingBottom: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonPressed: {
    opacity: 0.7,
  },
  backText: {
    fontSize: 17,
    fontWeight: '700',
    color: OnboardingColors.primary,
    letterSpacing: -0.2,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 36,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: OnboardingColors.textHeading,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15.5,
    fontWeight: '500',
    color: OnboardingColors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderLeftWidth: 3.5,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: OnboardingColors.textHeading,
    letterSpacing: -0.2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#1D61E7',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  inputContainerFocused: {
    borderColor: OnboardingColors.primary,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.8,
  },
  inputContainerError: {
    borderColor: '#EF4444',
  },
  inputContainerSuccess: {
    borderColor: '#10B981',
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 15.5,
    color: OnboardingColors.textHeading,
    fontWeight: '500',
  },
  eyeButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchIconContainer: {
    marginRight: 6,
  },
  mismatchText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EF4444',
    marginLeft: 4,
    marginTop: 2,
  },
  strengthBarsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingHorizontal: 2,
  },
  strengthBar: {
    flex: 1,
    height: 4.5,
    borderRadius: 3,
  },
  strengthMetaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 3,
    paddingHorizontal: 4,
  },
  strengthMetaText: {
    fontSize: 12,
    fontWeight: '700',
  },
  conditionsList: {
    marginTop: 4,
    paddingHorizontal: 4,
    gap: 3,
  },
  conditionHintText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 28,
  },
  primaryButton: {
    height: 54,
    backgroundColor: '#96BAEC',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#1D61E7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: OnboardingColors.primary,
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
