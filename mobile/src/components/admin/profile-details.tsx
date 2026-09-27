import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AdminProfileField } from './profile-field';
import type { AuthUser } from '@/services/auth.service';

/** The editable subset of the admin's profile. Email and role are read-only. */
export type ProfileForm = {
  name: string;
  mobile: string;
  address: string;
  bio: string;
  profileImage: string;
};

/** Per-field validation messages, keyed by the field they belong to. */
export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

/** Caps mirrored onto the inputs so a value can't exceed what validation allows. */
export const ProfileLimits = {
  name: 60,
  address: 200,
  bio: 300,
} as const;

export function toProfileForm(user: AuthUser | null): ProfileForm {
  return {
    name: user?.name ?? '',
    mobile: user?.mobile ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
    profileImage: user?.profileImage ?? '',
  };
}

/**
 * Validates the editable fields. Lives next to the form definition so the rules
 * and the inputs they apply to cannot drift apart.
 *
 * Only `name` is required — the rest are optional on the backend model, so an
 * empty value is valid and only a *malformed* one is rejected.
 */
export function validateProfileForm(form: ProfileForm): ProfileFormErrors {
  const errors: ProfileFormErrors = {};

  const name = form.name.trim();
  if (!name) {
    errors.name = 'Your name cannot be empty.';
  } else if (name.length < 2) {
    errors.name = 'Please enter at least 2 characters.';
  } else if (name.length > ProfileLimits.name) {
    errors.name = `Please keep your name under ${ProfileLimits.name} characters.`;
  }

  const mobile = form.mobile.trim();
  if (mobile) {
    // Digits only after stripping the separators people actually type.
    const digits = mobile.replace(/[\s\-()+]/g, '');
    if (!/^\d{7,15}$/.test(digits)) {
      errors.mobile = 'Enter a valid phone number (7-15 digits).';
    }
  }

  if (form.address.trim().length > ProfileLimits.address) {
    errors.address = `Please keep your address under ${ProfileLimits.address} characters.`;
  }

  if (form.bio.trim().length > ProfileLimits.bio) {
    errors.bio = `Please keep this under ${ProfileLimits.bio} characters.`;
  }

  return errors;
}

interface AdminProfileDetailsProps {
  form: ProfileForm;
  editing?: boolean;
  onChange?: (key: keyof ProfileForm, value: string) => void;
  /** Validation messages. Ignored when not editing. */
  errors?: ProfileFormErrors;
}

/**
 * The admin's account fields. Shared by the profile and edit-profile screens so
 * the two stay in step — only `editing` differs between them.
 *
 * Email is deliberately absent: it is not editable, and the identity block above
 * already shows it.
 */
export function AdminProfileDetails({
  form,
  editing,
  onChange,
  errors,
}: AdminProfileDetailsProps) {
  return (
    <View style={styles.container}>
      <AdminProfileField
        label="Full Name"
        value={form.name}
        editing={editing}
        onChangeText={(t) => onChange?.('name', t)}
        placeholder="Your full name"
        autoCapitalize="words"
        maxLength={ProfileLimits.name}
        error={errors?.name}
      />
      <AdminProfileField
        label="Mobile"
        value={form.mobile}
        editing={editing}
        onChangeText={(t) => onChange?.('mobile', t)}
        placeholder="e.g. 077 123 4567"
        keyboardType="phone-pad"
        maxLength={20}
        error={errors?.mobile}
      />
      <AdminProfileField
        label="Address"
        value={form.address}
        editing={editing}
        onChangeText={(t) => onChange?.('address', t)}
        placeholder="Your address"
        autoCapitalize="sentences"
        maxLength={ProfileLimits.address}
        error={errors?.address}
      />
      <AdminProfileField
        label="About"
        value={form.bio}
        editing={editing}
        onChangeText={(t) => onChange?.('bio', t)}
        placeholder="A short note about you"
        autoCapitalize="sentences"
        maxLength={ProfileLimits.bio}
        error={errors?.bio}
        multiline
        isLast
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // Was carried by the section label that used to head this block.
    marginTop: 24,
  },
});
