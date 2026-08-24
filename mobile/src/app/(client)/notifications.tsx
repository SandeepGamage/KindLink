import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ChevronLeft, Bell, Trash2, Mail } from 'lucide-react-native';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';

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

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'match' | 'booking' | 'message' | 'payment' | 'system';
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: 'Your request was matched',
    time: '11:32 AM',
    read: false,
    type: 'match',
  },
  {
    id: '2',
    title: 'New booking confirmed for tomorrow',
    time: '10:15 AM',
    read: false,
    type: 'booking',
  },
  {
    id: '3',
    title: 'Sarah sent you a message',
    time: '1:45 PM',
    read: true,
    type: 'message',
  },
  {
    id: '4',
    title: 'Payment received for Order #456',
    time: 'Yesterday',
    read: true,
    type: 'payment',
  },
];

type FilterType = 'All' | 'Unread' | 'System';

export default function NotificationsScreen() {
  const router = useRouter();
  const safeAreaInsets = useSafeAreaInsets();
  
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);

  const swipeableRefs = useRef<Map<string, Swipeable>>(new Map());

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + 24,
  };

  const handleMarkRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
    const swipeable = swipeableRefs.current.get(id);
    if (swipeable) {
      swipeable.close();
    }
  };

  const confirmDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteModalVisible(true);
  };

  const handleDelete = () => {
    if (itemToDelete) {
      setNotifications((prev) => prev.filter(item => item.id !== itemToDelete));
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

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'Unread') return !item.read;
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

  return (
    <View className="flex-1 bg-secondary" style={{ paddingTop: safeAreaInsets.top }}>
      {/* Header */}
      <View className="h-14 flex-row items-center justify-between px-4">
        <Pressable className="p-1" onPress={() => router.back()}>
          <ChevronLeft color={COLORS.Primary} size={24} />
        </Pressable>
        <Text className="text-primary text-lg font-semibold">Notifications</Text>
        <View className="w-8" />
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
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
          showsVerticalScrollIndicator={false}>
          {filteredNotifications.map((item) => (
            <Swipeable
              key={item.id}
              ref={(ref) => {
                if (ref) {
                  swipeableRefs.current.set(item.id, ref);
                } else {
                  swipeableRefs.current.delete(item.id);
                }
              }}
              renderLeftActions={(p, d) => renderLeftActions(p, d, item.id)}
              renderRightActions={(p, d) => renderRightActions(p, d, item.id)}
              friction={2}
              rightThreshold={40}
              leftThreshold={40}
            >
              <View className="flex-row items-center p-4 bg-primary border-b border-border">
                <View className="w-10 h-10 rounded-full bg-primary border border-border items-center justify-center mr-3">
                  <Bell color={COLORS.Secondary} size={20} />
                </View>
                <View className="flex-1 justify-center">
                  <Text className={`text-[15px] text-ink leading-5 ${!item.read ? 'font-semibold' : ''}`}>
                    {item.title}
                  </Text>
                </View>
                <Text className="text-xs text-muted ml-2">{item.time}</Text>
              </View>
            </Swipeable>
          ))}
          
          {filteredNotifications.length === 0 && (
             <View className="p-8 items-center">
               <Text className="text-muted">No notifications found</Text>
             </View>
          )}
        </ScrollView>
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
