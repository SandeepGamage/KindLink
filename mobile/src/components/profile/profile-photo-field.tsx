import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { Camera, ImageIcon, Trash2 } from 'lucide-react-native';
import { Avatar } from '@/components/ui/avatar';
import { ActionSheet, type ActionSheetOption } from '@/components/ui/action-sheet';
import type { AvatarPickerState } from '@/hooks/use-avatar-picker';
import { FunctionalColors, Palette } from '@/constants/theme';

interface Props {
  photo: AvatarPickerState;
  name?: string | null;
  disabled?: boolean;
  optional?: boolean;
}

/**
 * Shared Profile Photo Field with bottom popup action sheet.
 * Used across Elderly and Volunteer profile editing and signup.
 */
export function ProfilePhotoField({ photo, name, disabled, optional }: Props) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const busy = disabled || photo.busy;
  const [sheetVisible, setSheetVisible] = useState(false);

  const photoOptions = useMemo<ActionSheetOption[]>(() => {
    const textColor = isDark ? '#F8FAFC' : Palette.ink;
    const options: ActionSheetOption[] = [];

    if (Platform.OS !== 'web') {
      options.push({
        label: 'Take Photo',
        icon: <Camera size={20} color={textColor} />,
        onPress: photo.takePhoto,
      });
    }

    options.push({
      label: 'Choose from Gallery',
      icon: <ImageIcon size={20} color={textColor} />,
      onPress: photo.chooseFromLibrary,
    });

    if (photo.uri) {
      options.push({
        label: 'Remove Current Photo',
        icon: <Trash2 size={20} color={FunctionalColors.danger} />,
        tone: 'danger',
        onPress: photo.removePhoto,
      });
    }

    return options;
  }, [isDark, photo.uri, photo.takePhoto, photo.chooseFromLibrary, photo.removePhoto]);

  return (
    <View style={styles.container}>
      {/* Clickable Profile Photo with Camera Badge */}
      <Pressable
        onPress={() => setSheetVisible(true)}
        disabled={busy}
        accessibilityRole="button"
        accessibilityLabel="Change profile picture"
        accessibilityHint="Opens photo options to take a photo, choose from gallery, or remove photo"
        style={({ pressed }) => [
          styles.avatarWrapper,
          pressed && !busy && styles.pressed,
        ]}>
        <Avatar name={name} uri={photo.uri} size={104} />

        {/* Loading Spinner during compression/processing */}
        {photo.busy && (
          <View style={styles.busyOverlay}>
            <ActivityIndicator color="#FFFFFF" size="small" />
          </View>
        )}

        {/* Circular Camera Badge at bottom-right */}
        <View
          style={[
            styles.cameraBadge,
            {
              backgroundColor: Palette.secondary,
              borderColor: isDark ? '#17242E' : '#FFFFFF',
            },
          ]}>
          <Camera size={16} color="#FFFFFF" strokeWidth={2.4} />
        </View>
      </Pressable>

      <Text style={styles.label}>
        Profile picture{optional ? ' (optional)' : ''}
      </Text>

      <Text
        style={[
          styles.hint,
          { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
        ]}>
        {photo.isRemoved
          ? 'Your photo will be removed when you save.'
          : photo.isDirty
          ? 'Your photo will be uploaded when you save.'
          : 'Tap profile photo to choose or change picture.'}
      </Text>

      {!!photo.error && (
        <Text style={styles.error} accessibilityRole="alert">
          {photo.error}
        </Text>
      )}

      {photo.canOpenSettings && (
        <Pressable
          onPress={photo.openSettings}
          disabled={busy}
          style={({ pressed }) => [
            styles.settingsBtn,
            pressed && styles.pressed,
          ]}>
          <Text style={styles.settingsBtnText}>Open device settings</Text>
        </Pressable>
      )}

      {/* Bottom Popup Action Sheet */}
      <ActionSheet
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        title="Profile Photo"
        subtitle="Select an option to update your profile photo"
        options={photoOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    width: '100%',
  },
  avatarWrapper: {
    position: 'relative',
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busyOverlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
  },
  cameraBadge: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      },
    }),
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.secondary,
    backgroundColor: Palette.blueTint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    maxWidth: 340,
    marginTop: 2,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    color: FunctionalColors.danger,
    textAlign: 'center',
    marginTop: 2,
  },
  settingsBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Palette.blueTint,
    marginTop: 4,
  },
  settingsBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.secondary,
  },
});
