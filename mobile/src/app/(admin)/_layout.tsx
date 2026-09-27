import React, { useCallback, useState } from 'react';
import { Tabs, useFocusEffect, useSegments } from 'expo-router';
import { AdminTabBar } from '@/components/navigation/admin-tab-bar';
import { adminService } from '@/services/admin.service';

/**
 * Pins what `/(admin)` resolves to. Without this the anchor falls back to
 * whichever child route resolution happens to pick, so a hot reload — which
 * sends the root layout through `router.replace('/(admin)')` while segments are
 * momentarily empty — could land on any tab instead of Overview.
 */
export const unstable_settings = {
  anchor: 'index',
};

/**
 * Sub-pages pushed from a tab rather than being one. They carry their own back
 * affordance in AdminHeader, so the tab bar would only mislead — nothing to
 * highlight on profile, and the parent tab still lit on approval history.
 * A prefix match covers a route's whole subtree (`profile` → `profile/edit`).
 */
const FULL_SCREEN_ROUTES = ['profile', 'approvals/history'];

export default function AdminLayout() {
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number | undefined>>({});

  // Path relative to `(admin)`: ['(admin)', 'profile', 'edit'] -> 'profile/edit'.
  // Index routes contribute no segment, so My Profile is 'profile' and the
  // Approvals tab itself is 'approvals'.
  const segments = useSegments();
  const subPath = segments.slice(1).join('/');
  const hideNavBar = FULL_SCREEN_ROUTES.some(
    (route) => subPath === route || subPath.startsWith(`${route}/`)
  );

  // Surfaces the pending-verification count on the Approvals tab. Failures are
  // silent on purpose — a missing badge should never block navigation.
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      adminService
        .getDashboardStats()
        .then((stats) => {
          if (!cancelled) {
            setBadgeCounts({
              approvals: stats.pendingVerification || undefined,
              notifications: stats.draftBroadcasts || undefined,
            });
          }
        })
        .catch(() => {});
      return () => {
        cancelled = true;
      };
    }, [])
  );

  return (
    <Tabs
      tabBar={(props) =>
        hideNavBar ? null : <AdminTabBar {...props} badgeCounts={badgeCounts} />
      }
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
      {/* A nested Stack (approvals/_layout.tsx) so the approval-history screen
          can push and pop back to Volunteer Requests. */}
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
        }}
      />
      {/* Pushed from the Overview header avatar; absent from
          ADMIN_NAV_TABS so it gets no tab of its own. It is a nested Stack
          (profile/_layout.tsx) so its edit screen can push and pop properly. */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'My Profile',
        }}
      />
    </Tabs>
  );
}
