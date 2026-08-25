import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { useAuthContext } from '@/context/auth-context';
import { Palette, FunctionalColors } from '@/constants/theme';

const STATS = [
  {
    title: 'Pending Volunteers',
    value: '12',
    badgeText: '3 New today',
    badgeType: 'accent',
  },
  {
    title: 'Active Users',
    value: '1,420',
    badgeText: '+8.4%',
    badgeType: 'success',
  },
  {
    title: 'Sent Broadcasts',
    value: '38',
    subtext: 'Last sent 2h ago',
  },
  {
    title: 'System Status',
    value: 'Optimal',
    isStatus: true,
    subtext: 'All nodes online',
    subtextColor: FunctionalColors.success,
  },
];

const RECENT_ACTIONS = [
  { id: '1', action: 'John Doe applied for Volunteer', time: '10m ago' },
  { id: '2', action: 'System Alert #104 published', time: '1h ago' },
  { id: '3', action: 'Sarah Jenkins account approved', time: '3h ago' },
];

const getInitials = (name?: string | null) => {
  if (!name) return 'A';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  const [isProfileModalVisible, setProfileModalVisible] = useState(false);
  const { user, logout: handleLogout } = useAuthContext();

  return (
    <View style={styles.container}>
      <View style={[styles.innerContainer, { paddingTop: insets.top }]}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>Welcome back, Admin</Text>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.profileButton,
              pressed && styles.profileButtonPressed
            ]}
            onPress={() => setProfileModalVisible(true)}
          >
            <Text style={styles.profileInitials}>
              {getInitials(user?.name)}
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* Stat Cards Grid */}
          <View style={styles.statsGrid}>
            {STATS.map((stat, index) => (
              <View
                key={index}
                style={styles.statCard}
              >
                <Text style={styles.statTitle}>{stat.title}</Text>

                {stat.isStatus ? (
                  <View style={styles.statusValueContainer}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusValueText}>{stat.value}</Text>
                  </View>
                ) : (
                  <Text style={styles.statMainValue}>{stat.value}</Text>
                )}

                {stat.badgeText && (
                  <View
                    style={[
                      styles.badgeContainer,
                      stat.badgeType === 'accent' ? styles.badgeAccentBg : styles.badgeSuccessBg
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        stat.badgeType === 'accent' ? styles.badgeAccentText : styles.badgeSuccessText
                      ]}
                    >
                      {stat.badgeText}
                    </Text>
                  </View>
                )}

                {stat.subtext && (
                  <Text
                    style={[
                      styles.statSubtext,
                      { color: stat.subtextColor || FunctionalColors.textMuted }
                    ]}
                  >
                    {stat.subtext}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionHeaderTitle}>
              QUICK ACTIONS
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickActionsScroll}>
              <Pressable style={styles.quickActionButton}>
                <SymbolView name="plus" size={16} tintColor="#FFFFFF" style={styles.quickActionIcon} />
                <Text style={styles.quickActionText}>Send Notice</Text>
              </Pressable>
              <Pressable style={styles.quickActionButton}>
                <SymbolView name="shield" size={16} tintColor="#FFFFFF" style={styles.quickActionIcon} />
                <Text style={styles.quickActionText}>Review Volunteers</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Recent Actions */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent Actions</Text>
              <Pressable>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>

            <View style={styles.recentActionsCard}>
              {RECENT_ACTIONS.map((item, index) => (
                <View
                  key={item.id}
                  style={[
                    styles.recentActionRow,
                    index === RECENT_ACTIONS.length - 1 ? styles.recentActionRowLast : null
                  ]}
                >
                  <Text style={styles.recentActionText} numberOfLines={1}>
                    {item.action}
                  </Text>
                  <Text style={styles.recentActionTime}>{item.time}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>

      <BottomSheetModal
        visible={isProfileModalVisible}
        onClose={() => setProfileModalVisible(false)}
      >
        <Text style={styles.modalTitle}>Admin Account</Text>

        {/* User Card */}
        <View style={styles.modalUserCard}>
          <View style={styles.modalAvatar}>
            <Text style={styles.modalAvatarText}>
              {getInitials(user?.name)}
            </Text>
          </View>
          <View style={styles.modalUserInfo}>
            <Text style={styles.modalUserName}>
              {user?.name || 'Administrator'}
            </Text>
            <Text style={styles.modalUserEmail} numberOfLines={1}>
              {user?.email || 'admin@kindlink.com'}
            </Text>
            <View style={styles.modalUserRoleBadge}>
              <Text style={styles.modalUserRoleText}>Admin</Text>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <Pressable
          style={({ pressed }) => [
            styles.logoutButton,
            pressed && styles.logoutButtonPressed
          ]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={FunctionalColors.danger} style={styles.logoutIcon} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </BottomSheetModal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  greetingText: {
    fontSize: 14,
    color: Palette.secondary,
    marginBottom: 4,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.ink,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileButtonPressed: {
    opacity: 0.8,
  },
  profileInitials: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: Palette.primary,
    borderRadius: 16,
    padding: 16,
    borderColor: Palette.border,
    borderWidth: 1,
    minHeight: 120,
    justifyContent: 'center',
  },
  statTitle: {
    fontSize: 13,
    color: FunctionalColors.textSecondary,
    marginBottom: 8,
  },
  statusValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: FunctionalColors.success,
    marginRight: 6,
  },
  statusValueText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: FunctionalColors.success,
  },
  statMainValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 8,
  },
  badgeContainer: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeAccentBg: {
    backgroundColor: FunctionalColors.accentLight,
  },
  badgeSuccessBg: {
    backgroundColor: FunctionalColors.successBg,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeAccentText: {
    color: Palette.accent,
  },
  badgeSuccessText: {
    color: FunctionalColors.success,
  },
  statSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
  sectionContainer: {
    marginTop: 24,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: Palette.secondary,
    letterSpacing: 1,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  quickActionsScroll: {
    gap: 12,
    paddingRight: 20,
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderColor: Palette.secondary,
    borderWidth: 1,
  },
  quickActionIcon: {
    marginRight: 8,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.primary,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Palette.ink,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.secondary,
  },
  recentActionsCard: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    borderColor: Palette.border,
    borderWidth: 1,
    overflow: 'hidden',
  },
  recentActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderColor: Palette.border,
    borderBottomWidth: 1,
  },
  recentActionRowLast: {
    borderBottomWidth: 0,
  },
  recentActionText: {
    fontSize: 14,
    color: Palette.ink,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
  },
  recentActionTime: {
    fontSize: 13,
    color: FunctionalColors.textSecondary,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 20,
  },
  modalUserCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.surface,
    padding: 16,
    borderRadius: 16,
    borderColor: Palette.border,
    borderWidth: 1,
    marginBottom: 24,
  },
  modalAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalUserInfo: {
    flex: 1,
  },
  modalUserName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.ink,
  },
  modalUserEmail: {
    fontSize: 12,
    color: FunctionalColors.textSecondary,
    marginTop: 2,
  },
  modalUserRoleBadge: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: Palette.blueTint,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modalUserRoleText: {
    color: Palette.secondary,
    fontSize: 11,
    fontWeight: '600',
  },
  logoutButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: FunctionalColors.dangerBg,
    borderColor: '#FECACA',
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  logoutButtonPressed: {
    opacity: 0.8,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: FunctionalColors.danger,
    fontWeight: 'bold',
    fontSize: 16,
  },
});
