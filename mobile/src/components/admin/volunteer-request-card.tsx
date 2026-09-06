import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Avatar } from './avatar';
import { Button } from './button';
import { StatusBadge } from './status-badge';
import { AvailabilityChips } from './availability-chips';
import { Radius } from './tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { formatRelativeTime } from '@/utils/admin-time';
import type { VolunteerApplication } from '@/types/volunteer-application';

interface VolunteerRequestCardProps {
  application: VolunteerApplication;
  onApprove: () => void;
  onReject: () => void;
  onSeeMore: () => void;
}

/**
 * One volunteer's pending verification request. Summary only — contact details
 * and the ID document live in `VolunteerDetailsSheet`.
 */
export function VolunteerRequestCard({
  application,
  onApprove,
  onReject,
  onSeeMore,
}: VolunteerRequestCardProps) {
  const c = useAdminTheme();
  const isPending = application.status === 'Pending';

  return (
    <View style={[styles.container, { backgroundColor: c.card, borderColor: c.cardBorder }]}>
      {/* Identity */}
      <View style={styles.header}>
        <Avatar name={application.name} uri={application.profileImage} size={46} />

        <View style={styles.headerText}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {application.name}
          </Text>
          <Text style={[styles.appliedAt, { color: c.textSecondary }]}>
            Applied {formatRelativeTime(application.appliedAt)}
          </Text>
        </View>

        {!isPending && (
          <StatusBadge
            label={application.status}
            tone={application.status === 'Approved' ? 'success' : 'danger'}
          />
        )}
      </View>

      {/* Helper availability */}
      <View style={styles.availabilityBlock}>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Availability</Text>
        <AvailabilityChips slots={application.availability} variant="compact" />
      </View>

      <View style={[styles.divider, { backgroundColor: c.divider }]} />

      {/* Actions */}
      {isPending && (
        <View style={styles.actionsRow}>
          <Button
            label="Reject"
            variant="danger"
            onPress={onReject}
            accessibilityLabel={`Reject ${application.name}`}
            style={styles.actionButton}
          />
          <Button
            label="Approve"
            onPress={onApprove}
            accessibilityLabel={`Approve ${application.name}`}
            style={styles.actionButton}
          />
        </View>
      )}

      <Button
        label="See More Details"
        variant="ghost"
        fullWidth
        onPress={onSeeMore}
        accessibilityLabel={`See more details for ${application.name}`}
        style={isPending && styles.seeMoreSpacing}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: Radius.card,
    borderWidth: 1,
    marginBottom: 16,
    shadowColor: '#17242E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  appliedAt: {
    fontSize: 12,
    marginTop: 2,
  },
  availabilityBlock: {
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  divider: {
    height: 1,
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  seeMoreSpacing: {
    marginTop: 8,
  },
});
