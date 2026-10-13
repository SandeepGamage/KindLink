import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { Lock } from 'lucide-react-native';
import { Avatar } from '@/components/ui/avatar';
import { FunctionalColors, Palette, ClientFontSize } from '@/constants/theme';
import type { ConversationSummary } from '@/types/message';
import { formatChatListTime } from '@/utils/chat-time';
import { roleLabel } from './chat-theme';

interface ConversationRowProps {
  conversation: ConversationSummary;
  onPress: () => void;
}

/** One inbox entry, as its own card in the Alerts style. */
export function ConversationRow({ conversation, onPress }: ConversationRowProps) {
  const { otherUser, unreadCount, isActive, lastMessageSnippet, lastMessageFromMe } = conversation;
  const hasUnread = unreadCount > 0;
  const snippet = lastMessageSnippet
    ? `${lastMessageFromMe ? 'You: ' : ''}${lastMessageSnippet}`
    : 'No messages yet. Say hello!';
  const subtitle = [roleLabel(otherUser.role), conversation.connection?.title].filter(Boolean).join(' · ');

  const a11y = [
    `Chat with ${otherUser.name}, ${roleLabel(otherUser.role)}`,
    hasUnread ? `${unreadCount} unread ${unreadCount === 1 ? 'message' : 'messages'}` : null,
    lastMessageSnippet ? `Last message: ${snippet}` : null,
    !isActive ? 'Chat closed' : null,
  ]
    .filter(Boolean)
    .join('. ');

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={a11y}
      accessibilityHint="Opens the conversation"
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.avatarWrapper}>
        <Avatar name={otherUser.name} uri={otherUser.profileImage} size={44} dimmed={!isActive} />
        {hasUnread && <View style={styles.unreadDot} />}
      </View>

      <View style={styles.textContainer}>
        <Text numberOfLines={1} style={[styles.name, hasUnread ? styles.nameUnread : styles.nameRead]}>
          {otherUser.name}
        </Text>
        <View style={styles.subtitleRow}>
          <Text numberOfLines={1} style={styles.subtitle}>
            {subtitle}
          </Text>
          {!isActive && (
            <View style={styles.closedChip}>
              <Lock size={10} color={FunctionalColors.textMuted} />
              <Text style={styles.closedText}>Closed</Text>
            </View>
          )}
        </View>
        <Text
          numberOfLines={1}
          style={[
            styles.snippet,
            hasUnread ? styles.snippetUnread : styles.snippetRead,
            !lastMessageSnippet && styles.snippetEmpty,
          ]}>
          {snippet}
        </Text>
      </View>

      <View style={styles.trailing}>
        <Text style={styles.time}>{formatChatListTime(conversation.lastMessageAt)}</Text>
        {hasUnread && (
          <View style={styles.unreadPill}>
            <Text style={styles.unreadPillText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Palette.primary,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  pressed: {
    backgroundColor: Palette.surface,
  },
  avatarWrapper: {
    marginRight: 12,
  },
  unreadDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Palette.primary,
    backgroundColor: Palette.secondary,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 15,
    lineHeight: 20,
  },
  nameRead: {
    color: Palette.ink,
    fontWeight: '500',
  },
  nameUnread: {
    color: Palette.ink,
    fontWeight: '700',
  },
  subtitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  subtitle: {
    flexShrink: 1,
    fontSize: ClientFontSize.meta,
    fontWeight: '600',
    color: Palette.secondary,
  },
  closedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: Palette.surface,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  closedText: {
    fontSize: ClientFontSize.meta,
    fontWeight: '600',
    color: FunctionalColors.textMuted,
  },
  snippet: {
    fontSize: ClientFontSize.caption,
    lineHeight: 16,
    marginTop: 4,
  },
  snippetRead: {
    color: FunctionalColors.textMuted,
    fontWeight: '400',
  },
  snippetUnread: {
    color: Palette.ink,
    fontWeight: '600',
  },
  snippetEmpty: {
    fontStyle: 'italic',
  },
  trailing: {
    alignItems: 'flex-end',
    marginLeft: 8,
    gap: 6,
  },
  time: {
    fontSize: ClientFontSize.meta,
    color: FunctionalColors.textMuted,
  },
  unreadPill: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Palette.secondary,
  },
  unreadPillText: {
    color: Palette.primary,
    fontSize: ClientFontSize.meta,
    fontWeight: '700',
  },
});
