import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';

export default function ClientNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const notifications = [
    {
      id: 'notif-1',
      title: 'Volunteer Match Found',
      message: 'Alex Fernando has accepted your grocery shopping request.',
      time: '15 mins ago',
      type: 'match',
      unread: true,
      icon: '🤝',
    },
    {
      id: 'notif-2',
      title: 'Safety Check Reminder',
      message: 'Please confirm your upcoming scheduled check-in for tomorrow.',
      time: '2 hours ago',
      type: 'reminder',
      unread: true,
      icon: '⏰',
    },
    {
      id: 'notif-3',
      title: 'Profile Verified',
      message: 'Your KindLink ID verification has been successfully approved.',
      time: 'Yesterday',
      type: 'system',
      unread: false,
      icon: '🛡️',
    },
    {
      id: 'notif-4',
      title: 'Welcome to KindLink',
      message: 'Thank you for joining our community! Explore tasks and connect anytime.',
      time: '3 days ago',
      type: 'welcome',
      unread: false,
      icon: '🎉',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <View>
            <Text
              style={[
                styles.pageTitle,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              Notifications
            </Text>
            <Text
              style={[
                styles.pageSubtitle,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              Stay updated on your requests and messages
            </Text>
          </View>

          <Pressable>
            <Text style={[styles.markReadText, { color: Palette.secondary }]}>
              Mark all read
            </Text>
          </Pressable>
        </View>

        <View style={styles.list}>
          {notifications.map((n) => (
            <View
              key={n.id}
              style={[
                styles.notifCard,
                {
                  backgroundColor: isDark ? Palette.ink : Palette.primary,
                  borderColor: n.unread
                    ? Palette.accent
                    : isDark ? '#23384B' : Palette.border,
                  borderLeftWidth: n.unread ? 4 : 1,
                },
              ]}>
              <Text style={styles.notifIcon}>{n.icon}</Text>
              <View style={styles.notifBody}>
                <View style={styles.notifTop}>
                  <Text
                    style={[
                      styles.notifTitle,
                      { color: isDark ? Palette.primary : Palette.ink },
                    ]}>
                    {n.title}
                  </Text>
                  <Text
                    style={[
                      styles.notifTime,
                      { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                    ]}>
                    {n.time}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.notifMessage,
                    { color: isDark ? '#CBD5E1' : FunctionalColors.textSecondary },
                  ]}>
                  {n.message}
                </Text>
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
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  markReadText: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  list: {
    gap: 12,
  },
  notifCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    alignItems: 'flex-start',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  notifIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  notifBody: {
    flex: 1,
  },
  notifTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notifTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  notifTime: {
    fontSize: 11,
    fontWeight: '500',
  },
  notifMessage: {
    fontSize: 13,
    lineHeight: 18,
  },
});

