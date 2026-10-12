/**
 * auth-input.tsx
 *
 * Reusable styled text input for auth screens.
 * Matches the design: lavender background, blue border on focus, rounded corners.
 * Fully accessible with proper autoComplete and textContentType hints.
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  type TextInputProps,
  Platform,
} from 'react-native';
import { AuthColors, Palette } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  /** Displayed below the input on validation failure */
  error?: string | null;
  /** Accessible label (falls back to placeholder) */
  accessibilityLabel?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthInput({
  error,
  placeholder,
  accessibilityLabel,
  ...rest
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    rest.onFocus?.(null as never);
  }, [rest]);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    rest.onBlur?.(null as never);
  }, [rest]);

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={[
          styles.input,
          isFocused && styles.inputFocused,
          !!error && styles.inputError,
        ]}
        placeholder={placeholder}
        placeholderTextColor={AuthColors.textMuted}
        accessibilityLabel={accessibilityLabel ?? placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        // Security: disable spell-check on sensitive fields
        spellCheck={false}
        // Prevent auto-correction on password fields
        autoCorrect={false}
        {...rest}
      />
      {!!error && (
        <Text style={styles.errorText} accessibilityRole="alert">
          {error}
        </Text>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  wrapper: {
    gap: 4,
  },
  input: {
    height: 58,
    backgroundColor: AuthColors.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    paddingHorizontal: 20,
    fontSize: 16,
    color: Palette.ink,
    fontWeight: '500',
    // Subtle shadow on Android
    ...Platform.select({
      android: { elevation: 0 },
    }),
  },
  inputFocused: {
    borderColor: AuthColors.inputBorder,
    backgroundColor: Palette.primary,
    // subtle shadow on focus
    ...Platform.select({
      ios: {
        shadowColor: AuthColors.primaryBlue,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
      },
    }),
  },
  inputError: {
    borderColor: AuthColors.error,
  },
  errorText: {
    fontSize: 12,
    color: AuthColors.error,
    marginLeft: 4,
  },
});
