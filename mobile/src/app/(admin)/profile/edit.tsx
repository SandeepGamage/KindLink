import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { ChevronLeft, Camera, AlertCircle } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { Avatar } from '@/components/admin/avatar';
import {
  AdminProfileDetails,
  ProfileForm,
  toProfileForm,
} from '@/components/admin/profile-details';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { useAuthContext } from '@/context/auth-context';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { Palette, FunctionalColors } from '@/constants/theme';
import type { UpdateUserPayload } from '@/services/auth.service';

export default function AdminEditProfileScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  const { user, updateUser } = useAuthContext();

  const [form, setForm] = useState<ProfileForm>(() => toProfileForm(user));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Re-sync if the context user resolves after this screen mounts.
  useEffect(() => {
    setForm(toProfileForm(user));
  }, [user]);

  const setField = useCallback((key: keyof ProfileForm, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handlePickPhoto = useCallback(async () => {
    try {
      // No permission request: Android reads the library through the system
      // photo picker, so asking would prompt for access that isn't needed.
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled) {
        setError(null);
        setField('profileImage', result.assets[0].uri);
      }
    } catch (err) {
      setError((err as Error).message || 'Could not open your photo library.');
    }
  }, [setField]);

  const handleSave = useCallback(async () => {
    const name = form.name.trim();
    if (!name) {
      setError('Your name cannot be empty.');
      return;
    }

    // Send only what actually changed, so an untouched field is never overwritten.
    const original = toProfileForm(user);
    const payload: UpdateUserPayload = {};
    if (name !== original.name) payload.name = name;
    if (form.mobile.trim() !== original.mobile) payload.mobile = form.mobile.trim();
    if (form.address.trim() !== original.address) payload.address = form.address.trim();
    if (form.bio.trim() !== original.bio) payload.bio = form.bio.trim();
    // profileImage is deliberately omitted — the picked value is a device-local
    // file:// URI that would be meaningless to the server. See the note in the UI.

    if (Object.keys(payload).length === 0) {
      router.back();
      return;
    }

    setSaving(true);
    setError(null);
    try {
      await updateUser(payload);
      router.back();
    } catch (err) {
      // Stay on the page so the typed values survive the failure.
      setError((err as Error).message || 'Could not save your profile.');
    } finally {
      setSaving(false);
    }
  }, [form, user, updateUser, router]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Edit Profile"
        leftContent={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Discard changes and go back"
          >
            <ChevronLeft size={24} color={c.text} />
          </Pressable>
        }
        rightContent={
          saving ? (
            <ActivityIndicator size="small" color={c.primary} />
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
        {error && (
          <View style={[styles.banner, { backgroundColor: FunctionalColors.dangerBg }]}>
            <AlertCircle size={16} color={FunctionalColors.dangerText} />
            <Text style={styles.bannerText}>{error}</Text>
          </View>
        )}

        <View style={styles.identity}>
          <View style={styles.avatarWrapper}>
            <Avatar name={form.name || user?.name} uri={form.profileImage} size={96} />
            <Pressable
              onPress={handlePickPhoto}
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

          <Text style={[styles.photoNote, { color: c.textMuted }]}>
            Photo is previewed on this device; syncing comes next.
          </Text>
        </View>

        <AdminProfileDetails form={form} editing onChange={setField} />
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
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
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
  identity: {
    // No paddingTop — AdminHeader already owns the 24dp gap.
    alignItems: 'center',
  },
  avatarWrapper: {
    // Sized to the avatar so the badge below stays inside its bounds.
    width: 96,
    height: 96,
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
