import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Modal,
} from 'react-native';
import { Image } from 'expo-image';
import { AdminHeader } from '@/components/ui/admin-header';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { SheetCancelButton } from '@/components/ui/sheet-cancel-button';
import { ActionModal } from '@/components/ui/action-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { Avatar } from '@/components/admin/avatar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { Search, MoreVertical, ShieldOff, Shield, Trash2, AlertCircle, UserX, FileText, UserCheck } from 'lucide-react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { userService, User } from '@/services/user.service';
import { resolveMediaUrl } from '@/services/api-config';

type FilterType = 'All' | 'Volunteers' | 'Pending Review' | 'Elders' | 'Active' | 'Inactive';

export default function UsersDirectoryScreen() {
  const c = useAdminTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
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
  const [isDocumentModalVisible, setDocumentModalVisible] = useState(false);
  const [isApprovalModalVisible, setApprovalModalVisible] = useState(false);
  const [approvalTargetStatus, setApprovalTargetStatus] = useState<'approved' | 'rejected'>('approved');

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
    if (!selectedUser) return;
    try {
      await userService.toggleUserActive(selectedUser._id);
      setToggleModalVisible(false);
      setSelectedUser(null);
      loadUsers(false);
    } catch (err) {
      setToggleModalVisible(false);
      Alert.alert('Could not update user', (err as Error).message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      await userService.deleteUser(selectedUser._id);
      setDeleteModalVisible(false);
      setSelectedUser(null);
      loadUsers(false);
    } catch (err) {
      setDeleteModalVisible(false);
      Alert.alert('Could not delete user', (err as Error).message);
    }
  };

  const handleUpdateApproval = async () => {
    if (!selectedUser) return;
    try {
      await userService.updateApprovalStatus(selectedUser._id, approvalTargetStatus);
      setApprovalModalVisible(false);
      setSelectedUser(null);
      loadUsers(false);
    } catch (err) {
      setApprovalModalVisible(false);
      Alert.alert('Could not update volunteer status', (err as Error).message);
    }
  };

  const handleOpenActions = (user: User) => {
    setSelectedUser(user);
    setActionsSheetVisible(true);
  };

  // Shared by the backdrop, the swipe-down and the Cancel row, so dismissing
  // the sheet always clears the selection too.
  const closeActionsSheet = () => {
    setActionsSheetVisible(false);
    setSelectedUser(null);
  };

  // The sheet must finish dismissing before the confirm modal presents,
  // otherwise the second modal is swallowed on iOS.
  const openAfterSheetCloses = (open: () => void) => {
    setActionsSheetVisible(false);
    setTimeout(open, 300);
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
      case 'Pending Review':
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

  const filters: FilterType[] = ['All', 'Volunteers', 'Pending Review', 'Elders', 'Active', 'Inactive'];

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Users Directory"
        subtitle="Manage users system wide"
        bottomContent={
          <>
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
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScroll}
              contentContainerStyle={styles.filtersContent}
            >
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <Pressable
                    key={filter}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isActive }}
                    style={[
                      styles.filterChip,
                      isActive
                        ? { backgroundColor: c.tint, borderColor: c.primary }
                        : { backgroundColor: c.card, borderColor: c.cardBorder },
                    ]}
                    onPress={() => setActiveFilter(filter)}
                  >
                    <Text
                      style={[
                        styles.filterText,
                        { color: isActive ? c.primary : c.textSecondary },
                      ]}
                    >
                      {filter}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </>
        }
      />

      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={c.primary} />
        </View>
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
                {filteredUsers.map((user, index) => {
                  const isLast = index === filteredUsers.length - 1;
                  return (
                    <View
                      key={user._id}
                      style={[
                        styles.userRow,
                        !isLast && { borderBottomWidth: 1, borderBottomColor: c.divider },
                        !user.isActive && styles.userRowInactive,
                      ]}
                    >
                      <Avatar
                        name={user.name}
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
                        >
                          {user.name}
                        </Text>
                        <Text style={[styles.userEmail, { color: c.textSecondary }]}>
                          {user.email}
                        </Text>
                      </View>

                      <View style={styles.badgesContainer}>
                        <StatusBadge label={user.role} tone="neutral" />
                        {!user.isActive ? (
                          <StatusBadge label="Inactive" tone="danger" />
                        ) : user.role === 'volunteer' && user.approvalStatus === 'pending' ? (
                          <StatusBadge label="Pending Review" tone="warning" />
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
              </>
            )}
          </View>
        </ScrollView>
      )}

      {/* Actions Bottom Sheet */}
      <BottomSheetModal visible={isActionsSheetVisible} onClose={closeActionsSheet}>
        {selectedUser && (
          <>
            <View style={styles.sheetUserHeader}>
              <Avatar name={selectedUser.name} size={48} style={styles.avatar} />
              <View style={styles.sheetUserInfo}>
                <Text style={styles.sheetUserName}>{selectedUser.name}</Text>
                <Text style={styles.sheetUserEmail}>{selectedUser.email}</Text>
              </View>
            </View>

            <View style={styles.sheetDivider} />

            {selectedUser.role === 'volunteer' && selectedUser.approvalStatus !== 'approved' && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
                onPress={() => {
                  setApprovalTargetStatus('approved');
                  openAfterSheetCloses(() => setApprovalModalVisible(true));
                }}
              >
                <View style={[styles.sheetActionIcon, styles.activateIconContainer]}>
                  <UserCheck size={20} color={FunctionalColors.success} />
                </View>
                <View style={styles.sheetActionCopy}>
                  <Text style={styles.sheetActionTitle}>Approve Volunteer</Text>
                  <Text style={styles.sheetActionSubtitle}>Grant platform and dashboard access</Text>
                </View>
              </Pressable>
            )}

            {selectedUser.role === 'volunteer' && selectedUser.approvalStatus !== 'rejected' && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
                onPress={() => {
                  setApprovalTargetStatus('rejected');
                  openAfterSheetCloses(() => setApprovalModalVisible(true));
                }}
              >
                <View style={[styles.sheetActionIcon, styles.deleteIconContainer]}>
                  <UserX size={20} color={FunctionalColors.danger} />
                </View>
                <View style={styles.sheetActionCopy}>
                  <Text style={[styles.sheetActionTitle, styles.deleteText]}>Reject Application</Text>
                  <Text style={styles.sheetActionSubtitle}>Decline this volunteer request</Text>
                </View>
              </Pressable>
            )}

            <Pressable
              accessibilityRole="button"
              style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
              onPress={() => openAfterSheetCloses(() => setToggleModalVisible(true))}
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
              <View style={[styles.sheetActionIcon, styles.deleteIconContainer]}>
                <Trash2 size={20} color={FunctionalColors.danger} />
              </View>
              <View style={styles.sheetActionCopy}>
                <Text style={[styles.sheetActionTitle, styles.deleteText]}>Delete Permanently</Text>
                <Text style={styles.sheetActionSubtitle}>This action cannot be undone</Text>
              </View>
            </Pressable>

            {!!selectedUser.idDocument && (
              <Pressable
                accessibilityRole="button"
                style={({ pressed }) => [styles.sheetAction, pressed && styles.sheetActionPressed]}
                onPress={() => openAfterSheetCloses(() => setDocumentModalVisible(true))}
              >
                <View style={[styles.sheetActionIcon, styles.docIconContainer]}>
                  <FileText size={20} color={Palette.secondary} />
                </View>
                <View style={styles.sheetActionCopy}>
                  <Text style={styles.sheetActionTitle}>View NIC Document</Text>
                  <Text style={styles.sheetActionSubtitle}>Inspect verification card image</Text>
                </View>
              </Pressable>
            )}

            <SheetCancelButton onPress={closeActionsSheet} />
          </>
        )}
      </BottomSheetModal>

      {/* Volunteer Approval Confirmation */}
      {selectedUser && (
        <ActionModal
          visible={isApprovalModalVisible}
          onCancel={() => {
            setApprovalModalVisible(false);
            setSelectedUser(null);
          }}
          onConfirm={handleUpdateApproval}
          title={approvalTargetStatus === 'approved' ? 'Approve Volunteer?' : 'Reject Volunteer?'}
          subtitle={
            approvalTargetStatus === 'approved'
              ? `Grant ${selectedUser.name} full access to the KindLink volunteer platform.`
              : `Decline ${selectedUser.name}'s volunteer registration request.`
          }
          icon={
            approvalTargetStatus === 'approved'
              ? <Shield color={FunctionalColors.success} size={32} />
              : <UserX color={FunctionalColors.danger} size={32} />
          }
          iconContainerStyle={
            approvalTargetStatus === 'approved'
              ? styles.activateIconContainer
              : styles.deleteIconContainer
          }
          confirmText={approvalTargetStatus === 'approved' ? 'Approve' : 'Reject'}
          confirmButtonStyle={
            approvalTargetStatus === 'approved'
              ? styles.activateButton
              : styles.deactivateButton
          }
        />
      )}

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

      {/* View NIC Document Modal */}
      {selectedUser && (
        <Modal
          visible={isDocumentModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => {
            setDocumentModalVisible(false);
            setSelectedUser(null);
          }}
        >
          <View style={styles.docModalBackdrop}>
            <View style={[styles.docModalCard, { backgroundColor: c.card }]}>
              <View style={styles.docModalHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.docModalTitle, { color: c.text }]}>
                    {selectedUser.name}
                  </Text>
                  <Text style={[styles.docModalSub, { color: c.textSecondary }]}>
                    Volunteer Verification NIC Document
                  </Text>
                </View>
                <Pressable
                  onPress={() => {
                    setDocumentModalVisible(false);
                    setSelectedUser(null);
                  }}
                  hitSlop={12}
                  style={styles.docModalCloseBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Close document view"
                >
                  <Text style={styles.docModalCloseText}>✕</Text>
                </Pressable>
              </View>

              <View style={styles.docModalImageWrap}>
                {selectedUser.idDocument ? (
                  <Image
                    source={{ uri: resolveMediaUrl(selectedUser.idDocument) }}
                    style={styles.docModalImage}
                    contentFit="contain"
                  />
                ) : (
                  <Text style={{ color: c.textSecondary }}>No document attached</Text>
                )}
              </View>

              <Pressable
                onPress={() => {
                  setDocumentModalVisible(false);
                  setSelectedUser(null);
                }}
                style={styles.docModalDoneBtn}
                accessibilityRole="button"
              >
                <Text style={styles.docModalDoneBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      )}
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
    height: AdminSpacing.inputHeight,
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
    borderRadius: Radius.pill,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: 'center',
  },
  filterText: {
    fontWeight: '500',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  scrollContent: {
    paddingBottom: AdminSpacing.scrollBottom,
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
  docIconContainer: {
    backgroundColor: Palette.blueTint,
  },
  docModalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  docModalCard: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  docModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  docModalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  docModalSub: {
    fontSize: 13,
    marginTop: 2,
  },
  docModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(100, 116, 139, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docModalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  docModalImageWrap: {
    width: '100%',
    height: 280,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  docModalImage: {
    width: '100%',
    height: '100%',
  },
  docModalDoneBtn: {
    backgroundColor: Palette.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  docModalDoneBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
