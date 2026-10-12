import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';

/**
 * Runs `task` now and then every `intervalMs` while `enabled` and the app is in
 * the foreground.
 *
 * The backend runs on serverless functions, which can't hold WebSockets open,
 * so live chat is kept in sync by short polls. Polling pauses in the
 * background and fires immediately on return to the foreground, so a phone
 * that slept or lost signal catches up as soon as it is looked at again.
 * A tick is skipped while the previous one is still in flight, so a slow
 * network never piles up overlapping requests.
 */
export function useLivePolling(task: () => Promise<unknown> | void, intervalMs: number, enabled = true) {
  const taskRef = useRef(task);
  taskRef.current = task;

  useEffect(() => {
    if (!enabled) return;

    let timer: ReturnType<typeof setInterval> | undefined;
    let inFlight = false;

    const tick = async () => {
      if (inFlight) return;
      inFlight = true;
      try {
        await taskRef.current();
      } catch {
        // The task owns its error state; a failed tick just waits for the next.
      } finally {
        inFlight = false;
      }
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = undefined;
    };

    const start = () => {
      stop();
      tick();
      timer = setInterval(tick, intervalMs);
    };

    if (AppState.currentState !== 'background') start();

    const subscription = AppState.addEventListener('change', (next) => {
      if (next === 'active') start();
      else if (next === 'background') stop();
    });

    return () => {
      stop();
      subscription.remove();
    };
  }, [enabled, intervalMs]);
}
