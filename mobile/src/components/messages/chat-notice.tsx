import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { ClientFontSize } from '@/constants/theme';

interface ChatNoticeProps {
  icon: LucideIcon;
  title: string;
  message?: string;
  backgroundColor: string;
  textColor: string;
  bottomInset?: number;
}

/** A full-width strip in the chat room: "chat closed", "reconnecting", etc. */
export function ChatNotice({ icon: Icon, title, message, backgroundColor, textColor, bottomInset = 0 }: ChatNoticeProps) {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor, paddingBottom: 12 + bottomInset }]}>
      <Icon size={22} color={textColor} />
      <View style={styles.text}>
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        {!!message && <Text style={[styles.message, { color: textColor }]}>{message}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  text: {
    flex: 1,
  },
  title: {
    fontSize: ClientFontSize.body,
    fontWeight: '700',
  },
  message: {
    fontSize: ClientFontSize.caption,
    lineHeight: 18,
    marginTop: 2,
  },
});
