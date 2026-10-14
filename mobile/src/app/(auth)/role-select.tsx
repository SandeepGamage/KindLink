/**
 * (auth)/role-select.tsx
 *
 * KindLink Role Selection Screen (Step 1 of 5)
 * Matches the design mockup:
 * - Brand header with "K" logo and "KindLink" title, "1 of 5" capsule badge
 * - 5-segment progress bar with step 1 active
 * - Hero banner card with community photo, overlay text, and photographer credit
 * - Section header with community icon: "How will you use KindLink?"
 * - Selectable role cards ("I need support", "I want to volunteer")
 * - Selected state with soft blue fill, navy border, and checkmark circle
 * - Primary CTA "Continue >" and safety footer disclaimer
 * - Validation using useToast()
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  Platform,
} from 'react-native';
import { AppText as Text } from '@/components/ui/app-text';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Users, Heart, ChevronRight, Check } from 'lucide-react-native';

import {
  SignupStepHeader,
  SignupSectionTitle,
  SignupPrimaryButton,
  SignupFooterNote,
} from '@/components/auth/signup-wizard-ui';
import { useToast } from '@/context/toast-context';
import { Palette } from '@/constants/theme';

export type UserRole = 'elderly' | 'volunteer';

interface RoleOption {
  id: UserRole;
  title: string;
  subtitle: string;
  iconBg: string;
  iconColor: string;
  renderIcon: () => React.ReactNode;
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    id: 'elderly',
    title: 'I need support',
    subtitle: 'I am an elderly member or family caregiver',
    iconBg: Palette.secondary,
    iconColor: '#FFFFFF',
    renderIcon: () => <Heart size={22} color="#FFFFFF" strokeWidth={2.4} fill="#FFFFFF" />,
  },
  {
    id: 'volunteer',
    title: 'I want to volunteer',
    subtitle: 'I want to support older people nearby',
    iconBg: '#FEF3E2',
    iconColor: '#C4742B',
    renderIcon: () => <Users size={22} color="#C4742B" strokeWidth={2.4} />,
  },
];

export default function RoleSelectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  // Default to volunteer as shown in mockup
  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');

  const handleContinue = useCallback(() => {
    if (!selectedRole) {
      showToast('Please choose how you will use KindLink.', { type: 'error' });
      return;
    }

    router.push({
      pathname: '/(auth)/register',
      params: { role: selectedRole },
    });
  }, [router, selectedRole, showToast]);

  return (
    <View style={[styles.root, { paddingTop: insets.top, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar barStyle="dark-content" backgroundColor={Palette.surface} />

      {/* ─── Top Header (Step 1 of 5) ─── */}
      <SignupStepHeader currentStep={1} totalSteps={5} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ─── Hero Image Card ─── */}
        <View style={styles.heroCardContainer}>
          <Image
            source={require('@/assets/images/community-hero.jpg')}
            style={styles.heroImage}
            contentFit="cover"
            transition={300}
          />
          <View style={styles.heroOverlay}>
            <Text style={styles.heroTitle}>A community that cares.</Text>
            <Text style={styles.heroSubtitle}>Join KindLink in a few simple steps.</Text>
          </View>
        </View>

        {/* <Text style={styles.photoCreditText}>Photo: Adelson Gomz / Unsplash</Text> */}

        {/* ─── Section Header ─── */}
        <SignupSectionTitle
          icon={<Users size={24} color={Palette.secondary} strokeWidth={2.4} />}
          title="How will you use KindLink?"
          subtitle="Choose the option that best describes you."
        />

        {/* ─── Role Cards ─── */}
        <View style={styles.cardsList}>
          {ROLE_OPTIONS.map((option) => {
            const isSelected = selectedRole === option.id;

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
                accessibilityLabel={`${option.title}: ${option.subtitle}`}>
                {/* Left Icon Badge */}
                <View style={[styles.cardIconBox, { backgroundColor: option.iconBg }]}>
                  {option.renderIcon()}
                </View>

                {/* Text Content */}
                <View style={styles.cardTextCol}>
                  <Text style={styles.cardTitle}>{option.title}</Text>
                  <Text style={styles.cardSubtitle}>{option.subtitle}</Text>
                </View>

                {/* Right Selection Indicator */}
                {isSelected ? (
                  <View style={styles.checkedCircle}>
                    <Check size={14} color="#FFFFFF" strokeWidth={3} />
                  </View>
                ) : (
                  <ChevronRight size={22} color="#94A3B8" strokeWidth={2.2} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      {/* ─── Bottom CTA & Footer (Pinned at bottom) ─── */}
      <View style={styles.bottomSection}>
        <SignupPrimaryButton label="Continue" onPress={handleContinue} />
        <SignupFooterNote />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 24,
  },

  // Hero Card
  heroCardContainer: {
    width: '100%',
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#CBD5E1',
    position: 'relative',
    marginTop: 6,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.42)',
    justifyContent: 'flex-end',
    paddingHorizontal: 18,
    paddingBottom: 16,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  heroSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 13.5,
    fontWeight: '500',
    marginTop: 3,
  },
  photoCreditText: {
    fontSize: 11,
    color: '#8A9DAE',
    textAlign: 'right',
    marginTop: 5,
    marginBottom: 12,
  },

  // Role Cards
  cardsList: {
    gap: 14,
    marginBottom: 24,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 18,
    minHeight: 88,
    gap: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 5,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  roleCardUnselected: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.4,
    borderColor: '#E2E8F0',
  },
  roleCardSelected: {
    backgroundColor: '#F0F6FD',
    borderWidth: 2,
    borderColor: Palette.secondary,
  },
  roleCardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  cardIconBox: {
    width: 50,
    height: 50,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTextCol: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.2,
  },
  cardSubtitle: {
    fontSize: 13.5,
    color: '#55687C',
    marginTop: 3,
    lineHeight: 18.5,
  },
  checkedCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Bottom CTA
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: Palette.surface,
  },
});
