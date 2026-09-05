import { AppColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

/** Widened to `string` so the light and dark token sets share one type. */
export type AdminTheme = Record<keyof typeof AppColors.light, string>;

/**
 * Full semantic token set for the current color scheme, used by the admin screens.
 *
 * Prefer this over `useTheme()` for screen-level work — `useTheme` exposes the
 * narrower `Colors` set and exists for the themed-text/themed-view primitives.
 * Use it as a color override on top of a static StyleSheet:
 *
 *   const c = useAdminTheme();
 *   <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]} />
 *
 * Reads the already-exported `AppColors` from `@/constants/theme`; that file is
 * not modified by this branch.
 */
export function useAdminTheme(): AdminTheme {
  const scheme = useColorScheme();
  return AppColors[scheme === 'dark' ? 'dark' : 'light'];
}
