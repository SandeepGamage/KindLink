import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { Send } from 'lucide-react-native';
import { Palette, ClientFontSize } from '@/constants/theme';
import type { ChatColors } from './chat-theme';

/** Matches Message.MAX_LENGTH on the backend. */
const MAX_LENGTH = 2000;

interface MessageComposerProps {
  colors: ChatColors;
  onSend: (text: string) => void;
  bottomInset: number;
}

export function MessageComposer({ colors, onSend, bottomInset }: MessageComposerProps) {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const handleSend = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Math.max(bottomInset, 12) },
      ]}>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Type a message…"
        placeholderTextColor={colors.textSecondary}
        multiline
        maxLength={MAX_LENGTH}
        accessibilityLabel="Message"
        style={[
          styles.input,
          { color: colors.text, backgroundColor: colors.background, borderColor: colors.border },
        ]}
      />
      <Pressable
        onPress={handleSend}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send message"
        accessibilityState={{ disabled: !canSend }}
        hitSlop={6}
        style={({ pressed }) => [
          styles.sendButton,
          { backgroundColor: canSend ? colors.bubbleMine : colors.border },
          pressed && canSend && styles.pressed,
        ]}>
        <Send size={24} color={canSend ? Palette.primary : colors.textSecondary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    minHeight: 52,
    maxHeight: 140,
    borderWidth: 1,
    borderRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 18,
    lineHeight: 24,
  },
  sendButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
