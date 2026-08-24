/**
 * (auth)/role-select.tsx
 *
 * KindLink Role Selection Screen (Screen 5: "How will you use KindLink?")
 * Exactly matches the design mockup:
 * - Bold title "How will you use KindLink?"
 * - Subtitle "Select your role to get started with the right experience."
 * - 3 Selectable Role Cards (Elderly member, Volunteer, Admin)
 * - Selected card highlighted with light blue background and blue border
 * - "Continue" primary button
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import {
  RoleElderlyIcon,
  RoleVolunteerIcon,
  RoleAdminIcon,
} from '@/components/ui/onboarding-icons';
import { OnboardingColors } from '@/constants/theme';

export type UserRole = 'elderly' | 'volunteer' | 'admin';

interface RoleOption {
  id: UserRole;
  title: string;
  description: string;
  Icon: React.ComponentType<{ size?: number; color?: string }>;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'elderly',
    title: 'Elderly member',
    description: 'I am looking for local support or friendly companionship',
    Icon: RoleElderlyIcon,
  },
  {
    id: 'volunteer',
    title: 'Volunteer',
    description: 'I want to offer my time to assist elderly neighbors nearby',
    Icon: RoleVolunteerIcon,
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'I manage safety, verification, and community feedback',
    Icon: RoleAdminIcon,
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>('elderly');

  const handleContinue = useCallback(() => {
    router.push({
      pathname: '/(auth)/register',
      params: { role: selectedRole },
    });
  }, [router, selectedRole]);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={OnboardingColors.screenBg} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom', 'left', 'right']}>
        <View style={styles.content}>
          {/* ─── Header ─── */}
          <View style={styles.header}>
            <Text style={styles.title}>How will you use KindLink?</Text>
            <Text style={styles.subtitle}>
              Select your role to get started with the{'\n'}right experience.
            </Text>
          </View>

          {/* ─── Role Cards List ─── */}
          <ScrollView
            style={styles.cardsScroll}
            contentContainerStyle={styles.cardsContainer}
            showsVerticalScrollIndicator={false}>
            {ROLE_OPTIONS.map((option) => {
              const isSelected = selectedRole === option.id;
              const { Icon } = option;

              return (
                <Pressable
                  key={option.id}
                  style={({ pressed }) => [
                    styles.roleCard,
                    isSelected ? styles.roleCardSelected : styles.roleCardUnselected,
                    pressed && styles.roleCardPressed,
                  ]}
                  onPress={() => setSelectedRole(option.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  accessibilityLabel={`${option.title}: ${option.description}`}>
                  {/* Left Icon Box */}
                  <View style={styles.iconContainer}>
                    <Icon size={22} color="#FFFFFF" />
                  </View>

                  {/* Right Text Content */}
                  <View style={styles.roleTextContainer}>
                    <Text style={styles.roleTitle}>{option.title}</Text>
                    <Text style={styles.roleDescription}>{option.description}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* ─── Bottom CTA ─── */}
          <View style={styles.bottomContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
              ]}
              onPress={handleContinue}
              accessibilityRole="button"
              accessibilityLabel="Continue">
              <Text style={styles.primaryButtonText}>Continue</Text>
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
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  header: {
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: OnboardingColors.textHeading,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  subtitle: {
    fontSize: 14,
    color: OnboardingColors.textSecondary,
    marginTop: 6,
    lineHeight: 20,
    fontWeight: '500',
  },
  cardsScroll: {
    flex: 1,
  },
  cardsContainer: {
    gap: 14,
    paddingVertical: 4,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    gap: 14,
  },
  roleCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  roleCardSelected: {
    backgroundColor: OnboardingColors.selectedCardBg,
    borderWidth: 1.5,
    borderColor: OnboardingColors.selectedBorder,
  },
  roleCardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: OnboardingColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  roleTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: OnboardingColors.textHeading,
    letterSpacing: -0.2,
  },
  roleDescription: {
    fontSize: 12.5,
    color: OnboardingColors.textSecondary,
    lineHeight: 17,
    marginTop: 3,
    fontWeight: '500',
  },
  bottomContainer: {
    width: '100%',
    paddingTop: 16,
    paddingBottom: 16,
  },
  primaryButton: {
    width: '100%',
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
});
