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

export function toProfileForm(user: AuthUser | null): ProfileForm {
  return {
    name: user?.name ?? '',
    mobile: user?.mobile ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
    profileImage: user?.profileImage ?? '',
  };
}

interface AdminProfileDetailsProps {
  form: ProfileForm;
  editing?: boolean;
  onChange?: (key: keyof ProfileForm, value: string) => void;
}

/**
 * The admin's account fields. Shared by the profile and edit-profile screens so
 * the two stay in step — only `editing` differs between them.
 *
 * Email is deliberately absent: it is not editable, and the identity block above
 * already shows it.
 */
export function AdminProfileDetails({ form, editing, onChange }: AdminProfileDetailsProps) {
  return (
    <View style={styles.container}>
      <AdminProfileField
        label="Full Name"
        value={form.name}
        editing={editing}
        onChangeText={(t) => onChange?.('name', t)}
        placeholder="Your full name"
        autoCapitalize="words"
      />
      <AdminProfileField
        label="Mobile"
        value={form.mobile}
        editing={editing}
        onChangeText={(t) => onChange?.('mobile', t)}
        placeholder="e.g. 077 123 4567"
        keyboardType="phone-pad"
      />
      <AdminProfileField
        label="Address"
        value={form.address}
        editing={editing}
        onChangeText={(t) => onChange?.('address', t)}
        placeholder="Your address"
        autoCapitalize="sentences"
      />
      <AdminProfileField
        label="About"
        value={form.bio}
        editing={editing}
        onChangeText={(t) => onChange?.('bio', t)}
        placeholder="A short note about you"
        autoCapitalize="sentences"
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
