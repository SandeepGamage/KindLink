import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  useColorScheme,
  Platform,
  type TextInputProps,
} from 'react-native';
import { Palette, FunctionalColors } from '@/constants/theme';
import { LockBadgeIcon } from '@/components/ui/profile-icons';

interface ElderlyInputFieldProps extends TextInputProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  errorMessage?: string | null;
  required?: boolean;
}

/**
 * High-contrast, large touch-target input field tailored for elderly users.
 */
export function ElderlyInputField({
  label,
  sublabel,
  icon,
  errorMessage,
  required,
  style,
  ...rest
}: ElderlyInputFieldProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon && <View style={styles.iconBox}>{icon}</View>}
        <Text style={[styles.label, { color: isDark ? Palette.primary : Palette.ink }]}>
          {label}
          {required && <Text style={styles.requiredStar}> *</Text>}
        </Text>
      </View>

      {sublabel && (
        <Text
          style={[
            styles.sublabel,
            { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
          ]}>
          {sublabel}
        </Text>
      )}

      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? Palette.ink : Palette.primary,
            borderColor: errorMessage
              ? FunctionalColors.danger
              : isDark
                ? '#23384B'
                : Palette.border,
            color: isDark ? Palette.primary : Palette.ink,
          },
          style,
        ]}
        placeholderTextColor={isDark ? '#677B8D' : FunctionalColors.textMuted}
        {...rest}
      />

      {errorMessage && (
        <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
      )}
    </View>
  );
}

interface ElderlyLockedEmailFieldProps {
  email: string;
  label?: string;
}

/**
 * Explicitly locked, non-editable email input for account security and clarity.
 */
export function ElderlyLockedEmailField({
  email,
  label = 'Registered Email Address',
}: ElderlyLockedEmailFieldProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        <View style={styles.iconBox}>
          <LockBadgeIcon size={20} color={isDark ? '#93C5FD' : Palette.secondary} />
        </View>
        <Text style={[styles.label, { color: isDark ? Palette.primary : Palette.ink }]}>
          {label}
        </Text>
        <View
          style={[
            styles.lockBadge,
            {
              backgroundColor: isDark ? 'rgba(31, 92, 150, 0.4)' : Palette.blueTint,
            },
          ]}>
          <Text
            style={[
              styles.lockBadgeText,
              { color: isDark ? '#93C5FD' : Palette.secondary },
            ]}>
            🔒 Permanent
          </Text>
        </View>
      </View>

      <Text
        style={[
          styles.sublabel,
          { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
        ]}>
        Your email is permanently linked to your account for identity protection.
      </Text>

      <View
        style={[
          styles.lockedInputBox,
          {
            backgroundColor: isDark ? '#101B26' : '#EEF4F9',
            borderColor: isDark ? '#23384B' : '#CFDEEB',
          },
        ]}>
        <Text
          style={[
            styles.lockedEmailText,
            { color: isDark ? '#CBD5E1' : '#334155' },
          ]}>
          {email || 'member@kindlink.org'}
        </Text>
        <Text style={styles.lockIconRight}>🔒</Text>
      </View>
    </View>
  );
}

interface ElderlyTextAreaFieldProps extends TextInputProps {
  label: string;
  sublabel?: string;
  icon?: React.ReactNode;
  errorMessage?: string | null;
  minHeight?: number;
}

/**
 * Expansive, high-visibility multi-line text area for elderly care notes and bio.
 */
export function ElderlyTextAreaField({
  label,
  sublabel,
  icon,
  errorMessage,
  minHeight = 130,
  style,
  ...rest
}: ElderlyTextAreaFieldProps) {
  const isDark = useColorScheme() === 'dark';

  return (
    <View style={styles.container}>
      <View style={styles.labelRow}>
        {icon && <View style={styles.iconBox}>{icon}</View>}
        <Text style={[styles.label, { color: isDark ? Palette.primary : Palette.ink }]}>
          {label}
        </Text>
      </View>

      {sublabel && (
        <Text
          style={[
            styles.sublabel,
            { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
          ]}>
          {sublabel}
        </Text>
      )}

      <TextInput
        style={[
          styles.textArea,
          {
            minHeight,
            backgroundColor: isDark ? Palette.ink : Palette.primary,
            borderColor: errorMessage
              ? FunctionalColors.danger
              : isDark
                ? '#23384B'
                : Palette.border,
            color: isDark ? Palette.primary : Palette.ink,
          },
          style,
        ]}
        placeholderTextColor={isDark ? '#677B8D' : FunctionalColors.textMuted}
        multiline
        textAlignVertical="top"
        {...rest}
      />

      {errorMessage && (
        <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  iconBox: {
    marginRight: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  requiredStar: {
    color: FunctionalColors.danger,
    fontSize: 16,
    fontWeight: '700',
  },
  sublabel: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 8,
    lineHeight: 18,
  },
  input: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '600',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  lockedInputBox: {
    height: 54,
    borderRadius: 16,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    opacity: 0.95,
  },
  lockedEmailText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  lockIconRight: {
    fontSize: 16,
  },
  lockBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginLeft: 'auto',
  },
  lockBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  errorText: {
    color: FunctionalColors.danger,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
});
