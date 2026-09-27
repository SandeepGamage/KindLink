import React from 'react';
import { Stack } from 'expo-router';

/**
 * Keeps My Profile beneath the edit screen, so opening `/(admin)/profile/edit`
 * directly still has somewhere to pop back to.
 */
export const unstable_settings = {
  anchor: 'index',
};

/**
 * A Stack nested inside the admin Tabs.
 *
 * The admin group is a tab navigator, so sibling screens don't push onto each
 * other — going "back" from one would land on the navigator's initial route
 * (the dashboard) rather than the screen you came from. Profile and its edit
 * screen need real push/pop, so they get their own stack.
 */
export default function AdminProfileLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
