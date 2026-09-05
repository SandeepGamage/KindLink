import { View, Text, TextInput, ScrollView, TouchableOpacity, Pressable, StyleSheet, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { ActionModal } from '@/components/ui/action-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { Search, MoreVertical, ShieldOff, Shield, Trash2 } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Palette, FunctionalColors } from '@/constants/theme';
import { userService, User } from '@/services/user.service';

const getInitials = (name?: string | null) => {
  if (!name) return 'A';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

type FilterType = 'All' | 'Volunteers' | 'Elders' | 'Active' | 'Inactive';

export default function UsersDirectoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Selected user for actions
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isActionsSheetVisible, setActionsSheetVisible] = useState(false);
  const [isToggleModalVisible, setToggleModalVisible] = useState(false);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to refresh users:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const handleToggleActive = async () => {
    if (!selectedUser) return;
    try {
      await userService.toggleUserActive(selectedUser._id);
      setToggleModalVisible(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to update user status');
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser._id);
      setDeleteModalVisible(false);
      setSelectedUser(null);
      loadUsers();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete user');
    }
  };

  const handleOpenActions = (user: User) => {
    setSelectedUser(user);
    setActionsSheetVisible(true);
  };

  const handleActionToggle = () => {
    setActionsSheetVisible(false);
    setTimeout(() => {
      setToggleModalVisible(true);
    }, 300);
  };

  const handleActionDelete = () => {
    setActionsSheetVisible(false);
    setTimeout(() => {
      setDeleteModalVisible(true);
    }, 300);
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
      case 'Elders':
        return user.role === 'elderly' || user.role === 'senior';
      case 'Active':
        return user.isActive === true;
      case 'Inactive':
        return user.isActive === false;
      default:
        return true;
    }
  });

  const filters: FilterType[] = ['All', 'Volunteers', 'Elders', 'Active', 'Inactive'];

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Users Directory"
        subtitle="Manage users system wide"
        bottomContent={
          <>
            <View style={styles.searchContainer}>
              <Search size={20} color={FunctionalColors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={FunctionalColors.textSecondary}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, activeFilter === filter ? styles.filterChipActive : styles.filterChipInactive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter ? styles.filterTextActive : styles.filterTextInactive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.secondary} />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Palette.secondary} />
          }
        >
          <View style={styles.listContainer}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              <>
                {filteredUsers.map((user, index) => {
                  const isLast = index === filteredUsers.length - 1;
                  return (
                    <View
                      key={user._id}
                      style={[
                        styles.userRow,
                        !isLast && styles.userRowBorder,
                        !user.isActive && styles.userRowInactive,
                      ]}
                    >
                      {/* Avatar */}
                      <View style={[styles.avatarContainer, !user.isActive && styles.avatarInactive]}>
                        <Text style={[styles.avatarText, !user.isActive && styles.avatarTextInactive]}>
                          {getInitials(user.name)}
                        </Text>
                      </View>

                      {/* User Info */}
                      <View style={styles.userInfoContainer}>
                        <View style={styles.userNameContainer}>
                          <Text style={[styles.userName, !user.isActive && styles.textInactive]}>
                            {user.name}
                          </Text>
                        </View>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>

                      {/* Status & Role Badges */}
                      <View style={styles.badgesContainer}>
                        <View style={styles.roleBadge}>
                          <Text style={styles.roleBadgeText}>
                            {user.role}
                          </Text>
                        </View>
                        {!user.isActive ? (
                          <View style={styles.statusBadgeInactive}>
                            <Text style={styles.statusTextInactive}>Inactive</Text>
                          </View>
                        ) : user.isVerified ? (
                          <View style={[styles.statusBadge, styles.statusBadgeVerified]}>
                            <Text style={[styles.statusBadgeText, styles.statusTextVerified]}>
                              Verified
                            </Text>
                          </View>
                        ) : (
                          <View style={[styles.statusBadge, styles.statusBadgePending]}>
                            <Text style={[styles.statusBadgeText, styles.statusTextPending]}>
                              Pending
                            </Text>
                          </View>
                        )}
                        <TouchableOpacity style={styles.moreButton} onPress={() => handleOpenActions(user)}>
                          <MoreVertical size={20} color={FunctionalColors.textMuted} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })}
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Actions Bottom Sheet */}
      <BottomSheetModal
        visible={isActionsSheetVisible}
        onClose={() => {
          setActionsSheetVisible(false);
          setSelectedUser(null);
        }}
      >
        {selectedUser && (
          <>
            {/* User info header */}
            <View style={styles.sheetUserHeader}>
              <View style={styles.sheetAvatar}>
                <Text style={styles.sheetAvatarText}>{getInitials(selectedUser.name)}</Text>
              </View>
              <View style={styles.sheetUserInfo}>
                <Text style={styles.sheetUserName}>{selectedUser.name}</Text>
                <Text style={styles.sheetUserEmail}>{selectedUser.email}</Text>
              </View>
            </View>

            {/* Divider */}
            <View style={styles.sheetDivider} />

            {/* Toggle Active */}
            <Pressable
              style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
              onPress={handleActionToggle}
            >
              <View style={[
                styles.sheetActionIcon,
                selectedUser.isActive ? styles.deactivateIconContainer : styles.activateIconContainer
              ]}>
                {selectedUser.isActive
                  ? <ShieldOff size={20} color={FunctionalColors.warning} />
                  : <Shield size={20} color={FunctionalColors.success} />
                }
              </View>
              <View>
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

            {/* Delete */}
            <Pressable
              style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
              onPress={handleActionDelete}
            >
              <View style={[styles.sheetActionIcon, styles.deleteIconContainer]}>
                <Trash2 size={20} color={FunctionalColors.danger} />
              </View>
              <View>
                <Text style={[styles.sheetActionTitle, styles.deleteText]}>Delete Permanently</Text>
                <Text style={styles.sheetActionSubtitle}>This action cannot be undone</Text>
              </View>
            </Pressable>
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
          title={selectedUser.isActive ? 'Deactivate User?' : 'Activate User?'}
          subtitle={
            selectedUser.isActive
              ? `${selectedUser.name} will no longer be able to access the platform.`
              : `${selectedUser.name} will regain access to the platform.`
          }
          icon={
            selectedUser.isActive
              ? <ShieldOff color={FunctionalColors.warning} size={32} />
              : <Shield color={FunctionalColors.success} size={32} />
          }
          iconContainerStyle={
            selectedUser.isActive
              ? styles.deactivateIconContainer
              : styles.activateIconContainer
          }
          confirmText={selectedUser.isActive ? 'Deactivate' : 'Activate'}
          confirmButtonStyle={
            selectedUser.isActive
              ? styles.deactivateButton
              : styles.activateButton
          }
        />
      )}

      {/* Delete Confirmation */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedUser(null);
        }}
        onConfirm={handleDeleteUser}
        title="Delete User?"
        subtitle={`${selectedUser?.name || 'This user'} will be permanently removed from the system. This action cannot be undone.`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
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
    color: Palette.ink,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filtersContent: {
    paddingRight: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: Palette.blueTint,
    borderColor: Palette.secondary,
  },
  filterChipInactive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
  },
  filterText: {
    fontWeight: '500',
  },
  filterTextActive: {
    color: Palette.secondary,
  },
  filterTextInactive: {
    color: FunctionalColors.textSecondary,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 96,
    marginTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: FunctionalColors.textMuted,
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  userRowInactive: {
    opacity: 0.6,
  },
  avatarContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarInactive: {
    backgroundColor: Palette.border,
  },
  avatarText: {
    color: Palette.secondary,
    fontWeight: '600',
    fontSize: 18,
  },
  avatarTextInactive: {
    color: FunctionalColors.textMuted,
  },
  userInfoContainer: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    color: Palette.ink,
    fontWeight: '600',
    fontSize: 16,
  },
  textInactive: {
    color: FunctionalColors.textMuted,
  },
  userEmail: {
    color: FunctionalColors.textSecondary,
    fontSize: 14,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
  },
  roleBadgeText: {
    color: FunctionalColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
  },
  statusBadgeVerified: {
    backgroundColor: FunctionalColors.successBg,
    borderColor: '#bbf7d0',
  },
  statusBadgePending: {
    backgroundColor: FunctionalColors.warningBg,
    borderColor: '#fde68a',
  },
  statusBadgeInactive: {
    backgroundColor: FunctionalColors.dangerBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextVerified: {
    color: FunctionalColors.successText,
  },
  statusTextPending: {
    color: FunctionalColors.warningText,
  },
  statusTextInactive: {
    color: FunctionalColors.dangerText,
    fontSize: 12,
    fontWeight: '500',
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
  sheetAvatar: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  sheetAvatarText: {
    color: Palette.secondary,
    fontWeight: '600',
    fontSize: 18,
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

  // Modal icon/button variants
  deactivateIconContainer: {
    backgroundColor: FunctionalColors.warningBg,
  },
  activateIconContainer: {
    backgroundColor: FunctionalColors.successBg,
  },
  deleteIconContainer: {
    backgroundColor: FunctionalColors.dangerBg,
  },
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
