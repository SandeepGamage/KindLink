/**
 * KindLink 60-30-10 Centralized Design Palette
 *
 * 60% Base / Canvas: Primary (#FFFFFF) & Surface (#F4F7FA)
 * 30% Brand & Structure: Secondary (#1F5C96), Ink (#17242E), Border (#DCE6EF), Blue Tint (#E3EEF9)
 * 10% Dynamic Accent: Accent (#E08A3C) & Alert Highlights
 */

export const Palette = {
  /** 60% Base — Pure White for cards, modal sheets, button text, and clean contrast */
  primary: '#FFFFFF',
  /** 60% Canvas — Soft cool surface background for screen layouts and sections */
  surface: '#F4F7FA',
  /** Structural border, divider, and input outline tone */
  border: '#DCE6EF',
  /** Soft pastel blue tint for tag fills, badge backgrounds, selected pills */
  blueTint: '#E3EEF9',
  /** 30% Brand Blue — Primary CTA buttons, active tabs, main links, key icons */
  secondary: '#1F5C96',
  /** Deep navy ink for typography, primary titles, high-contrast dark accents */
  ink: '#17242E',
  /** 10% Accent — Warm amber/orange for notification badges, alerts, priority chips */
  accent: '#E08A3C',
} as const;

export type PaletteColor = keyof typeof Palette;

/**
 * Extended contextual and functional color definitions
 */
export const FunctionalColors = {
  // Brand blue variants
  secondaryDark: '#164673',
  secondaryLight: '#2B72B5',

  // Accent variants
  accentDark: '#C4742B',
  accentLight: '#FDF3E7',

  // Text hierarchy
  textPrimary: Palette.ink,
  textSecondary: '#5A6E7F',
  textMuted: '#8B9DAE',
  textLight: '#FFFFFF',

  // Status tokens
  success: '#10B981',
  successBg: '#DCFCE7',
  successText: '#15803D',

  danger: '#EF4444',
  dangerBg: '#FEE2E2',
  dangerText: '#B91C1C',

  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  warningText: '#B45309',

  info: '#3B82F6',
  infoBg: '#EFF6FF',
  infoText: '#1D4ED8',
} as const;

/**
 * Semantic Light & Dark theme tokens
 */
export const AppColors = {
  light: {
    background: Palette.surface,
    surface: Palette.surface,
    card: Palette.primary,
    cardBorder: Palette.border,
    divider: Palette.border,
    tint: Palette.blueTint,
    primary: Palette.secondary,
    primaryDark: FunctionalColors.secondaryDark,
    text: Palette.ink,
    textSecondary: FunctionalColors.textSecondary,
    textMuted: FunctionalColors.textMuted,
    accent: Palette.accent,
    accentBg: FunctionalColors.accentLight,
    border: Palette.border,
    success: FunctionalColors.success,
    danger: FunctionalColors.danger,
    warning: FunctionalColors.warning,
  },
  dark: {
    background: '#0D151D',
    surface: '#131F2A',
    card: Palette.ink,
    cardBorder: '#23384B',
    divider: '#23384B',
    tint: 'rgba(31, 92, 150, 0.28)',
    primary: '#4D8EC9',
    primaryDark: Palette.secondary,
    text: Palette.primary,
    textSecondary: '#94A7B8',
    textMuted: '#677B8D',
    accent: Palette.accent,
    accentBg: 'rgba(224, 138, 60, 0.2)',
    border: '#23384B',
    success: '#34D399',
    danger: '#F87171',
    warning: '#FBBF24',
  },
} as const;
