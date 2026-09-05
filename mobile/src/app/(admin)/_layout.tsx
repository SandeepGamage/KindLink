import React, { useCallback, useState } from 'react';
import { Tabs, useFocusEffect } from 'expo-router';
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

export default function AdminLayout() {
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number | undefined>>({});

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
      tabBar={(props) => <AdminTabBar {...props} badgeCounts={badgeCounts} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
        }}
      />
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
      {/* Pushed from Approvals; intentionally absent from ADMIN_NAV_TABS so it
          gets no tab of its own. */}
      <Tabs.Screen
        name="history"
        options={{
          title: 'Approval History',
        }}
      />
      {/* Pushed from the Overview header avatar; likewise absent from
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
