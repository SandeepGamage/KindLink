import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { ActionModal } from '@/components/ui/action-modal';
import { Send } from 'lucide-react-native';
import { notificationService, Notification, CreateNotificationPayload, UpdateNotificationPayload } from '@/services/notification.service';
import { useFocusEffect } from 'expo-router';
import { Palette, FunctionalColors } from '@/constants/theme';

import { useColorScheme } from 'react-native';

type AdminTab = 'All' | 'Sent' | 'Drafts';

export default function AdminAlertsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [activeTab, setActiveTab] = useState<AdminTab>('All');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [formTitle, setFormTitle] = useState('');
  const [formAudience, setFormAudience] = useState<'all' | 'volunteer' | 'elder'>('all');
  const [formMessage, setFormMessage] = useState('');
  const [formSaveAsDraft, setFormSaveAsDraft] = useState(false);

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isPublishModalVisible, setPublishModalVisible] = useState(false);

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormTitle('');
    setFormMessage('');
    setFormAudience('all');
    setFormSaveAsDraft(false);
    setCreateModalVisible(true);
  };

  const handleOpenEdit = (notification: any) => {
    setModalMode('edit');
    setFormTitle(notification.title);
    setFormMessage(notification.message);
    setFormAudience((notification.targetAudience || notification.audience || 'all') as any);
    setFormSaveAsDraft(notification.status === 'draft');
    setSelectedNotification(notification);
    setCreateModalVisible(true);
  };

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAdminNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadNotifications();
    }, [loadNotifications])
  );

  const handleSaveNotification = async () => {
    setActionLoading(true);
    try {
      const payload: CreateNotificationPayload = {
        title: formTitle,
        message: formMessage,
        targetAudience: formAudience,
        saveAsDraft: formSaveAsDraft,
      };

      if (modalMode === 'create') {
        await notificationService.createNotification(payload);
      } else if (selectedNotification) {
        await notificationService.updateNotification(selectedNotification._id, payload);
      }
      setCreateModalVisible(false);
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to save notification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    try {
      await notificationService.deleteAdminNotification(selectedNotification._id);
      setDeleteModalVisible(false);
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to delete notification');
    }
  };

  const handlePublish = async () => {
    if (!selectedNotification) return;
    try {
      await notificationService.publishNotification(selectedNotification._id);
      setPublishModalVisible(false);
      loadNotifications();
    } catch (error) {
      Alert.alert('Error', 'Failed to publish notification');
    }
  };

  const formatDate = (date: string | Date | undefined) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString();
  };

  const sentCount = notifications.filter(n => n.status === 'sent').length;
  const draftCount = notifications.filter(n => n.status === 'draft').length;

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'Sent') return n.status === 'sent';
    if (activeTab === 'Drafts') return n.status === 'draft';
    return true;
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Create & broadcast messages</Text>
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.addButton,
            pressed && styles.addButtonPressed
          ]}
          onPress={handleOpenCreate}
        >
          <Ionicons name="add" size={16} color={Palette.primary} style={styles.addIcon} />
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
          {[`All (${notifications.length})`, `Sent (${sentCount})`, `Drafts (${draftCount})`].map((tabStr, index) => {
            const tabType = ['All', 'Sent', 'Drafts'][index] as AdminTab;
            const isActive = activeTab === tabType;
            return (
              <Pressable
                key={tabType}
                onPress={() => setActiveTab(tabType)}
                style={[
                  styles.tabButton,
                  isActive && styles.tabButtonActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    isActive ? styles.tabTextActive : styles.tabTextInactive,
                  ]}
                >
                  {tabStr}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.secondary} />
        </View>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}>

          {filteredNotifications.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No notifications found.</Text>
            </View>
          ) : null}

          {filteredNotifications.map((notification) => (
            <View key={notification._id} style={styles.notificationCard}>
              <View style={styles.cardHeader}>
                {notification.status === 'sent' ? (
                  <View style={styles.statusBadgeSent}>
                    <Text style={styles.statusBadgeSentText}>Sent</Text>
                  </View>
                ) : (
                  <View style={styles.statusBadgeDraft}>
                    <Text style={styles.statusBadgeDraftText}>Draft</Text>
                  </View>
                )}
                <Text style={styles.cardTime}>
                  {notification.status === 'sent' ? formatDate(notification.publishedAt || notification.updatedAt) : `Saved ${formatDate(notification.updatedAt)}`}
                </Text>
              </View>
              <Text style={styles.cardTitle}>{notification.title}</Text>
              <Text style={styles.cardMessage}>
                {notification.message}
              </Text>
              <View style={styles.audienceContainer}>
                <Text style={styles.audienceText}>
                  Audience: {(notification.targetAudience || notification.audience || 'all').charAt(0).toUpperCase() + (notification.targetAudience || notification.audience || 'all').slice(1)}
                </Text>
              </View>

              {notification.status === 'draft' && (
                <>
                  <View style={styles.cardDivider} />
                  <View style={styles.cardActions}>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButtonPrimary,
                        pressed && styles.actionButtonPressed
                      ]}
                      onPress={() => {
                        setSelectedNotification(notification);
                        setPublishModalVisible(true);
                      }}
                    >
                      <Text style={styles.actionButtonPrimaryText}>Publish Now</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButtonSecondary,
                        pressed && styles.actionButtonPressed
                      ]}
                      onPress={() => handleOpenEdit(notification)}
                    >
                      <Text style={styles.actionButtonSecondaryText}>Edit</Text>
                    </Pressable>
                    <Pressable
                      style={({ pressed }) => [
                        styles.actionButtonDanger,
                        pressed && styles.actionButtonPressed
                      ]}
                      onPress={() => {
                        setSelectedNotification(notification);
                        setDeleteModalVisible(true);
                      }}
                    >
                      <Text style={styles.actionButtonDangerText}>Delete</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          ))}

        </ScrollView>
      )}

      {/* Create Notification Bottom Sheet Modal */}
      <BottomSheetModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
      >
        <Text style={styles.modalTitle}>
          {modalMode === 'create' ? 'Create Notification' : 'Edit Notification'}
        </Text>

        <Text style={styles.inputLabel}>Title</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Enter notification title"
          placeholderTextColor={FunctionalColors.textMuted}
          value={formTitle}
          onChangeText={setFormTitle}
        />

        <Text style={styles.inputLabel}>Target Audience</Text>
        <View style={styles.audienceSelectionContainer}>
          {['all', 'volunteer', 'elder'].map((type) => (
            <Pressable
              key={type}
              onPress={() => setFormAudience(type as any)}
              style={[
                styles.audienceTypeButton,
                formAudience === type ? styles.audienceTypeButtonActive : styles.audienceTypeButtonInactive
              ]}
            >
              <Text style={[
                styles.audienceTypeText,
                formAudience === type ? styles.audienceTypeTextActive : styles.audienceTypeTextInactive
              ]}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.inputLabel}>Message</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Enter your message here..."
          placeholderTextColor={FunctionalColors.textMuted}
          multiline
          textAlignVertical="top"
          value={formMessage}
          onChangeText={setFormMessage}
        />

        <Pressable
          style={styles.checkboxContainer}
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

        {/* Actions */}
        <View style={styles.modalActionsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.modalCancelButton,
              pressed && styles.modalButtonPressed
            ]}
            onPress={() => setCreateModalVisible(false)}
            disabled={actionLoading}
          >
            <Text style={styles.modalCancelButtonText}>Cancel</Text>
          </Pressable>

          <Pressable
            style={({ pressed }) => [
              styles.modalSubmitButton,
              pressed && styles.modalButtonPressed
            ]}
            onPress={handleSaveNotification}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <ActivityIndicator size="small" color={Palette.primary} />
            ) : (
              <Text style={styles.modalSubmitButtonText}>{formSaveAsDraft ? 'Save Draft' : 'Publish'}</Text>
            )}
          </Pressable>
        </View>
      </BottomSheetModal>

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleDelete}
        title="Delete Notification?"
        subtitle="This notification will be permanently deleted and cannot be recovered."
      />

      <ActionModal
        visible={isPublishModalVisible}
        onCancel={() => setPublishModalVisible(false)}
        onConfirm={handlePublish}
        title="Publish Notification?"
        subtitle="This notification will be sent to the selected audience immediately."
        icon={<Send color={Palette.secondary} size={32} />}
        iconContainerStyle={styles.publishIconContainer}
        confirmText="Publish"
        confirmButtonStyle={styles.publishButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
  },
  addButton: {
    backgroundColor: Palette.secondary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: 40,
  },
  addButtonPressed: {
    opacity: 0.8,
  },
  addIcon: {
    marginRight: 6,
  },
  addButtonText: {
    color: Palette.primary,
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 16,
    textAlign: 'center',
  },
  tabsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 8,
  },
  tabsWrapper: {
    backgroundColor: Palette.blueTint,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabButtonActive: {
    backgroundColor: Palette.primary,
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
    color: Palette.ink,
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: FunctionalColors.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: FunctionalColors.textSecondary,
  },
  notificationCard: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    borderColor: Palette.border,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadgeSent: {
    backgroundColor: FunctionalColors.successBg,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeSentText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: FunctionalColors.success,
  },
  statusBadgeDraft: {
    backgroundColor: FunctionalColors.accentLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeDraftText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: Palette.accent,
  },
  cardTime: {
    fontSize: 12,
    color: FunctionalColors.textSecondary,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 8,
  },
  cardMessage: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  audienceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  audienceText: {
    fontSize: 12,
    color: FunctionalColors.textSecondary,
    backgroundColor: Palette.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Palette.surface,
    marginBottom: 12,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButtonPrimary: {
    backgroundColor: Palette.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonPrimaryText: {
    color: Palette.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  actionButtonSecondary: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonSecondaryText: {
    color: Palette.ink,
    fontWeight: 'bold',
    fontSize: 13,
  },
  actionButtonDanger: {
    backgroundColor: FunctionalColors.danger,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonDangerText: {
    color: Palette.primary,
    fontWeight: 'bold',
    fontSize: 13,
  },
  actionButtonPressed: {
    opacity: 0.8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.ink,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
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
    borderRadius: 12,
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
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
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
  modalCancelButton: {
    flex: 1,
    backgroundColor: Palette.blueTint,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalCancelButtonText: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalSubmitButton: {
    flex: 1,
    backgroundColor: Palette.secondary,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalSubmitButtonText: {
    color: Palette.primary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonPressed: {
    opacity: 0.8,
  },
  publishIconContainer: {
    backgroundColor: Palette.blueTint,
  },
  publishButton: {
    backgroundColor: Palette.secondary,
  },
});
