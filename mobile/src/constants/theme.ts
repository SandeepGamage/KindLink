/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';
import { Palette, FunctionalColors, AppColors, type PaletteColor } from './colors';

export * from './colors';

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.surface,
    backgroundElement: Palette.primary,
    backgroundSelected: Palette.blueTint,
    textSecondary: FunctionalColors.textSecondary,
    border: Palette.border,
    primary: Palette.secondary,
    accent: Palette.accent,
  },
  dark: {
    text: Palette.primary,
    background: '#0D151D',
    backgroundElement: Palette.ink,
    backgroundSelected: '#23384B',
    textSecondary: '#94A7B8',
    border: '#23384B',
    primary: '#4D8EC9',
    accent: Palette.accent,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;

/**
 * Auth screen color tokens — matches the 60-30-10 palette
 */
export const AuthColors = {
  /** 30% Brand Blue — primary CTA color */
  primaryBlue: Palette.secondary,
  /** Focused input border */
  inputBorder: Palette.secondary,
  /** Text blue for links */
  linkBlue: Palette.secondary,
  /** Soft surface background */
  bgLavender: Palette.surface,
  /** Input backgrounds */
  inputBg: Palette.primary,
  /** Input border */
  border: Palette.border,
  /** Muted placeholder text */
  textMuted: FunctionalColors.textMuted,
  /** White for button label text */
  white: Palette.primary,
  /** Background for social buttons */
  socialBg: Palette.blueTint,
  /** Decorative circle color */
  circle: Palette.blueTint,
  /** Error red */
  error: FunctionalColors.danger,
  /** Accent */
  accent: Palette.accent,
} as const;

/**
 * Onboarding and Welcome screen color tokens — matches the 60-30-10 palette
 */
export const OnboardingColors = {
  /** 30% Brand Blue for buttons, icons, active indicators, and links */
  primary: Palette.secondary,
  /** Darker primary for pressed states */
  primaryDark: FunctionalColors.secondaryDark,
  /** Pastel light blue for illustration containers and selected role card fill */
  illustrationBg: Palette.blueTint,
  /** Selected role card background */
  selectedCardBg: Palette.blueTint,
  /** Selected role card border */
  selectedBorder: Palette.secondary,
  /** Normal card border */
  cardBorder: Palette.border,
  /** Normal card background */
  cardBg: Palette.primary,
  /** Dark navy ink for titles and headings */
  textHeading: Palette.ink,
  /** Grey for subtitles and descriptions */
  textSecondary: FunctionalColors.textSecondary,
  /** Dark text for step indicators */
  textStep: Palette.ink,
  /** Inactive indicator dot */
  dotInactive: Palette.border,
  /** Active indicator pill */
  dotActive: Palette.secondary,
  /** Soft surface screen background */
  screenBg: Palette.surface,
  /** Pure white */
  white: Palette.primary,
  /** Accent highlight */
  accent: Palette.accent,
} as const;


