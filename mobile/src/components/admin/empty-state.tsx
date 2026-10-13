import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/app-text';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Button } from './button';
import { Radius } from './tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';

interface EmptyStateProps {
  title: string;
  message?: string;
  /** Rendered above the title — typically a lucide icon. */
  icon?: React.ReactNode;
  /** Shows a retry button. Use for error states so a failure is recoverable. */
  onRetry?: () => void;
  retryLabel?: string;
  /**
   * Sits the placeholder in a bordered card, like the list items it stands in
   * for, with the icon in a circle. Themed, so it holds up in dark mode.
   */
  card?: boolean;
}

/**
 * Shared empty/error placeholder for the admin lists.
 *
 * Passing `onRetry` turns it into an error state — important because a failed
 * fetch must be distinguishable from a genuinely empty list.
 */
export function EmptyState({
  title,
  message,
  icon,
  onRetry,
  retryLabel = 'Try again',
  card = false,
}: EmptyStateProps) {
  const c = useAdminTheme();

  return (
    <View
      style={[
        styles.container,
        card && [styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }],
      ]}
    >
      {icon && (
        <View
          style={[
            styles.icon,
            card && [styles.iconCircle, { backgroundColor: c.surface, borderColor: c.border }],
          ]}
        >
          {icon}
        </View>
      )}
      <Text style={[styles.title, card && { color: c.text }]}>{title}</Text>
      {message && (
        <Text style={[styles.message, card && { color: c.textSecondary }]}>{message}</Text>
      )}
      {onRetry && (
        <Button
          label={retryLabel}
          variant="secondary"
          onPress={onRetry}
          style={styles.retry}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  card: {
    borderRadius: Radius.card,
    borderWidth: 1,
    paddingVertical: 40,
  },
  icon: {
    marginBottom: 12,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Palette.ink,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  retry: {
    marginTop: 20,
    paddingHorizontal: 28,
  },
});
