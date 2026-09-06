import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, RefreshControl } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, LogOut } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ActionModal } from '@/components/ui/action-modal';
import { Avatar } from '@/components/admin/avatar';
import { Button } from '@/components/admin/button';
import { AdminProfileDetails, toProfileForm } from '@/components/admin/profile-details';
import { AdminSpacing } from '@/components/admin/tokens';
import { useAuthContext } from '@/context/auth-context';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { FunctionalColors } from '@/constants/theme';

export default function AdminProfileScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  // This screen hides the tab bar, so the bottom inset is ours to clear.
  const insets = useSafeAreaInsets();
  const { user, logout, refreshUser } = useAuthContext();

  const [isSignOutVisible, setSignOutVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Pull the latest profile every time the screen is shown, so an edit made
  // elsewhere (or the avatar just saved on the edit screen) is reflected here.
  // The cached context user is rendered meanwhile — there is nothing to spin on.
  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, [refreshUser])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshUser();
    } finally {
      setRefreshing(false);
    }
  }, [refreshUser]);

  const handleSignOut = useCallback(async () => {
    setSignOutVisible(false);
    // No manual navigation — the root layout redirects once the token clears.
    await logout();
  }, [logout]);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="My Profile"
        leftContent={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={c.text} />
          </Pressable>
        }
        rightContent={
          <Pressable
            onPress={() => router.push('/(admin)/profile/edit')}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            style={({ pressed }) => [pressed && styles.pressed]}
          >
            <Text style={[styles.headerAction, { color: c.primary }]}>Edit</Text>
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + AdminSpacing.scrollBottomBare },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={c.primary}
            colors={[c.primary]}
          />
        }
      >
        <View style={styles.identity}>
          <Avatar name={user?.name} uri={user?.profileImage} size={96} />
          <Text style={[styles.identityName, { color: c.text }]}>
            {user?.name || 'Administrator'}
          </Text>
          <Text style={[styles.identityEmail, { color: c.textSecondary }]} numberOfLines={1}>
            {user?.email || 'admin@kindlink.com'}
          </Text>
        </View>

        <AdminProfileDetails form={toProfileForm(user)} />

        <Button
          label="Sign Out"
          variant="danger"
          onPress={() => setSignOutVisible(true)}
          fullWidth
          icon={<LogOut size={20} color={FunctionalColors.textLight} />}
          style={styles.signOutButton}
        />
      </ScrollView>

      <ActionModal
        visible={isSignOutVisible}
        onCancel={() => setSignOutVisible(false)}
        onConfirm={handleSignOut}
        title="Sign out?"
        subtitle="You'll need to log in again to manage the admin portal."
        icon={<LogOut size={28} color={FunctionalColors.danger} />}
        confirmText="Sign Out"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: AdminSpacing.screenEdgeWide,
    // paddingBottom is applied inline — it depends on the safe-area inset.
  },
  pressed: {
    opacity: 0.7,
  },
  headerAction: {
    fontSize: 16,
    fontWeight: '600',
  },
  identity: {
    // No paddingTop — AdminHeader already owns the 24dp gap.
    alignItems: 'center',
  },
  identityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 12,
  },
  identityEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  signOutButton: {
    // Matches the gap AdminProfileDetails puts above the field block.
    marginTop: 24,
  },
});
