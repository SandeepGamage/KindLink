import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 0,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="volunteer/index"
        options={{
          title: 'Volunteer',
        }}
      />
      <Tabs.Screen
        name="volunteer/requests/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="volunteer/requests/[requestId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="volunteer/schedule/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="volunteer/schedule/[commitmentId]"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="volunteer/profile/index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Schedule',
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Notifications',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      <Tabs.Screen
        name="admin"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
