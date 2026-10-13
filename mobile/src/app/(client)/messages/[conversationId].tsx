import React, { useCallback, useMemo } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  View,
} from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { type Href, useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Lock, MessageCircle, WifiOff } from 'lucide-react-native';
import { EmptyState } from '@/components/admin/empty-state';
import { Avatar } from '@/components/ui/avatar';
import { ClientScreenShell, HeaderIconButton } from '@/components/ui/client-screen-shell';
import { ChatNotice } from '@/components/messages/chat-notice';
import { CHAT_COLORS as colors, roleLabel } from '@/components/messages/chat-theme';
import { MessageBubble } from '@/components/messages/message-bubble';
import { MessageComposer } from '@/components/messages/message-composer';
import { MaxContentWidth, Palette, ClientFontSize } from '@/constants/theme';
import { useAuth } from '@/context/auth-context';
import { useChat } from '@/hooks/use-chat';
import { useKeyboardHeight } from '@/hooks/use-keyboard-height';
import type { DisplayMessage } from '@/types/message';
import { isSameDay } from '@/utils/chat-time';

/** Space between the composer and the open keyboard. */
const KEYBOARD_GAP = 36;

export default function ChatRoomScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const keyboardHeight = useKeyboardHeight();
  // The open keyboard covers the home indicator / nav bar area, so the
  // composer swaps the bottom inset for a fixed gap above the keyboard.
  const bottomInset = keyboardHeight > 0 ? KEYBOARD_GAP : insets.bottom;
  const router = useRouter();
  const isFocused = useIsFocused();
  const { user } = useAuth();
  const myId = user?._id || user?.id || '';

  const chat = useChat(String(conversationId), myId, isFocused);
  const otherUser = chat.detail?.otherUser;

  // The list is inverted so it opens at, and stays pinned to, the newest message.
  const newestFirst = useMemo(() => [...chat.messages].reverse(), [chat.messages]);

  const goBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(client)/messages' as Href);
  };

  const { retry, discard } = chat;
  const handleFailedPress = useCallback(
    (message: DisplayMessage) => {
      if (!message.clientId) return;
      const clientId = message.clientId;
      Alert.alert('Message not sent', 'Would you like to try sending it again?', [
        { text: 'Delete', style: 'destructive', onPress: () => discard(clientId) },
        { text: 'Cancel', style: 'cancel' },
        { text: 'Try again', onPress: () => retry(clientId) },
      ]);
    },
    [retry, discard]
  );

  const renderItem = useCallback(
    ({ item, index }: { item: DisplayMessage; index: number }) => {
      const older = newestFirst[index + 1];
      return (
        <MessageBubble
          message={item}
          isMine={item.sender === myId}
          colors={colors}
          showDayLabel={!older || !isSameDay(older.createdAt, item.createdAt)}
          onFailedPress={handleFailedPress}
        />
      );
    },
    [newestFirst, myId, handleFailedPress]
  );

  const renderBody = () => {
    if (chat.loading && !chat.detail) {
      return (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }

    if (chat.error && !chat.detail) {
      return (
        <View style={styles.centered}>
          <EmptyState
            icon={<WifiOff size={40} color={colors.textSecondary} />}
            title="Could not open this chat"
            message={chat.error}
            onRetry={chat.reload}
          />
        </View>
      );
    }

    // Rendered outside the inverted list: each platform inverts lists with a
    // different transform, so an empty component inside would show mirrored.
    if (newestFirst.length === 0) {
      return (
        <View style={styles.centered}>
          <EmptyState
            icon={<MessageCircle size={40} color={colors.primary} />}
            title={chat.isActive ? 'Start the conversation' : 'No messages'}
            message={
              chat.isActive
                ? `Say hello to ${otherUser?.name ?? 'your connection'}. Messages you send will appear here.`
                : undefined
            }
          />
        </View>
      );
    }

    return (
      <FlatList
        data={newestFirst}
        inverted
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        onEndReached={chat.loadOlder}
        onEndReachedThreshold={0.3}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        contentContainerStyle={styles.listContent}
        ListFooterComponent={
          chat.loadingOlder ? <ActivityIndicator style={styles.olderSpinner} color={colors.primary} /> : null
        }
      />
    );
  };

  return (
    <ClientScreenShell
      left={
        <HeaderIconButton onPress={goBack} accessibilityLabel="Back to messages">
          <ChevronLeft color={Palette.primary} size={24} />
        </HeaderIconButton>
      }
      headerContent={
        otherUser && (
          <View style={styles.headerContact}>
            <Avatar name={otherUser.name} uri={otherUser.profileImage} size={40} dimmed={!chat.isActive} />
            <View style={styles.headerText}>
              <Text numberOfLines={1} accessibilityRole="header" style={styles.headerName}>
                {otherUser.name}
              </Text>
              <Text numberOfLines={1} style={styles.headerMeta}>
                {roleLabel(otherUser.role)}
                {chat.detail?.connection?.title ? ` · ${chat.detail.connection.title}` : ''}
              </Text>
            </View>
          </View>
        )
      }>
      {chat.offline && (
        <ChatNotice
          icon={WifiOff}
          title="Reconnecting…"
          message="New messages will appear when your connection is back."
          backgroundColor={colors.warningBg}
          textColor={colors.warningText}
        />
      )}

      {/* The shell reaches the bottom of the screen, so padding by the keyboard
          height lifts the composer above it. Android runs edge-to-edge and no
          longer resizes the window for the keyboard. */}
      <View style={[styles.body, { paddingBottom: keyboardHeight }]}>
        <View style={styles.content}>{renderBody()}</View>

        {chat.detail &&
          (chat.isActive ? (
            <MessageComposer colors={colors} onSend={chat.send} bottomInset={bottomInset} />
          ) : (
            <ChatNotice
              icon={Lock}
              title="This chat is closed"
              message="The connection is no longer active, so new messages can't be sent. You can still read earlier messages."
              backgroundColor={colors.lockedBg}
              textColor={colors.text}
              bottomInset={bottomInset}
            />
          ))}
      </View>
    </ClientScreenShell>
  );
}

const styles = StyleSheet.create({
  headerContact: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingLeft: 8,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    color: Palette.primary,
    fontSize: ClientFontSize.section,
    fontWeight: '600',
  },
  headerMeta: {
    color: Palette.blueTint,
    fontSize: ClientFontSize.caption,
    fontWeight: '500',
    marginTop: 1,
  },
  body: {
    flex: 1,
  },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  olderSpinner: {
    marginVertical: 16,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
