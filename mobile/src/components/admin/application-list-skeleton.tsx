import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton } from './skeleton';
import { Radius } from './tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';

interface ApplicationListSkeletonProps {
  /** Adds the availability-chip row that the Volunteer Requests cards show. */
  withChips?: boolean;
  rows?: number;
}

/**
 * First-load placeholder for the approvals lists. It uses the same card
 * outline as the real rows, so nothing shifts when the data arrives.
 */
export function ApplicationListSkeleton({ withChips = false, rows = 4 }: ApplicationListSkeletonProps) {
  const c = useAdminTheme();

  return (
    <View accessibilityLabel="Loading applications" accessibilityRole="progressbar">
      {Array.from({ length: rows }, (_, i) => (
        <View
          key={i}
          style={[styles.card, { backgroundColor: c.card, borderColor: c.cardBorder }]}
        >
          <View style={styles.header}>
            <Skeleton width={46} height={46} radius={Radius.pill} />
            <View style={styles.text}>
              <Skeleton width="55%" height={14} />
              <Skeleton width="35%" height={12} />
            </View>
            <Skeleton width={64} height={20} radius={Radius.pill} />
          </View>
          {withChips && (
            <View style={styles.chips}>
              <Skeleton width={72} height={24} radius={Radius.pill} />
              <Skeleton width={72} height={24} radius={Radius.pill} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: Radius.card,
    borderWidth: 1,
    marginBottom: 12,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  text: {
    flex: 1,
    gap: 8,
  },
  chips: {
    flexDirection: 'row',
    gap: 8,
  },
});
