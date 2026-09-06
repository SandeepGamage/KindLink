import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { FunctionalColors } from '@/constants/theme';
import { Radius, AdminSpacing } from './tokens';

interface AdminProfileFieldProps {
  label: string;
  value: string;
  /** Swaps the read-only value for a text input. */
  editing?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  /** Taller input for free text such as the bio. */
  multiline?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  /** Suppresses the bottom divider on the final row of a card. */
  isLast?: boolean;
  /** Validation message shown under the input. Only rendered while editing. */
  error?: string;
  maxLength?: number;
}

/**
 * One labelled row of the admin profile card. Renders the read-only value or an
 * input for the same field, so both modes stay in sync from a single definition.
 */
export function AdminProfileField({
  label,
  value,
  editing,
  onChangeText,
  placeholder,
  multiline,
  keyboardType,
  autoCapitalize,
  isLast,
  error,
  maxLength,
}: AdminProfileFieldProps) {
  const c = useAdminTheme();
  const isEditable = !!editing && !!onChangeText;
  const showError = isEditable && !!error;

  return (
    <View style={[styles.row, !isLast && [styles.rowDivider, { borderBottomColor: c.divider }]]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>

      {isEditable ? (
        <>
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={c.textMuted}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            multiline={multiline}
            maxLength={maxLength}
            textAlignVertical={multiline ? 'top' : 'center'}
            accessibilityLabel={label}
            aria-invalid={showError}
            style={[
              styles.input,
              multiline ? styles.inputMultiline : styles.inputSingle,
              // c.card, not c.surface — the rows sit on the page background, which
              // *is* c.surface in light mode, so the field would vanish into it.
              { backgroundColor: c.card, borderColor: c.border, color: c.text },
              showError && styles.inputError,
            ]}
          />
          {showError && (
            <Text style={styles.errorText} accessibilityRole="alert">
              {error}
            </Text>
          )}
        </>
      ) : (
        <Text style={[styles.value, { color: value ? c.text : c.textMuted }]}>
          {value || '—'}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: 1,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
  },
  value: {
    fontSize: 15,
  },
  input: {
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    fontSize: 15,
  },
  inputSingle: {
    height: AdminSpacing.inputHeight,
    // Android adds its own vertical padding, which fights a fixed height.
    paddingVertical: 0,
  },
  inputMultiline: {
    minHeight: 120,
    paddingVertical: 16,
  },
  inputError: {
    borderColor: FunctionalColors.danger,
  },
  errorText: {
    fontSize: 12,
    marginTop: 6,
    color: FunctionalColors.dangerText,
  },
});
