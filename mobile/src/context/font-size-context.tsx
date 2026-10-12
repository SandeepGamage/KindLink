import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FontSizeScaleMode = 'normal' | 'large' | 'extra-large';

export interface FontSizeContextType {
  fontSizeMode: FontSizeScaleMode;
  fontScale: number;
  setFontSizeMode: (mode: FontSizeScaleMode) => Promise<void>;
  resetToNormal: () => Promise<void>;
  scaleFont: (baseSize: number) => number;
  scaleLineHeight: (baseLineHeight: number) => number;
  isScaled: boolean;
}

const STORAGE_KEY = '@kindlink_elderly_font_scale';

const SCALE_MULTIPLIERS: Record<FontSizeScaleMode, number> = {
  'normal': 1.0,
  'large': 1.20,
  'extra-large': 1.35,
};

const FontSizeContext = createContext<FontSizeContextType | undefined>(undefined);

export function FontSizeProvider({ children }: { children: React.ReactNode }) {
  const [fontSizeMode, setFontSizeModeState] = useState<FontSizeScaleMode>('normal');

  // Load persisted font size preference on startup
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          isMounted &&
          saved &&
          (saved === 'normal' || saved === 'large' || saved === 'extra-large')
        ) {
          setFontSizeModeState(saved as FontSizeScaleMode);
        }
      } catch (err) {
        console.warn('Failed to load font size preference from storage:', err);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  const setFontSizeMode = useCallback(async (mode: FontSizeScaleMode) => {
    setFontSizeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (err) {
      console.warn('Failed to save font size preference to storage:', err);
    }
  }, []);

  const resetToNormal = useCallback(async () => {
    setFontSizeModeState('normal');
    try {
      await AsyncStorage.setItem(STORAGE_KEY, 'normal');
    } catch (err) {
      console.warn('Failed to reset font size preference in storage:', err);
    }
  }, []);

  const fontScale = useMemo(() => SCALE_MULTIPLIERS[fontSizeMode], [fontSizeMode]);

  const scaleFont = useCallback(
    (baseSize: number) => {
      if (fontScale === 1.0) return baseSize;
      return Math.round(baseSize * fontScale);
    },
    [fontScale]
  );

  const scaleLineHeight = useCallback(
    (baseLineHeight: number) => {
      if (fontScale === 1.0) return baseLineHeight;
      return Math.round(baseLineHeight * fontScale);
    },
    [fontScale]
  );

  const isScaled = fontSizeMode !== 'normal';

  const value = useMemo(
    () => ({
      fontSizeMode,
      fontScale,
      setFontSizeMode,
      resetToNormal,
      scaleFont,
      scaleLineHeight,
      isScaled,
    }),
    [fontSizeMode, fontScale, setFontSizeMode, resetToNormal, scaleFont, scaleLineHeight, isScaled]
  );

  return (
    <FontSizeContext.Provider value={value}>
      {children}
    </FontSizeContext.Provider>
  );
}

export function useFontSize() {
  const context = useContext(FontSizeContext);
  if (!context) {
    throw new Error('useFontSize must be used within a FontSizeProvider');
  }
  return context;
}
