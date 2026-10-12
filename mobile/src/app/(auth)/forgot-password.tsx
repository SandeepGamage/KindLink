/**
 * (auth)/forgot-password.tsx
 *
 * KindLink Forgot Password Screen
 * Step 1: User inputs their email to receive a password reset code.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Svg, { Path } from 'react-native-svg';

import { AuthInput } from '@/components/auth/auth-input';
import { Palette, FunctionalColors } from '@/constants/theme';
import { authService, AuthError } from '@/services/auth.service';

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

export default function ForgotPasswordScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string>();
  const [serverError, setServerError] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestReset = useCallback(async () => {
    if (!email) {
      setEmailError('Please enter your email address');
      return;
    }
    
    // Basic regex check
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError(undefined);
    setServerError(undefined);
    setIsLoading(true);

    try {
      await authService.requestPasswordReset(email);
      // Navigate to verify code screen, passing the email
      router.push({
        pathname: '/(auth)/verify-reset-code',
        params: { email },
      } as any);
    } catch (err: unknown) {
      if (err instanceof AuthError) {
        setServerError(err.message);
      } else {
        setServerError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [email, router]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* Decorative background circles */}
      <View style={[styles.circle, styles.circleTopRight]} pointerEvents="none" />
      <View style={[styles.circle, styles.circleSmallRight]} pointerEvents="none" />
      <View style={[styles.circle, styles.circleBottomLeft]} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>

          <View style={styles.topHeader}>
            <Pressable
              onPress={() => router.back()}
              hitSlop={{ top: 14, bottom: 14, left: 16, right: 16 }}
              style={({ pressed }) => [
                styles.backButton,
                pressed && styles.backButtonPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <BackArrowIcon size={20} color={Palette.secondary} />
              <Text style={styles.backText}>Back</Text>
            </Pressable>
          </View>

          <View style={styles.content}>
            <View style={styles.header}>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll{'\n'}send you a reset code.
              </Text>
            </View>

            <View style={styles.form}>
              {!!serverError && (
                <View style={styles.serverErrorBanner} accessibilityRole="alert">
                  <Text style={styles.serverErrorText}>{serverError}</Text>
                </View>
              )}

              <AuthInput
                placeholder="Email address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError(undefined);
                  if (serverError) setServerError(undefined);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                returnKeyType="done"
                onSubmitEditing={handleRequestReset}
                error={emailError}
                accessibilityLabel="Email address"
              />

              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && !isLoading && styles.primaryButtonPressed,
                  isLoading && styles.primaryButtonLoading,
                ]}
                onPress={handleRequestReset}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Send reset code"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}>
                {isLoading ? (
                  <ActivityIndicator color={Palette.primary} size="small" />
                ) : (
                  <Text style={styles.primaryButtonText}>Send Reset Code</Text>
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
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  topHeader: {
    paddingHorizontal: 24,
    paddingTop: 10,
    paddingBottom: 4,
    zIndex: 10,
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
    color: Palette.secondary,
    letterSpacing: -0.2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 32,
    marginTop: -40,
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    backgroundColor: Palette.blueTint,
  },
  circleTopRight: {
    width: 240,
    height: 240,
    top: -70,
    right: -70,
    opacity: 0.55,
  },
  circleSmallRight: {
    width: 140,
    height: 140,
    top: 130,
    right: -40,
    opacity: 0.35,
  },
  circleBottomLeft: {
    width: 200,
    height: 200,
    bottom: 40,
    left: -70,
    opacity: 0.4,
  },
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: Palette.ink,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  serverErrorBanner: {
    backgroundColor: FunctionalColors.dangerBg,
    borderRadius: 10,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: FunctionalColors.danger,
  },
  serverErrorText: {
    color: FunctionalColors.dangerText,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  primaryButton: {
    height: 56,
    backgroundColor: Palette.secondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  primaryButtonLoading: {
    opacity: 0.75,
  },
  primaryButtonText: {
    color: Palette.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
