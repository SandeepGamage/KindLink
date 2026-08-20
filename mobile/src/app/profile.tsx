import React, { useCallback } from 'react';
import { StyleSheet, View, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useAuthContext } from '@/context/auth-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = useCallback(async () => {
    await logout();
    router.replace('/');
  }, [logout, router]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">User Profile & Account</ThemedText>
        </View>

        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" style={styles.memberTag}>
            Assigned to Member 1 (IT23672932)
          </ThemedText>

          {user ? (
            <View style={styles.userContainer}>
              <ThemedText type="smallBold">Account Details:</ThemedText>
              <ThemedText type="default">Email: {user.email}</ThemedText>
              {user.name ? <ThemedText type="default">Name: {user.name}</ThemedText> : null}
              {user.role ? <ThemedText type="default">Role: {user.role}</ThemedText> : null}
            </View>
          ) : (
            <ThemedText type="default">
              Authentication & User Management / Feedback & Rating System
            </ThemedText>
          )}

          <Pressable style={styles.logoutButton} onPress={handleLogout}>
            <ThemedText style={styles.logoutText}>Log out</ThemedText>
          </Pressable>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    paddingVertical: Spacing.two,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  memberTag: {
    color: '#0066CC',
  },
  userContainer: {
    gap: Spacing.one,
    paddingVertical: Spacing.two,
  },
  logoutButton: {
    backgroundColor: '#DC2626',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
});
