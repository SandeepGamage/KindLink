import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  ActivityIndicator,
  Alert,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import { Bell, Trash2, Mail, MailOpen, CheckCircle } from 'lucide-react-native';
import { DeleteConfirmationModal } from '@/components/ui/delete-confirmation-modal';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { Button } from '@/components/admin/button';
import { ClientScreenShell, HeaderIconButton } from '@/components/ui/client-screen-shell';
import { FilterTabs } from '@/components/ui/filter-tabs';
import { notificationService, Notification, isSystemNotification } from '@/services/notification.service';
import { useAuth } from '@/context/auth-context';
import { Palette, FunctionalColors, ClientFontSize } from '@/constants/theme';

type FilterType = 'All' | 'Unread' | 'System';

export default function ClientNotificationsScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + 24,
  };

  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  // Kept separate from `selected` so the sheet's content stays put while it slides out
  const [selected, setSelected] = useState<Notification | null>(null);
  const [isDetailVisible, setDetailVisible] = useState(false);

  const swipeableRefs = React.useRef(new Map<string, any>());
  const { user } = useAuth();
  const userId = user?._id || user?.id || 'anonymous';

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificationService.getClientNotifications(userId);
      setNotifications(data || []);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
      Alert.alert('Error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
    }, [fetchNotifications])
  );

  const handleToggleRead = async (id: string) => {
    try {
      const result = await notificationService.toggleReadStatus(userId, id);
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

  const openDetails = (item: Notification) => {
    setSelected(item);
    setDetailVisible(true);
  };

  const handleDetailToggleRead = () => {
    if (!selected) return;
    handleToggleRead(selected._id);
    setDetailVisible(false);
  };

  // The sheet must finish dismissing before the confirm modal presents,
  // otherwise the second modal is swallowed on iOS.
  const handleDetailDelete = () => {
    if (!selected) return;
    const id = selected._id;
    setDetailVisible(false);
    setTimeout(() => confirmDelete(id), 300);
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(userId, notifications.map((n) => n._id));
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
        await notificationService.hideClientNotification(userId, itemToDelete);
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

  // One predicate per tab, shared by the tab counts and the list so they always agree.
  const FILTERS: Record<FilterType, (n: Notification) => boolean> = {
    All: () => true,
    Unread: (n) => !n.read,
    System: isSystemNotification,
  };

  const filteredNotifications = notifications.filter(FILTERS[activeFilter]);

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

  const formatFullDate = (dateString?: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <>
      <ClientScreenShell
        title="Alerts"
        right={
          <HeaderIconButton onPress={handleMarkAllAsRead} accessibilityLabel="Mark all as read">
            <CheckCircle color={Palette.primary} size={20} />
          </HeaderIconButton>
        }>
          <FilterTabs
            tabs={(['All', 'Unread', 'System'] as FilterType[]).map((tab) => ({
              key: tab,
              label: tab,
              count: notifications.filter(FILTERS[tab]).length,
            }))}
            active={activeFilter}
            onChange={setActiveFilter}
          />

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
                      <Pressable
                        style={[styles.notificationItem, !isLast && styles.notificationItemBorder]}
                        onPress={() => openDetails(item)}
                        accessibilityRole="button"
                        accessibilityLabel={`${item.title}. ${isRead ? '' : 'Unread. '}Tap to view details`}
                      >
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
                          {formatDate(item.createdAt)}
                        </Text>
                      </Pressable>
                    </Swipeable>
                  );
                })}

                {filteredNotifications.length === 0 && (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No notifications found</Text>
                  </View>
                )}
              </View>
            </ScrollView>
          )}
      </ClientScreenShell>

      {/* Full notification details */}
      <BottomSheetModal
        visible={isDetailVisible}
        onClose={() => setDetailVisible(false)}
        minHeight={0}
      >
        {selected && (
          <View style={styles.detailContent}>
            <View style={styles.detailIcon}>
              <Bell color={Palette.secondary} size={32} />
            </View>
            <Text style={styles.detailTitle}>{selected.title}</Text>
            <Text style={styles.detailMeta}>
              {[selected.sender, formatFullDate(selected.createdAt)].filter(Boolean).join(' · ')}
            </Text>
            <ScrollView style={styles.detailScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.detailMessage} selectable>
                {selected.message}
              </Text>
            </ScrollView>

            <View style={styles.detailActions}>
              <Button
                label="Delete"
                variant="danger"
                icon={<Trash2 size={18} color={FunctionalColors.textLight} />}
                onPress={handleDetailDelete}
                style={styles.detailActionButton}
              />
              <Button
                label={selected.read ? 'Mark as Unread' : 'Mark as Read'}
                icon={selected.read
                  ? <Mail size={18} color={Palette.primary} />
                  : <MailOpen size={18} color={Palette.primary} />}
                onPress={handleDetailToggleRead}
                style={styles.detailActionButton}
              />
            </View>
          </View>
        )}
      </BottomSheetModal>

      <DeleteConfirmationModal
        visible={isDeleteModalVisible}
        onCancel={cancelDelete}
        onConfirm={handleDelete}
        title="Delete notification?"
        subtitle="It will be removed from your alerts on this device."
      />
    </>
  );
}

const styles = StyleSheet.create({
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
    fontSize: ClientFontSize.caption,
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
    fontSize: ClientFontSize.meta,
    color: FunctionalColors.textMuted,
    marginLeft: 8,
  },
  // Detail sheet follows the ActionModal (confirm modal) layout: centred icon
  // circle, bold title, muted subtitle, then a full-width row of actions.
  detailContent: {
    // Hugs its content; shrinks (and the message scrolls) only once the
    // sheet hits its 90% max height
    flexShrink: 1,
    alignItems: 'center',
  },
  detailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: Palette.blueTint,
  },
  detailTitle: {
    fontSize: ClientFontSize.heroTitle,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  detailMeta: {
    fontSize: ClientFontSize.body,
    color: FunctionalColors.textMuted,
    marginBottom: 16,
    textAlign: 'center',
  },
  detailScroll: {
    flexGrow: 0,
    flexShrink: 1,
    width: '100%',
  },
  detailMessage: {
    fontSize: ClientFontSize.body,
    lineHeight: 20,
    color: Palette.ink,
    textAlign: 'center',
  },
  detailActions: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    paddingTop: 32,
    marginBottom: 24,
  },
  detailActionButton: {
    flex: 1,
    paddingVertical: 14,
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
    fontSize: ClientFontSize.meta,
    fontWeight: '500',
    marginTop: 4,
  },
});
