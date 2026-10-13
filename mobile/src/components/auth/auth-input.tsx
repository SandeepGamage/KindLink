/**
 * auth-input.tsx
 *
 * Reusable styled text input for auth screens.
 * Rounded field with a blue border on focus, optional leading icon and an optional
 * show/hide toggle for passwords.
 * Fully accessible with proper autoComplete and textContentType hints.
 */

import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  TextInput,
  Text,
  Pressable,
  StyleSheet,
  type TextInputProps,
  type NativeSyntheticEvent,
  type TargetedEvent,
  Platform,
} from 'react-native';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { AuthColors, Palette } from '@/constants/theme';
import { useKeyboardAwareField } from '@/components/ui/keyboard-aware-scroll-view';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthInputProps extends Omit<TextInputProps, 'style'> {
  /** Displayed below the input on validation failure */
  error?: string | null;
  /** Accessible label (falls back to placeholder) */
  accessibilityLabel?: string;
  /** Optional icon shown at the start of the field */
  icon?: LucideIcon;
  /** For secure fields: show an eye button that reveals the text */
  passwordToggle?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AuthInput({
  error,
  placeholder,
  accessibilityLabel,
  icon: Icon,
  passwordToggle = false,
  secureTextEntry,
  onFocus,
  onBlur,
  ...rest
}: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);
  const fieldRef = useRef<View>(null);
  const reportFieldFocus = useKeyboardAwareField();

  const handleFocus = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocused(true);
      reportFieldFocus(fieldRef.current);
      onFocus?.(event as never);
    },
    [onFocus, reportFieldFocus]
  );

  const handleBlur = useCallback(
    (event: NativeSyntheticEvent<TargetedEvent>) => {
      setIsFocused(false);
      onBlur?.(event as never);
    },
    [onBlur]
  );

  const iconColor = error
    ? AuthColors.error
    : isFocused
      ? AuthColors.inputBorder
      : AuthColors.textMuted;

  return (
    <View style={styles.wrapper}>
      <View
        ref={fieldRef}
        style={[
          styles.field,
          isFocused && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}>
        {Icon && <Icon size={20} color={iconColor} strokeWidth={2} />}
        <TextInput
          {...rest}
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={AuthColors.textMuted}
          accessibilityLabel={accessibilityLabel ?? placeholder}
          secureTextEntry={secureTextEntry && !isRevealed}
          onFocus={handleFocus}
          onBlur={handleBlur}
          // Security: disable spell-check on sensitive fields
          spellCheck={false}
          // Prevent auto-correction on password fields
          autoCorrect={false}
        />
        {passwordToggle && secureTextEntry && (
          <Pressable
            onPress={() => setIsRevealed((prev) => !prev)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={isRevealed ? 'Hide password' : 'Show password'}>
            {isRevealed ? (
              <EyeOff size={20} color={AuthColors.textMuted} strokeWidth={2} />
            ) : (
              <Eye size={20} color={AuthColors.textMuted} strokeWidth={2} />
            )}
          </Pressable>
        )}
      </View>
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
  field: {
    height: 58,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: AuthColors.inputBg,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: AuthColors.border,
    paddingHorizontal: 18,
  },
  fieldFocused: {
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
  fieldError: {
    borderColor: AuthColors.error,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Palette.ink,
    fontWeight: '500',
    padding: 0,
  },
  errorText: {
    fontSize: 12,
    color: AuthColors.error,
    marginLeft: 4,
  },
});
