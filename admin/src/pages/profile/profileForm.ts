/**
 * Profile form rules — ported from mobile/src/components/admin/profile-details.tsx
 * so both admin surfaces accept exactly the same values.
 */

import type { AdminUser } from '../../api/auth';

/** The editable subset of the admin's profile. Email and role are read-only. */
export type ProfileForm = {
  name: string;
  mobile: string;
  address: string;
  bio: string;
};

export type ProfileFormErrors = Partial<Record<keyof ProfileForm, string>>;

/** Caps mirrored onto the inputs so a value can't exceed what validation allows. */
export const ProfileLimits = {
  name: 60,
  mobile: 20,
  address: 200,
  bio: 300,
} as const;

export function toProfileForm(user: AdminUser | null): ProfileForm {
  return {
    name: user?.name ?? '',
    mobile: user?.mobile ?? '',
    address: user?.address ?? '',
    bio: user?.bio ?? '',
  };
}

/** Only `name` is required; the rest are optional, so only malformed values fail. */
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
