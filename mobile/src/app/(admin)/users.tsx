import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { SheetCancelButton } from '@/components/ui/sheet-cancel-button';
import { ActionModal } from '@/components/ui/action-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { Avatar } from '@/components/admin/avatar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { FilterDropdown } from '@/components/admin/filter-dropdown';
import { MonoIcon } from '@/components/admin/icon-circle';
import { Skeleton } from '@/components/admin/skeleton';
import { Search, ArrowUpDown, MoreVertical, ShieldOff, Shield, Trash2, AlertCircle, UserX } from 'lucide-react-native';
import { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from 'expo-router';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { userService, User } from '@/services/user.service';

type FilterType = 'All' | 'Volunteers' | 'Pending' | 'Elders' | 'Active' | 'Inactive';

export default function UsersDirectoryScreen() {
  const c = useAdminTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [isFilterMenuOpen, setFilterMenuOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isActionsSheetVisible, setActionsSheetVisible] = useState(false);
  const [isToggleModalVisible, setToggleModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  // True while a toggle/delete request is in flight; the confirm modal shows a
  // spinner and ignores taps, so a slow response isn't mistaken for a missed tap.
  const [actionLoading, setActionLoading] = useState(false);

  const loadUsers = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Could not load users.');
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Block the screen only on first load; later focuses refresh in place
      // so returning to the tab doesn't flash a full-screen spinner.
      loadUsers(!hasLoaded);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadUsers])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadUsers(false);
    setRefreshing(false);
  }, [loadUsers]);

  const handleToggleActive = async () => {
    if (!selectedUser || actionLoading) return;
    setActionLoading(true);
    try {
      await userService.toggleUserActive(selectedUser._id);
      setToggleModalVisible(false);
      setSelectedUser(null);
      loadUsers(false);
    } catch (err) {
      setToggleModalVisible(false);
      Alert.alert('Could not update user', (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser || actionLoading) return;
    setActionLoading(true);
    try {
      await userService.deleteUser(selectedUser._id);
      setDeleteModalVisible(false);
      setSelectedUser(null);
      loadUsers(false);
    } catch (err) {
      setDeleteModalVisible(false);
      Alert.alert('Could not delete user', (err as Error).message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOpenActions = (user: User) => {
    setSelectedUser(user);
    setActionsSheetVisible(true);
  };

  // Shared by the backdrop, the swipe-down and the Cancel row, so dismissing
  // the sheet always clears the selection too.
  const closeActionsSheet = () => {
    afterSheetCloses.current = null;
    setActionsSheetVisible(false);
    setSelectedUser(null);
  };

  // The sheet must finish dismissing before the confirm modal presents,
  // otherwise the second modal is swallowed on iOS. The sheet's onClosed runs
  // this once it has really gone, however long that takes on the device.
  const afterSheetCloses = useRef<(() => void) | null>(null);
  const openAfterSheetCloses = (open: () => void) => {
    afterSheetCloses.current = open;
    setActionsSheetVisible(false);
  };
  const handleSheetClosed = () => {
    const open = afterSheetCloses.current;
    afterSheetCloses.current = null;
    open?.();
  };

  // Client-side filtering
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    switch (activeFilter) {
      case 'Volunteers':
        return user.role === 'volunteer';
      case 'Pending':
        return user.role === 'volunteer' && user.approvalStatus === 'pending';
      case 'Elders':
        // The User model's role enum carries both 'elderly' and 'senior'.
        return user.role === 'elderly' || user.role === 'senior';
      case 'Active':
        return user.isActive === true;
      case 'Inactive':
        return user.isActive === false;
      default:
        return true;
    }
  });

  const filters: FilterType[] = ['All', 'Volunteers', 'Pending', 'Elders', 'Active', 'Inactive'];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Users Directory"
        subtitle="Manage users system wide"
        bottomGap={12}
        rightContent={
          <Pressable
            onPress={() => setFilterMenuOpen(true)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Filter users"
          >
            <ArrowUpDown size={24} color={c.text} />
          </Pressable>
        }
        bottomContent={
          <View
            style={[
              styles.searchContainer,
              { backgroundColor: c.card, borderColor: c.cardBorder },
            ]}
          >
            <Search size={20} color={c.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: c.text }]}
              placeholder="Search users..."
              accessibilityLabel="Search users by name or email"
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={c.textSecondary}
            />
          </View>
        }
      />

      {loading && !refreshing ? (
        <UsersSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.primary} />
          }
        >
          <View style={styles.listContainer}>
            {error && users.length === 0 ? (
              <EmptyState
                icon={<AlertCircle size={32} color={c.danger} />}
                title="Couldn't load users"
                message={error}
                onRetry={() => loadUsers(true)}
              />
            ) : filteredUsers.length === 0 ? (
              <EmptyState
                icon={<UserX size={32} color={c.textMuted} />}
                title={users.length === 0 ? 'No users yet' : 'No matching users'}
                message={
                  users.length === 0
                    ? 'Users will appear here once people sign up.'
                    : 'Try a different search term or filter.'
                }
              />
            ) : (
              <>
                {error && (
                  <View style={[styles.errorBanner, { backgroundColor: FunctionalColors.dangerBg }]}>
                    <AlertCircle size={16} color={FunctionalColors.dangerText} />
                    <Text style={styles.errorBannerText}>Showing older data — {error}</Text>
                  </View>
                )}
                <View
                  style={[styles.usersCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}
                >
                  {filteredUsers.map((user, index) => {
                    const isLast = index === filteredUsers.length - 1;
                    return (
                      <View
                        key={user._id}
                        style={[
                          styles.userRow,
                          !isLast && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: c.divider },
                          !user.isActive && styles.userRowInactive,
                        ]}
                      >
                        <Avatar
                          name={user.name}
                          uri={user.profileImage}
                          size={48}
                          dimmed={!user.isActive}
                          style={styles.avatar}
                        />
  
                        <View style={styles.userInfoContainer}>
                          <Text
                            style={[
                              styles.userName,
                              { color: user.isActive ? c.text : c.textMuted },
                            ]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {user.name}
                          </Text>
                          <Text
                            style={[styles.userEmail, { color: c.textSecondary }]}
                            numberOfLines={1}
                            ellipsizeMode="tail"
                          >
                            {user.email}
                          </Text>
                        </View>
  
                        <View style={styles.badgesContainer}>
                          <StatusBadge label={user.role} tone="neutral" />
                          {!user.isActive ? (
                            <StatusBadge label="Inactive" tone="danger" />
                          ) : user.role === 'volunteer' && user.approvalStatus === 'pending' ? (
                            <StatusBadge label="Pending" tone="warning" />
                          ) : user.role === 'volunteer' && user.approvalStatus === 'rejected' ? (
                            <StatusBadge label="Declined" tone="danger" />
                          ) : user.isVerified ? (
                            <StatusBadge label="Verified" tone="success" />
                          ) : (
                            <StatusBadge label="Pending" tone="warning" />
                          )}
                          <Pressable
                            style={styles.moreButton}
                            hitSlop={12}
                            accessibilityRole="button"
                            accessibilityLabel={`Actions for ${user.name}`}
                            onPress={() => handleOpenActions(user)}
                          >
                            <MoreVertical size={20} color={c.textMuted} />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Actions Bottom Sheet */}
      <BottomSheetModal
        visible={isActionsSheetVisible}
        onClose={closeActionsSheet}
        onClosed={handleSheetClosed}
      >
        {selectedUser && (
          <>
            <View style={styles.sheetUserHeader}>
              <Avatar
                name={selectedUser.name}
                uri={selectedUser.profileImage}
                size={48}
                style={styles.avatar}
              />
              <View style={styles.sheetUserInfo}>
                <Text style={styles.sheetUserName}>{selectedUser.name}</Text>
                <Text style={styles.sheetUserEmail}>{selectedUser.email}</Text>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
              onPress={() => openAfterSheetCloses(() => setToggleModalVisible(true))}
            >
              <View style={[styles.sheetActionIcon, MonoIcon.circle]}>
                {selectedUser.isActive
                  ? <ShieldOff size={20} color={MonoIcon.color} />
                  : <Shield size={20} color={MonoIcon.color} />
                }
              </View>
              <View style={styles.sheetActionCopy}>
                <Text style={styles.sheetActionTitle}>
                  {selectedUser.isActive ? 'Deactivate Account' : 'Activate Account'}
                </Text>
                <Text style={styles.sheetActionSubtitle}>
                  {selectedUser.isActive
                    ? 'User will lose access to the platform'
                    : 'User will regain access to the platform'
                  }
                </Text>
              </View>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
              onPress={() => openAfterSheetCloses(() => setDeleteModalVisible(true))}
            >
              <View style={[styles.sheetActionIcon, MonoIcon.circle]}>
                <Trash2 size={20} color={FunctionalColors.danger} />
              </View>
              <View style={styles.sheetActionCopy}>
                <Text style={[styles.sheetActionTitle, styles.deleteText]}>Delete Permanently</Text>
                <Text style={styles.sheetActionSubtitle}>This action cannot be undone</Text>
              </View>
            </Pressable>

            <SheetCancelButton onPress={closeActionsSheet} />
          </>
        )}
      </BottomSheetModal>

      {/* Toggle Active Confirmation */}
      {selectedUser && (
        <ActionModal
          visible={isToggleModalVisible}
          onCancel={() => {
            setToggleModalVisible(false);
            setSelectedUser(null);
          }}
          onConfirm={handleToggleActive}
          loading={actionLoading}
          title={selectedUser.isActive ? 'Deactivate User?' : 'Activate User?'}
          subtitle={
            selectedUser.isActive
              ? `${selectedUser.name} will no longer be able to access the platform.`
              : `${selectedUser.name} will regain access to the platform.`
          }
          icon={
            selectedUser.isActive
              ? <ShieldOff color={MonoIcon.color} size={32} />
              : <Shield color={MonoIcon.color} size={32} />
          }
          iconContainerStyle={MonoIcon.circle}
          confirmText={selectedUser.isActive ? 'Deactivate' : 'Activate'}
          confirmButtonStyle={
            selectedUser.isActive
              ? styles.deactivateButton
              : styles.activateButton
          }
        />
      )}

      {/* Filter Popup — same pattern as the Approvals status filter. */}
      <FilterDropdown
        visible={isFilterMenuOpen}
        onClose={() => setFilterMenuOpen(false)}
        options={filters}
        activeValue={activeFilter}
        onChange={setActiveFilter}
        // One header icon here (Approvals has two), so align to the screen edge.
        offsetRight={AdminSpacing.screenEdge}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        loading={actionLoading}
        title="Delete User?"
        subtitle={`${selectedUser?.name || 'This user'} will be permanently removed from the system. This action cannot be undone.`}
        monochromeIcon
      />

    </View>
  );
}

/**
 * First-load placeholder in the shape of the real list — the same card, rows and
 * hairlines — so nothing shifts once the users arrive. Matches the dashboard's
 * skeleton approach rather than a centered spinner.
 */
function UsersSkeleton() {
  const c = useAdminTheme();
  const rows = [0, 1, 2, 3, 4, 5];

  return (
    <View
      accessibilityLabel="Loading users"
      accessibilityRole="progressbar"
      style={styles.listContainer}
    >
      <View style={[styles.usersCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
        {rows.map((i) => (
          <View
            key={i}
            style={[
              styles.userRow,
              i < rows.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: c.divider,
              },
            ]}
          >
            <Skeleton width={48} height={48} radius={Radius.pill} style={styles.avatar} />
            <View style={[styles.userInfoContainer, styles.skeletonText]}>
              <Skeleton width="60%" height={14} />
              <Skeleton width="85%" height={12} />
            </View>
            <View style={styles.badgesContainer}>
              <Skeleton width={56} height={20} radius={Radius.pill} />
              <Skeleton width={56} height={20} radius={Radius.pill} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    height: 48,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
  },

  scrollContent: {
    paddingBottom: AdminSpacing.scrollBottom,
  },
  skeletonText: {
    gap: 8,
  },
  listContainer: {
    paddingHorizontal: AdminSpacing.screenEdge,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 12,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: FunctionalColors.dangerText,
  },
  usersCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  userRowInactive: {
    opacity: 0.6,
  },
  avatar: {
    marginRight: 16,
  },
  userInfoContainer: {
    flex: 1,
    // Lets the email shrink and truncate instead of wrapping under the badges.
    minWidth: 0,
    marginRight: 12,
  },
  userName: {
    fontWeight: '600',
    fontSize: 16,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  moreButton: {
    marginLeft: 8,
    paddingLeft: 8,
  },

  // Bottom sheet action styles
  sheetUserHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sheetUserInfo: {
    flex: 1,
  },
  sheetUserName: {
    color: Palette.ink,
    fontWeight: '600',
    fontSize: 18,
    marginBottom: 2,
  },
  sheetUserEmail: {
    color: FunctionalColors.textSecondary,
    fontSize: 14,
  },
  sheetDivider: {
    height: 1,
    backgroundColor: Palette.border,
    marginBottom: 8,
  },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    paddingHorizontal: 4,
  },
  sheetActionPressed: {
    backgroundColor: Palette.surface,
  },
  sheetActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sheetActionCopy: {
    flex: 1,
  },
  sheetActionTitle: {
    color: Palette.ink,
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 2,
  },
  sheetActionSubtitle: {
    color: FunctionalColors.textSecondary,
    fontSize: 13,
  },

  // Modal button variants
  deactivateButton: {
    backgroundColor: FunctionalColors.warning,
  },
  activateButton: {
    backgroundColor: FunctionalColors.success,
  },
  deleteText: {
    color: FunctionalColors.danger,
  },
});
