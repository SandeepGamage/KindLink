import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Button } from './button';

interface EmptyStateProps {
  title: string;
  message?: string;
  /** Rendered above the title — typically a lucide icon. */
  icon?: React.ReactNode;
  /** Shows a retry button. Use for error states so a failure is recoverable. */
  onRetry?: () => void;
  retryLabel?: string;
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
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      {icon && <View style={styles.icon}>{icon}</View>}
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.message}>{message}</Text>}
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
  icon: {
    marginBottom: 12,
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
