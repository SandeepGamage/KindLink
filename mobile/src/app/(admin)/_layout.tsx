import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { SymbolView } from 'expo-symbols';

import { Colors } from '@/constants/theme';

export default function AdminLayout() {
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
          borderTopWidth: 1,
          borderTopColor: '#E0E0E0',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Overview',
          tabBarIcon: ({ color }) => <SymbolView name="square.grid.2x2" tintColor={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="approvals"
        options={{
          title: 'Approvals',
          tabBarIcon: ({ color }) => <SymbolView name="checkmark.circle" tintColor={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          title: 'Alerts',
          tabBarIcon: ({ color }) => <SymbolView name="bell" tintColor={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="users"
        options={{
          title: 'Users',
          tabBarIcon: ({ color }) => <SymbolView name="person.2" tintColor={color} size={24} />
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <SymbolView name="gear" tintColor={color} size={24} />
        }}
      />
    </Tabs>
  );
}
