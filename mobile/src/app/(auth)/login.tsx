/**
 * (auth)/login.tsx
 *
 * KindLink Login Screen
 *  - Compact brand hero (shared with the welcome and onboarding screens)
 *  - "Welcome back" title and subtitle
 *  - Email & password inputs with icons, focus states and a show/hide toggle
 *  - "Forgot password?" link (right-aligned)
 *  - Full-width pill "Sign in" button with loading state
 *  - "Create an account" link → navigates to role select
 */

import React, { useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Heart, Users, Shield, Mail, Lock } from 'lucide-react-native';

import { AuthInput } from '@/components/auth/auth-input';
import { PillButton } from '@/components/auth/pill-button';
import {
  AuthScreen,
  AuthHeader,
  AuthErrorBanner,
  AuthFooterLink,
} from '@/components/auth/auth-screen';
import { useLogin } from '@/hooks/use-auth';
import { Palette } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------

export default function LoginScreen() {
  const router = useRouter();
  const { email: paramEmail } = useLocalSearchParams<{ email?: string }>();

  const {
    email,
    setEmail,
    password,
    setPassword,
    emailError,
    passwordError,
    serverError,
    isLoading,
    handleLogin,
  } = useLogin(
    useCallback((token?: string, user?: any) => {
      const role = (user?.role || '').toLowerCase();
      const approvalStatus = user?.approvalStatus;
      if (role === 'admin') {
        router.replace('/(admin)/users' as any);
      } else if (role === 'volunteer' && approvalStatus !== 'approved') {
        router.replace('/(auth)/pending-approval' as any);
      } else {
        router.replace('/(client)' as any);
      }
    }, [router]),
    useCallback((unverifiedEmail: string) => {
      router.push({
        pathname: '/(auth)/verify-email',
        params: { email: unverifiedEmail },
      } as any);
    }, [router]),
  );

  React.useEffect(() => {
    if (paramEmail && !email) {
      setEmail(paramEmail);
    }
  }, [paramEmail, email, setEmail]);

  const handleForgotPassword = useCallback(() => {
    router.push('/(auth)/forgot-password' as never);
  }, [router]);

  const handleCreateAccount = useCallback(() => {
    router.push('/(auth)/role-select' as never);
  }, [router]);

  return (
    <AuthScreen>
      <AuthHeader
        hero={{
          CenterIcon: Heart,
          centerFilled: true,
          badges: [{ Icon: Heart, color: Palette.accent }, { Icon: Users }, { Icon: Shield }],
        }}
        title="Welcome back"
        subtitle="Sign in to keep connecting with your community."
      />

      {/* ─── Form ─── */}
      <View style={styles.form}>
        <AuthErrorBanner message={serverError} />

        <AuthInput
          icon={Mail}
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          error={emailError}
          accessibilityLabel="Email address"
        />

        <AuthInput
          icon={Lock}
          passwordToggle
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="done"
          onSubmitEditing={handleLogin}
          error={passwordError}
          accessibilityLabel="Password"
        />

        {/* Forgot password — right aligned */}
        <Pressable
          style={({ pressed }) => [styles.forgotRow, pressed && styles.forgotPressed]}
          onPress={handleForgotPassword}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Forgot password?">
          <Text style={styles.forgotText}>Forgot password?</Text>
        </Pressable>

        <PillButton label="Sign in" onPress={handleLogin} loading={isLoading} />

        <AuthFooterLink
          prompt="New to KindLink?"
          action="Create an account"
          onPress={handleCreateAccount}
        />
      </View>
    </AuthScreen>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  form: {
    gap: 14,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
    marginBottom: 6,
  },
  forgotPressed: {
    opacity: 0.7,
  },
  forgotText: {
    color: Palette.secondary,
    fontSize: 14,
    fontWeight: '700',
  },
});
