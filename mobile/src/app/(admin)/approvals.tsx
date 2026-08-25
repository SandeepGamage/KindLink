import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { ActionModal } from '@/components/ui/action-modal';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { Palette, FunctionalColors } from '@/constants/theme';

const MOCK_DATA = [
  {
    id: '1',
    name: 'Michael Chang',
    role: 'Community Lead',
    initials: 'MC',
    time: 'Today, 09:30 AM',
    tags: ['First Aid Certified', '5+ Yrs Exp'],
  },
  {
    id: '2',
    name: 'Jessica Taylor',
    role: 'Youth Care Assistant',
    initials: 'JT',
    time: 'Yesterday, 04:15 PM',
    tags: ['Background Checked', 'Bilingual'],
  },
];

export default function ApprovalsScreen() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [userToApprove, setUserToApprove] = useState<typeof MOCK_DATA[0] | null>(null);
  const [userToReject, setUserToReject] = useState<typeof MOCK_DATA[0] | null>(null);
  const [userToView, setUserToView] = useState<typeof MOCK_DATA[0] | null>(null);
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Volunteer Requests</Text>
        <Text style={styles.headerSubtitle}>3 pending applications</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TabButton title="Pending (3)" isActive={activeTab === 'Pending'} onPress={() => setActiveTab('Pending')} />
        <TabButton title="Approved" isActive={activeTab === 'Approved'} onPress={() => setActiveTab('Approved')} />
        <TabButton title="Rejected" isActive={activeTab === 'Rejected'} onPress={() => setActiveTab('Rejected')} />
      </View>

      {/* Border below tabs */}
      <View style={styles.divider} />

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
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No {activeTab.toLowerCase()} applications.</Text>
          </View>
        )}
      </ScrollView>

      {userToApprove && (
        <ActionModal
          visible={!!userToApprove}
          onCancel={() => setUserToApprove(null)}
          onConfirm={() => {
            // TODO: API call to actually approve the user
            setUserToApprove(null);
          }}
          title={`Approve ${userToApprove.name}?`}
          subtitle={`${userToApprove.name} will be granted active ${userToApprove.role} volunteer permissions.`}
          icon={<Check color={Palette.secondary} size={32} />}
          iconContainerStyle={styles.approveIconContainer}
          cancelText="Cancel"
          cancelButtonStyle={styles.cancelButton}
          cancelTextStyle={styles.cancelText}
          confirmText="Confirm Approval"
          confirmButtonStyle={styles.approveButton}
          confirmTextStyle={styles.confirmText}
        />
      )}

      {userToReject && (
        <ActionModal
          visible={!!userToReject}
          onCancel={() => setUserToReject(null)}
          onConfirm={() => {
            // TODO: API call to actually reject the user
            setUserToReject(null);
          }}
          title={`Reject ${userToReject.name}?`}
          subtitle={`${userToReject.name}'s request for the ${userToReject.role} position will be declined.`}
          icon={<X color={FunctionalColors.danger} size={32} />}
          iconContainerStyle={styles.rejectIconContainer}
          cancelText="Cancel"
          cancelButtonStyle={styles.cancelButton}
          cancelTextStyle={styles.cancelText}
          confirmText="Reject Application"
          confirmButtonStyle={styles.rejectButton}
          confirmTextStyle={styles.confirmText}
        />
      )}

      {/* Profile Details Bottom Sheet */}
      <BottomSheetModal
        visible={!!userToView}
        onClose={() => setUserToView(null)}
      >
        {userToView && (
          <View>
            <Text style={styles.modalTitle}>Profile Details</Text>

            <View style={styles.modalProfileHeader}>
              <View style={styles.modalAvatar}>
                <Text style={styles.modalAvatarText}>{userToView.initials}</Text>
              </View>
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
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setUserToView(null)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function TabButton({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tabButton,
        isActive ? styles.tabButtonActive : styles.tabButtonInactive
      ]}
    >
      <Text
        style={[
          styles.tabText,
          isActive ? styles.tabTextActive : styles.tabTextInactive
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function RequestCard({ request, onApprove, onReject, onViewProfile }: { request: typeof MOCK_DATA[0], onApprove: () => void, onReject: () => void, onViewProfile: () => void }) {
  return (
    <View style={styles.cardContainer}>
      {/* Top Row: User Info */}
      <View style={styles.cardHeader}>
        <View style={styles.cardUserContainer}>
          {/* Avatar */}
          <View style={styles.cardAvatar}>
            <Text style={styles.cardAvatarText}>{request.initials}</Text>
          </View>

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

        <TouchableOpacity style={styles.cardViewProfileButton} onPress={onViewProfile}>
          <Text style={styles.cardViewProfileText}>View Profile Details</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Bottom Row: Actions */}
      <View style={styles.cardActionsContainer}>
        <TouchableOpacity
          style={styles.cardRejectButton}
          onPress={onReject}
        >
          <Text style={styles.cardRejectText}>Reject</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.cardApproveButton}
          onPress={onApprove}
        >
          <Text style={styles.cardApproveText}>Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.primary,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    color: Palette.ink,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: FunctionalColors.textSecondary,
    fontSize: 14,
  },
  tabsContainer: {
    paddingHorizontal: 24,
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: Palette.border,
    width: '100%',
  },
  listContainer: {
    flex: 1,
    backgroundColor: Palette.surface,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  listContent: {
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  emptyText: {
    color: FunctionalColors.textSecondary,
  },
  approveIconContainer: {
    backgroundColor: Palette.blueTint,
  },
  rejectIconContainer: {
    backgroundColor: '#FDEAEA',
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
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  modalAvatarText: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 20,
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
    borderRadius: 12,
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
    borderRadius: 6,
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
  modalCloseButton: {
    flex: 1,
    backgroundColor: Palette.surface,
    paddingVertical: 14,
    borderRadius: 12,
    borderColor: Palette.border,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    color: Palette.ink,
    fontWeight: 'bold',
    fontSize: 16,
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#E3F2FD',
  },
  tabButtonInactive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
  },
  tabText: {
    fontSize: 13,
  },
  tabTextActive: {
    color: Palette.ink,
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: FunctionalColors.textSecondary,
    fontWeight: '500',
  },
  cardContainer: {
    backgroundColor: Palette.primary,
    padding: 20,
    borderRadius: 20,
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
  cardAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: Palette.surface,
    borderColor: Palette.border,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardAvatarText: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 15,
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
    borderRadius: 6,
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
  cardRejectButton: {
    flex: 1,
    backgroundColor: '#D32F2F',
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: '#D32F2F',
    borderWidth: 1,
  },
  cardRejectText: {
    color: Palette.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cardApproveButton: {
    flex: 1,
    backgroundColor: Palette.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    borderColor: Palette.secondary,
    borderWidth: 1,
  },
  cardApproveText: {
    color: Palette.primary,
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
