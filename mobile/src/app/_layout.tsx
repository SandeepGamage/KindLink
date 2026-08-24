/**
 * Root _layout.tsx
 *
 * App root layout:
 *  - Handles authentication routing state (admin vs client vs unauthenticated)
 *  - Configures global providers: GestureHandlerRootView, ThemeProvider, AuthProvider
 *  - Displays animated splash screen during load
 */

import React, { useEffect, useMemo } from 'react';
import '../../global.css';
import { DarkTheme, DefaultTheme, ThemeProvider, type Theme } from '@react-navigation/native';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Slot, useRouter, useSegments } from 'expo-router';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuthContext } from '@/context/auth-context';
import { Palette, FunctionalColors } from '@/constants/theme';

SplashScreen.preventAutoHideAsync();

const CustomLightTheme: Theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Palette.secondary,
    background: Palette.surface,
    card: Palette.primary,
    text: Palette.ink,
    border: Palette.border,
    notification: Palette.accent,
  },
};

const CustomDarkTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#4D8EC9',
    background: '#0D151D',
    card: Palette.ink,
    text: Palette.primary,
    border: '#23384B',
    notification: Palette.accent,
  },
};

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
          router.replace('/(admin)' as any);
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
  const theme = useMemo(
    () => (colorScheme === 'dark' ? CustomDarkTheme : CustomLightTheme),
    [colorScheme]
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={theme}>
        <AuthProvider>
          <AnimatedSplashOverlay />
          <RootNavigation />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

