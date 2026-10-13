import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, Alert, StyleSheet, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AdminHeader } from '@/components/ui/admin-header';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { ActionModal } from '@/components/ui/action-modal';
import { StatusBadge } from '@/components/admin/status-badge';
import { Button } from '@/components/admin/button';
import { EmptyState } from '@/components/admin/empty-state';
import { MonoIcon } from '@/components/admin/icon-circle';
import { Skeleton } from '@/components/admin/skeleton';
import { Send, Plus, AlertCircle, BellOff } from 'lucide-react-native';
import {
  notificationService,
  Notification,
  NotificationAudience,
  NotificationPayload,
} from '@/services/notification.service';
import { useFocusEffect } from 'expo-router';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius, AdminSpacing } from '@/components/admin/tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useKeyboardAwareScroll } from '@/hooks/use-keyboard-aware-scroll';
import { formatRelativeTime } from '@/utils/admin-time';

type AdminTab = 'All' | 'Sent' | 'Drafts';

const AUDIENCES: NotificationAudience[] = ['all', 'volunteer', 'elder'];

export default function AdminAlertsScreen() {
  const c = useAdminTheme();
  const formScroll = useKeyboardAwareScroll();

  const [activeTab, setActiveTab] = useState<AdminTab>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  // Delete/publish confirms; separate from the form so one can't lock the other.
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formTitle, setFormTitle] = useState('');
  const [formAudience, setFormAudience] = useState<NotificationAudience>('all');
  const [formMessage, setFormMessage] = useState('');
  const [formSaveAsDraft, setFormSaveAsDraft] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isPublishModalVisible, setPublishModalVisible] = useState(false);

  const closeForm = () => {
    setCreateModalVisible(false);
    setSelectedNotification(null);
    setModalMode('create');
    setFormError(null);
  };

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormTitle('');
    setFormMessage('');
    setFormAudience('all');
    setFormSaveAsDraft(false);
    setFormError(null);
    setSelectedNotification(null);
    setCreateModalVisible(true);
  };

  const handleOpenEdit = (notification: Notification) => {
    setModalMode('edit');
    setFormTitle(notification.title);
    setFormMessage(notification.message);
    setFormAudience(notification.audience || 'all');
    setFormSaveAsDraft(notification.status === 'draft');
    setFormError(null);
    setSelectedNotification(notification);
    setCreateModalVisible(true);
  };

  const loadNotifications = useCallback(async (showSpinner: boolean) => {
    if (showSpinner) setLoading(true);
    try {
      const data = await notificationService.getAdminNotifications();
      setNotifications(data);
      setError(null);
    } catch (err) {
      setError((err as Error).message || 'Could not load notifications.');
    } finally {
      setLoading(false);
      setHasLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      // Full-screen spinner only on first load; later focuses refresh in place.
      loadNotifications(!hasLoaded);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loadNotifications])
  );

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadNotifications(false);
    setRefreshing(false);
  }, [loadNotifications]);

  const handleSaveNotification = async () => {
    // The backend requires both fields; without this the 400 would come back
    // after the sheet had already closed, looking like a save that vanished.
    if (!formTitle.trim() || !formMessage.trim()) {
      setFormError('Both a title and a message are required.');
      return;
    }

    setActionLoading(true);
    setFormError(null);
    try {
      const payload: NotificationPayload = {
        title: formTitle.trim(),
        message: formMessage.trim(),
        audience: formAudience,
        saveAsDraft: formSaveAsDraft,
      };

      if (modalMode === 'create') {
        await notificationService.createNotification(payload);
      } else if (selectedNotification) {
        await notificationService.updateNotification(selectedNotification._id, payload);
      }
      closeForm();
      loadNotifications(false);
    } catch (err) {
      setFormError((err as Error).message || 'Failed to save notification.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification || confirmLoading) return;
    setConfirmLoading(true);
    try {
      await notificationService.deleteAdminNotification(selectedNotification._id);
      setDeleteModalVisible(false);
      setSelectedNotification(null);
      loadNotifications(false);
    } catch (err) {
      setDeleteModalVisible(false);
      Alert.alert('Could not delete notification', (err as Error).message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedNotification || confirmLoading) return;
    setConfirmLoading(true);
    try {
      await notificationService.publishNotification(selectedNotification._id);
      setPublishModalVisible(false);
      setSelectedNotification(null);
      loadNotifications(false);
    } catch (err) {
      setPublishModalVisible(false);
      Alert.alert('Could not publish notification', (err as Error).message);
    } finally {
      setConfirmLoading(false);
    }
  };

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const draftCount = notifications.filter(n => n.status === 'draft').length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Sent') return n.status === 'sent';
    if (activeTab === 'Drafts') return n.status === 'draft';
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Notifications"
        subtitle="Manage platform announcements"
        rightContent={
          <Button
            label="Create"
            icon={<Plus size={18} color={Palette.primary} />}
            onPress={handleOpenCreate}
            accessibilityLabel="Create a notification"
            style={styles.addButton}
          />
        }
      />

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={[styles.tabsWrapper, { backgroundColor: c.tint }]}>
          {[`All (${notifications.length})`, `Sent (${sentCount})`, `Drafts (${draftCount})`].map((tabStr, index) => {
            const tabType = ['All', 'Sent', 'Drafts'][index] as AdminTab;
            const isActive = activeTab === tabType;
            return (
              <Pressable
                key={tabType}
                onPress={() => setActiveTab(tabType)}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={[
                  styles.tabButton,
                  isActive && [styles.tabButtonActive, { backgroundColor: c.card }],
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive
                      ? [styles.tabTextActive, { color: c.text }]
                      : [styles.tabTextInactive, { color: c.textSecondary }],
                  ]}
                >
                  {tabStr}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading && !refreshing ? (
        <NotificationsSkeleton />
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={c.primary} />
          }
        >
          {error && notifications.length === 0 ? (
            <EmptyState
              icon={<AlertCircle size={32} color={c.danger} />}
              title="Couldn't load notifications"
              message={error}
              onRetry={() => loadNotifications(true)}
            />
          ) : filteredNotifications.length === 0 ? (
            <EmptyState
              card
              icon={<BellOff size={28} color={c.textMuted} />}
              title={
                notifications.length === 0
                  ? 'No notifications yet'
                  : `No ${activeTab.toLowerCase()} notifications`
              }
              message={
                notifications.length === 0
                  ? 'Create a broadcast to reach volunteers and elders.'
                  : undefined
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
              {filteredNotifications.map((notification) => {
                const audience = notification.audience || 'all';
                return (
                  <View
                    key={notification._id}
                    style={[
                      styles.notificationCard,
                      {
                        backgroundColor: c.card,
                        borderColor: c.cardBorder,
                      },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <View style={styles.cardHeaderLeft}>
                        <StatusBadge
                          label={notification.status === 'sent' ? 'Sent' : 'Draft'}
                          tone={notification.status === 'sent' ? 'success' : 'warning'}
                        />
                        <StatusBadge
                          label={audience.charAt(0).toUpperCase() + audience.slice(1)}
                          tone="neutral"
                          // "All" is so short the pill looks cramped; give it more room.
                          style={audience.toLowerCase() === 'all' && styles.audiencePillWide}
                        />
                      </View>
                      <Text style={[styles.cardTime, { color: c.textSecondary }]}>
                        {notification.status === 'sent'
                          ? formatRelativeTime(notification.createdAt)
                          : `Saved ${formatRelativeTime(notification.updatedAt)}`}
                      </Text>
                    </View>
                    <Text style={[styles.cardTitle, { color: c.text }]}>{notification.title}</Text>
                    <Text style={[styles.cardMessage, { color: c.textSecondary }]}>
                      {notification.message}
                    </Text>
                    {notification.status === 'draft' && (
                      <>
                        <View style={[styles.cardDivider, { backgroundColor: c.divider }]} />
                        <View style={styles.cardActions}>
                          <Button
                            label="Publish"
                            onPress={() => {
                              setSelectedNotification(notification);
                              setPublishModalVisible(true);
                            }}
                            style={styles.cardActionButton}
                          />
                          <Button
                            label="Edit"
                            variant="secondary"
                            onPress={() => handleOpenEdit(notification)}
                            style={[styles.cardActionButton, styles.cardActionsRight]}
                          />
                          <Button
                            label="Delete"
                            variant="danger"
                            onPress={() => {
                              setSelectedNotification(notification);
                              setDeleteModalVisible(true);
                            }}
                            style={styles.cardActionButton}
                          />
                        </View>
                      </>
                    )}
                  </View>
                );
              })}
            </>
          )}
        </ScrollView>
      )}

      {/* Create Notification Bottom Sheet Modal */}
      <BottomSheetModal
        visible={isCreateModalVisible}
        onClose={closeForm}
      >
        {/* Scrolls once the keyboard lifts the sheet and squeezes the form. */}
        <ScrollView
          {...formScroll.scrollProps}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.modalTitle}>
            {modalMode === 'create' ? 'Create Notification' : 'Edit Notification'}
          </Text>

          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Enter notification title"
            accessibilityLabel="Notification title"
            placeholderTextColor={FunctionalColors.textMuted}
            value={formTitle}
            onChangeText={setFormTitle}
            onFocus={formScroll.onInputFocus}
          />

          <Text style={styles.inputLabel}>Target Audience</Text>
          <View style={styles.audienceSelectionContainer}>
            {AUDIENCES.map((type) => {
              const isActive = formAudience === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setFormAudience(type)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  style={[
                    styles.audienceTypeButton,
                    isActive ? styles.audienceTypeButtonActive : styles.audienceTypeButtonInactive
                  ]}
                >
                  <Text style={[
                    styles.audienceTypeText,
                    isActive ? styles.audienceTypeTextActive : styles.audienceTypeTextInactive
                  ]}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Message</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter your message here..."
            accessibilityLabel="Notification message"
            placeholderTextColor={FunctionalColors.textMuted}
            multiline
            textAlignVertical="top"
            value={formMessage}
            onChangeText={setFormMessage}
            onFocus={formScroll.onInputFocus}
          />

          <Pressable
            style={styles.checkboxContainer}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: formSaveAsDraft }}
            accessibilityLabel="Save as draft"
            onPress={() => setFormSaveAsDraft(!formSaveAsDraft)}
          >
            <View style={[
              styles.checkbox,
              formSaveAsDraft ? styles.checkboxChecked : styles.checkboxUnchecked
            ]}>
              {formSaveAsDraft && <Ionicons name="checkmark" size={14} color={Palette.primary} />}
            </View>
            <Text style={styles.checkboxLabel}>Save as Draft</Text>
          </Pressable>

          {formError && (
            <View style={[styles.errorBanner, { backgroundColor: FunctionalColors.dangerBg }]}>
              <AlertCircle size={16} color={FunctionalColors.dangerText} />
              <Text style={styles.errorBannerText}>{formError}</Text>
            </View>
          )}

          {/* Actions */}
          <View style={styles.modalActionsContainer}>
            <Button
              label="Cancel"
              variant="secondary"
              onPress={closeForm}
              disabled={actionLoading}
              style={styles.modalActionButton}
            />
            <Button
              label={formSaveAsDraft ? 'Save Draft' : 'Publish'}
              onPress={handleSaveNotification}
              loading={actionLoading}
              style={styles.modalActionButton}
            />
          </View>
        </ScrollView>
      </BottomSheetModal>

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedNotification(null);
        }}
        onConfirm={handleDelete}
        loading={confirmLoading}
        title="Delete Notification?"
        subtitle="This notification will be permanently deleted and cannot be recovered."
        monochromeIcon
      />

      <ActionModal
        visible={isPublishModalVisible}
        onCancel={() => {
          setPublishModalVisible(false);
          setSelectedNotification(null);
        }}
        onConfirm={handlePublish}
        loading={confirmLoading}
        title="Publish Notification?"
        subtitle="This notification will be sent to the selected audience immediately."
        icon={<Send color={MonoIcon.color} size={32} />}
        iconContainerStyle={MonoIcon.circle}
        confirmText="Publish"
        confirmButtonStyle={styles.publishButton}
      />
    </View>
  );
}

/**
 * First-load placeholder in the shape of the real cards — status and audience
 * pills, timestamp, title and message — so nothing shifts once data arrives.
 * Matches the dashboard's skeleton approach rather than a centered spinner.
 */
function NotificationsSkeleton() {
  const c = useAdminTheme();

  return (
    <View
      accessibilityLabel="Loading notifications"
      accessibilityRole="progressbar"
      style={[styles.listContainer, styles.listContent]}
    >
      {[0, 1, 2].map((i) => (
        <View
          key={i}
          style={[styles.notificationCard, { backgroundColor: c.card, borderColor: c.cardBorder }]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Skeleton width={44} height={22} radius={Radius.pill} />
              <Skeleton width={44} height={22} radius={Radius.pill} />
            </View>
            <Skeleton width={72} height={12} />
          </View>
          <Skeleton width="55%" height={15} style={styles.skeletonTitle} />
          <Skeleton width="90%" height={12} style={styles.skeletonLine} />
          <Skeleton width="65%" height={12} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  addButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  tabsContainer: {
    paddingHorizontal: AdminSpacing.screenEdge,
    marginBottom: 12,
    // No marginTop — AdminHeader already owns the 24dp gap.
    marginTop: 0,
  },
  tabsWrapper: {
    borderRadius: Radius.card,
    padding: 4,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: Radius.card,
  },
  tabButtonActive: {
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
  },
  tabTextActive: {
    fontWeight: 'bold',
  },
  tabTextInactive: {
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: AdminSpacing.screenEdge,
    paddingBottom: AdminSpacing.scrollBottom,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 16,
  },
  errorBannerText: {
    flex: 1,
    fontSize: 13,
    color: FunctionalColors.dangerText,
  },
  notificationCard: {
    borderRadius: Radius.card,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    // Shrinks before the timestamp does, so the time always keeps the right edge.
    flexShrink: 1,
  },
  cardTime: {
    fontSize: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cardMessage: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  audiencePillWide: {
    paddingHorizontal: 14,
  },
  skeletonTitle: {
    marginBottom: 12,
  },
  skeletonLine: {
    marginBottom: 8,
  },
  cardDivider: {
    height: 1,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardActionButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    minHeight: 40,
  },
  cardActionsRight: {
    // Takes the row's spare width so Edit and Delete group on the right edge,
    // apart from the primary Publish action.
    marginLeft: 'auto',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.ink,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    height: AdminSpacing.inputHeight,
    // Android adds its own vertical padding, which fights a fixed height.
    paddingVertical: 0,
    marginBottom: 20,
    color: Palette.ink,
    fontSize: 15,
  },
  audienceSelectionContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  audienceTypeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    alignItems: 'center',
  },
  audienceTypeButtonActive: {
    backgroundColor: Palette.blueTint,
    borderColor: Palette.secondary,
  },
  audienceTypeButtonInactive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
  },
  audienceTypeText: {
    fontWeight: 'bold',
    fontSize: 13,
  },
  audienceTypeTextActive: {
    color: Palette.secondary,
  },
  audienceTypeTextInactive: {
    color: FunctionalColors.textSecondary,
  },
  textArea: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: Radius.card,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    // Multi-line: taller than inputHeight so several lines stay visible.
    height: 128,
    color: Palette.ink,
    fontSize: 15,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: Palette.secondary,
    borderColor: Palette.secondary,
  },
  checkboxUnchecked: {
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
  },
  checkboxLabel: {
    color: Palette.ink,
    fontSize: 14,
  },
  modalActionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalActionButton: {
    flex: 1,
    paddingVertical: 14,
  },
  publishButton: {
    backgroundColor: Palette.secondary,
  },
});
