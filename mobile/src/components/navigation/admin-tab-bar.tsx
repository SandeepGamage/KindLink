import React from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { ReusableNavBar, TabItemConfig } from './reusable-nav-bar';
import {
  OverviewIcon,
  ApprovalsIcon,
  UsersIcon,
  AlertsIcon,
  SettingsIcon,
} from './navigation-icons';

export interface AdminTabBarProps extends Partial<BottomTabBarProps> {
  /** Standalone active tab name if used without Expo Router */
  activeTab?: string;
  /** Standalone tab press callback */
  onTabPress?: (tabName: string) => void;
  /** Notification / pending approval badge counts */
  badgeCounts?: Record<string, number | string | boolean | undefined>;
  /** Floating pill layout */
  floating?: boolean;
}

/**
 * Pre-configured 5-tab navigation configuration for Admin Portal
 * 1. Overview (Dashboard & analytics)
 * 2. Approvals (Volunteer & Senior verification requests)
 * 3. Users (User directory & role management)
 * 4. Alerts (System logs & incident reports)
 * 5. Settings (Platform configuration & security)
 */
export const ADMIN_NAV_TABS: TabItemConfig[] = [
  {
    name: 'index',
    label: 'Overview',
    icon: OverviewIcon,
    accessibilityLabel: 'Admin Overview dashboard tab',
  },
  {
    name: 'approvals',
    label: 'Approvals',
    icon: ApprovalsIcon,
    badgeColor: '#DC2626',
    accessibilityLabel: 'Admin Approvals queue tab',
  },
  {
    name: 'users',
    label: 'Users',
    icon: UsersIcon,
    accessibilityLabel: 'Admin User management directory tab',
  },
  {
    name: 'notifications',
    label: 'Alerts',
    icon: AlertsIcon,
    badgeColor: '#EA580C',
    accessibilityLabel: 'Admin System alerts and broadcasts tab',
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: SettingsIcon,
    accessibilityLabel: 'Admin Platform settings and configuration tab',
  },
];

/**
 * Admin Navigation Bar Component.
 * Styled with modern administrative dark/slate accents and priority badge indicators.
 */
export function AdminTabBar(props: AdminTabBarProps) {
  const isRouterMode = !!(props.state && props.descriptors && props.navigation);

  return (
    <ReusableNavBar
      role="admin"
      tabs={ADMIN_NAV_TABS}
      badgeCounts={props.badgeCounts}
      activeTab={props.activeTab}
      onTabPress={props.onTabPress}
      floating={props.floating}
      navigationProps={isRouterMode ? (props as BottomTabBarProps) : undefined}
    />
  );
}
