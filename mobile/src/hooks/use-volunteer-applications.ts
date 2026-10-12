import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { volunteerApplicationService } from '@/services/volunteer-application.service';
import type { VolunteerApplication } from '@/types/volunteer-application';

/**
 * Loads volunteer applications for the approvals screens, using the same
 * lifecycle as the users directory:
 * - Only the first load blocks the screen. Later focuses refresh in place.
 * - `refresh` backs pull-to-refresh.
 * - A failed reload keeps the last good list, so the screen can show it with
 *   a stale-data banner instead of blanking.
 */
export function useVolunteerApplications() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasLoaded = useRef(false);

  const load = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      setApplications(await volunteerApplicationService.getApplications());
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Could not load applications.');
    } finally {
      setLoading(false);
      hasLoaded.current = true;
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(!hasLoaded.current);
    }, [load])
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await load(false);
    setRefreshing(false);
  }, [load]);

  return { applications, loading, refreshing, error, reload: load, refresh };
}
