/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Palette = {
  primary: '#FFFFFF',
  surface: '#F4F7FA',
  border: '#DCE6EF',
  blueTint: '#E3EEF9',
  secondary: '#1F5C96',
  ink: '#17242E',
  accent: '#E08A3C',
} as const;

export const Colors = {
  light: {
    text: Palette.ink,
    background: Palette.primary,
    backgroundElement: Palette.surface,
    backgroundSelected: Palette.blueTint,
    textSecondary: '#60646C',
    primary: Palette.secondary,
    border: Palette.border,
    accent: Palette.accent,
    blueTint: Palette.blueTint,
  },
  dark: {
    text: '#ffffff',
    background: '#121212',
    backgroundElement: '#1E1E1E',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    primary: Palette.secondary,
    border: '#333333',
    accent: Palette.accent,
    blueTint: '#1E2D3B',
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
 * Auth screen color tokens — matches the login UI design
 */
export const AuthColors = {
  /** Deep royal blue — primary CTA color */
  primaryBlue: '#3232C8',
  /** Lighter blue used for focused input borders */
  inputBorder: '#4040D8',
  /** Text blue for links (Forgot password, Or continue with) */
  linkBlue: '#3D44DB',
  /** Lavender background for the entire auth screen */
  bgLavender: '#EEEEF8',
  /** Slightly deeper lavender for input backgrounds */
  inputBg: '#EAEAF5',
  /** Muted placeholder text */
  textMuted: '#9E9EA7',
  /** White for button label text */
  white: '#FFFFFF',
  /** Light grey for social login buttons */
  socialBg: '#F2F2F5',
  /** Decorative circle color (very subtle) */
  circle: '#DDDDF0',
  /** Error red */
  error: '#D32F2F',
} as const;

/**
 * Onboarding and Welcome screen color tokens — matches the exact KindLink mockup
 */
export const OnboardingColors = {
  /** Primary royal blue for buttons, icons, active indicators, and links */
  primary: '#1D61E7',
  /** Darker primary for pressed states */
  primaryDark: '#1548B5',
  /** Pastel light blue for illustration containers and selected role card fill */
  illustrationBg: '#C7DCFB',
  /** Selected role card background */
  selectedCardBg: '#C7DCFB',
  /** Selected role card border */
  selectedBorder: '#1D61E7',
  /** Normal card border */
  cardBorder: '#E2E8F0',
  /** Normal card background */
  cardBg: '#FFFFFF',
  /** Dark slate/navy for titles and headings */
  textHeading: '#0F172A',
  /** Grey for subtitles and descriptions */
  textSecondary: '#475569',
  /** Grey for step indicators */
  textStep: '#334155',
  /** Inactive indicator dot */
  dotInactive: '#C7DCFB',
  /** Active indicator pill */
  dotActive: '#1D61E7',
  /** Soft ice blue screen background matching Figma iPhone 15 design */
  screenBg: '#F0F6FE',
  /** Pure white */
  white: '#FFFFFF',
} as const;

