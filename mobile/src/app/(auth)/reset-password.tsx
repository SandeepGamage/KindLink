/**
 * (auth)/reset-password.tsx
 *
 * KindLink Reset Password Screen
 * Step 3: User inputs their new password.
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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { OnboardingColors, Palette, FunctionalColors } from '@/constants/theme';
import { authService, AuthError } from '@/services/auth.service';

function EyeIcon({ size = 22, color = FunctionalColors.textMuted }: { size?: number; color?: string }) {
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

function EyeOffIcon({ size = 22, color = FunctionalColors.textMuted }: { size?: number; color?: string }) {
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

function CheckIcon({ size = 14, color = FunctionalColors.success }: { size?: number; color?: string }) {
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

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { email, code } = useLocalSearchParams<{ email: string; code: string }>();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmFocused, setIsConfirmFocused] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const conditions = useMemo(() => {
    return {
      minLength: password.length >= 8,
      hasMixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[^a-zA-Z0-9\s]/.test(password),
    };
  }, [password]);

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
      case 1: return FunctionalColors.danger;
      case 2: return Palette.accent;
      case 3: return Palette.secondary;
      case 4: return FunctionalColors.success;
      default: return Palette.blueTint;
    }
  }, [strengthScore]);

  const strengthLabel = useMemo(() => {
    if (!password) return '';
    switch (strengthScore) {
      case 1: return 'Weak password';
      case 2: return 'Moderate';
      case 3: return 'Good';
      case 4: return 'Strong password';
      default: return '';
    }
  }, [password, strengthScore]);

  const isMatching = useMemo(() => {
    return confirmPassword.length > 0 && confirmPassword === password;
  }, [confirmPassword, password]);

  const isMismatch = useMemo(() => {
    return confirmPassword.length > 0 && confirmPassword !== password;
  }, [confirmPassword, password]);

  const handleResetPassword = useCallback(async () => {
    if (!email || !code) {
      setErrorMessage('Missing reset information. Please start the process again.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (!conditions.minLength || !conditions.hasMixedCase || !conditions.hasNumber || !conditions.hasSpecialChar) {
      setErrorMessage('Password must meet all complexity requirements.');
      return;
    }

    if (!confirmPassword) {
      setErrorMessage('Please re-enter your password to confirm.');
      return;
    }

    if (confirmPassword !== password) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      await authService.resetPassword(email, code, password);
      setIsSuccess(true);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Failed to reset password. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [password, confirmPassword, conditions, email, code]);

  if (isSuccess) {
    return (
      <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.createdForm}>
          <Text style={styles.title}>Password Reset!</Text>
          <Text style={styles.subtitle}>Your password has been successfully updated. You can now sign in with your new password.</Text>
          <Pressable 
            accessibilityRole="button" 
            style={styles.primaryButton}
            onPress={() => router.replace({ pathname: '/(auth)/login', params: { email } })}>
            <Text style={styles.primaryButtonText}>Back to Login</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />
      <View style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>

            <View style={styles.titleBlock}>
              <Text style={styles.title}>Create new password</Text>
              <Text style={styles.subtitle}>
                Please choose a secure new password for your account.
              </Text>
            </View>

            {!!errorMessage && (
              <View style={styles.errorBanner} accessibilityRole="alert">
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            )}

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>New Password</Text>
                <View
                  style={[
                    styles.inputContainer,
                    isPasswordFocused && styles.inputContainerFocused,
                    !!errorMessage && !password && styles.inputContainerError,
                  ]}>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter your new password"
                    placeholderTextColor={FunctionalColors.textMuted}
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
                    accessibilityLabel="New Password"
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowPassword((prev) => !prev)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </Pressable>
                </View>

                <View style={styles.strengthBarsContainer}>
                  {[0, 1, 2, 3].map((index) => {
                    const isFilled = index < strengthScore;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.strengthBar,
                          { backgroundColor: isFilled ? strengthColor : Palette.blueTint },
                        ]}
                      />
                    );
                  })}
                </View>

                {password.length > 0 && (
                  <View style={styles.strengthMetaRow}>
                    <Text style={[styles.strengthMetaText, { color: strengthColor }]}>
                      {strengthLabel}
                    </Text>
                  </View>
                )}

                {password.length > 0 && strengthScore < 4 && (
                  <View style={styles.conditionsList}>
                    {!conditions.minLength && <Text style={styles.conditionHintText}>• At least 8 characters</Text>}
                    {!conditions.hasMixedCase && <Text style={styles.conditionHintText}>• Upper and lower case letters</Text>}
                    {!conditions.hasNumber && <Text style={styles.conditionHintText}>• At least one number</Text>}
                    {!conditions.hasSpecialChar && <Text style={styles.conditionHintText}>• Special character (!@#$%^&*)</Text>}
                  </View>
                )}
              </View>

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
                    placeholder="Re-enter your new password"
                    placeholderTextColor={FunctionalColors.textMuted}
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
                      <CheckIcon size={18} color={FunctionalColors.success} />
                    </View>
                  )}
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword((prev) => !prev)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showConfirmPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                  </Pressable>
                </View>

                {isMismatch && (
                  <Text style={styles.mismatchText}>Passwords do not match</Text>
                )}
              </View>
            </View>

            <View style={styles.buttonContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={handleResetPassword}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Reset password">
                {isLoading ? (
                  <ActivityIndicator color={Palette.primary} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Reset Password</Text>
                )}
              </Pressable>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </View>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 36,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: Palette.ink,
    letterSpacing: -0.5,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 15.5,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    marginTop: 6,
    lineHeight: 22,
  },
  errorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
    borderLeftWidth: 3.5,
    borderLeftColor: FunctionalColors.danger,
  },
  errorText: {
    color: FunctionalColors.dangerText,
    fontSize: 13.5,
    fontWeight: '600',
    lineHeight: 18,
  },
  form: {
    gap: 20,
  },
  createdForm: {
    padding: 24,
    justifyContent: 'center',
    flex: 1,
    paddingBottom: 100,
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
    borderColor: Palette.border,
    backgroundColor: Palette.primary,
    paddingHorizontal: 16,
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  inputContainerFocused: {
    borderColor: Palette.secondary,
    backgroundColor: Palette.primary,
    borderWidth: 1.8,
  },
  inputContainerError: {
    borderColor: FunctionalColors.danger,
  },
  inputContainerSuccess: {
    borderColor: FunctionalColors.success,
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
    color: FunctionalColors.danger,
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
    color: FunctionalColors.textSecondary,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: 28,
  },
  primaryButton: {
    height: 54,
    backgroundColor: Palette.secondary,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    transform: [{ scale: 0.985 }],
    opacity: 0.95,
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: Palette.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
