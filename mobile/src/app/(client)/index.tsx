/**
 * index.tsx (Root route: /)
 *
 * KindLink Initial Welcome & Landing Screen
 * Launches the app directly from the "Get started" screen:
 * - Brand squircle logo with white heart
 * - "KindLink" bold title
 * - "Connecting friendly local volunteers with elderly neighbors."
 * - "Get started" primary blue button → navigates to onboarding
 * - "I already have an account" link → navigates to login
 */

import React, { useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { KindLinkLogo } from '@/components/ui/onboarding-icons';
import { OnboardingColors } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const handleGetStarted = useCallback(() => {
    router.push('/(auth)/onboarding');
  }, [router]);

  const handleAlreadyHaveAccount = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={OnboardingColors.screenBg} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.content}>
          {/* ─── Centered Brand Area ─── */}
          <View style={styles.brandContainer}>
            <KindLinkLogo size={84} />
            <Text style={styles.title}>KindLink</Text>
            <Text style={styles.subtitle}>
              Connecting friendly local{'\n'}volunteers with elderly{'\n'}neighbors.
            </Text>
          </View>

          {/* ─── Bottom Actions ─── */}
          <View style={styles.bottomContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleGetStarted}
              accessibilityRole="button"
              accessibilityLabel="Get started">
              <Text style={styles.primaryButtonText}>Get started</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.linkButton,
                pressed && styles.linkButtonPressed,
              ]}
              onPress={handleAlreadyHaveAccount}
              accessibilityRole="button"
              accessibilityLabel="I already have an account">
              <Text style={styles.linkText}>I already have an account</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: OnboardingColors.screenBg,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: 'space-between',
    paddingVertical: 20,
  },
  brandContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: OnboardingColors.textHeading,
    marginTop: 20,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: OnboardingColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 260,
    marginTop: 12,
    fontWeight: '500',
  },
  bottomContainer: {
    width: '100%',
    paddingBottom: 16,
    gap: 6,
  },
  primaryButton: {
    height: 52,
    backgroundColor: OnboardingColors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: OnboardingColors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: OnboardingColors.primaryDark,
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  linkButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  linkButtonPressed: {
    opacity: 0.7,
  },
  linkText: {
    fontSize: 15,
    fontWeight: '700',
    color: OnboardingColors.primary,
  },
});
