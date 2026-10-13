import React from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import { type Href, useRouter } from 'expo-router';
import { MessageCircle, WifiOff } from 'lucide-react-native';
import { Button } from '@/components/admin/button';
import { ConversationRow } from '@/components/messages/conversation-row';
import { ClientScreenShell } from '@/components/ui/client-screen-shell';
import { FunctionalColors, Palette, ClientFontSize } from '@/constants/theme';
import { useConversations } from '@/hooks/use-conversations';

export default function MessagesInboxScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const { conversations, loading, refreshing, error, refresh, retry } = useConversations(isFocused);

  const openChat = (conversationId: string) =>
    router.push({ pathname: '/(client)/messages/[conversationId]', params: { conversationId } } as unknown as Href);

  const renderEmpty = () => {
    if (error && conversations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <WifiOff color={FunctionalColors.textMuted} size={32} />
          <Text style={styles.emptyTitle}>Could not load your messages</Text>
          <Text style={styles.emptyText}>{error}</Text>
          <Button label="Try again" variant="secondary" onPress={retry} style={styles.retryButton} />
        </View>
      );
    }
    return (
      <View style={styles.emptyContainer}>
        <MessageCircle color={Palette.secondary} size={32} />
        <Text style={styles.emptyTitle}>No active chats yet</Text>
        <Text style={styles.emptyText}>
          Once a connection request is approved, your conversations will appear here.
        </Text>
      </View>
    );
  };

  return (
    <ClientScreenShell title="Messages">
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Palette.secondary} />
        </View>
      ) : (
        <ScrollView
          style={styles.listScrollView}
          contentContainerStyle={{ paddingBottom: insets.bottom + 44 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Palette.secondary} />
          }>
          {error && conversations.length > 0 && (
            <View style={styles.staleBanner}>
              <WifiOff color={FunctionalColors.warningText} size={16} />
              <Text style={styles.staleText}>Showing saved messages. Trying to reconnect…</Text>
            </View>
          )}

          {conversations.length === 0 ? (
            <View style={styles.emptyCard}>{renderEmpty()}</View>
          ) : (
            <View style={styles.list}>
              {conversations.map((item) => (
                <ConversationRow key={item._id} conversation={item} onPress={() => openChat(item._id)} />
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </ClientScreenShell>
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
  list: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: Palette.primary,
    borderRadius: 16,
    borderColor: Palette.border,
    borderWidth: 1,
  },
  staleBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: FunctionalColors.warningBg,
  },
  staleText: {
    flex: 1,
    fontSize: ClientFontSize.caption,
    fontWeight: '600',
    color: FunctionalColors.warningText,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    marginTop: 12,
    fontSize: ClientFontSize.body,
    fontWeight: '600',
    color: Palette.ink,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 6,
    fontSize: ClientFontSize.caption,
    lineHeight: 18,
    color: FunctionalColors.textMuted,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 28,
  },
});
