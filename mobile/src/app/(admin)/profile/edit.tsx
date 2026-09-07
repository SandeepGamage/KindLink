import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, AlertCircle } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ProfilePhotoField } from '@/components/profile/profile-photo-field';
import { Button } from '@/components/admin/button';
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
  const submitting = useRef(false);

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
    if (submitting.current || photo.busy) return;
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

    submitting.current = true;
    try {
      if (photo.isRemoved) payload.profileImage = '';

      if (Object.keys(payload).length === 0 && !photo.localUri) {
        router.back();
        return;
      }

      setStage('saving');
      await updateUser(payload, photo.localUri || undefined);
      photo.reset();
      router.back();
    } catch (err) {
      // Stay on the page so the typed values survive the failure.
      setError(await describeFailure(err));
    } finally {
      submitting.current = false;
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
            disabled={saving || photo.busy}
            accessibilityRole="button"
            accessibilityLabel="Discard changes and go back"
          >
            <ChevronLeft size={24} color={saving ? c.textMuted : c.text} />
          </Pressable>
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

        <ProfilePhotoField photo={photo} name={form.name || user?.name} disabled={saving || photo.busy} />

        <AdminProfileDetails form={form} editing errors={errors} onChange={setField} />

        {/* The stage rides on the label rather than `loading`, which would swap
            it for a bare spinner and lose the upload-vs-save distinction. */}
        <Button
          label={saving ? (stage === 'uploading' ? 'Uploading photo…' : 'Saving…') : 'Save Changes'}
          onPress={handleSave}
          disabled={saving || photo.busy}
          fullWidth
          icon={saving ? <ActivityIndicator size="small" color={Palette.primary} /> : undefined}
          accessibilityLabel="Save profile"
          style={styles.saveButton}
        />
      </ScrollView>

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
  saveButton: {
    // Matches the gap AdminProfileDetails puts above the field block.
    marginTop: 24,
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
