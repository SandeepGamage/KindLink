/**
 * use-avatar-picker.ts
 *
 * The whole avatar pipeline in one hook: pick (camera or library) → crop square
 * → resize and compress → upload → hand back the stored path.
 *
 * Deliberately knows nothing about the admin section, the auth context or
 * navigation, so any flow can use it — the admin profile screen today, account
 * registration later. A signup screen reuses it as-is: register (which returns
 * a token), then `upload()`, then send the URL with the profile update.
 */
import { useCallback, useMemo, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { uploadService } from '@/services/upload.service';
import { ApiError } from '@/services/admin-api-client';

/** Longest edge of the uploaded image. Keeps a JPEG well under the 5MB cap. */
const MAX_DIMENSION = 1024;

/** JPEG quality after resizing. 0.7 lands a 1024px photo around 100-200KB. */
const COMPRESSION = 0.7;

export interface AvatarPickerState {
  /** What to render: a local preview, the initial remote value, or nothing. */
  uri?: string;
  /** A newly picked file is waiting to be uploaded. */
  isDirty: boolean;
  /** The user asked to clear their photo. */
  isRemoved: boolean;
  /** Picking, compressing or uploading is in progress. */
  busy: boolean;
  /** Human-readable problem, or null. Never throws for user-facing failures. */
  error: string | null;
  /** True when the OS denied a permission and Settings is the only way back. */
  canOpenSettings: boolean;
  takePhoto: () => Promise<void>;
  chooseFromLibrary: () => Promise<void>;
  removePhoto: () => void;
  openSettings: () => void;
  clearError: () => void;
  reset: () => void;
  /**
   * Resolves with the value to store in `profileImage`:
   * the new path after upload, `''` when the photo was removed, or `null` when
   * nothing changed — so callers can skip the field entirely.
   */
  upload: () => Promise<string | null>;
}

/**
 * Shrinks and re-encodes a picked photo before it ever touches the network.
 * Only downscales — enlarging a small photo would add bytes for no quality.
 */
async function compress(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const longestEdge = Math.max(asset.width ?? 0, asset.height ?? 0);
  const context = ImageManipulator.manipulate(asset.uri);

  if (longestEdge > MAX_DIMENSION) {
    // Only the longer edge is constrained; the other is derived from the ratio.
    const isLandscape = (asset.width ?? 0) >= (asset.height ?? 0);
    context.resize(isLandscape ? { width: MAX_DIMENSION } : { height: MAX_DIMENSION });
  }

  const rendered = await context.renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: COMPRESSION });
  return result.uri;
}

export function useAvatarPicker(initialUri?: string | null): AvatarPickerState {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [isRemoved, setIsRemoved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canOpenSettings, setCanOpenSettings] = useState(false);

  const uri = useMemo(() => {
    if (localUri) return localUri;
    if (isRemoved) return undefined;
    return initialUri || undefined;
  }, [localUri, isRemoved, initialUri]);

  const clearError = useCallback(() => {
    setError(null);
    setCanOpenSettings(false);
  }, []);

  const applyPick = useCallback(async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;

    const compressed = await compress(result.assets[0]);
    setLocalUri(compressed);
    setIsRemoved(false);
  }, []);

  const chooseFromLibrary = useCallback(async () => {
    clearError();
    setBusy(true);
    try {
      // Android reads the library through the system photo picker, which grants
      // access to the single chosen file — asking for the permission would
      // prompt for broader access than the picker actually needs.
      if (Platform.OS !== 'android') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError('KindLink needs access to your photos to set a profile picture.');
          setCanOpenSettings(!permission.canAskAgain);
          return;
        }
      }

      await applyPick(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      );
    } catch (err) {
      setError((err as Error).message || 'Could not open your photo library.');
    } finally {
      setBusy(false);
    }
  }, [applyPick, clearError]);

  const takePhoto = useCallback(async () => {
    clearError();
    setBusy(true);
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        setError('KindLink needs camera access to take a profile picture.');
        setCanOpenSettings(!permission.canAskAgain);
        return;
      }

      await applyPick(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      );
    } catch (err) {
      setError((err as Error).message || 'Could not open the camera.');
    } finally {
      setBusy(false);
    }
  }, [applyPick, clearError]);

  const removePhoto = useCallback(() => {
    clearError();
    setLocalUri(null);
    setIsRemoved(true);
  }, [clearError]);

  const reset = useCallback(() => {
    clearError();
    setLocalUri(null);
    setIsRemoved(false);
  }, [clearError]);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      setError('Open your device settings to grant KindLink access.');
    });
  }, []);

  const upload = useCallback(async (): Promise<string | null> => {
    if (isRemoved) return '';
    if (!localUri) return null;

    setBusy(true);
    try {
      return await uploadService.uploadAvatar(localUri);
    } catch (err) {
      // Rethrown so the caller can abort its own save; the message is already
      // user-facing (the backend's own text for a rejected file or size).
      const apiError = err as ApiError;
      const message = apiError.isNetworkError
        ? "Couldn't upload your photo. Check your connection."
        : apiError.message || 'Could not upload your photo.';
      setError(message);
      throw new Error(message);
    } finally {
      setBusy(false);
    }
  }, [isRemoved, localUri]);

  return {
    uri,
    isDirty: !!localUri,
    isRemoved,
    busy,
    error,
    canOpenSettings,
    takePhoto,
    chooseFromLibrary,
    removePhoto,
    openSettings,
    clearError,
    reset,
    upload,
  };
}
