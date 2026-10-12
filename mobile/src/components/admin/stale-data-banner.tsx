import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle } from 'lucide-react-native';
import { FunctionalColors } from '@/constants/theme';
import { Radius } from './tokens';

interface StaleDataBannerProps {
  error: string;
}

/**
 * Shown above a list when a refresh failed but an earlier load succeeded, so
 * the admin knows the rows on screen may be out of date.
 */
export function StaleDataBanner({ error }: StaleDataBannerProps) {
  return (
    <View style={styles.banner}>
      <AlertCircle size={16} color={FunctionalColors.dangerText} />
      <Text style={styles.text}>Showing older data — {error}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: Radius.md,
    marginBottom: 12,
    backgroundColor: FunctionalColors.dangerBg,
  },
  text: {
    flex: 1,
    fontSize: 13,
    color: FunctionalColors.dangerText,
  },
});
