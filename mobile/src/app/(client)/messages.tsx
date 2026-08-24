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
import { OnboardingColors, MaxContentWidth } from '@/constants/theme';

export default function ClientMessagesScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const conversations = [
    {
      id: 'chat-1',
      name: 'Alex Fernando',
      role: 'Volunteer',
      lastMessage: "I'm on my way with your groceries! Should be there in 15 mins.",
      time: '12:45 PM',
      unreadCount: 2,
      online: true,
      avatarColor: '#1D61E7',
    },
    {
      id: 'chat-2',
      name: 'Sarah Jenkins',
      role: 'Volunteer',
      lastMessage: 'Glad I could help with the WhatsApp setup! Let me know anytime.',
      time: 'Yesterday',
      unreadCount: 0,
      online: false,
      avatarColor: '#10B981',
    },
    {
      id: 'chat-3',
      name: 'KindLink Care Coordinator',
      role: 'Support',
      lastMessage: 'Your upcoming health checkup ride has been confirmed.',
      time: 'Aug 21',
      unreadCount: 0,
      online: true,
      avatarColor: '#8B5CF6',
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#090D16' : '#F0F6FE',
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text
            style={[
              styles.pageTitle,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}>
            Messages
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            Direct communication with your volunteers & coordinators
          </Text>
        </View>

        {/* Conversation List */}
        <View style={styles.chatList}>
          {conversations.map((chat) => (
            <Pressable
              key={chat.id}
              style={({ pressed }) => [
                styles.chatCard,
                {
                  backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  opacity: pressed ? 0.9 : 1,
                },
              ]}>
              {/* Avatar with Online indicator */}
              <View style={styles.avatarWrapper}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: chat.avatarColor },
                  ]}>
                  <Text style={styles.avatarInitial}>
                    {chat.name.charAt(0)}
                  </Text>
                </View>
                {chat.online && <View style={styles.onlineDot} />}
              </View>

              {/* Message Details */}
              <View style={styles.chatContent}>
                <View style={styles.chatHeaderRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.chatName,
                      { color: isDark ? '#FFFFFF' : '#0F172A' },
                    ]}>
                    {chat.name}
                  </Text>
                  <Text
                    style={[
                      styles.chatTime,
                      { color: isDark ? '#64748B' : '#94A3B8' },
                    ]}>
                    {chat.time}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.roleTag,
                    { color: isDark ? '#93C5FD' : '#2563EB' },
                  ]}>
                  {chat.role}
                </Text>

                <View style={styles.lastMessageRow}>
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.lastMessage,
                      {
                        color: chat.unreadCount > 0
                          ? isDark ? '#FFFFFF' : '#0F172A'
                          : isDark ? '#94A3B8' : '#64748B',
                        fontWeight: chat.unreadCount > 0 ? '700' : '400',
                      },
                    ]}>
                    {chat.lastMessage}
                  </Text>

                  {chat.unreadCount > 0 && (
                    <View style={styles.unreadPill}>
                      <Text style={styles.unreadText}>
                        {chat.unreadCount}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </Pressable>
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
  header: {
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
  chatList: {
    gap: 12,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatContent: {
    flex: 1,
  },
  chatHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chatName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
  chatTime: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 8,
  },
  roleTag: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  lastMessageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  lastMessage: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  unreadPill: {
    backgroundColor: OnboardingColors.primary,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
});
