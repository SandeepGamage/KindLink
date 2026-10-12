/**
 * (auth)/welcome.tsx
 *
 * KindLink Welcome Screen (Initial Landing Screen)
 * - Logo inside soft concentric rings, orbited by badges for the app's three promises
 *   (care, local helpers, safety)
 * - Title and tagline
 * - Primary pill "Get started" and a "Log in" link
 */

import React, { useCallback, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { Heart, Users, Shield } from 'lucide-react-native';
import { PillButton } from '@/components/auth/pill-button';
import { OrbitHero } from '@/components/ui/orbit-hero';
import { Palette, FunctionalColors } from '@/constants/theme';

export default function WelcomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(entrance, {
      toValue: 1,
      duration: 600,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, [entrance]);

  const handleGetStarted = useCallback(() => {
    router.push('/(auth)/onboarding');
  }, [router]);

  const handleLogin = useCallback(() => {
    router.push('/(auth)/login');
  }, [router]);

  const riseIn = (offset: number) => ({
    opacity: entrance,
    transform: [
      {
        translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [offset, 0] }),
      },
    ],
  });

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: insets.bottom + 20 }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.primary} />

      {/* ─── Hero: logo in rings with orbiting badges ─── */}
      <View style={styles.heroContainer}>
        <Animated.View style={riseIn(12)}>
          <OrbitHero
            CenterIcon={Heart}
            centerFilled
            badges={[
              { Icon: Heart, color: Palette.accent },
              { Icon: Users },
              { Icon: Shield },
            ]}
          />
        </Animated.View>

        <Animated.View style={[styles.textContainer, riseIn(24)]}>
          <Text style={styles.title}>KindLink</Text>
          <Text style={styles.subtitle}>
            Connecting friendly local volunteers with elderly neighbors.
          </Text>
        </Animated.View>
      </View>

      {/* ─── Bottom Actions ─── */}
      <Animated.View style={[styles.bottomContainer, riseIn(32)]}>
        <PillButton label="Get started" onPress={handleGetStarted} />

        <Pressable
          style={({ pressed }) => [styles.linkButton, pressed && styles.linkButtonPressed]}
          onPress={handleLogin}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="I already have an account, log in">
          <Text style={styles.linkText}>
            Already have an account? <Text style={styles.linkTextStrong}>Log in</Text>
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.primary,
    paddingHorizontal: 24,
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    marginTop: 36,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: Palette.ink,
    letterSpacing: -0.6,
  },
  subtitle: {
    fontSize: 16,
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
    marginTop: 10,
    fontWeight: '500',
  },
  bottomContainer: {
    width: '100%',
    gap: 8,
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
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
  },
  linkTextStrong: {
    fontWeight: '700',
    color: Palette.secondary,
  },
});
