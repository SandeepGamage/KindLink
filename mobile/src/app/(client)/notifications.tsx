import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
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
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread'>('all');

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

  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'unread') return !item.read;
    return true;
  });

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header matching Wireframe 1 */}
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} accessibilityLabel="Back">
            <SymbolView
              tintColor={theme.text}
              name="chevron.left"
              size={20}
            />
          </Pressable>

          <ThemedText type="subtitle" style={styles.headerTitle}>
            Notifications
          </ThemedText>

          <Pressable
            style={styles.iconButton}
            onPress={() => setActiveFilter(activeFilter === 'all' ? 'unread' : 'all')}
            accessibilityLabel="Filter notifications">
            <SymbolView
              tintColor={activeFilter === 'unread' ? '#0066CC' : theme.text}
              name="slider.horizontal.3"
              size={20}
            />
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
            <Pressable
              key={item.id}
              style={({ pressed }) => [
                styles.notificationRow,
                { borderBottomColor: theme.backgroundElement },
                pressed && styles.rowPressed,
              ]}
              onPress={() => toggleReadStatus(item.id)}>
              {/* 24x24 Bell Icon Box (Wireframe 1) */}
              <View style={styles.iconBox}>
                <SymbolView
                  tintColor="#333333"
                  name="bell"
                  size={24}
                />
              </View>

              {/* Title & Message */}
              <View style={styles.textContainer}>
                <ThemedText
                  type="default"
                  style={[styles.titleText, !item.read && styles.unreadTitleText]}
                  numberOfLines={2}>
                  {item.title}
                </ThemedText>
              </View>

              {/* Timestamp */}
              <Text style={styles.timeText}>{item.time}</Text>
            </Pressable>
          ))}

          {filteredNotifications.length === 0 && (
            <View style={styles.emptyContainer}>
              <ThemedText type="small" themeColor="textSecondary">
                No unread notifications
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
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
    borderBottomColor: '#E0E0E0',
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
  iconBox: {
    width: 44,
    height: 44,
    backgroundColor: '#EAEAEA',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleText: {
    fontSize: 15,
    lineHeight: 20,
  },
  unreadTitleText: {
    fontWeight: '700',
  },
  timeText: {
    fontSize: 13,
    color: '#777777',
    marginLeft: Spacing.two,
  },
  emptyContainer: {
    padding: Spacing.six,
    alignItems: 'center',
  },
});
