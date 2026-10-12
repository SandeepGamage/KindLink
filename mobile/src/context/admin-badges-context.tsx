import React, { createContext, useCallback, useContext, useRef, useState } from 'react';
import { adminService } from '@/services/admin.service';

type BadgeCounts = Record<string, number | undefined>;

interface AdminBadgesContextValue {
  badgeCounts: BadgeCounts;
  /** Re-fetches the counts. Call it after anything that changes them. */
  refreshBadges: () => void;
}

const AdminBadgesContext = createContext<AdminBadgesContextValue>({
  badgeCounts: {},
  refreshBadges: () => {},
});

/**
 * Owns the admin tab-bar badge counts: pending volunteer applications on
 * Approvals, and draft broadcasts on Alerts. The admin layout refreshes them
 * on every tab change, and screens call `refreshBadges` after a change, such
 * as approving a volunteer, so the badge updates without leaving the tab.
 *
 * Failures are silent on purpose. A missing badge should never block
 * navigation.
 */
export function AdminBadgesProvider({ children }: { children: React.ReactNode }) {
  const [badgeCounts, setBadgeCounts] = useState<BadgeCounts>({});
  // Only the latest request may write, so a slow response can't overwrite a newer one.
  const latestRequest = useRef(0);

  const refreshBadges = useCallback(() => {
    const requestId = ++latestRequest.current;
    adminService
      .getDashboardStats()
      .then((stats) => {
        if (requestId !== latestRequest.current) return;
        setBadgeCounts({
          approvals: stats.pendingApprovals || undefined,
          notifications: stats.draftBroadcasts || undefined,
        });
      })
      .catch(() => {});
  }, []);

  return (
    <AdminBadgesContext.Provider value={{ badgeCounts, refreshBadges }}>
      {children}
    </AdminBadgesContext.Provider>
  );
}

export const useAdminBadges = () => useContext(AdminBadgesContext);
