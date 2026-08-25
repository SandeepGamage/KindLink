/**
 * (auth)/login.tsx
 *
 * KindLink Login Screen — fits entirely on one screen, no social media section.
 *  - Lavender background with decorative circles
 *  - "Login here" bold blue title
 *  - "Welcome back…" subtitle
 *  - Email & password inputs with focus states
 *  - "Forgot your password?" link (right-aligned)
 *  - Full-width blue "Sign in" button with loading state
 *  - "Create new account" link → navigates to register screen
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

import { AuthInput } from '@/components/auth/auth-input';
import { useLogin } from '@/hooks/use-auth';
import { AuthColors, Palette, FunctionalColors } from '@/constants/theme';

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
      if (role === 'admin') {
        router.replace('/(admin)/users' as any);
      } else {
        router.replace('/(client)' as any);
      }
    }, [router]),
  );

  React.useEffect(() => {
    if (paramEmail && !email) {
      setEmail(paramEmail);
    }
  }, [paramEmail, email, setEmail]);

  const handleForgotPassword = useCallback(() => {
    Alert.alert('Reset Password', 'Password reset is coming soon!');
  }, []);

  const handleCreateAccount = useCallback(() => {
    router.push('/(auth)/role-select' as never);
  }, [router]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* ─── Decorative background circles ─── */}
      <View style={[styles.circle, styles.circleTopRight]} pointerEvents="none" />
      <View style={[styles.circle, styles.circleSmallRight]} pointerEvents="none" />
      <View style={[styles.circle, styles.circleBottomLeft]} pointerEvents="none" />

      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>

          {/* All content in a single non-scrolling column */}
          <View style={styles.content}>

            {/* ─── Header ─── */}
            <View style={styles.header}>
              <Text style={styles.title}>Login here</Text>
              <Text style={styles.subtitle}>
                Welcome back you've{'\n'}been missed!
              </Text>
            </View>

            {/* ─── Form ─── */}
            <View style={styles.form}>

              {/* Server-level error */}
              {!!serverError && (
                <View style={styles.serverErrorBanner} accessibilityRole="alert">
                  <Text style={styles.serverErrorText}>{serverError}</Text>
                </View>
              )}

              <AuthInput
                placeholder="Email"
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
                style={styles.forgotRow}
                onPress={handleForgotPassword}
                accessibilityRole="button"
                accessibilityLabel="Forgot your password?">
                <Text style={styles.forgotText}>Forgot your password?</Text>
              </Pressable>

              {/* Sign in button */}
              <Pressable
                style={({ pressed }) => [
                  styles.signInButton,
                  pressed && !isLoading && styles.signInButtonPressed,
                  isLoading && styles.signInButtonLoading,
                ]}
                onPress={handleLogin}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Sign in"
                accessibilityState={{ disabled: isLoading, busy: isLoading }}>
                {isLoading ? (
                  <ActivityIndicator color={Palette.primary} size="small" />
                ) : (
                  <Text style={styles.signInText}>Sign in</Text>
                )}
              </Pressable>

              {/* Create new account */}
              <Pressable
                style={styles.createAccountRow}
                onPress={handleCreateAccount}
                accessibilityRole="button"
                accessibilityLabel="Create new account">
                <Text style={styles.createAccountText}>Create new account</Text>
              </Pressable>
            </View>

          </View>
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
    backgroundColor: Palette.surface,
  },
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },

  // Single full-height column — no scroll needed
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'center',
    gap: 32,
  },

  // Decorative circles — purely visual
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

  // Header
  header: {
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Palette.secondary,
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Palette.ink,
    textAlign: 'center',
    lineHeight: 28,
  },

  // Form
  form: {
    gap: 16,
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
  forgotRow: {
    alignSelf: 'flex-end',
    paddingVertical: 2,
  },
  forgotText: {
    color: Palette.secondary,
    fontSize: 14,
    fontWeight: '600',
  },
  signInButton: {
    height: 56,
    backgroundColor: Palette.secondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
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
  signInButtonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    opacity: 0.88,
    transform: [{ scale: 0.985 }],
  },
  signInButtonLoading: {
    opacity: 0.75,
  },
  signInText: {
    color: Palette.primary,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  createAccountRow: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  createAccountText: {
    fontSize: 15,
    fontWeight: '600',
    color: FunctionalColors.textSecondary,
  },
});
