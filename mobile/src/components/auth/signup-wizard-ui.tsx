import React from 'react';
import { View, Pressable, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { AppText as Text } from '@/components/ui/app-text';
import { ChevronLeft, ChevronRight, ShieldCheck, Heart } from 'lucide-react-native';
import { Palette } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Step Header (Back Button or Logo + Step Capsule Badge + Segmented Progress Bar)
// ---------------------------------------------------------------------------

interface SignupStepHeaderProps {
  currentStep: number;
  totalSteps?: number;
  onBack?: () => void;
  brandTitle?: string;
  showTextResize?: boolean;
}

export function SignupStepHeader({
  currentStep,
  totalSteps = 5,
  onBack,
  brandTitle = 'KindLink',
}: SignupStepHeaderProps) {
  return (
    <View style={styles.headerContainer}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={{ top: 12, bottom: 12, left: 14, right: 14 }}
            style={({ pressed }) => [styles.backButton, pressed && styles.backButtonPressed]}
            accessibilityRole="button"
            accessibilityLabel="Go back">
            <ChevronLeft size={22} color={Palette.secondary} strokeWidth={2.6} />
            <Text style={styles.backButtonText}>Back</Text>
          </Pressable>
        ) : (
          <View style={styles.brandRow}>
            <Image
              source={require('@/assets/images/logo-blue.png')}
              style={styles.brandLogoImage}
              contentFit="contain"
            />
          </View>
        )}

        {/* Step Badge Capsule: e.g. "1 of 5" */}
        <View style={styles.stepBadgeCapsule}>
          <Text style={styles.stepBadgeText}>
            {currentStep} of {totalSteps}
          </Text>
        </View>
      </View>

      {/* Segmented Progress Bar */}
      <View style={styles.progressBarRow}>
        {Array.from({ length: totalSteps }).map((_, index) => {
          const isFilled = index < currentStep;
          return (
            <View
              key={index}
              style={[
                styles.progressSegment,
                isFilled ? styles.progressSegmentFilled : styles.progressSegmentEmpty,
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Section Title Block (Icon + Title + Subtitle)
// ---------------------------------------------------------------------------

interface SignupSectionTitleProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}

export function SignupSectionTitle({ icon, title, subtitle }: SignupSectionTitleProps) {
  return (
    <View style={styles.sectionTitleBlock}>
      <View style={styles.sectionIconBox}>{icon}</View>
      <View style={styles.sectionTextCol}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionSubtitle}>{subtitle}</Text>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Info Banner (Soft Blue or Peach/Amber)
// ---------------------------------------------------------------------------

interface SignupInfoBannerProps {
  text: string;
  variant?: 'blue' | 'peach';
  icon?: React.ReactNode;
}

export function SignupInfoBanner({
  text,
  variant = 'blue',
  icon,
}: SignupInfoBannerProps) {
  const isPeach = variant === 'peach';

  return (
    <View style={[styles.infoBanner, isPeach ? styles.infoBannerPeach : styles.infoBannerBlue]}>
      <View style={styles.infoBannerIcon}>
        {icon ? (
          icon
        ) : isPeach ? (
          <Heart size={20} color="#C4742B" strokeWidth={2.2} />
        ) : (
          <ShieldCheck size={20} color={Palette.secondary} strokeWidth={2.2} />
        )}
      </View>
      <Text style={[styles.infoBannerText, isPeach ? styles.infoTextPeach : styles.infoTextBlue]}>
        {text}
      </Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Primary Button ("Continue >")
// ---------------------------------------------------------------------------

interface SignupPrimaryButtonProps {
  label?: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
}

export function SignupPrimaryButton({
  label = 'Continue',
  onPress,
  loading = false,
  disabled = false,
  showChevron = true,
}: SignupPrimaryButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && !isDisabled && styles.primaryButtonPressed,
        isDisabled && styles.primaryButtonDisabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={label}>
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View style={styles.primaryButtonContent}>
          <Text style={styles.primaryButtonText}>{label}</Text>
          {showChevron && (
            <ChevronRight size={19} color="#FFFFFF" strokeWidth={2.6} style={styles.buttonChevron} />
          )}
        </View>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Footer Note ("You can go back and change anything before finishing.")
// ---------------------------------------------------------------------------

export function SignupFooterNote({
  text = 'You can go back and change anything before finishing.',
}: {
  text?: string;
}) {
  return <Text style={styles.footerNote}>{text}</Text>;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    backgroundColor: Palette.surface,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 40,
    marginBottom: 14,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingRight: 10,
    gap: 3,
  },
  backButtonPressed: {
    opacity: 0.65,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.secondary,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoImage: {
    width: 136,
    height: 29,
  },
  stepBadgeCapsule: {
    backgroundColor: '#E2EEF8',
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.secondary,
    letterSpacing: -0.2,
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  progressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  progressSegmentFilled: {
    backgroundColor: Palette.secondary,
  },
  progressSegmentEmpty: {
    backgroundColor: '#D7E3EE',
  },

  // Section title block
  sectionTitleBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 18,
  },
  sectionIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E2EFFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTextCol: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.4,
    lineHeight: 28,
  },
  sectionSubtitle: {
    fontSize: 14.5,
    color: '#55687C',
    marginTop: 4,
    lineHeight: 20,
    fontWeight: '400',
  },

  // Info banner
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginVertical: 14,
  },
  infoBannerBlue: {
    backgroundColor: '#E4F0FB',
  },
  infoBannerPeach: {
    backgroundColor: '#FEF3E7',
  },
  infoBannerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBannerText: {
    flex: 1,
    fontSize: 13.5,
    lineHeight: 19,
    fontWeight: '500',
  },
  infoTextBlue: {
    color: '#20517E',
  },
  infoTextPeach: {
    color: '#92400E',
  },

  // Primary button
  primaryButton: {
    backgroundColor: Palette.secondary,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#174066',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  primaryButtonPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }],
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  primaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  buttonChevron: {
    marginTop: 1,
  },

  // Footer note
  footerNote: {
    fontSize: 12.5,
    color: '#8A9DAE',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '400',
  },
});
