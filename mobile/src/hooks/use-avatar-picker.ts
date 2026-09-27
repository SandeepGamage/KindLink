import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Longest edge of the uploaded image. Keeps a JPEG well under the 5MB cap. */
const MAX_DIMENSION = 1024;

/** JPEG quality after resizing. 0.7 lands a 1024px photo around 100-200KB. */
const COMPRESSION = 0.7;

export interface AvatarPickerState {
  /** What to render: a local preview, the initial remote value, or nothing. */
  uri?: string;
  /** Prepared JPEG to attach to the signup/profile request. */
  localUri: string | null;
  /** A newly picked file is waiting to be uploaded. */
  isDirty: boolean;
  /** The user asked to clear their photo. */
  isRemoved: boolean;
  /** Picking or compressing is in progress. */
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

}

/**
 * Shrinks and re-encodes a picked photo before it ever touches the network.
 * Only downscales — enlarging a small photo would add bytes for no quality.
 */
async function compress(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const side = Math.min(asset.width, asset.height);
  const context = ImageManipulator.manipulate(asset.uri);

  if (side > 0) {
    context.crop({ originX: Math.floor((asset.width - side) / 2),
      originY: Math.floor((asset.height - side) / 2), width: side, height: side });
    if (side > MAX_DIMENSION) context.resize({ width: MAX_DIMENSION, height: MAX_DIMENSION });
  }

  const rendered = await context.renderAsync();
  try {
    const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: COMPRESSION });
    return result.uri;
  } finally {
    rendered.release();
    context.release();
  }
}

export function useAvatarPicker(initialUri?: string | null): AvatarPickerState {
  const picking = useRef(false);
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
    if (picking.current) return;
    picking.current = true;
    clearError();
    setBusy(true);
    try {
      // Android reads the library through the system photo picker, which grants
      // access to the single chosen file — asking for the permission would
      // prompt for broader access than the picker actually needs.
      if (Platform.OS === 'ios') {
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
      picking.current = false;
      setBusy(false);
    }
  }, [applyPick, clearError]);

  const takePhoto = useCallback(async () => {
    if (picking.current) return;
    picking.current = true;
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
      picking.current = false;
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

  return {
    uri,
    localUri,
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
  };
}
