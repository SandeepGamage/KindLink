import { useEffect, useRef } from 'react';

/** How often a visible page reloads its data. */
const DEFAULT_INTERVAL_MS = 30_000;

/**
 * Keeps a page's data fresh without a Refresh button: calls `refresh` on an
 * interval while the browser tab is visible, and once immediately when the
 * admin comes back to the tab. Hidden tabs don't poll, and a slow request is
 * never overlapped by the next tick.
 *
 * `refresh` should update data in place (no full-page spinner), since it runs
 * in the background.
 */
export function useAutoRefresh(refresh: () => Promise<unknown>, intervalMs = DEFAULT_INTERVAL_MS) {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useEffect(() => {
    let inFlight = false;

    const run = async () => {
      if (inFlight || document.visibilityState !== 'visible') return;
      inFlight = true;
      try {
        await refreshRef.current();
      } finally {
        inFlight = false;
      }
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') run();
    };

    const timer = window.setInterval(run, intervalMs);
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [intervalMs]);
}
