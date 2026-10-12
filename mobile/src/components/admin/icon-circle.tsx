import { Palette } from '@/constants/theme';

/**
 * The admin side's single icon treatment: a black glyph on a white circle with
 * a grey border. Statuses are carried by text and buttons, not icon color.
 *
 * For always-white surfaces (`ActionModal`, the bottom sheets): pass
 * `MonoIcon.circle` as the container style and `MonoIcon.color` as the icon
 * color. Themed surfaces use `c.card` / `c.cardBorder` / `c.text` instead.
 */
export const MonoIcon = {
  color: Palette.ink,
  circle: {
    backgroundColor: Palette.primary,
    borderWidth: 1,
    borderColor: Palette.border,
  },
} as const;
