/**
 * (auth)/_layout.tsx
 *
 * Auth group layout — renders auth screens (login, register, reset-password)
 * WITHOUT the bottom tab navigator. Uses a plain Stack navigator with
 * headers disabled so each auth screen controls its own presentation.
 */

import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}>
      <Stack.Screen name="welcome" options={{ gestureEnabled: false }} />
      <Stack.Screen name="onboarding" />
      <Stack.Screen name="role-select" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}

