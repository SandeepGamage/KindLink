import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useFocusEffect } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { ChevronLeft, Bell, Trash2, Mail, MailOpen, CheckCircle } from 'lucide-react-native';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { notificationService, Notification } from '@/services/notification.service';
import { useAuth } from '@/context/auth-context';
import { Palette, FunctionalColors } from '@/constants/theme';

type FilterType = 'All' | 'Unread' | 'System';

export default function ClientNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

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

  const handleToggleRead = async (id: string) => {
    try {
      const result = await notificationService.toggleReadStatus(id);
      setNotifications((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, read: result.read } : item
        )
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle read status');
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

  const renderLeftActions = (progress: Animated.AnimatedInterpolation<number>, dragX: Animated.AnimatedInterpolation<number>, id: string, isRead: boolean) => {
    const scale = dragX.interpolate({
      inputRange: [0, 80],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    });

    return (
      <Pressable style={styles.leftAction} onPress={() => handleToggleRead(id)}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          {isRead ? <MailOpen color={Palette.primary} size={24} /> : <Mail color={Palette.primary} size={24} />}
          <Text style={styles.actionText}>{isRead ? 'Unread' : 'Read'}</Text>
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
      <Pressable style={styles.rightAction} onPress={() => confirmDelete(id)}>
        <Animated.View style={[styles.actionContent, { transform: [{ scale }] }]}>
          <Trash2 color={Palette.primary} size={24} />
          <Text style={styles.actionText}>Delete</Text>
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
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerIconButton} onPress={() => router.back()}>
          <ChevronLeft color={Palette.primary} size={24} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.headerIconButton} onPress={handleMarkAllAsRead}>
          <CheckCircle color={Palette.primary} size={20} />
        </Pressable>
      </View>

      {/* Background container */}
      <View style={styles.backgroundContainer}>
        <View style={styles.mainContent}>
          {/* Filter Tabs */}
          <View style={styles.filterTabsContainer}>
            <View style={styles.filterTabsWrapper}>
              {(['All', 'Unread', 'System'] as FilterType[]).map((tab) => {
                const isActive = activeFilter === tab;
                const count = tab === 'All' ? notifications.length
                  : tab === 'Unread' ? notifications.filter(n => !n.read).length
                    : notifications.filter(n => n.type === 'system').length;

                return (
                  <Pressable
                    key={tab}
                    onPress={() => setActiveFilter(tab)}
                    style={[
                      styles.filterTab,
                      isActive && styles.filterTabActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.filterTabText,
                        isActive ? styles.filterTabTextActive : styles.filterTabTextInactive,
                      ]}
                    >
                      {tab} ({count})
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* List */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.secondary} />
            </View>
          ) : (
            <ScrollView
              style={styles.listScrollView}
              contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
              showsVerticalScrollIndicator={false}>
              <View style={styles.listContainer}>
                {filteredNotifications.map((item, index) => {
                  const isRead = item.read ?? false;
                  const isLast = index === filteredNotifications.length - 1;
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
                      renderLeftActions={(p, d) => renderLeftActions(p, d, item._id, isRead)}
                      renderRightActions={(p, d) => renderRightActions(p, d, item._id)}
                      onSwipeableLeftOpen={() => handleToggleRead(item._id)}
                      onSwipeableRightOpen={() => confirmDelete(item._id)}
                      friction={2}
                      rightThreshold={40}
                      leftThreshold={40}
                    >
                      <View style={[styles.notificationItem, !isLast && styles.notificationItemBorder]}>
                        {/* Unread indicator dot */}
                        <View style={[styles.unreadDot, !isRead && styles.unreadDotActive]} />
                        <View style={[styles.iconContainer, isRead ? styles.iconContainerRead : styles.iconContainerUnread]}>
                          <Bell color={Palette.secondary} size={20} />
                        </View>
                        <View style={styles.textContainer}>
                          <Text style={[styles.titleText, isRead ? styles.titleTextRead : styles.titleTextUnread]}>
                            {item.title}
                          </Text>
                          <Text style={[styles.messageText, isRead ? styles.messageTextRead : styles.messageTextUnread]} numberOfLines={1}>
                            {item.message}
                          </Text>
                        </View>
                        <Text style={styles.timeText}>
                          {formatDate(item.publishedAt || item.createdAt)}
                        </Text>
                      </View>
                    </Swipeable>
                  );
                })}

                {filteredNotifications.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No notifications found</Text>
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.secondary,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  headerIconButton: {
    padding: 4,
  },
  headerTitle: {
    color: Palette.primary,
    fontSize: 18,
    fontWeight: '600',
  },
  backgroundContainer: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  mainContent: {
    flex: 1,
    backgroundColor: Palette.surface,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  filterTabsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterTabsWrapper: {
    backgroundColor: Palette.blueTint,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  filterTabActive: {
    backgroundColor: Palette.primary,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTabText: {
    fontSize: 13,
  },
  filterTabTextActive: {
    color: Palette.ink,
    fontWeight: 'bold',
  },
  filterTabTextInactive: {
    color: FunctionalColors.textMuted,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listScrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContainer: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    overflow: 'hidden',
    borderColor: Palette.border,
    borderWidth: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Palette.primary,
  },
  notificationItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  unreadDot: {
    width: 8,
    marginRight: 10,
  },
  unreadDotActive: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Palette.secondary,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  iconContainerRead: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
  },
  iconContainerUnread: {
    backgroundColor: '#DAE9F7',
    borderColor: '#B5D3EE',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  titleTextRead: {
    color: FunctionalColors.textMuted,
    fontWeight: '400',
  },
  titleTextUnread: {
    color: Palette.ink,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 13,
    lineHeight: 16,
    marginTop: 4,
  },
  messageTextRead: {
    color: FunctionalColors.textMuted,
    fontWeight: '400',
  },
  messageTextUnread: {
    color: FunctionalColors.textMuted,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 12,
    color: FunctionalColors.textMuted,
    marginLeft: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: FunctionalColors.textMuted,
  },
  leftAction: {
    backgroundColor: Palette.secondary,
    justifyContent: 'center',
    width: 80,
  },
  rightAction: {
    backgroundColor: FunctionalColors.danger,
    justifyContent: 'center',
    alignItems: 'flex-end',
    width: 80,
  },
  actionContent: {
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionText: {
    color: Palette.primary,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
});
