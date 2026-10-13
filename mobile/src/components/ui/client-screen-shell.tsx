import React from 'react';
import { Pressable, StyleSheet, View, useColorScheme } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, ClientFontSize } from '@/constants/theme';

interface ClientScreenShellProps {
  /** Centred white title. Ignored when `headerContent` is given. */
  title?: string;
  /** Replaces the centred title, e.g. an avatar and name in a chat room. */
  headerContent?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Client screen frame: a brand-blue header bar over a rounded surface sheet
 * (the Alerts/Messages design). Applies the top inset itself, per AGENTS.md.
 */
export function ClientScreenShell({ title, headerContent, left, right, children }: ClientScreenShellProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        {/* Fixed-width sides keep the title centred whichever actions are present. */}
        <View style={styles.side}>{left}</View>
        {headerContent ? (
          <View style={styles.headerContent}>{headerContent}</View>
        ) : (
          <Text accessibilityRole="header" numberOfLines={1} style={styles.headerTitle}>
            {title}
          </Text>
        )}
        <View style={[styles.side, styles.sideRight]}>{right}</View>
      </View>

      <View style={[styles.sheetBackground, isDark && { backgroundColor: '#0D151D' }]}>
        <View style={[styles.sheet, isDark && { backgroundColor: '#0D151D' }]}>{children}</View>
      </View>
    </View>
  );
}

interface HeaderIconButtonProps {
  onPress: () => void;
  accessibilityLabel: string;
  children: React.ReactNode;
}

/** Icon button sized for the ClientScreenShell header. */
export function HeaderIconButton({ onPress, accessibilityLabel, children }: HeaderIconButtonProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.iconButton, pressed && styles.pressed]}
      onPress={onPress}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}>
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.secondary,
  },
  header: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  side: {
    minWidth: 32,
  },
  sideRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: Palette.primary,
    fontSize: ClientFontSize.title,
    fontWeight: '600',
  },
  headerContent: {
    flex: 1,
  },
  iconButton: {
    padding: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  sheetBackground: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  sheet: {
    flex: 1,
    backgroundColor: Palette.surface,
    paddingTop: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
});
