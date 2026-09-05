import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BottomSheetModal } from './bottom-sheet-modal';
import { Radius } from '@/components/admin/tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { FunctionalColors } from '@/constants/theme';

export interface ActionSheetOption {
  label: string;
  /** Rendered to the left of the label, e.g. a lucide icon. */
  icon?: React.ReactNode;
  /** `danger` tints the row red for destructive choices. */
  tone?: 'default' | 'danger';
  onPress: () => void;
}

interface ActionSheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  options: ActionSheetOption[];
  /** Text of the trailing dismiss row. Pass null to omit it. */
  cancelText?: string | null;
}

/**
 * A generic list-of-choices bottom sheet — the iOS action sheet pattern, made
 * to work identically on Android.
 *
 * Built on `BottomSheetModal` so the animation and dismiss behaviour stay in one
 * place; only the sizing and fill are overridden, since a short list of rows
 * should hug its content rather than take the form-sheet's 40% minimum.
 */
export function ActionSheet({
  visible,
  onClose,
  title,
  subtitle,
  options,
  cancelText = 'Cancel',
}: ActionSheetProps) {
  const c = useAdminTheme();

  const handlePress = (option: ActionSheetOption) => {
    // Close first so the sheet is never left hanging over a picker or an alert
    // that the action opens.
    onClose();
    option.onPress();
  };

  return (
    <BottomSheetModal visible={visible} onClose={onClose} minHeight={0} backgroundColor={c.card}>
      {(title || subtitle) && (
        <View style={styles.header}>
          {title && <Text style={[styles.title, { color: c.text }]}>{title}</Text>}
          {subtitle && (
            <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
          )}
        </View>
      )}

      {options.map((option) => {
        const isDanger = option.tone === 'danger';
        return (
          <Pressable
            key={option.label}
            onPress={() => handlePress(option)}
            accessibilityRole="button"
            accessibilityLabel={option.label}
            style={({ pressed }) => [
              styles.option,
              { backgroundColor: c.surface },
              pressed && styles.pressed,
            ]}
          >
            {option.icon}
            <Text
              style={[styles.optionText, { color: isDanger ? FunctionalColors.danger : c.text }]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}

      {cancelText && (
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={cancelText}
          style={({ pressed }) => [styles.cancel, pressed && styles.pressed]}
        >
          <Text style={[styles.cancelText, { color: c.textSecondary }]}>{cancelText}</Text>
        </Pressable>
      )}
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  header: {
    marginBottom: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 4,
    textAlign: 'center',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 16,
    // 56dp keeps every row comfortably above the 44dp touch-target minimum.
    minHeight: 56,
    borderRadius: Radius.md,
    marginBottom: 8,
  },
  optionText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
  cancel: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
