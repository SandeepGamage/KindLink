import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Avatar } from './avatar';
import { StatusBadge } from './status-badge';
import { AvailabilityChips } from './availability-chips';
import { Radius } from './tokens';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { formatRelativeTime } from '@/utils/admin-time';
import type { VolunteerApplication } from '@/types/volunteer-application';

interface VolunteerRequestCardProps {
  application: VolunteerApplication;
  onSeeMore: () => void;
}

/**
 * One volunteer's pending verification request. Summary and a single way in —
 * contact details, the ID document, and the approve/reject decision itself all
 * live in `VolunteerDetailsSheet`, so nobody rules on an application without
 * having seen it.
 *
 * The whole card is the target. "More Details" in the header is the visual cue
 * for that, deliberately not a Pressable of its own — a nested touchable running
 * the same handler would only add a second, identical stop for screen readers.
 */
export function VolunteerRequestCard({
  application,
  onSeeMore,
}: VolunteerRequestCardProps) {
  const c = useAdminTheme();
  const isPending = application.status === 'Pending';

  return (
    <Pressable
      onPress={onSeeMore}
      accessibilityRole="button"
      accessibilityLabel={`See more details for ${application.name}`}
      style={({ pressed }) => [
        styles.container,
        { backgroundColor: c.card, borderColor: c.cardBorder },
        pressed && styles.pressed,
      ]}
    >
      {/* Identity */}
      <View style={styles.header}>
        <Avatar name={application.name} uri={application.profileImage} size={46} />

        <View style={styles.headerText}>
          <Text style={[styles.name, { color: c.text }]} numberOfLines={1}>
            {application.name}
          </Text>
          <Text style={[styles.appliedAt, { color: c.textSecondary }]} numberOfLines={1}>
            Applied {formatRelativeTime(application.appliedAt)}
          </Text>
        </View>

        <View style={styles.headerActions}>
          {!isPending && (
            <StatusBadge
              label={application.status}
              tone={application.status === 'Approved' ? 'success' : 'danger'}
            />
          )}
          <View style={styles.moreDetails}>
            <Text style={[styles.moreDetailsLabel, { color: c.primary }]}>More Details</Text>
            <ChevronRight size={14} color={c.primary} />
          </View>
        </View>
      </View>

      {/* Helper availability */}
      <View>
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Availability</Text>
        <AvailabilityChips slots={application.availability} variant="compact" />
      </View>
    </Pressable>
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
  pressed: {
    opacity: 0.7,
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
  // A column so the status badge, when there is one, stacks above the cue
  // rather than competing with it for the header's remaining width.
  headerActions: {
    alignItems: 'flex-end',
    gap: 6,
  },
  moreDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  moreDetailsLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
});
