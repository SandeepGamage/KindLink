import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft, MoreVertical, LogOut } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ActionModal } from '@/components/ui/action-modal';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Avatar } from '@/components/admin/avatar';
import { AdminProfileDetails, toProfileForm } from '@/components/admin/profile-details';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { useAuthContext } from '@/context/auth-context';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { FunctionalColors } from '@/constants/theme';

export default function AdminProfileScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  const { user, logout } = useAuthContext();

  const [isMenuVisible, setMenuVisible] = useState(false);
  const [isSignOutVisible, setSignOutVisible] = useState(false);

  const handleSignOutPress = useCallback(() => {
    setMenuVisible(false);
    // The confirm modal is swallowed if it opens while the menu is still
    // closing — same 300ms hand-off the users screen uses between its modals.
    setTimeout(() => setSignOutVisible(true), 300);
  }, []);

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
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push('/(admin)/profile/edit')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={[styles.headerAction, { color: c.primary }]}>Edit</Text>
            </Pressable>
            <Pressable
              onPress={() => setMenuVisible(true)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="More account actions"
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <MoreVertical size={22} color={c.text} />
            </Pressable>
          </View>
        }
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
      </ScrollView>

      <DropdownMenu
        visible={isMenuVisible}
        onClose={() => setMenuVisible(false)}
        offsetTop={56}
        offsetRight={12}
      >
        <Pressable
          onPress={handleSignOutPress}
          accessibilityRole="menuitem"
          accessibilityLabel="Sign out"
          style={({ pressed }) => [styles.menuItem, pressed && styles.pressed]}
        >
          <LogOut size={20} color={FunctionalColors.danger} />
          <Text style={styles.menuItemText}>Sign Out</Text>
        </Pressable>
      </DropdownMenu>

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
    paddingBottom: AdminSpacing.scrollBottom,
  },
  pressed: {
    opacity: 0.7,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    minHeight: 44,
  },
  menuItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: FunctionalColors.danger,
  },
});
