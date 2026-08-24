import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ChevronLeft, Bell, Trash2, Mail, CheckCircle } from 'lucide-react-native';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { notificationService, Notification } from '@/services/notification.service';
import { useAuth } from '@/context/auth-context';

const COLORS = {
  Primary: '#FFFFFF',
  Surface: '#F4F7FA',
  Border: '#DCE6EF',
  BlueTint: '#E3EEF9',
  Secondary: '#1F5C96',
  Ink: '#17242E',
  Danger: '#EF5350',
  Muted: '#6B7280',
};

type FilterType = 'All' | 'Unread' | 'System';

export default function NotificationsScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  const { user } = useAuth();
  const userId = user?._id || '';

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + 24,
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getClientNotifications();
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

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, read: true } : item
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark as read');
    } finally {
      const swipeable = swipeableRefs.current.get(id);
      if (swipeable) {
        swipeable.close();
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => {
          if (!item.read) {
             return { ...item, read: true };
          }
          return item;
        })
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = async () => {
    if (itemToDelete) {
      try {
        await notificationService.hideClientNotification(itemToDelete);
        setNotifications((prev) => prev.filter(item => item._id !== itemToDelete));
      } catch (error) {
         Alert.alert('Error', 'Failed to delete notification');
      }
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const cancelDelete = () => {
    if (itemToDelete) {
      const swipeable = swipeableRefs.current.get(itemToDelete);
      if (swipeable) {
        swipeable.close();
      }
    }
    setDeleteModalVisible(false);
    setItemToDelete(null);
  };

  const filteredNotifications = (notifications || []).filter((item) => {
    const isRead = item.read;
    if (activeFilter === 'Unread') return !isRead;
    if (activeFilter === 'System') return item.type === 'system';
    return true;
  });

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <Pressable className="bg-secondary justify-center w-20" onPress={() => handleMarkRead(id)}>
        <Animated.View className="w-20 items-center justify-center" style={{ transform: [{ scale }] }}>
          <Mail color={COLORS.Primary} size={24} />
          <Text className="text-primary text-xs font-medium mt-1">Mark Read</Text>
        </Animated.View>
      </Pressable>
    );
  };

  const renderRightActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string) => {
    const scale = dragX.interpolate({
      inputRange: [-80, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    });

    return (
      <Pressable className="bg-danger justify-center items-end w-20" onPress={() => confirmDelete(id)}>
        <Animated.View className="w-20 items-center justify-center" style={{ transform: [{ scale }] }}>
          <Trash2 color={COLORS.Primary} size={24} />
          <Text className="text-primary text-xs font-medium mt-1">Delete</Text>
        </Animated.View>
      </Pressable>
    );
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <View className="flex-1 bg-secondary" style={{ paddingTop: safeAreaInsets.top }}>
      {/* Header */}
      <View className="h-14 flex-row items-center justify-between px-4">
        <Pressable className="p-1" onPress={() => router.back()}>
          <ChevronLeft color={COLORS.Primary} size={24} />
        </Pressable>
        <Text className="text-primary text-lg font-semibold">Notifications</Text>
        <Pressable className="p-1" onPress={handleMarkAllAsRead}>
           <CheckCircle color={COLORS.Primary} size={20} />
        </Pressable>
      </View>

      {/* Background container */}
      <View className="flex-1 bg-surface">
        <View className="flex-1 bg-primary rounded-t-2xl">
          {/* Filter Tabs */}
          <View className="flex-row px-4 py-3 border-b border-border gap-2">
            {(['All', 'Unread', 'System'] as FilterType[]).map((tab) => {
              const isActive = activeFilter === tab;
              return (
                <Pressable
                  key={tab}
                  className={`py-2 px-4 rounded-full bg-transparent ${isActive ? 'bg-blueTint' : ''}`}
                  onPress={() => setActiveFilter(tab)}>
                  <Text className={`text-sm font-medium text-ink opacity-60 ${isActive ? 'text-secondary opacity-100 font-semibold' : ''}`}>
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* List */}
          {loading ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color={COLORS.Secondary} />
            </View>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              showsVerticalScrollIndicator={false}>
              {filteredNotifications.map((item) => {
                const isRead = item.read;
                return (
                  <Swipeable
                    key={item._id}
                    ref={(ref) => {
                      if (ref) {
                        swipeableRefs.current.set(item._id, ref);
                      } else {
                        swipeableRefs.current.delete(item._id);
                      }
                    }}
                    renderLeftActions={(p, d) => isRead ? undefined : renderLeftActions(p, d, item._id)}
                    renderRightActions={(p, d) => renderRightActions(p, d, item._id)}
                    friction={2}
                    rightThreshold={40}
                    leftThreshold={40}
                  >
                    <View className="flex-row items-center p-4 bg-primary border-b border-border">
                      <View className="w-10 h-10 rounded-full bg-primary border border-border items-center justify-center mr-3">
                        <Bell color={COLORS.Secondary} size={20} />
                      </View>
                      <View className="flex-1 justify-center">
                        <Text className={`text-[15px] text-ink leading-5 ${!isRead ? 'font-semibold' : ''}`}>
                          {item.title}
                        </Text>
                        <Text className={`text-[13px] text-muted leading-4 mt-1`} numberOfLines={1}>
                          {item.message}
                        </Text>
                      </View>
                      <Text className="text-xs text-muted ml-2">
                        {formatDate(item.publishedAt || item.createdAt)}
                      </Text>
                    </View>
                  </Swipeable>
                );
              })}

              {filteredNotifications.length === 0 && (
                <View className="p-8 items-center">
                  <Text className="text-muted">No notifications found</Text>
                </View>
              )}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
      />
    </View>
  );
}
