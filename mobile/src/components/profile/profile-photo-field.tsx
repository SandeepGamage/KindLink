import React from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Avatar } from '@/components/ui/avatar';
import type { AvatarPickerState } from '@/hooks/use-avatar-picker';
import { FunctionalColors, Palette } from '@/constants/theme';

interface Props {
  photo: AvatarPickerState;
  name?: string | null;
  disabled?: boolean;
  optional?: boolean;
}

/** Shared by signup and profile editors; selection stays local until form save. */
export function ProfilePhotoField({ photo, name, disabled, optional }: Props) {
  const busy = disabled || photo.busy;
  return (
    <View style={styles.container}>
      <Avatar name={name} uri={photo.uri} size={96} />
      <Text style={styles.label}>Profile picture{optional ? ' (optional)' : ''}</Text>
      <View style={styles.actions}>
        {Platform.OS !== 'web' && (
          <PhotoButton label="Take photo" disabled={busy} onPress={photo.takePhoto} />
        )}
        <PhotoButton label={photo.uri ? 'Change photo' : 'Choose photo'} disabled={busy} onPress={photo.chooseFromLibrary} />
        {photo.uri && <PhotoButton label="Remove photo" disabled={busy} onPress={photo.removePhoto} />}
      </View>
      {photo.busy && <ActivityIndicator color={Palette.secondary} accessibilityLabel="Preparing photo" />}
      <Text style={styles.hint}>
        {photo.isRemoved ? 'Your photo will be removed when you save.' :
          photo.isDirty ? 'Your photo will be uploaded when you save.' :
            'Choose a clear photo of yourself. It will be visible on your profile.'}
      </Text>
      {!!photo.error && <Text style={styles.error} accessibilityRole="alert">{photo.error}</Text>}
      {photo.canOpenSettings && <PhotoButton label="Open settings" onPress={photo.openSettings} disabled={busy} />}
    </View>
  );
}

function PhotoButton({ label, disabled, onPress }: {
  label: string; disabled?: boolean; onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} disabled={disabled} accessibilityRole="button"
      accessibilityLabel={label} accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [styles.button, (pressed || disabled) && styles.dimmed]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', gap: 12, paddingVertical: 18, width: '100%' },
  label: { fontSize: 16, fontWeight: '700', color: Palette.secondary, backgroundColor: Palette.blueTint, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actions: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 8 },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, backgroundColor: Palette.blueTint, justifyContent: 'center' },
  buttonText: { fontSize: 15, fontWeight: '600', color: Palette.secondary },
  dimmed: { opacity: 0.5 },
  hint: { fontSize: 14, lineHeight: 20, color: FunctionalColors.textSecondary, textAlign: 'center', maxWidth: 360 },
  error: { fontSize: 14, lineHeight: 20, color: FunctionalColors.danger, textAlign: 'center' },
});
