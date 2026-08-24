import React from 'react';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { AdminTabBar } from '@/components/ui/admin-tab-bar';

import { Colors } from '@/constants/theme';

export default function AdminLayout() {
  return (
    <Tabs
      tabBar={(props) => <AdminTabBar {...props} />}
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
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
        }}
      />
    </Tabs>
  );
}
