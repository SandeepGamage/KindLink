import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, X, ArrowUpDown, History, Inbox } from 'lucide-react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { ActionModal } from '@/components/ui/action-modal';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { FilterDropdown } from '@/components/admin/filter-dropdown';
import { Avatar } from '@/components/admin/avatar';
import { Button } from '@/components/admin/button';
import { EmptyState } from '@/components/admin/empty-state';
import { Palette, FunctionalColors } from '@/constants/theme';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { AdminSpacing } from '@/components/admin/tokens';

// TODO: This screen is still on mock data. Approving/rejecting does not persist —
// it needs a VolunteerApplication model plus admin endpoints before it is usable.
const MOCK_DATA = [
  {
    id: '1',
    name: 'Michael Chang',
    role: 'Community Lead',
    time: 'Today, 09:30 AM',
    tags: ['First Aid Certified', '5+ Yrs Exp'],
  },
  {
    id: '2',
    name: 'Jessica Taylor',
    role: 'Youth Care Assistant',
    time: 'Yesterday, 04:15 PM',
    tags: ['Background Checked', 'Bilingual'],
  },
];

type ApplicationStatus = 'Pending' | 'Approved' | 'Rejected';
const STATUS_OPTIONS: ApplicationStatus[] = ['Pending', 'Approved', 'Rejected'];

type Application = (typeof MOCK_DATA)[0];

