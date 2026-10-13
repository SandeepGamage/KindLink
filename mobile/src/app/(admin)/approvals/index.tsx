import React, { useMemo, useRef, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, X, ArrowUpDown, History, Inbox, AlertCircle } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ActionModal } from '@/components/ui/action-modal';
import { FilterDropdown } from '@/components/admin/filter-dropdown';
import { EmptyState } from '@/components/admin/empty-state';
import { MonoIcon } from '@/components/admin/icon-circle';
import { VolunteerRequestCard } from '@/components/admin/volunteer-request-card';
import { VolunteerDetailsSheet } from '@/components/admin/volunteer-details-sheet';
import { ApplicationListSkeleton } from '@/components/admin/application-list-skeleton';
import { StaleDataBanner } from '@/components/admin/stale-data-banner';
import { Palette, FunctionalColors } from '@/constants/theme';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { useVolunteerApplications } from '@/hooks/use-volunteer-applications';
import { useAdminBadges } from '@/context/admin-badges-context';
import { AdminSpacing } from '@/components/admin/tokens';
import { volunteerApplicationService } from '@/services/volunteer-application.service';
import type {
  VolunteerApplication,
  VolunteerApplicationStatus,
} from '@/types/volunteer-application';

const STATUS_OPTIONS: VolunteerApplicationStatus[] = ['Pending', 'Approved', 'Rejected'];

export default function ApprovalsScreen() {
  const c = useAdminTheme();
  const router = useRouter();

  const { applications, loading, refreshing, error, reload, refresh } =
    useVolunteerApplications();
  const { refreshBadges } = useAdminBadges();
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

  // A ref stops a double tap on Confirm from sending the decision twice (state
  // updates too late for that); the state drives the modal's spinner.
  const isSubmitting = useRef(false);
  const [submitting, setSubmitting] = useState(false);

  const decide = async (
    application: VolunteerApplication | null,
    decision: 'approve' | 'reject',
    close: () => void
  ) => {
    if (!application || isSubmitting.current) return;
    isSubmitting.current = true;
    setSubmitting(true);
    try {
      await volunteerApplicationService[decision](application.id);
      close();
      reload(false);
      refreshBadges();
    } catch (err) {
      close();
      Alert.alert('Could not update application', (err as Error).message);
    } finally {
      isSubmitting.current = false;
      setSubmitting(false);
    }
  };

  // The sheet must finish dismissing before the confirm modal presents,
  // otherwise the second modal is swallowed on iOS. Same guard as (admin)/users.
  const afterSheetCloses = useRef<(() => void) | null>(null);
  const openAfterSheetCloses = (open: () => void) => {
    afterSheetCloses.current = open;
    setUserToView(null);
  };
  const handleSheetClosed = () => {
    const open = afterSheetCloses.current;
    afterSheetCloses.current = null;
    open?.();
  };

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Volunteer Requests"
        subtitle={
          loading
            ? 'Loading applications…'
            : `${pendingCount} pending application${pendingCount === 1 ? '' : 's'}`
        }
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
      <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={c.primary} />
        }
      >
        {loading && !refreshing ? (
          <ApplicationListSkeleton withChips />
        ) : error && applications.length === 0 ? (
          <EmptyState
            icon={<AlertCircle size={32} color={c.danger} />}
            title="Couldn't load applications"
            message={error}
            onRetry={() => reload(true)}
          />
        ) : (
          <>
            {error && <StaleDataBanner error={error} />}
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
          </>
        )}
      </ScrollView>

      <ActionModal
        visible={!!userToApprove}
        onCancel={() => setUserToApprove(null)}
        onConfirm={() => decide(userToApprove, 'approve', () => setUserToApprove(null))}
        loading={submitting}
        title={`Approve ${userToApprove?.name}?`}
        subtitle={`${userToApprove?.name} will be granted active volunteer permissions.`}
        icon={<Check color={MonoIcon.color} size={32} />}
        iconContainerStyle={MonoIcon.circle}
        cancelText="Cancel"
        cancelButtonStyle={styles.cancelButton}
        cancelTextStyle={styles.cancelText}
        confirmText="Confirm"
        confirmButtonStyle={styles.approveButton}
        confirmTextStyle={styles.confirmText}
      />

      <ActionModal
        visible={!!userToReject}
        onCancel={() => setUserToReject(null)}
        onConfirm={() => decide(userToReject, 'reject', () => setUserToReject(null))}
        loading={submitting}
        title={`Reject ${userToReject?.name}?`}
        subtitle={`${userToReject?.name}'s volunteer application will be declined.`}
        icon={<X color={MonoIcon.color} size={32} />}
        iconContainerStyle={MonoIcon.circle}
        cancelText="Cancel"
        cancelButtonStyle={styles.cancelButton}
        cancelTextStyle={styles.cancelText}
        confirmText="Reject"
        confirmButtonStyle={styles.rejectButton}
        confirmTextStyle={styles.confirmText}
      />

      <VolunteerDetailsSheet
        application={userToView}
        visible={!!userToView}
        onClose={() => {
          afterSheetCloses.current = null;
          setUserToView(null);
        }}
        onClosed={handleSheetClosed}
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
  // Same white, grey-bordered pill as the bottom sheets' SheetCancelButton.
  cancelButton: {
    backgroundColor: Palette.primary,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  cancelText: {
    color: FunctionalColors.textSecondary,
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
