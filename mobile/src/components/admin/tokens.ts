/**
 * Design tokens local to the admin area.
 *
 * These live here rather than in `@/constants/theme` because this branch owns
 * only the admin side and the shared theme file is edited by other feature
 * branches. Promote them into `theme.ts` once the branches are merged — the
 * values already match what the rest of the app hardcodes.
 */

/** Corner radius scale. `card` is the radius used by cards, pills and sheets. */
export const Radius = {
  sm: 8,
  md: 16,
  card: 24,
  pill: 999,
} as const;

/**
 * Page-level spacing every admin screen shares.
 *
 * `headerGap` is applied once, as `AdminHeader`'s bottom padding — screens must
 * not add their own top padding on top of it, or the gap stops being 24.
 */
export const AdminSpacing = {
  /** Screen edge to body content. */
  screenEdge: 12,
  /**
   * Wider body inset for the card-less profile pages. Their rows sit directly
   * on the background, so they need the breathing room a card's own padding
   * gives content on every other screen.
   */
  screenEdgeWide: 24,
  /** Header to the first body element. */
  headerGap: 24,
  /** Clears the floating tab bar at the end of a scroll. */
  scrollBottom: 120,
  /**
   * Height of a single-line input. Multi-line fields use this as a floor only —
   * they stay taller so several lines are visible. Pair with `Radius.card`.
   */
  inputHeight: 56,
} as const;
