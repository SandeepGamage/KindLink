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

  // Fixed positional slots array
  const [slots, setSlots] = useState<string[]>(() => {
    const initial = Array(length).fill('');
    for (let i = 0; i < Math.min(value?.length || 0, length); i++) {
      initial[i] = value[i];
    }
    return initial;
  });

  const lastEmittedValueRef = useRef<string>(value || '');

  // Synchronize when value is reset or changed externally (e.g. cleared by parent on resend)
  useEffect(() => {
    if (value !== lastEmittedValueRef.current) {
      lastEmittedValueRef.current = value || '';
      const newSlots = Array(length).fill('');
      for (let i = 0; i < Math.min(value?.length || 0, length); i++) {
        newSlots[i] = value[i];
      }
      setSlots(newSlots);
    }
  }, [value, length]);

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0]?.focus();
    }
  }, [autoFocus]);

  const handleChangeText = useCallback(
    (text: string, index: number) => {
      if (disabled) return;

      const cleaned = text.replace(/[^0-9]/g, '');

      // Handle paste of multiple characters (spreads across slots from index 0)
      if (cleaned.length >= length) {
        const pastedDigits = cleaned.slice(0, length).split('');
        const newSlots = Array(length).fill('');
        for (let i = 0; i < length; i++) {
          newSlots[i] = pastedDigits[i] || '';
        }
        setSlots(newSlots);
        const combined = newSlots.join('');
        lastEmittedValueRef.current = combined;
        onChange(combined);
        inputRefs.current[length - 1]?.focus();
        return;
      }

      // If text was cleared (e.g. backspace or selection deletion)
      if (cleaned === '') {
        setSlots((prev) => {
          if (!prev[index]) return prev;
          const next = [...prev];
          next[index] = '';
          const combined = next.join('');
          lastEmittedValueRef.current = combined;
          onChange(combined);
          return next;
        });
        return;
      }

      // Single digit entry or replacement in current slot
      setSlots((prev) => {
        const prevChar = prev[index] || '';
        const newChar =
          cleaned.length > 1
            ? cleaned.replace(prevChar, '')[0] || cleaned[cleaned.length - 1]
            : cleaned[0];

        const next = [...prev];
        next[index] = newChar;
        const combined = next.join('');
        lastEmittedValueRef.current = combined;
        onChange(combined);
        return next;
      });

      // Auto-advance to next input if digit entered
      if (cleaned && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    },
    [disabled, length, onChange]
  );

  const handleKeyPress = useCallback(
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>, index: number) => {
      if (disabled) return;

      if (e.nativeEvent.key === 'Backspace') {
        setSlots((prev) => {
          if (!prev[index] && index > 0) {
            // Current box is already empty, move back and clear previous slot
            const next = [...prev];
            next[index - 1] = '';
            const combined = next.join('');
            lastEmittedValueRef.current = combined;
            onChange(combined);
            inputRefs.current[index - 1]?.focus();
            return next;
          } else if (prev[index]) {
            // Current box has a digit, clear only this slot
            const next = [...prev];
            next[index] = '';
            const combined = next.join('');
            lastEmittedValueRef.current = combined;
            onChange(combined);
            return next;
          }
          return prev;
        });
      }
    },
    [disabled, onChange]
  );

  return (
    <View style={styles.container}>
      {Array.from({ length }).map((_, index) => {
        const isFocused = focusedIndex === index;
        const digit = slots[index] || '';

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
              maxLength={length}
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
