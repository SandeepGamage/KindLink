import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import type { DisplayMessage } from '@/types/message';
import { formatDayLabel, formatMessageTime } from '@/utils/chat-time';
import type { ChatColors } from './chat-theme';
import { ClientFontSize } from '@/constants/theme';

interface MessageBubbleProps {
  message: DisplayMessage;
  isMine: boolean;
  colors: ChatColors;
  /** Show a day divider above this message (first message of a day). */
  showDayLabel?: boolean;
  /** Called when a failed message is tapped. */
  onFailedPress?: (message: DisplayMessage) => void;
}

export const MessageBubble = React.memo(function MessageBubble({
  message,
  isMine,
  colors,
  showDayLabel,
  onFailedPress,
}: MessageBubbleProps) {
  const failed = message.deliveryStatus === 'failed';
  const sending = message.deliveryStatus === 'sending';
  const time = formatMessageTime(message.createdAt);

  const status = failed ? 'Not sent. Tap to try again' : sending ? 'Sending…' : time;

  return (
    <View>
      {showDayLabel && (
        <View style={styles.dayRow} accessibilityRole="header">
          <Text style={[styles.dayLabel, { color: colors.textSecondary, backgroundColor: colors.lockedBg }]}>
            {formatDayLabel(message.createdAt)}
          </Text>
        </View>
      )}

      <Pressable
        disabled={!failed}
        onPress={() => onFailedPress?.(message)}
        accessibilityRole={failed ? 'button' : 'text'}
        accessibilityLabel={`${isMine ? 'You' : 'They'} said: ${message.content}. ${status}`}
        style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs]}>
        <View
          style={[
            styles.bubble,
            isMine
              ? [styles.bubbleMine, { backgroundColor: colors.bubbleMine }]
              : [styles.bubbleTheirs, { backgroundColor: colors.bubbleTheirs, borderColor: colors.border }],
            sending && styles.sending,
            failed && { borderWidth: 2, borderColor: colors.danger },
          ]}>
          <Text
            selectable
            style={[styles.content, { color: isMine ? colors.bubbleMineText : colors.bubbleTheirsText }]}>
            {message.content}
          </Text>
        </View>

        <View style={[styles.statusRow, isMine && styles.statusRowMine]}>
          {failed && <AlertCircle size={14} color={colors.danger} />}
          <Text style={[styles.status, { color: failed ? colors.danger : colors.textSecondary }]}>
            {status}
          </Text>
        </View>
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  dayRow: {
    alignItems: 'center',
    marginVertical: 12,
  },
  dayLabel: {
    fontSize: ClientFontSize.caption,
    fontWeight: '700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  row: {
    marginVertical: 4,
    maxWidth: '85%',
  },
  rowMine: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  rowTheirs: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
  },
  bubbleMine: {
    borderBottomRightRadius: 6,
  },
  bubbleTheirs: {
    borderWidth: 1,
    borderBottomLeftRadius: 6,
  },
  sending: {
    opacity: 0.7,
  },
  content: {
    fontSize: 18,
    lineHeight: 25,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
    paddingHorizontal: 6,
  },
  statusRowMine: {
    justifyContent: 'flex-end',
  },
  status: {
    fontSize: ClientFontSize.meta,
    fontWeight: '500',
  },
});
