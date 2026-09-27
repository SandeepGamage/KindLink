import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius } from './tokens';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'neutral';

const TONES: Record<BadgeTone, { bg: string; text: string }> = {
  success: { bg: FunctionalColors.successBg, text: FunctionalColors.successText },
  warning: { bg: FunctionalColors.warningBg, text: FunctionalColors.warningText },
  danger: { bg: FunctionalColors.dangerBg, text: FunctionalColors.dangerText },
  info: { bg: FunctionalColors.infoBg, text: FunctionalColors.infoText },
  accent: { bg: FunctionalColors.accentLight, text: Palette.accent },
  neutral: { bg: Palette.blueTint, text: Palette.secondary },
};

interface StatusBadgeProps {
  label: string;
  tone?: BadgeTone;
  /** Uppercases the label — used for role chips. */
  uppercase?: boolean;
  style?: StyleProp<ViewStyle>;
}

/**
 * Small pill used for statuses, roles and counts across the admin screens.
 * Replaces the per-screen hand-rolled badge styles.
 */
export function StatusBadge({ label, tone = 'neutral', uppercase, style }: StatusBadgeProps) {
  const { bg, text } = TONES[tone];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }, uppercase && styles.uppercase]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
  },
  uppercase: {
    textTransform: 'uppercase',
  },
});
