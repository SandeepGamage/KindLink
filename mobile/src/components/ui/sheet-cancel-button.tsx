import React from 'react';
import { StyleSheet } from 'react-native';
import { Button } from '@/components/admin/button';
import { useAdminTheme } from '@/hooks/use-admin-theme';

interface SheetCancelButtonProps {
  onPress: () => void;
  /** Row text. Defaults to "Cancel". */
  label?: string;
}

/**
 * The trailing dismiss row shared by the bottom sheets — the same white,
 * grey-bordered pill as the profile's Sign Out button, with a quiet grey label.
 *
 * Extracted from `ActionSheet` so sheets built directly on `BottomSheetModal`
 * (the users directory's action sheet, for one) get the identical treatment
 * instead of restyling their own.
 */
export function SheetCancelButton({ onPress, label = 'Cancel' }: SheetCancelButtonProps) {
  const c = useAdminTheme();

  return (
    <Button
      label={label}
      variant="secondary"
      onPress={onPress}
      fullWidth
      labelColor={c.textSecondary}
      style={styles.cancel}
    />
  );
}

const styles = StyleSheet.create({
  cancel: {
    marginTop: 4,
  },
});
