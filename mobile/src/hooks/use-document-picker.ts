import { useCallback, useMemo, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

/** Longest edge of the uploaded document image. Ensures crisp text readability while keeping file size small. */
const MAX_DOCUMENT_DIMENSION = 1920;

/** High quality compression for identity cards and national IDs. */
const DOCUMENT_COMPRESSION = 0.82;

export interface DocumentPickerState {
  /** What to render: a local preview URI, an initial remote URL, or undefined. */
  uri?: string;
  /** Prepared compressed JPEG to attach to the signup request. */
  localUri: string | null;
  /** Human-readable document name, or null. */
  fileName: string | null;
  /** A newly picked file is waiting to be uploaded. */
  isDirty: boolean;
  /** Picking or compressing is in progress. */
  busy: boolean;
  /** Human-readable error message, or null. */
  error: string | null;
  /** True when the OS denied permission and Settings is required. */
  canOpenSettings: boolean;
  takePhoto: () => Promise<void>;
  chooseFromLibrary: () => Promise<void>;
  removeDocument: () => void;
  openSettings: () => void;
  clearError: () => void;
  reset: () => void;
}

/**
 * Normalizes and compresses an ID card image without cropping or distorting its natural aspect ratio.
 */
async function compressDocument(asset: ImagePicker.ImagePickerAsset): Promise<string> {
  const context = ImageManipulator.manipulate(asset.uri);
  const longest = Math.max(asset.width || 0, asset.height || 0);

  if (longest > MAX_DOCUMENT_DIMENSION && asset.width && asset.height) {
    if (asset.width >= asset.height) {
      context.resize({ width: MAX_DOCUMENT_DIMENSION });
    } else {
      context.resize({ height: MAX_DOCUMENT_DIMENSION });
    }
  }

  const rendered = await context.renderAsync();
  try {
    const result = await rendered.saveAsync({
      format: SaveFormat.JPEG,
      compress: DOCUMENT_COMPRESSION,
    });
    return result.uri;
  } finally {
    rendered.release();
    context.release();
  }
}

export function useDocumentPicker(initialUri?: string | null): DocumentPickerState {
  const picking = useRef(false);
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [canOpenSettings, setCanOpenSettings] = useState(false);

  const uri = useMemo(() => {
    if (localUri) return localUri;
    return initialUri || undefined;
  }, [localUri, initialUri]);

  const clearError = useCallback(() => {
    setError(null);
    setCanOpenSettings(false);
  }, []);

  const applyPick = useCallback(async (result: ImagePicker.ImagePickerResult) => {
    if (result.canceled || !result.assets?.length) return;

    const asset = result.assets[0];
    const compressed = await compressDocument(asset);
    setLocalUri(compressed);

    const name = asset.fileName || 'NIC_Identity_Card.jpg';
    setFileName(name);
  }, []);

  const chooseFromLibrary = useCallback(async () => {
    if (picking.current) return;
    picking.current = true;
    clearError();
    setBusy(true);

    try {
      if (Platform.OS === 'ios') {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          setError('KindLink needs access to your photos to attach your ID document.');
          setCanOpenSettings(!permission.canAskAgain);
          return;
        }
      }

      await applyPick(
        await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: false, // Do not force square crop: natural card aspect ratio is preserved
          quality: 0.9,
        })
      );
    } catch (err) {
      setError((err as Error).message || 'Could not open photo library.');
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
        setError('KindLink needs camera access to capture your ID document.');
        setCanOpenSettings(!permission.canAskAgain);
        return;
      }

      await applyPick(
        await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: false, // Preserve card dimensions and readability
          quality: 0.9,
        })
      );
    } catch (err) {
      setError((err as Error).message || 'Could not open camera.');
    } finally {
      picking.current = false;
      setBusy(false);
    }
  }, [applyPick, clearError]);

  const removeDocument = useCallback(() => {
    clearError();
    setLocalUri(null);
    setFileName(null);
  }, [clearError]);

  const reset = useCallback(() => {
    clearError();
    setLocalUri(null);
    setFileName(null);
  }, [clearError]);

  const openSettings = useCallback(() => {
    Linking.openSettings().catch(() => {
      setError('Open your device settings to grant KindLink permissions.');
    });
  }, []);

  return {
    uri,
    localUri,
    fileName,
    isDirty: !!localUri,
    busy,
    error,
    canOpenSettings,
    takePhoto,
    chooseFromLibrary,
    removeDocument,
    openSettings,
    clearError,
    reset,
  };
}
