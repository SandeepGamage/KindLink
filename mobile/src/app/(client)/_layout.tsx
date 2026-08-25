import React from 'react';
import { Tabs } from 'expo-router';
import { ClientTabBar } from '@/components/navigation/client-tab-bar';

export default function ClientLayout() {
  return (
    <Tabs
      tabBar={(props) => <ClientTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      {/* Hidden helper screens if needed */}
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="add-rating"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="edit-request"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
