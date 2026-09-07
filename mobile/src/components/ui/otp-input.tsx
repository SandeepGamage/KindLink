/**
 * otp-input.tsx
 *
 * Modular 6-digit OTP PIN input component:
 * - 6 discrete high-contrast boxes matching KindLink 60-30-10 palette
 * - Auto-advances focus to next input on keystroke
 * - Auto-focuses previous input on backspace
 * - Full clipboard paste support (spreads 6 digits across all boxes)
 * - Pure React Native StyleSheet.create (no NativeWind/Tailwind)
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
  Platform,
} from 'react-native';
import { Palette, FunctionalColors } from '@/constants/theme';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  hasError?: boolean;
  autoFocus?: boolean;
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  hasError = false,
  autoFocus = true,
}: OtpInputProps) {
  const [focusedIndex, setFocusedIndex] = useState<number | null>(autoFocus ? 0 : null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  // Split current value into array of individual characters
  const digits = Array.from({ length }, (_, i) => value[i] || '');

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChangeText = useCallback(
    (text: string, index: number) => {
      if (disabled) return;

      const cleaned = text.replace(/[^0-9]/g, '');

      // Handle paste of multiple characters
      if (cleaned.length > 1) {
        const pastedDigits = cleaned.slice(0, length);
        onChange(pastedDigits);
        const nextFocusIndex = Math.min(pastedDigits.length, length - 1);
        inputRefs.current[nextFocusIndex]?.focus();
        return;
      }

      // Single digit entry
      const newDigits = [...digits];
      newDigits[index] = cleaned;
      const combined = newDigits.join('').slice(0, length);
      onChange(combined);

      // Auto-advance to next input if digit entered
      if (cleaned && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [digits, disabled, length, onChange]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (disabled) return;

      if (e.nativeEvent.key === 'Backspace') {
        if (!digits[index] && index > 0) {
          // Current box is already empty, move back and clear previous
          const newDigits = [...digits];
          newDigits[index - 1] = '';
          onChange(newDigits.join(''));
          inputRefs.current[index - 1]?.focus();
        } else if (digits[index]) {
          const newDigits = [...digits];
          newDigits[index] = '';
          onChange(newDigits.join(''));
        }
      }
    },
    [digits, disabled, onChange]
  );

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const digit = digits[index] || '';

        return (
          <View
            key={index}
            style={[
              styles.boxWrapper,
              isFocused && styles.boxWrapperFocused,
              hasError && styles.boxWrapperError,
              disabled && styles.boxWrapperDisabled,
            ]}>
            <TextInput
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              style={[
                styles.input,
                isFocused && styles.inputFocused,
                hasError && styles.inputError,
              ]}
              value={digit}
              onChangeText={(text) => handleChangeText(text, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              onFocus={() => setFocusedIndex(index)}
              onBlur={() => setFocusedIndex(null)}
              keyboardType="number-pad"
              maxLength={index === 0 ? length : 1}
              selectTextOnFocus
              editable={!disabled}
              accessible
              accessibilityLabel={`Verification digit ${index + 1} of ${length}`}
              textContentType={index === 0 ? 'oneTimeCode' : 'none'}
              autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            />
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginVertical: 16,
    gap: 8,
  },
  boxWrapper: {
    flex: 1,
    height: 58,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Palette.border,
    backgroundColor: Palette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  boxWrapperFocused: {
    borderColor: Palette.secondary,
    backgroundColor: '#F7FAFD',
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  boxWrapperError: {
    borderColor: FunctionalColors.danger,
    backgroundColor: '#FFF8F8',
  },
  boxWrapperDisabled: {
    backgroundColor: '#F4F7FA',
    opacity: 0.6,
  },
  input: {
    width: '100%',
    height: '100%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
    color: Palette.ink,
    padding: 0,
  },
  inputFocused: {
    color: Palette.secondary,
  },
  inputError: {
    color: FunctionalColors.danger,
  },
});
