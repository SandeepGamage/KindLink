/**
 * (auth)/forgot-password.tsx
 *
 * KindLink Forgot Password Screen
 * Step 1: User inputs their email to receive a password reset code.
 */

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { KeyRound, Mail, Lock, ShieldCheck } from 'lucide-react-native';

import { AuthInput } from '@/components/auth/auth-input';
import { PillButton } from '@/components/auth/pill-button';
import {
  AuthScreen,
  AuthHeader,
  AuthErrorBanner,
  AuthFooterLink,
} from '@/components/auth/auth-screen';
import { Palette } from '@/constants/theme';
import { authService, AuthError } from '@/services/auth.service';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const goBack = useCallback(() => router.back(), [router]);

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
    <AuthScreen onBack={goBack}>
      <AuthHeader
        hero={{
          CenterIcon: KeyRound,
          badges: [{ Icon: Mail, color: Palette.accent }, { Icon: Lock }, { Icon: ShieldCheck }],
        }}
        title="Forgot password?"
        subtitle="No worries. Enter your email address and we'll send you a reset code."
      />

      <View style={styles.form}>
        <AuthErrorBanner message={serverError} />

        <AuthInput
          icon={Mail}
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

        <PillButton
          label="Send reset code"
          onPress={handleRequestReset}
          loading={isLoading}
          style={styles.submit}
        />

        <AuthFooterLink prompt="Remembered it?" action="Back to sign in" onPress={goBack} />
      </View>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  submit: {
    marginTop: 6,
  },
});
