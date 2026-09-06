import React from 'react';
import { Text, StyleSheet, Pressable } from 'react-native';
import { Radius } from '@/components/admin/tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';

interface SheetCancelButtonProps {
  onPress: () => void;
  /** Row text. Defaults to "Cancel". */
  label?: string;
}

/**
 * The trailing dismiss row shared by the bottom sheets — a quiet, fill-less
 * text button that sits under the last action.
 *
 * Extracted from `ActionSheet` so sheets built directly on `BottomSheetModal`
 * (the users directory's action sheet, for one) get the identical treatment
 * instead of restyling their own.
 */
export function SheetCancelButton({ onPress, label = 'Cancel' }: SheetCancelButtonProps) {
  const c = useAdminTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.cancel,
        { borderColor: c.border },
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.cancelText, { color: c.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cancel: {
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    borderWidth: 1,
    // The pill radius the admin buttons share.
    borderRadius: Radius.card,
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
