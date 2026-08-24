import React from 'react';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useAuthContext } from '@/context/auth-context';
import { ReusableNavBar, TabItemConfig, UserNavRole } from './reusable-nav-bar';
import {
  HomeIcon,
  RequestsIcon,
  MessagesIcon,
  NotificationsIcon,
  ProfileIcon,
} from './navigation-icons';

export interface ClientTabBarProps extends Partial<BottomTabBarProps> {
  /** Override role (if not provided, auto-detected from AuthContext) */
  role?: 'elderly' | 'volunteer' | 'client';
  /** Standalone active tab name if used without Expo Router */
  activeTab?: string;
  /** Standalone tab press callback */
  onTabPress?: (tabName: string) => void;
  /** Notification / message badge counts */
  badgeCounts?: Record<string, number | string | boolean | undefined>;
  /** Floating pill layout */
  floating?: boolean;
}

/**
 * Pre-configured 5-tab navigation configuration for Client (Volunteer & Elderly)
 */
export const CLIENT_NAV_TABS: TabItemConfig[] = [
  {
    name: 'index',
    label: 'Home',
    icon: HomeIcon,
    accessibilityLabel: 'Home tab, view dashboard and activity',
  },
  {
    name: 'requests',
    label: 'Requests',
    icon: RequestsIcon,
    accessibilityLabel: 'Requests tab, view and manage assistance requests',
  },
  {
    name: 'messages',
    label: 'Messages',
    icon: MessagesIcon,
    accessibilityLabel: 'Messages tab, chat with volunteers and seniors',
  },
  {
    name: 'notifications',
    label: 'Alerts',
    icon: NotificationsIcon,
    accessibilityLabel: 'Notifications tab, view updates and alerts',
  },
  {
    name: 'profile',
    label: 'Profile',
    icon: ProfileIcon,
    accessibilityLabel: 'Profile tab, view account and settings',
  },
];

/**
 * Client Navigation Bar Component.
 * Optimized for both Volunteer and Elderly person personas with high accessibility and clear visual cues.
 */
export function ClientTabBar(props: ClientTabBarProps) {
  const { user } = useAuthContext();

  // Determine effective role: priority to prop -> authContext -> 'client'
  let effectiveRole: UserNavRole = props.role ?? 'client';
  if (!props.role && user?.role) {
    const rawRole = user.role.toLowerCase();
    if (rawRole === 'elderly' || rawRole === 'senior') {
      effectiveRole = 'elderly';
    } else if (rawRole === 'volunteer') {
      effectiveRole = 'volunteer';
    }
  }

  // If props has navigation & state, pass as navigationProps for Expo Router
  const isRouterMode = !!(props.state && props.descriptors && props.navigation);

  return (
    <ReusableNavBar
      role={effectiveRole}
      tabs={CLIENT_NAV_TABS}
      badgeCounts={props.badgeCounts}
      activeTab={props.activeTab}
      onTabPress={props.onTabPress}
      floating={props.floating}
      navigationProps={isRouterMode ? (props as BottomTabBarProps) : undefined}
    />
  );
}
