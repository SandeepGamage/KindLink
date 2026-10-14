import { useCallback, useEffect, useState } from 'react';
import { getVolunteerApplications, type VolunteerApplication } from '../api/volunteerApplications';
import { useAutoRefresh } from './useAutoRefresh';

/**
 * Loads volunteer applications for the approvals pages, with the same
 * lifecycle as the users directory:
 * - Only the first load shows a skeleton. Background refreshes update in place.
 * - A failed reload keeps the last good list (`hasLoaded` stays true), so the
 *   page can show it under a stale-data banner instead of blanking.
 */
export function useVolunteerApplications() {
  const [applications, setApplications] = useState<VolunteerApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const reload = useCallback(async () => {
    try {
      setApplications(await getVolunteerApplications());
      setError(null);
      setHasLoaded(true);
    } catch (err) {
      setError((err as Error).message || 'Could not load applications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  useAutoRefresh(reload);

  const retry = useCallback(() => {
    setLoading(true);
    reload();
  }, [reload]);

  return { applications, loading, error, hasLoaded, reload, retry };
}
