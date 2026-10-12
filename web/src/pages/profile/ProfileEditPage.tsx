import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Camera, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/PageHeader';
import Avatar from '../../components/Avatar';
import { useToast } from '../../components/Toast';
import { ApiError } from '../../api/client';
import { updateUser, uploadAvatar, type UpdateUserPayload } from '../../api/profile';
import {
  ProfileLimits,
  toProfileForm,
  validateProfileForm,
  type ProfileForm,
  type ProfileFormErrors,
} from './profileForm';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/**
 * What the photo will become on save: unchanged, a newly picked file, or removed.
 */
type PhotoChange = { kind: 'none' } | { kind: 'new'; file: File; previewUrl: string } | { kind: 'remove' };

type Phase = 'idle' | 'uploading' | 'saving';

function describeFailure(err: unknown): string {
  if (err instanceof ApiError && err.isNetworkError) {
    return "Can't reach the server. Check your connection and try again.";
  }
  return (err as Error)?.message || 'Could not save your changes.';
}

export default function ProfileEditPage() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInput = useRef<HTMLInputElement>(null);

  const initial = toProfileForm(user);
  const [form, setForm] = useState<ProfileForm>(initial);
  const [errors, setErrors] = useState<ProfileFormErrors>({});
  const [photo, setPhoto] = useState<PhotoChange>({ kind: 'none' });
  const [phase, setPhase] = useState<Phase>('idle');
  const [failure, setFailure] = useState<string | null>(null);

  const busy = phase !== 'idle';

  // Release the object URL for a picked photo once it's replaced or the page unmounts.
  useEffect(() => {
    if (photo.kind !== 'new') return;
    return () => URL.revokeObjectURL(photo.previewUrl);
  }, [photo]);

  const update = (key: keyof ProfileForm, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow picking the same file again
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFailure('Please choose a JPEG, PNG or WebP image.');
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setFailure('That image is too large. Please choose one under 5 MB.');
      return;
    }
    setFailure(null);
    setPhoto({ kind: 'new', file, previewUrl: URL.createObjectURL(file) });
  };

  const handleSave = async () => {
    const validation = validateProfileForm(form);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    // Only send what actually changed.
    const payload: UpdateUserPayload = {};
    (Object.keys(form) as (keyof ProfileForm)[]).forEach((key) => {
      const value = form[key].trim();
      if (value !== initial[key].trim()) payload[key] = value;
    });

    setFailure(null);
    try {
      if (photo.kind === 'new') {
        setPhase('uploading');
        payload.profileImage = await uploadAvatar(photo.file);
      } else if (photo.kind === 'remove') {
        payload.profileImage = '';
      }

      if (Object.keys(payload).length === 0) {
        navigate('/profile');
        return;
      }

      setPhase('saving');
      const updated = await updateUser(payload);
      setUser(updated);
      toast('Profile updated');
      navigate('/profile');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        logout();
        navigate('/login', { replace: true });
        return;
      }
      setFailure(describeFailure(err));
      setPhase('idle');
    }
  };

  const previewUri =
    photo.kind === 'new' ? photo.previewUrl : photo.kind === 'remove' ? undefined : user?.profileImage;
  const hasPhoto = Boolean(previewUri);

  const saveLabel = phase === 'uploading' ? 'Uploading photo…' : phase === 'saving' ? 'Saving…' : 'Save Changes';

  return (
    <>
      <PageHeader title="Edit Profile" subtitle="Update your administrator details" backTo="/profile" />

      <div className="page-body page-animate">
        <form
          className="profile-layout"
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
          noValidate
        >
          <section className="card profile-identity">
            <Avatar name={form.name || user?.name} uri={previewUri} size={112} />
            <input
              ref={fileInput}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              onChange={handleFile}
              hidden
            />
            <div className="profile-photo-buttons">
              <button type="button" className="btn btn-ghost" onClick={() => fileInput.current?.click()} disabled={busy}>
                <Camera size={14} /> {hasPhoto ? 'Change Photo' : 'Upload Photo'}
              </button>
              {hasPhoto && (
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => setPhoto({ kind: 'remove' })}
                  disabled={busy}
                >
                  <Trash2 size={14} /> Remove
                </button>
              )}
            </div>
            {photo.kind === 'new' && <p className="muted small">Your new photo will be uploaded when you save.</p>}
            {photo.kind === 'remove' && <p className="muted small">Your photo will be removed when you save.</p>}
            <p className="muted small">{user?.email}</p>
          </section>

          <section className="card panel">
            <div className="panel-header">
              <h2 className="section-title">Account Details</h2>
            </div>

            {failure && (
              <div className="banner banner-danger" role="alert">
                <AlertCircle size={16} /> {failure}
              </div>
            )}

            <ProfileField
              id="profile-name"
              label="Full Name"
              value={form.name}
              onChange={(v) => update('name', v)}
              placeholder="Your full name"
              maxLength={ProfileLimits.name}
              error={errors.name}
              required
            />
            <ProfileField
              id="profile-mobile"
              label="Mobile"
              value={form.mobile}
              onChange={(v) => update('mobile', v)}
              placeholder="e.g. 077 123 4567"
              maxLength={ProfileLimits.mobile}
              error={errors.mobile}
              type="tel"
            />
            <ProfileField
              id="profile-address"
              label="Address"
              value={form.address}
              onChange={(v) => update('address', v)}
              placeholder="Your address"
              maxLength={ProfileLimits.address}
              error={errors.address}
              showCount
            />
            <ProfileField
              id="profile-bio"
              label="About"
              value={form.bio}
              onChange={(v) => update('bio', v)}
              placeholder="A short note about you"
              maxLength={ProfileLimits.bio}
              error={errors.bio}
              multiline
              showCount
            />

            <div className="form-actions">
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => navigate('/profile')} disabled={busy}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={busy}>
                {saveLabel}
              </button>
            </div>
          </section>
        </form>
      </div>
    </>
  );
}

interface ProfileFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  error?: string;
  multiline?: boolean;
  showCount?: boolean;
  required?: boolean;
  type?: string;
}

function ProfileField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
  multiline,
  showCount,
  required,
  type = 'text',
}: ProfileFieldProps) {
  const describedBy = error ? `${id}-error` : undefined;
  const common = {
    id,
    value,
    placeholder,
    maxLength,
    className: `field-input${multiline ? ' field-textarea' : ''}${error ? ' invalid' : ''}`,
    'aria-invalid': Boolean(error),
    'aria-describedby': describedBy,
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onChange(e.target.value),
  };

  return (
    <div className="field">
      <div className="field-label-row">
        <label className="field-label" htmlFor={id}>
          {label}
          {required && <span className="field-required"> *</span>}
        </label>
        {showCount && (
          <span className="field-count">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {multiline ? <textarea rows={4} {...common} /> : <input type={type} {...common} />}
      {error && (
        <div className="field-error" id={describedBy}>
          {error}
        </div>
      )}
    </div>
  );
}
