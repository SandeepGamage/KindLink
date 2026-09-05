import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, Camera, AlertCircle, ImageIcon, Trash2 } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ActionSheet, ActionSheetOption } from '@/components/ui/action-sheet';
import { Avatar } from '@/components/admin/avatar';
import {
  AdminProfileDetails,
  ProfileForm,
  ProfileFormErrors,
  toProfileForm,
  validateProfileForm,
} from '@/components/admin/profile-details';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { useAuthContext } from '@/context/auth-context';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useAvatarPicker } from '@/hooks/use-avatar-picker';
import { Palette, FunctionalColors } from '@/constants/theme';
import { ApiError } from '@/services/admin-api-client';
import { AuthError, type UpdateUserPayload } from '@/services/auth.service';

/** What the header spinner is currently waiting on. */
type SaveStage = 'idle' | 'uploading' | 'saving';

export default function AdminEditProfileScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  const { user, updateUser, logout } = useAuthContext();

  const [form, setForm] = useState<ProfileForm>(() => toProfileForm(user));
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [stage, setStage] = useState<SaveStage>('idle');
  const [error, setError] = useState<string | null>(null);

  const photo = useAvatarPicker(user?.profileImage);

  const saving = stage !== 'idle';

  // Re-sync if the context user resolves after this screen mounts.
  useEffect(() => {
    setForm(toProfileForm(user));
  }, [user]);

  const setField = useCallback((key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear the field's error as soon as it is touched, the same way the auth
    // forms do — leaving a stale message under an edited field reads as a bug.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  }, []);

  const [isPhotoSheetVisible, setPhotoSheetVisible] = useState(false);

  const photoOptions = useMemo<ActionSheetOption[]>(() => {
    const options: ActionSheetOption[] = [
      {
        label: 'Take Photo',
        icon: <Camera size={20} color={c.text} />,
        onPress: photo.takePhoto,
      },
      {
        label: 'Choose from Gallery',
        icon: <ImageIcon size={20} color={c.text} />,
        onPress: photo.chooseFromLibrary,
      },
    ];

    if (photo.uri) {
      options.push({
        label: 'Remove Current Photo',
        icon: <Trash2 size={20} color={FunctionalColors.danger} />,
        tone: 'danger',
        onPress: photo.removePhoto,
      });
    }

    return options;
  }, [c.text, photo.uri, photo.takePhoto, photo.chooseFromLibrary, photo.removePhoto]);

  /** Turns any thrown failure into one sentence worth showing the user. */
  const describeFailure = useCallback(
    async (err: unknown): Promise<string> => {
      const status = err instanceof ApiError || err instanceof AuthError
        ? (err as ApiError).status ?? (err as AuthError).statusCode
        : undefined;

      if (status === 401) {
        // The token is gone or expired; sign out so the root layout can send
        // the user back to the login screen rather than leaving a dead session.
        await logout();
        return 'Your session expired. Please sign in again.';
      }
      if (status === 0) {
        return "Can't reach the server. Check your connection.";
      }
      return (err as Error).message || 'Could not save your profile.';
    },
    [logout]
  );

  const handleSave = useCallback(async () => {
    const validationErrors = validateProfileForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setError(null);
      return;
    }

    setErrors({});
    setError(null);

    // Send only what actually changed, so an untouched field is never overwritten.
    const original = toProfileForm(user);
    const payload: UpdateUserPayload = {};
    const name = form.name.trim();
    if (name !== original.name) payload.name = name;
    if (form.mobile.trim() !== original.mobile) payload.mobile = form.mobile.trim();
    if (form.address.trim() !== original.address) payload.address = form.address.trim();
    if (form.bio.trim() !== original.bio) payload.bio = form.bio.trim();

    try {
      // The photo goes first: it must become a server-hosted path before the
      // profile can reference it. If it fails, nothing is saved at all, so the
      // profile is never left pointing at an image that was never stored.
      if (photo.isDirty || photo.isRemoved) {
        setStage('uploading');
        const storedPath = await photo.upload();
        if (storedPath !== null && storedPath !== original.profileImage) {
          payload.profileImage = storedPath;
        }
      }

      if (Object.keys(payload).length === 0) {
        router.back();
        return;
      }

      setStage('saving');
      await updateUser(payload);
      router.back();
    } catch (err) {
      // Stay on the page so the typed values survive the failure.
      setError(await describeFailure(err));
    } finally {
      setStage('idle');
    }
  }, [form, user, photo, updateUser, router, describeFailure]);

  // The picker reports permission and upload problems through its own state.
  const banner = error ?? photo.error;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Edit Profile"
        leftContent={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            disabled={saving}
            accessibilityRole="button"
            accessibilityLabel="Discard changes and go back"
          >
            <ChevronLeft size={24} color={saving ? c.textMuted : c.text} />
          </Pressable>
        }
        rightContent={
          saving ? (
            <View style={styles.savingIndicator}>
              <ActivityIndicator size="small" color={c.primary} />
              <Text style={[styles.savingLabel, { color: c.textSecondary }]}>
                {stage === 'uploading' ? 'Uploading photo…' : 'Saving…'}
              </Text>
            </View>
          ) : (
            <Pressable
              onPress={handleSave}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Save profile"
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.headerAction, { color: c.primary }]}>Save</Text>
            </Pressable>
          )
        }
      />

      {/* Android resizes the window for the keyboard, so no KeyboardAvoidingView
          is needed — the same approach the other form screens take. */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {banner && (
          <View style={[styles.banner, { backgroundColor: FunctionalColors.dangerBg }]}>
            <AlertCircle size={16} color={FunctionalColors.dangerText} />
            <Text style={styles.bannerText}>{banner}</Text>
            {photo.canOpenSettings && (
              <Pressable
                onPress={photo.openSettings}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel="Open device settings"
              >
                <Text style={styles.bannerAction}>Settings</Text>
              </Pressable>
            )}
          </View>
        )}

        <View style={styles.identity}>
          <View style={styles.avatarWrapper}>
            <Avatar name={form.name || user?.name} uri={photo.uri} size={96} />

            {photo.busy && (
              <View style={styles.avatarBusy}>
                <ActivityIndicator size="small" color={Palette.primary} />
              </View>
            )}

            <Pressable
              onPress={() => setPhotoSheetVisible(true)}
              disabled={saving || photo.busy}
              accessibilityRole="button"
              accessibilityLabel="Change profile photo"
              style={({ pressed }) => [
                styles.cameraBadge,
                { backgroundColor: c.primary, borderColor: c.background },
                pressed && styles.pressed,
              ]}
            >
              <Camera size={16} color={Palette.primary} />
            </Pressable>
          </View>

          {(photo.isDirty || photo.isRemoved) && (
            <Text style={[styles.photoNote, { color: c.textMuted }]}>
              {photo.isRemoved
                ? 'Your photo will be removed when you save.'
                : 'Your new photo will be uploaded when you save.'}
            </Text>
          )}
        </View>

        <AdminProfileDetails form={form} editing errors={errors} onChange={setField} />
      </ScrollView>

      <ActionSheet
        visible={isPhotoSheetVisible}
        onClose={() => setPhotoSheetVisible(false)}
        title="Profile Photo"
        options={photoOptions}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AdminSpacing.screenEdgeWide,
    paddingBottom: AdminSpacing.scrollBottom,
  },
  pressed: {
    opacity: 0.7,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  savingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  savingLabel: {
    fontSize: 13,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  bannerText: {
    flex: 1,
    fontSize: 13,
    color: FunctionalColors.dangerText,
  },
  bannerAction: {
    fontSize: 13,
    fontWeight: '700',
    color: FunctionalColors.dangerText,
    textDecorationLine: 'underline',
  },
  identity: {
    // No paddingTop — AdminHeader already owns the 24dp gap.
    alignItems: 'center',
  },
  avatarWrapper: {
    // Sized to the avatar so the badge below stays inside its bounds.
    width: 96,
    height: 96,
  },
  avatarBusy: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(23, 36, 46, 0.45)',
  },
  cameraBadge: {
    position: 'absolute',
    // Kept inside the wrapper's bounds — Android clips children that overflow.
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  photoNote: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 12,
  },
});
