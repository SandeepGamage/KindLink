import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  Platform,
  ActivityIndicator,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Palette, FunctionalColors } from '@/constants/theme';

export const PILL_BUTTON_HEIGHT = 54;

interface PillButtonProps {
  label: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  /** Shows a spinner and blocks presses */
  loading?: boolean;
}

/**
 * Full-width brand-blue pill used for the primary action on auth screens (welcome, onboarding, login).
 */
export function PillButton({ label, onPress, style, loading = false }: PillButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && !loading && styles.buttonPressed,
        loading && styles.buttonLoading,
        style,
      ]}
      onPress={onPress}
      disabled={loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: loading, busy: loading }}>
      {loading ? (
        <ActivityIndicator color={Palette.primary} size="small" />
      ) : (
        <Text style={styles.label}>{label}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: PILL_BUTTON_HEIGHT,
    backgroundColor: Palette.secondary,
    borderRadius: PILL_BUTTON_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.24,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  buttonPressed: {
    backgroundColor: FunctionalColors.secondaryDark,
    transform: [{ scale: 0.985 }],
  },
  buttonLoading: {
    opacity: 0.75,
  },
  label: {
    color: Palette.primary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
});
