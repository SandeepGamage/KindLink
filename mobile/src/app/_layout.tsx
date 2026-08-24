/**
 * Root _layout.tsx
 *
 * Checks for a stored JWT on mount:
 *  - No token  → redirect to /(auth)/login
 *  - Has token → show the main tab navigator (AppTabs)
 *
 * Uses expo-router's <Slot> / <Stack> to host both the auth group and
 * the tab group. The auth group never shows the tab bar.
 */

import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { useRouter, useSegments, Slot } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { AuthProvider, useAuthContext } from '@/context/auth-context';

SplashScreen.preventAutoHideAsync();

function RootNavigation() {
  const { userRole, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = (segments[0] as string) === '(auth)';
    
    if (userRole === 'guest' && !inAuthGroup) {
      router.replace('/(auth)/sign-in' as any);
    } else if (userRole === 'admin') {
      if ((segments[0] as string) !== '(admin)') {
         router.replace('/(admin)' as any);
      }
    } else if (userRole === 'user') {
       if ((segments[0] as string) !== '(client)') {
         router.replace('/(client)' as any);
       }
    }
  }, [userRole, isLoading, segments]);

  return <Slot />;
}

export default function RootLayout() {
function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const isRoot = !segments[0];

    if (!isAuthenticated && !inAuthGroup && !isRoot) {
      router.replace('/');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/profile');
    }
  }, [isAuthenticated, isLoading, segments, router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <AnimatedSplashOverlay />
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Slot />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
