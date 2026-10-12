import React from 'react';
import { Stack } from 'expo-router';

/** Keeps the inbox beneath a chat room opened directly (e.g. from a link). */
export const unstable_settings = {
  anchor: 'index',
};

/**
 * A Stack inside the client Tabs, so opening a chat pushes onto the inbox and
 * "back" returns there instead of the Home tab. The tab bar hides itself on
 * the chat room — see ClientTabBar.
 */
export default function MessagesLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
