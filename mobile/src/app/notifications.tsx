import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomSheet } from '@/components/bottom-sheet';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface NotificationItem {
  id: string;
  title: string;
  time: string;
  read: boolean;
  type: 'match' | 'booking' | 'message' | 'payment';
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
    title: 'New booking confirmed for Tomorrow',
    time: '10:15 AM',
    read: false,
    type: 'booking',
  },
  {
    id: '3',
    title: 'Sarah sent you a message',
    time: '9:45 AM',
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

export default function NotificationsScreen() {
  const theme = useTheme();
  const safeAreaInsets = useSafeAreaInsets();
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'system'>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const swipeableRefs = useRef<{ [key: string]: any }>({}).current;

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  const toggleReadStatus = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: !item.read } : item
      )
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const confirmDelete = () => {
    if (notificationToDelete) {
      deleteNotification(notificationToDelete);
      setNotificationToDelete(null);
    }
  };

  const cancelDelete = () => {
    if (notificationToDelete) {
      swipeableRefs[notificationToDelete]?.close();
    }
    setNotificationToDelete(null);
  };

  const handleToggleRead = (item: NotificationItem) => {
    toggleReadStatus(item.id);
    swipeableRefs[item.id]?.close();
  };

  const renderLeftActions = (item: NotificationItem) => (
    <Pressable
      style={[styles.readAction, { backgroundColor: item.read ? '#6e7681' : '#58a6ff' }]}
      onPress={() => handleToggleRead(item)}>
      <Ionicons name={item.read ? 'mail-open-outline' : 'mail-unread-outline'} size={24} color="#FFFFFF" />
    </Pressable>
  );

  const renderRightActions = (id: string) => (
    <Pressable
      style={styles.deleteAction}
      onPress={() => setNotificationToDelete(id)}>
      <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
    </Pressable>
  );

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    if (activeFilter === 'system') return item.type === 'match' || item.type === 'payment';
    return true;
  });

  return (
    <ThemedView style={styles.container}>
      <LinearGradient
        colors={['#0ea5e9', '#1e3a8a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.safeArea, 
          { 
            paddingTop: safeAreaInsets.top,
            paddingLeft: safeAreaInsets.left,
            paddingRight: safeAreaInsets.right,
          }
        ]}>
        {/* Header matching Wireframe 1 */}
        <View style={[styles.headerRow, { backgroundColor: 'transparent', borderBottomColor: 'rgba(255,255,255,0.2)' }]}>
          <Pressable style={styles.iconButton} accessibilityLabel="Back">
            <Ionicons
              color="#FFFFFF"
              name="chevron-back"
              size={24}
            />
          </Pressable>

          <ThemedText type="subtitle" style={[styles.headerTitle, { color: '#FFFFFF' }]}>
            Notifications
          </ThemedText>

          <Pressable
            style={styles.iconButton}
            onPress={() => setActiveFilter(activeFilter === 'all' ? 'unread' : 'all')}
            accessibilityLabel="Filter notifications">
            <Ionicons
              color={activeFilter === 'unread' ? '#58a6ff' : '#FFFFFF'}
              name="options-outline"
              size={24}
            />
          </Pressable>
        </View>

        <View style={{ flex: 1, backgroundColor: theme.background }}>
        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable
            style={[styles.tab, activeFilter === 'all' && styles.activeTab]}
            onPress={() => setActiveFilter('all')}>
            <Text style={[styles.tabText, activeFilter === 'all' && styles.activeTabText]}>All</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>7</Text>
            </View>
          </Pressable>
          
          <Pressable
            style={[styles.tab, activeFilter === 'unread' && styles.activeTab]}
            onPress={() => setActiveFilter('unread')}>
            <Text style={[styles.tabText, activeFilter === 'unread' && styles.activeTabText]}>Unread</Text>
          </Pressable>

          <Pressable
            style={[styles.tab, activeFilter === 'system' && styles.activeTab]}
            onPress={() => setActiveFilter('system')}>
            <Text style={[styles.tabText, activeFilter === 'system' && styles.activeTabText]}>System</Text>
          </Pressable>
        </View>

        {/* Notification List Container */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom },
          ]}
          showsVerticalScrollIndicator={false}>
          {filteredNotifications.map((item) => (
            <Swipeable
              key={item.id}
              ref={(ref) => {
                if (ref) swipeableRefs[item.id] = ref;
              }}
              renderLeftActions={() => renderLeftActions(item)}
              renderRightActions={() => renderRightActions(item.id)}
              overshootRight={false}
              overshootLeft={false}
              onSwipeableOpen={(direction) => {
                if (direction === 'right') {
                  setNotificationToDelete(item.id);
                } else if (direction === 'left') {
                  handleToggleRead(item);
                }
              }}>
              <Pressable
                style={({ pressed }) => [
                  styles.notificationRow,
                  { borderBottomColor: theme.backgroundElement, backgroundColor: theme.background },
                  pressed && styles.rowPressed,
                ]}
                onPress={() => {
                  setSelectedNotification(item);
                  if (!item.read) {
                    toggleReadStatus(item.id);
                  }
                }}>
                {/* 24x24 Bell Icon Box (Wireframe 1) */}
                <View style={styles.iconBox}>
                  <Ionicons
                    color="#1e3a8a"
                    name="notifications-outline"
                    size={24}
                  />
                </View>

                {/* Title & Message */}
                <View style={styles.textContainer}>
                  <ThemedText
                    type="default"
                    style={[
                      styles.titleText,
                      activeFilter === 'unread' || !item.read
                        ? styles.unreadTitleText
                        : styles.readTitleText
                    ]}
                    numberOfLines={2}>
                    {item.title}
                  </ThemedText>
                </View>

                {/* Timestamp */}
                <Text style={styles.timeText}>{item.time}</Text>
              </Pressable>
            </Swipeable>
          ))}

          {filteredNotifications.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText type="small" themeColor="textSecondary">
                No unread notifications
              </ThemedText>
            </View>
          )}
        </ScrollView>
        </View>
      </LinearGradient>

      {/* Details Bottom Sheet */}
      <BottomSheet
        visible={!!selectedNotification}
        onClose={() => setSelectedNotification(null)}
        title="Notification Details"
        backgroundColor="#e6f0fa">
        {selectedNotification && (
          <View style={styles.sheetContent}>
            <View style={styles.sheetIconRow}>
              <View style={styles.iconBox}>
                <Ionicons color="#1e3a8a" name="notifications-outline" size={28} />
              </View>
              <View style={styles.sheetHeaderInfo}>
                <ThemedText type="subtitle" style={styles.sheetTitle}>
                  {selectedNotification.title}
                </ThemedText>
                <Text style={styles.sheetTimeText}>{selectedNotification.time}</Text>
              </View>
            </View>
            
            <View style={styles.sheetDetails}>
              <ThemedText type="default" themeColor="textSecondary">
                This is a detailed view of your {selectedNotification.type} notification. 
                In a full implementation, action buttons (like "View Match", "Pay Now", etc.) would appear here based on the notification type.
              </ThemedText>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Delete Confirmation Bottom Sheet */}
      <BottomSheet
        visible={!!notificationToDelete}
        onClose={cancelDelete}>
        <View style={styles.sheetContent}>
          <View style={styles.warningContent}>
            <View style={[styles.iconBox, { backgroundColor: 'rgba(248, 81, 73, 0.1)', borderColor: 'rgba(248, 81, 73, 0.2)', marginBottom: Spacing.three, width: 64, height: 64, borderRadius: 32 }]}>
              <Ionicons color="#f85149" name="warning-outline" size={32} />
            </View>
            <ThemedText type="subtitle" style={[styles.sheetTitle, { textAlign: 'center' }]}>
              Are you sure?
            </ThemedText>
            <Text style={[styles.sheetTimeText, { textAlign: 'center', marginBottom: Spacing.two }]}>This action cannot be undone.</Text>
          </View>
          
          <View style={styles.confirmationActions}>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: '#F0F0F3' }]} 
              onPress={cancelDelete}>
              <ThemedText type="default" style={{ fontWeight: '600' }}>Cancel</ThemedText>
            </Pressable>
            <Pressable 
              style={[styles.actionButton, { backgroundColor: '#f85149' }]} 
              onPress={confirmDelete}>
              <ThemedText type="default" style={{ color: '#FFFFFF', fontWeight: '600' }}>Delete</ThemedText>
            </Pressable>
          </View>
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.one,
  },
  notificationRow: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    gap: Spacing.three,
  },
  rowPressed: {
    opacity: 0.7,
  },
  readAction: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  deleteAction: {
    backgroundColor: '#f85149',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
  },
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#e6f0fa',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(30, 58, 138, 0.15)',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  unreadTitleText: {
    fontWeight: '500',
  },
  readTitleText: {
    color: '#8b949e',
    fontWeight: '400',
  },
  timeText: {
    fontSize: 13,
    color: '#8b949e',
    marginLeft: Spacing.two,
  },
  emptyContainer: {
    padding: Spacing.six,
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#e6f0fa',
    marginHorizontal: Spacing.four,
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
    padding: 4,
    borderRadius: 10,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    color: '#8b949e',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sheetContent: {
    paddingVertical: Spacing.two,
  },
  sheetIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
    gap: Spacing.three,
  },
  sheetHeaderInfo: {
    flex: 1,
  },
  sheetTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  sheetTimeText: {
    fontSize: 14,
    color: '#8b949e',
  },
  sheetDetails: {
    backgroundColor: '#FFFFFF',
    padding: Spacing.four,
    borderRadius: 12,
  },
  warningContent: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  confirmationActions: {
    flexDirection: 'row', 
    gap: Spacing.three, 
    marginTop: Spacing.two,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
