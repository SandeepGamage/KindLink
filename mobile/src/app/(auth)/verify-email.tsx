/**
 * (auth)/verify-email.tsx
 *
 * KindLink Email Verification Screen:
 * - Prompts user for 6-digit verification code sent via Resend
 * - 6-box modular OtpInput component
 * - 60-second countdown timer with resend code action
 * - Immediate session activation and direct navigation to app home page upon success
 * - Strictly follows KindLink 60-30-10 design system and AGENTS.md rules
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
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
import Svg, { Path, Rect } from 'react-native-svg';

import { Palette, FunctionalColors } from '@/constants/theme';
import { OtpInput } from '@/components/ui/otp-input';
import { authService, AuthError } from '@/services/auth.service';
import { useAuthContext } from '@/context/auth-context';

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function BackArrowIcon({ size = 20, color = Palette.secondary }: { size?: number; color?: string }) {
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

function MailVerifyIllustration({ size = 72 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <Rect width="80" height="80" rx="40" fill={Palette.blueTint} />
      <Path
        d="M26 31C26 28.7909 27.7909 27 30 27H50C52.2091 27 54 28.7909 54 31V49C54 51.2091 52.2091 53 50 53H30C27.7909 53 26 51.2091 26 49V31Z"
        fill="#FFFFFF"
        stroke={Palette.secondary}
        strokeWidth="2.5"
      />
      <Path
        d="M28 32L40 41L52 32"
        stroke={Palette.secondary}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Rect x="46" y="44" width="18" height="18" rx="9" fill={FunctionalColors.success} />
      <Path
        d="M51 53L54 56L60 50"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Screen Component
// ---------------------------------------------------------------------------

export default function VerifyEmailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { setSession } = useAuthContext();
  const { email: initialEmail } = useLocalSearchParams<{ email?: string }>();

  const [email] = useState<string>(initialEmail ? decodeURIComponent(initialEmail).trim() : '');
  const [code, setCode] = useState<string>('');
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isResending, setIsResending] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastAttemptedCodeRef = useRef<string>('');

  // Countdown timer for resending OTP
  useEffect(() => {
    if (timer > 0) {
      setCanResend(false);
      timerRef.current = setTimeout(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timer]);

  // Handle Verify Code
  const handleVerify = useCallback(
    async (codeToVerify?: string) => {
      const targetCode = (typeof codeToVerify === 'string' ? codeToVerify : code).trim();
      if (isLoading || isResending || isLocked) return;

      if (!email) {
        setErrorMessage('Missing email address. Please return to the previous screen.');
        return;
      }

      if (targetCode.length !== 6) {
        setErrorMessage('Please enter all 6 digits of the verification code.');
        return;
      }

      setErrorMessage(null);
      setIsLoading(true);

      try {
        const response = await authService.verifyCode(email, targetCode);
        setSuccessBanner('Email verified successfully! Welcome to KindLink.');

        if (response?.user && response?.token) {
          setSession(response.token, response.user);
        }

        // Small delay so user sees verification success confirmation
        setTimeout(() => {
          const role = (response.user?.role || '').toLowerCase();
          if (role === 'admin') {
            router.replace('/(admin)/users' as any);
          } else {
            router.replace('/(client)' as any);
          }
        }, 700);
      } catch (err) {
        if (err instanceof AuthError) {
          setErrorMessage(err.message);
          if (err.data?.isLocked || err.data?.remainingAttempts === 0) {
            setIsLocked(true);
            setCanResend(true); // Allow immediate resend to unlock
          }
        } else {
          setErrorMessage('Incorrect OTP. Try again.');
        }
      } finally {
        setIsLoading(false);
      }
    },
    [code, email, isLoading, isResending, isLocked, router, setSession]
  );

  // Automatically trigger verify ONCE when all 6 digits are entered
  useEffect(() => {
    if (
      code.length === 6 &&
      !isLoading &&
      !isLocked &&
      lastAttemptedCodeRef.current !== code
    ) {
      lastAttemptedCodeRef.current = code;
      handleVerify(code);
    }
  }, [code, isLoading, isLocked, handleVerify]);

  // Handle Resend Code
  const handleResendCode = useCallback(async () => {
    if ((!canResend && !isLocked) || isResending || isLoading) return;

    if (!email) {
      setErrorMessage('No email address provided.');
      return;
    }

    setIsResending(true);
    setErrorMessage(null);
    setSuccessBanner(null);

    try {
      const res = await authService.resendVerificationCode(email);
      setSuccessBanner(res.message || 'A fresh 6-digit code has been sent to your email.');
      setTimer(60);
      setCanResend(false);
      setIsLocked(false);
      setCode('');
      lastAttemptedCodeRef.current = '';
    } catch (err) {
      if (err instanceof AuthError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Could not resend verification code. Please try again.');
      }
    } finally {
      setIsResending(false);
    }
  }, [canResend, email, isLocked, isLoading, isResending]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* ─── Top Header: Back Button ─── */}
      <View style={styles.topHeader}>
        <Pressable
          onPress={() => router.replace('/(auth)/login' as any)}
          hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
          style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
          accessibilityRole="button"
          accessibilityLabel="Back to sign in">
          <BackArrowIcon size={20} color={Palette.secondary} />
          <Text style={styles.backText}>Back to Login</Text>
        </Pressable>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* ─── Center Visual Icon ─── */}
          <View style={styles.illustrationWrapper}>
            <MailVerifyIllustration size={80} />
          </View>

          {/* ─── Title & Email Indicator ─── */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.subtitle}>
              We sent a 6-digit verification code to
            </Text>
            <View style={styles.emailChip}>
              <Text style={styles.emailChipText} numberOfLines={1}>
                {email || 'your email address'}
              </Text>
            </View>
          </View>

          {/* ─── Success Banner ─── */}
          {!!successBanner && (
            <View style={styles.successBanner} accessibilityRole="alert">
              <Text style={styles.successText}>{successBanner}</Text>
            </View>
          )}

          {/* ─── Error Alert Banner ─── */}
          {!!errorMessage && (
            <View style={styles.errorBanner} accessibilityRole="alert">
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* ─── 6-Box OTP Input Card ─── */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Enter 6-digit code</Text>
            <OtpInput
              length={6}
              value={code}
              onChange={(val) => {
                setCode(val);
                if (val !== lastAttemptedCodeRef.current) {
                  setErrorMessage(null);
                }
              }}
              disabled={isLoading || isResending || isLocked}
              hasError={!!errorMessage}
              autoFocus
            />

            {/* ─── Resend Timer Row ─── */}
            <View style={styles.resendRow}>
              {canResend || isLocked ? (
                <Pressable
                  onPress={handleResendCode}
                  disabled={isResending}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  accessibilityRole="button"
                  accessibilityLabel="Resend verification code">
                  {isResending ? (
                    <ActivityIndicator size="small" color={Palette.secondary} />
                  ) : (
                    <Text style={styles.resendActiveText}>Resend code</Text>
                  )}
                </Pressable>
              ) : (
                <Text style={styles.resendTimerText}>
                  Resend code in{' '}
                  <Text style={styles.timerBold}>
                    00:{timer < 10 ? `0${timer}` : timer}
                  </Text>
                </Text>
              )}
            </View>
          </View>

          {/* ─── CTA Action Button ─── */}
          <Pressable
            style={({ pressed }) => [
              styles.primaryButton,
              (code.length !== 6 || isLoading || isLocked) && styles.primaryButtonDisabled,
              pressed && styles.primaryButtonPressed,
            ]}
            onPress={() => handleVerify()}
            disabled={code.length !== 6 || isLoading || isLocked}
            accessibilityRole="button"
            accessibilityLabel="Verify email and continue">
            {isLoading ? (
              <ActivityIndicator color={Palette.primary} size="small" />
            ) : (
              <Text style={styles.primaryButtonText}>Verify & Continue</Text>
            )}
          </Pressable>

          {/* ─── Footer Support Note ─── */}
          <View style={styles.footerNote}>
            <Text style={styles.footerText}>
              Didn't receive the email? Check your spam or junk folder, or request a new code above.
            </Text>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Stylesheet
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
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
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backButtonPressed: {
    opacity: 0.65,
  },
  backText: {
    fontSize: 15,
    fontWeight: '600',
    color: Palette.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: 40,
  },
  illustrationWrapper: {
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 20,
  },
  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: Palette.ink,
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: FunctionalColors.textSecondary,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 10,
  },
  emailChip: {
    backgroundColor: Palette.blueTint,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    maxWidth: '90%',
  },
  emailChipText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.secondary,
  },
  successBanner: {
    backgroundColor: FunctionalColors.successBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
  },
  successText: {
    fontSize: 14,
    color: FunctionalColors.successText,
    fontWeight: '600',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: FunctionalColors.dangerText,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
    padding: 20,
    marginBottom: 24,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'center',
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: FunctionalColors.textSecondary,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  resendRow: {
    marginTop: 14,
    alignItems: 'center',
  },
  resendTimerText: {
    fontSize: 14,
    color: FunctionalColors.textMuted,
  },
  timerBold: {
    fontWeight: '700',
    color: Palette.secondary,
  },
  resendActiveText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.secondary,
    textDecorationLine: 'underline',
  },
  primaryButton: {
    backgroundColor: Palette.secondary,
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 20,
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CBAD7',
    shadowOpacity: 0,
    elevation: 0,
  },
  primaryButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.primary,
    letterSpacing: 0.2,
  },
  footerNote: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  footerText: {
    fontSize: 13,
    color: FunctionalColors.textMuted,
    lineHeight: 18,
    textAlign: 'center',
  },
});
