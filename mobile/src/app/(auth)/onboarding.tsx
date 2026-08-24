import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  HelpersIllustration,
  CalendarIllustration,
  ShieldIllustration,
} from '@/components/ui/onboarding-icons';
import { Palette, FunctionalColors } from '@/constants/theme';

interface OnboardingStep {
  id: number;
  stepLabel: string;
  title: string;
  subtitle: string;
  buttonText: string;
  showSkip: boolean;
  Illustration: React.ComponentType<{ size?: number; color?: string }>;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    stepLabel: 'Step 1 of 3',
    title: 'Find a friendly helper\nnearby',
    subtitle:
      'Local volunteers can help with everyday visits, walks, grocery runs, and simple errands.',
    buttonText: 'Next',
    showSkip: true,
    Illustration: HelpersIllustration,
  },
  {
    id: 2,
    stepLabel: 'Step 2 of 3',
    title: 'Schedule visits easily',
    subtitle:
      'Simply pick a day and time that works best for your routine. We make booking effortless.',
    buttonText: 'Next',
    showSkip: true,
    Illustration: CalendarIllustration,
  },
  {
    id: 3,
    stepLabel: 'Step 3 of 3',
    title: 'Safe and verified',
    subtitle:
      'Every volunteer is identity-checked and rated by the community for peace of mind.',
    buttonText: 'Continue',
    showSkip: false,
    Illustration: ShieldIllustration,
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = STEPS[currentStepIndex];
  const isLastStep = currentStepIndex === STEPS.length - 1;

  const handleNext = useCallback(() => {
    if (isLastStep) {
      router.push('/(auth)/role-select');
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [isLastStep, router]);

  const handleSkip = useCallback(() => {
    router.push('/(auth)/role-select');
  }, [router]);

  const { Illustration } = currentStep;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.content}>
          {/* ─── Header: Step indicator & Skip ─── */}
          <View style={styles.header}>
            <Text style={styles.stepText}>{currentStep.stepLabel}</Text>
            {currentStep.showSkip ? (
              <Pressable
                onPress={handleSkip}
                hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
                accessibilityRole="button"
                accessibilityLabel="Skip onboarding">
                <Text style={styles.skipText}>Skip</Text>
              </Pressable>
            ) : (
              <View style={styles.skipPlaceholder} />
            )}
          </View>

          {/* ─── Center: Illustration Card + Text ─── */}
          <View style={styles.centerContainer}>
            {/* Pastel Blue Rounded Illustration Card */}
            <View style={styles.illustrationCard}>
              <Illustration size={84} color={Palette.secondary} />
            </View>

            {/* Title & Description */}
            <View style={styles.textContainer}>
              <Text style={styles.title}>{currentStep.title}</Text>
              <Text style={styles.subtitle}>{currentStep.subtitle}</Text>
            </View>
          </View>

          {/* ─── Bottom: Pagination Dots & Action Button ─── */}
          <View style={styles.bottomContainer}>
            {/* 3-Dot Indicator with Active Pill */}
            <View style={styles.paginationRow}>
              {STEPS.map((step, idx) => {
                const isActive = idx === currentStepIndex;
                return (
                  <View
                    key={step.id}
                    style={[
                      styles.dot,
                      isActive ? styles.dotActive : styles.dotInactive,
                    ]}
                  />
                );
              })}
            </View>

            {/* Primary Action Button */}
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleNext}
              accessibilityRole="button"
              accessibilityLabel={currentStep.buttonText}>
              <Text style={styles.primaryButtonText}>{currentStep.buttonText}</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const screenHeight = Dimensions.get('window').height;
const illustrationHeight = Math.min(240, Math.max(190, screenHeight * 0.3));

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    paddingBottom: 12,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.secondary,
  },
  skipPlaceholder: {
    width: 36,
    height: 18,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  illustrationCard: {
    width: '100%',
    height: illustrationHeight,
    backgroundColor: Palette.blueTint,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 310,
    marginTop: 10,
    fontWeight: '500',
  },
  bottomContainer: {
    width: '100%',
    alignItems: 'center',
    gap: 20,
    paddingBottom: 16,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: 7,
    borderRadius: 3.5,
  },
  dotInactive: {
    width: 7,
    backgroundColor: Palette.border,
  },
  dotActive: {
    width: 22,
    backgroundColor: Palette.secondary,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: Palette.secondary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  primaryButtonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    transform: [{ scale: 0.985 }],
    opacity: 0.92,
  },
  primaryButtonText: {
    color: Palette.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