export default function ApprovalsScreen() {
  const c = useAdminTheme();
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('Pending');
  const [userToApprove, setUserToApprove] = useState<Application | null>(null);
  const [userToReject, setUserToReject] = useState<Application | null>(null);
  const [userToView, setUserToView] = useState<Application | null>(null);
  const [isSortDrawerOpen, setIsSortDrawerOpen] = useState(false);
  const router = useRouter();

  const pendingCount = MOCK_DATA.length;

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
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
              onPress={() => router.push('/(admin)/history')}
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
        {activeTab === 'Pending' ? (
          MOCK_DATA.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={() => setUserToApprove(request)}
              onReject={() => setUserToReject(request)}
              onViewProfile={() => setUserToView(request)}
            />
          ))
        ) : (
          <EmptyState
            icon={<Inbox size={32} color={c.textMuted} />}
            title={`No ${activeTab.toLowerCase()} applications`}
          />
        )}
      </ScrollView>

      <ActionModal
        visible={!!userToApprove}
        onCancel={() => setUserToApprove(null)}
        onConfirm={() => {
          // TODO: API call to actually approve the user
          setUserToApprove(null);
        }}
        title={`Approve ${userToApprove?.name}?`}
        subtitle={`${userToApprove?.name} will be granted active ${userToApprove?.role} volunteer permissions.`}
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
          // TODO: API call to actually reject the user
          setUserToReject(null);
        }}
        title={`Reject ${userToReject?.name}?`}
        subtitle={`${userToReject?.name}'s request for the ${userToReject?.role} position will be declined.`}
        icon={<X color={FunctionalColors.danger} size={32} />}
        iconContainerStyle={styles.rejectIconContainer}
        cancelText="Cancel"
        cancelButtonStyle={styles.cancelButton}
        cancelTextStyle={styles.cancelText}
        confirmText="Reject Application"
        confirmButtonStyle={styles.rejectButton}
        confirmTextStyle={styles.confirmText}
      />

      {/* Profile Details Bottom Sheet */}
      <BottomSheetModal
        visible={!!userToView}
        onClose={() => setUserToView(null)}
      >
        {userToView && (
          <View>
            <Text style={styles.modalTitle}>Profile Details</Text>

            <View style={styles.modalProfileHeader}>
              <Avatar name={userToView.name} size={64} style={styles.modalAvatar} />
              <View>
                <Text style={styles.modalName}>{userToView.name}</Text>
                <Text style={styles.modalRole}>{userToView.role}</Text>
              </View>
            </View>

            <Text style={styles.modalSectionTitle}>Application Time</Text>
            <View style={styles.modalTimeContainer}>
              <Text style={styles.modalTimeText}>{userToView.time}</Text>
            </View>

            <Text style={styles.modalSectionTitle}>Qualifications</Text>
            <View style={styles.modalTagsContainer}>
              {userToView.tags.map((tag, index) => (
                <View key={index} style={styles.modalTag}>
                  <Text style={styles.modalTagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.modalActionContainer}>
              <Button
                label="Close"
                variant="secondary"
                fullWidth
                onPress={() => setUserToView(null)}
              />
            </View>
          </View>
        )}
      </BottomSheetModal>

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

function RequestCard({
  request,
  onApprove,
  onReject,
  onViewProfile,
}: {
  request: Application;
  onApprove: () => void;
  onReject: () => void;
  onViewProfile: () => void;
}) {
  return (
    <View style={styles.cardContainer}>
      {/* Top Row: User Info */}
      <View style={styles.cardHeader}>
        <View style={styles.cardUserContainer}>
          <Avatar name={request.name} size={46} />
          <View>
            <Text style={styles.cardName}>{request.name}</Text>
            <Text style={styles.cardRole}>{request.role}</Text>
          </View>
        </View>
        <Text style={styles.cardTime}>{request.time}</Text>
      </View>

      {/* Middle Row: Tags & Link */}
      <View style={styles.cardMiddleRow}>
        <View style={styles.cardTagsContainer}>
          {request.tags.map((tag, index) => (
            <View key={index} style={styles.cardTag}>
              <Text style={styles.cardTagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <Pressable
          style={styles.cardViewProfileButton}
          onPress={onViewProfile}
          accessibilityRole="button"
          accessibilityLabel={`View profile details for ${request.name}`}
        >
          <Text style={styles.cardViewProfileText}>View Profile Details</Text>
        </Pressable>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom Row: Actions */}
      <View style={styles.cardActionsContainer}>
        <Button
          label="Reject"
          variant="danger"
          onPress={onReject}
          accessibilityLabel={`Reject ${request.name}`}
          style={styles.cardActionButton}
        />
        <Button
          label="Approve"
          onPress={onApprove}
          accessibilityLabel={`Approve ${request.name}`}
          style={styles.cardActionButton}
        />
      </View>
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
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 24,
  },
  modalProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalAvatar: {
    marginRight: 16,
  },
  modalName: {
    color: Palette.ink,
    fontWeight: 'bold',
    fontSize: 18,
  },
  modalRole: {
    color: FunctionalColors.textSecondary,
    fontSize: 14,
    marginTop: 4,
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 8,
  },
  modalTimeContainer: {
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 20,
  },
  modalTimeText: {
    color: FunctionalColors.textSecondary,
    fontSize: 15,
  },
  modalTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  modalTag: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderColor: Palette.border,
    borderWidth: 1,
  },
  modalTagText: {
    color: Palette.ink,
    fontSize: 12,
    fontWeight: '600',
  },
  modalActionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 'auto',
    paddingTop: 8,
    paddingBottom: 32,
  },
  cardContainer: {
    backgroundColor: Palette.primary,
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderColor: Palette.border,
    borderWidth: 1,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardUserContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardName: {
    color: Palette.ink,
    fontWeight: 'bold',
    fontSize: 16,
  },
  cardRole: {
    color: FunctionalColors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  cardTime: {
    color: FunctionalColors.textSecondary,
    fontSize: 11,
    marginTop: 4,
  },
  cardMiddleRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    flex: 1,
    paddingRight: 16,
  },
  cardTag: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
    borderColor: Palette.border,
    borderWidth: 1,
  },
  cardTagText: {
    color: Palette.ink,
    fontSize: 11,
    fontWeight: '600',
  },
  cardViewProfileButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardViewProfileText: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Palette.border,
    width: '100%',
    marginBottom: 16,
    opacity: 0.5,
  },
  cardActionsContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  cardActionButton: {
    flex: 1,
  },
});
