import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const VARIANTS: Record<ButtonVariant, { bg: string; border: string; label: string }> = {
  primary: { bg: Palette.secondary, border: Palette.secondary, label: Palette.primary },
  secondary: { bg: Palette.primary, border: Palette.border, label: Palette.ink },
  danger: { bg: FunctionalColors.dangerBg, border: FunctionalColors.dangerBg, label: FunctionalColors.danger },
  ghost: { bg: 'transparent', border: 'transparent', label: Palette.secondary },
};

interface ButtonProps {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  /** Swaps the label for a spinner and blocks presses. */
  loading?: boolean;
  disabled?: boolean;
  /** Rendered to the left of the label. */
  icon?: React.ReactNode;
  /** Stretch to fill the parent. */
  fullWidth?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
}

/**
 * The single pill button used across the admin screens — primary CTAs, modal
 * actions, destructive actions and quick-action chips.
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  fullWidth,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const colors = VARIANTS[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.bg, borderColor: colors.border },
        fullWidth && styles.fullWidth,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.label} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, { color: colors.label }, !!icon && styles.labelWithIcon]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Radius.card,
    borderWidth: 1,
    minHeight: 44,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.5,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  labelWithIcon: {
    marginLeft: 8,
  },
});
