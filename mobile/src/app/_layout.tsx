/**
 * Root _layout.tsx
 *
 * App root layout:
 *  - Handles authentication routing state (admin vs client vs unauthenticated)
 *  - Configures global providers: GestureHandlerRootView, ThemeProvider, AuthProvider
 *  - Displays animated splash screen during load
 */

import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuthContext } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

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
    const isAdmin = user?.role?.toLowerCase() === 'admin';

    if (!isAuthenticated) {
      if (inAdminGroup) {
        router.replace('/(auth)/login' as any);
      }
    } else {
      if (isAdmin) {
        if (inAuthGroup || !inAdminGroup) {
          router.replace('/admin' as any);
        }
      } else {
        if (inAdminGroup || inAuthGroup) {
          router.replace('/profile' as any);
        }
      }
    }
  }, [isAuthenticated, user, isLoading, segments, router]);

  return <Slot />;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AnimatedSplashOverlay />
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
