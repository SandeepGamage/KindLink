import React, { useMemo, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, X, ArrowUpDown, History, Inbox } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ActionModal } from '@/components/ui/action-modal';
import { FilterDropdown } from '@/components/admin/filter-dropdown';
import { EmptyState } from '@/components/admin/empty-state';
import { VolunteerRequestCard } from '@/components/admin/volunteer-request-card';
import { VolunteerDetailsSheet } from '@/components/admin/volunteer-details-sheet';
import { Palette, FunctionalColors } from '@/constants/theme';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { AdminSpacing } from '@/components/admin/tokens';
import { MOCK_VOLUNTEER_APPLICATIONS } from '@/services/volunteer-application.mock';
import type {
  VolunteerApplication,
  VolunteerApplicationStatus,
} from '@/types/volunteer-application';

const STATUS_OPTIONS: VolunteerApplicationStatus[] = ['Pending', 'Approved', 'Rejected'];

export default function ApprovalsScreen() {
  const c = useAdminTheme();
  const router = useRouter();

  // TODO: mock state — swap for the volunteer applications endpoint once the
  // VolunteerApplication model and admin routes exist.
  const [applications, setApplications] = useState<VolunteerApplication[]>(
    MOCK_VOLUNTEER_APPLICATIONS
  );
  const [activeTab, setActiveTab] = useState<VolunteerApplicationStatus>('Pending');
  const [userToApprove, setUserToApprove] = useState<VolunteerApplication | null>(null);
  const [userToReject, setUserToReject] = useState<VolunteerApplication | null>(null);
  const [userToView, setUserToView] = useState<VolunteerApplication | null>(null);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);

  const visibleApplications = useMemo(
    () => applications.filter((a) => a.status === activeTab),
    [applications, activeTab]
  );
  const pendingCount = useMemo(
    () => applications.filter((a) => a.status === 'Pending').length,
    [applications]
  );

  const setStatus = (id: string, status: VolunteerApplicationStatus) =>
    setApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));

  // The sheet must finish dismissing before the confirm modal presents,
  // otherwise the second modal is swallowed on iOS. Same guard as (admin)/users.
  const openAfterSheetCloses = (open: () => void) => {
    setUserToView(null);
    setTimeout(open, 300);
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Volunteer Requests"
        subtitle={`${pendingCount} pending application${pendingCount === 1 ? '' : 's'}`}
        rightContent={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setIsSortDrawerOpen(true)}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Filter applications by status"
            >
              <ArrowUpDown size={24} color={c.text} />
            </Pressable>
            <Pressable
              onPress={() => router.push('/(admin)/approvals/history')}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="View approval history"
            >
              <History size={24} color={c.text} />
            </Pressable>
          </View>
        }
      />

      {/* List */}
      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {visibleApplications.length === 0 ? (
          <EmptyState
            icon={<Inbox size={32} color={c.textMuted} />}
            title={`No ${activeTab.toLowerCase()} applications`}
          />
        ) : (
          visibleApplications.map((application) => (
            <VolunteerRequestCard
              key={application.id}
              application={application}
              onSeeMore={() => setUserToView(application)}
            />
          ))
        )}
      </ScrollView>

      <ActionModal
        visible={!!userToApprove}
        onCancel={() => setUserToApprove(null)}
        onConfirm={() => {
          // TODO: replace with the approve API call.
          if (userToApprove) setStatus(userToApprove.id, 'Approved');
          setUserToApprove(null);
        }}
        title={`Approve ${userToApprove?.name}?`}
        subtitle={`${userToApprove?.name} will be granted active volunteer permissions.`}
        icon={<Check color={Palette.secondary} size={32} />}
        iconContainerStyle={styles.approveIconContainer}
        cancelText="Cancel"
        cancelButtonStyle={styles.cancelButton}
        cancelTextStyle={styles.cancelText}
        confirmText="Confirm Approval"
        confirmButtonStyle={styles.approveButton}
        confirmTextStyle={styles.confirmText}
      />

      <ActionModal
        visible={!!userToReject}
        onCancel={() => setUserToReject(null)}
        onConfirm={() => {
          // TODO: replace with the reject API call.
          if (userToReject) setStatus(userToReject.id, 'Rejected');
          setUserToReject(null);
        }}
        title={`Reject ${userToReject?.name}?`}
        subtitle={`${userToReject?.name}'s volunteer application will be declined.`}
        icon={<X color={FunctionalColors.danger} size={32} />}
        iconContainerStyle={styles.rejectIconContainer}
        cancelText="Cancel"
        cancelButtonStyle={styles.cancelButton}
        cancelTextStyle={styles.cancelText}
        confirmText="Reject Application"
        confirmButtonStyle={styles.rejectButton}
        confirmTextStyle={styles.confirmText}
      />

      <VolunteerDetailsSheet
        application={userToView}
        visible={!!userToView}
        onClose={() => setUserToView(null)}
        onApprove={() => openAfterSheetCloses(() => setUserToApprove(userToView))}
        onReject={() => openAfterSheetCloses(() => setUserToReject(userToView))}
      />

      {/* Status Filter Popup */}
      <FilterDropdown
        visible={isSortDrawerOpen}
        onClose={() => setIsSortDrawerOpen(false)}
        options={STATUS_OPTIONS}
        activeValue={activeTab}
        onChange={setActiveTab}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: AdminSpacing.screenEdge,
    // No paddingTop — AdminHeader already owns the 24dp gap.
    paddingTop: 0,
  },
  listContent: {
    paddingBottom: AdminSpacing.scrollBottom,
  },
  approveIconContainer: {
    backgroundColor: Palette.blueTint,
  },
  rejectIconContainer: {
    backgroundColor: FunctionalColors.dangerBg,
  },
  cancelButton: {
    backgroundColor: Palette.blueTint,
  },
  cancelText: {
    color: Palette.secondary,
  },
  approveButton: {
    backgroundColor: Palette.secondary,
  },
  rejectButton: {
    backgroundColor: FunctionalColors.danger,
  },
  confirmText: {
    color: Palette.primary,
  },
});
