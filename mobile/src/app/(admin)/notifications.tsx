import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { ActionModal } from '@/components/ui/action-modal';
import { Send } from 'lucide-react-native';
import { notificationService, Notification, CreateNotificationPayload, UpdateNotificationPayload } from '@/services/notification.service';
import { useFocusEffect } from 'expo-router';

const COLORS = {
  primary: '#FFFFFF',
  surface: '#F4F7FA',
  border: '#DCE6EF',
  blueTint: '#E3EEF9',
  secondary: '#1F5C96',
  ink: '#17242E',
  accent: '#E08A3C',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  accentBg: '#FEF3E7',
  gray: '#667085',
  danger: '#D32F2F',
  dangerBg: '#FFEBEE',
};

type AdminTab = 'All' | 'Sent' | 'Drafts';

export default function AdminNotificationsScreen() {
  const insets = useSafeAreaInsets();
  
  // State
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('All');
  
  // Modals
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [isPublishModalVisible, setPublishModalVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formMessage, setFormMessage] = useState('');
  const [formAudience, setFormAudience] = useState<'all' | 'volunteer' | 'elder'>('all');
  const [formSaveAsDraft, setFormSaveAsDraft] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAllNotifications();
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [])
  );

  const filteredNotifications = (notifications || []).filter(n => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Sent') return n.status === 'sent';
    if (activeTab === 'Drafts') return n.status === 'draft';
    return true;
  });

  const sentCount = (notifications || []).filter(n => n.status === 'sent').length;
  const draftCount = (notifications || []).filter(n => n.status === 'draft').length;

  const handleOpenCreate = () => {
    setModalMode('create');
    setFormTitle('');
    setFormMessage('');
    setFormAudience('all');
    setFormSaveAsDraft(true);
    setSelectedNotification(null);
    setCreateModalVisible(true);
  };

  const handleOpenEdit = (notification: Notification) => {
    setModalMode('edit');
    setFormTitle(notification.title);
    setFormMessage(notification.message);
    setFormAudience(notification.targetAudience);
    setFormSaveAsDraft(notification.status === 'draft');
    setSelectedNotification(notification);
    setCreateModalVisible(true);
  };

  const handleSaveNotification = async () => {
    if (!formTitle.trim() || !formMessage.trim()) {
      Alert.alert('Validation', 'Title and message are required.');
      return;
    }

    setActionLoading(true);
    try {
      const payload: CreateNotificationPayload | UpdateNotificationPayload = {
        title: formTitle,
        message: formMessage,
        targetAudience: formAudience,
        ...(modalMode === 'create' ? { saveAsDraft: formSaveAsDraft } : {})
      };

      if (modalMode === 'create') {
        await notificationService.createNotification(payload as CreateNotificationPayload);
      } else if (selectedNotification) {
        await notificationService.updateNotification(selectedNotification._id, payload);
      }
      setCreateModalVisible(false);
      fetchNotifications();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save notification');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedNotification) return;
    setActionLoading(true);
    try {
      await notificationService.publishNotification(selectedNotification._id);
      setPublishModalVisible(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to publish notification');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotification) return;
    setActionLoading(true);
    try {
      await notificationService.deleteNotification(selectedNotification._id);
      setDeleteModalVisible(false);
      setSelectedNotification(null);
      fetchNotifications();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to delete notification');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <View className="flex-1 bg-[#F4F7FA]">
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-[#17242E] mb-1">Notifications</Text>
            <Text className="text-[14px] text-[#667085]">Create & broadcast messages</Text>
          </View>
          <Pressable
            className="bg-[#1F5C96] rounded-xl flex-row items-center justify-center px-4 py-2 h-[40px]"
            onPress={handleOpenCreate}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text className="text-white font-bold text-[13px] leading-4 text-center">Add</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="px-5 mb-5 mt-2">
          <View className="bg-[#E3EEF9] rounded-2xl p-1 flex-row">
            {[`All (${notifications.length})`, `Sent (${sentCount})`, `Drafts (${draftCount})`].map((tabStr, index) => {
              const tabType = ['All', 'Sent', 'Drafts'][index] as AdminTab;
              const isActive = activeTab === tabType;
              return (
                <Pressable
                  key={tabType}
                  onPress={() => setActiveTab(tabType)}
                  style={[
                    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
                    isActive && {
                      backgroundColor: '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      { fontSize: 14 },
                      isActive
                        ? { color: '#17242E', fontWeight: 'bold' }
                        : { color: '#667085', fontWeight: '500' },
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
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={COLORS.secondary} />
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}>

            {filteredNotifications.length === 0 ? (
              <View className="py-10 items-center">
                <Text className="text-[#667085]">No notifications found.</Text>
              </View>
            ) : null}

            {filteredNotifications.map((notification) => (
              <View key={notification._id} className="bg-white rounded-2xl border border-[#DCE6EF] p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  {notification.status === 'sent' ? (
                    <View className="bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                      <Text className="text-[11px] font-bold text-[#2E7D32]">Sent</Text>
                    </View>
                  ) : (
                    <View className="bg-[#FEF3E7] px-2.5 py-1 rounded-full">
                      <Text className="text-[11px] font-bold text-[#E08A3C]">Draft</Text>
                    </View>
                  )}
                  <Text className="text-[12px] text-[#667085]">
                    {notification.status === 'sent' ? formatDate(notification.publishedAt || notification.updatedAt) : `Saved ${formatDate(notification.updatedAt)}`}
                  </Text>
                </View>
                <Text className="text-[15px] font-bold text-[#17242E] mb-2">{notification.title}</Text>
                <Text className="text-[14px] text-[#667085] leading-5 mb-4">
                  {notification.message}
                </Text>
                <View className="flex-row items-center mb-4">
                  <Text className="text-[12px] text-[#667085] bg-[#F4F7FA] px-2 py-1 rounded">
                    Audience: {notification.targetAudience.charAt(0).toUpperCase() + notification.targetAudience.slice(1)}
                  </Text>
                </View>

                {notification.status === 'draft' && (
                  <>
                    <View className="h-[1px] bg-[#F4F7FA] mb-3" />
                    <View className="flex-row items-center gap-x-2">
                      <Pressable
                        className="bg-[#1F5C96] px-4 py-2.5 rounded-xl flex-row items-center"
                        onPress={() => {
                          setSelectedNotification(notification);
                          setPublishModalVisible(true);
                        }}
                      >
                        <Text className="text-white font-bold text-[13px]">Publish Now</Text>
                      </Pressable>
                      <Pressable
                        className="bg-[#F4F7FA] px-4 py-2.5 rounded-xl flex-row items-center"
                        onPress={() => handleOpenEdit(notification)}
                      >
                        <Text className="text-[#17242E] font-bold text-[13px]">Edit</Text>
                      </Pressable>
                      <Pressable
                        className="bg-[#D32F2F] px-4 py-2.5 rounded-xl flex-row items-center"
                        onPress={() => {
                          setSelectedNotification(notification);
                          setDeleteModalVisible(true);
                        }}
                      >
                        <Text className="text-white font-bold text-[13px]">Delete</Text>
                      </Pressable>
                    </View>
                  </>
                )}
              </View>
            ))}

          </ScrollView>
        )}
      </View>

      {/* Create Notification Bottom Sheet Modal */}
      <BottomSheetModal
        visible={isCreateModalVisible}
        onClose={() => setCreateModalVisible(false)}
      >
        <Text className="text-xl font-bold text-[#17242E] mb-6">
          {modalMode === 'create' ? 'Create Notification' : 'Edit Notification'}
        </Text>

        <Text className="text-sm font-bold text-[#17242E] mb-2">Title</Text>
        <TextInput
          className="bg-[#F4F7FA] border border-[#DCE6EF] rounded-xl px-4 py-3.5 mb-5 text-[#17242E] text-[15px]"
          placeholder="Enter notification title"
          placeholderTextColor="#667085"
          value={formTitle}
          onChangeText={setFormTitle}
        />

        <Text className="text-sm font-bold text-[#17242E] mb-2">Target Audience</Text>
        <View className="flex-row gap-2 mb-5">
          {['all', 'volunteer', 'elder'].map((type) => (
            <Pressable
              key={type}
              onPress={() => setFormAudience(type as any)}
              className={`flex-1 py-2.5 rounded-xl border items-center ${formAudience === type
                  ? 'bg-[#E3EEF9] border-[#1F5C96]'
                  : 'bg-white border-[#DCE6EF]'
                }`}
            >
              <Text className={`font-bold text-[13px] ${formAudience === type ? 'text-[#1F5C96]' : 'text-[#667085]'
                }`}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        <Text className="text-sm font-bold text-[#17242E] mb-2">Message</Text>
        <TextInput
          className="bg-[#F4F7FA] border border-[#DCE6EF] rounded-xl px-4 py-3.5 mb-4 h-32 text-[#17242E] text-[15px]"
          placeholder="Enter your message here..."
          placeholderTextColor="#667085"
          multiline
          textAlignVertical="top"
          value={formMessage}
          onChangeText={setFormMessage}
        />

        <Pressable
          className="flex-row items-center mb-6"
          onPress={() => setFormSaveAsDraft(!formSaveAsDraft)}
        >
          <View className={`w-5 h-5 rounded border items-center justify-center mr-3 ${formSaveAsDraft ? 'bg-[#1F5C96] border-[#1F5C96]' : 'border-[#DCE6EF] bg-white'
            }`}>
            {formSaveAsDraft && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
          </View>
          <Text className="text-[#17242E] text-[14px]">Save as Draft</Text>
        </Pressable>

        {/* Actions */}
        <View className="flex-row gap-3 mt-auto pt-4 pb-8">
          <Pressable
            className="flex-1 bg-[#E3EEF9] py-3.5 rounded-xl items-center"
            onPress={() => setCreateModalVisible(false)}
            disabled={actionLoading}
          >
            <Text className="text-[#1F5C96] font-bold text-base">Cancel</Text>
          </Pressable>

          <Pressable
            className="flex-1 bg-[#1F5C96] py-3.5 rounded-xl items-center flex-row justify-center"
            onPress={handleSaveNotification}
            disabled={actionLoading}
          >
            {actionLoading ? (
               <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
               <Text className="text-white font-bold text-base">{formSaveAsDraft ? 'Save Draft' : 'Publish'}</Text>
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
        icon={<Send color="#1F5C96" size={32} />}
        iconContainerClassName="bg-[#E3EEF9]"
        confirmText="Publish"
        confirmButtonClassName="bg-[#1F5C96]"
      />
    </View>
  );
}
