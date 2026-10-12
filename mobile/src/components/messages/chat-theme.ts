import { FunctionalColors, Palette } from '@/constants/theme';

/** Colors shared by the inbox and chat room — the same light palette as Alerts. */
export const CHAT_COLORS = {
  text: Palette.ink,
  textSecondary: FunctionalColors.textSecondary,
  textMuted: FunctionalColors.textMuted,
  background: Palette.surface,
  card: Palette.primary,
  border: Palette.border,
  primary: Palette.secondary,
  bubbleMine: Palette.secondary,
  bubbleMineText: Palette.primary,
  bubbleTheirs: Palette.primary,
  bubbleTheirsText: Palette.ink,
  danger: FunctionalColors.dangerText,
  lockedBg: Palette.blueTint,
  warningBg: FunctionalColors.warningBg,
  warningText: FunctionalColors.warningText,
};

export type ChatColors = typeof CHAT_COLORS;

export const roleLabel = (role?: string) => (role === 'volunteer' ? 'Volunteer' : 'Elder');
