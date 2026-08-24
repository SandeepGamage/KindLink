import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments } from 'expo-router';

import { AuthProvider, useAuthContext } from '@/context/auth-context';

function RootNavigation() {
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, user, isLoading } = useAuthContext();

  useEffect(() => {
    if (isLoading) return;

    const seg0 = (segments[0] as string) ?? '';
    const inAuthGroup =
      seg0 === '(auth)' ||
      seg0 === 'login' ||
      seg0 === 'register' ||
      seg0 === 'welcome' ||
      seg0 === 'onboarding' ||
      seg0 === 'role-select';
    const inAdminGroup = seg0 === '(admin)' || seg0 === 'admin';
    const inClientGroup = seg0 === '(client)';
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    if (!isAuthenticated) {
      if (!inAuthGroup) {
        router.replace('/(auth)/welcome' as any);
      }
    } else {
      if (isAdmin) {
        if (!inAdminGroup) {
          router.replace('/(admin)/users' as any);
        }
      } else {
        if (!inClientGroup) {
          router.replace('/(client)' as any);
        }
      }
    }
  }, [isAuthenticated, user, isLoading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colorScheme === 'dark' ? '#0D151C' : '#F4F7FA' }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
