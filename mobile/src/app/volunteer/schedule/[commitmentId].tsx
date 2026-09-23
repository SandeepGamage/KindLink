import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { appointmentService } from '@/services/appointmentService';
import { AssistanceRequest } from '@/types/appointment';

type CommitmentStatus = 'Upcoming' | 'In Progress' | 'Completed' | 'Cancelled';

function mapBackendStatusToCommitmentStatus(status?: string): CommitmentStatus {
  if (!status) return 'Upcoming';
  const lower = status.toLowerCase();
  if (lower === 'accepted') return 'Upcoming';
  if (lower === 'in_progress') return 'In Progress';
  if (lower === 'completed') return 'Completed';
  if (lower === 'cancelled') return 'Cancelled';
  return 'Upcoming';
}

export default function AcceptedTaskDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function loadCommitment() {
      if (!commitmentId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await appointmentService.getAppointmentById(commitmentId);
        if (isMounted) {
          setRequest(data);
        }
      } catch (err) {
        console.error('Failed to load commitment details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadCommitment();
    return () => {
      isMounted = false;
    };
  }, [commitmentId]);

  const handleVerifyPin = async () => {
    if (!commitmentId || pinInput.trim().length !== 4) {
      Alert.alert('Invalid PIN', 'Please enter the 4-digit code provided by the resident.');
      return;
    }
    setVerifying(true);
    try {
      const updated = await appointmentService.verifyArrivalPin(commitmentId, pinInput.trim());
      if (updated) {
        setRequest(updated);
        setPinInput('');
        Alert.alert(
          'Arrival Verified! ✓',
          'The 4-digit safety PIN matched successfully. Task status is now In Progress.'
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Invalid 4-digit PIN. Please re-check with the resident.';
      Alert.alert('Verification Failed', msg);
    } finally {
      setVerifying(false);
    }
  };

  const handleCompleteTask = () => {
    if (!commitmentId) return;
    if (!request?.isPinVerified) {
      Alert.alert(
        'PIN Verification Required',
        'Please verify the resident\'s 4-digit arrival PIN before checking out and completing this task.'
      );
      return;
    }

    Alert.alert(
      'Complete Task',
      'Are you sure you want to check out and mark this assistance task as completed?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Complete',
          onPress: async () => {
            setCompleting(true);
            try {
              const updated = await appointmentService.completeAppointment(commitmentId);
              if (updated) {
                setRequest(updated);
                Alert.alert(
                  'Task Completed! 🎉',
                  'Thank you for supporting your community member!',
                  [{ text: 'View Schedule', onPress: () => router.push('/volunteer/schedule') }]
                );
              }
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : 'Failed to complete task.';
              Alert.alert('Error', msg);
            } finally {
              setCompleting(false);
            }
          },
        },
      ]
    );
  };

  const handleGetDirections = () => {
    const loc = request?.location || 'Home';
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Maps Unavailable', `Address: ${loc}`);
    });
  };

  const handleContactMember = () => {
    if (request?.contactNumber) {
      Linking.openURL(`tel:${request.contactNumber}`).catch(() => {
        Alert.alert('Phone Dialer Unavailable', `Resident phone: ${request.contactNumber}`);
      });
    } else {
      router.push('/messages' as any);
    }
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <ThemedText style={styles.loadingText}>Loading task details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const person = request?.requester?.name || 'Community Elder';
  const taskType = request?.taskType || request?.title || 'Assistance Task';
  const description = request?.description || 'No additional details provided.';
  const dateTime = request?.preferredTime || request?.date || 'Scheduled time';
  const location = request?.location || 'Home';
  const status: CommitmentStatus = mapBackendStatusToCommitmentStatus(request?.status);

  const primaryAction =
    status === 'Upcoming'
      ? 'Get Directions'
      : status === 'In Progress'
      ? 'Check Out & Complete'
      : status === 'Completed'
      ? 'View Summary'
      : 'Return to Schedule';

  const secondaryAction =
    status === 'Upcoming'
      ? 'Contact Member'
      : status === 'In Progress'
      ? 'Contact Support'
      : status === 'Completed'
      ? 'Rate Experience'
      : 'Back';

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <ThemedText style={styles.back}>‹</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Task Details
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 112 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.taskMark}>
              <ThemedText style={styles.taskMarkText}>✦</ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.taskType}>
              {taskType}
            </ThemedText>
            <ThemedText type="small" style={styles.helpingText}>
              Helping {person}
            </ThemedText>
            <StatusBadge status={status} />
          </View>

          <DetailCard label="Task Overview">
            <ThemedText type="small" style={styles.description}>
              {description}
            </ThemedText>
          </DetailCard>

          <DetailCard label="When & Where">
            <View style={styles.detailList}>
              <DetailItem label={`Time: ${dateTime}`} />
              <DetailItem label={`Location: ${location}`} />
              {request?.contactNumber ? (
                <DetailItem label={`Contact: ${request.contactNumber}`} />
              ) : null}
            </View>
          </DetailCard>

          {request?.cancellationReason ? (
            <DetailCard label="Cancellation Info">
              <ThemedText type="small" style={styles.cancellationText}>
                Reason: {request.cancellationReason}
              </ThemedText>
              {request.cancellationNote ? (
                <ThemedText type="small" style={styles.cancellationNote}>
                  Note: {request.cancellationNote}
                </ThemedText>
              ) : null}
            </DetailCard>
          ) : null}

          {/* In-Person Arrival Safety PIN Verification */}
          {status !== 'Cancelled' && (
            <DetailCard label="In-Person Arrival Verification">
              {request?.isPinVerified ? (
                <View style={styles.verifiedCard}>
                  <View style={styles.verifiedIconWrap}>
                    <ThemedText style={styles.verifiedCheck}>✓</ThemedText>
                  </View>
                  <View style={styles.verifiedTextWrap}>
                    <ThemedText type="smallBold" style={styles.verifiedTitle}>
                      Identity & Arrival Verified
                    </ThemedText>
                    <ThemedText type="small" style={styles.verifiedSubtitle}>
                      {request.verifiedAt
                        ? `Verified at ${new Date(request.verifiedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                        : 'Arrival PIN verified with resident'}
                    </ThemedText>
                  </View>
                </View>
              ) : (
                <View style={styles.pinVerifySection}>
                  <ThemedText type="small" style={styles.pinInstruction}>
                    When you arrive at {person}'s door, ask for their 4-digit KindLink PIN to confirm identity before starting.
                  </ThemedText>
                  <View style={styles.pinInputRow}>
                    <TextInput
                      style={styles.pinTextInput}
                      placeholder="4-digit PIN"
                      placeholderTextColor="#71717A"
                      value={pinInput}
                      onChangeText={setPinInput}
                      keyboardType="number-pad"
                      maxLength={4}
                      autoCorrect={false}
                    />
                    <Pressable
                      style={[
                        styles.pinVerifyBtn,
                        (pinInput.trim().length !== 4 || verifying) && styles.pinVerifyBtnDisabled,
                      ]}
                      onPress={handleVerifyPin}
                      disabled={pinInput.trim().length !== 4 || verifying}
                    >
                      {verifying ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                      ) : (
                        <ThemedText type="smallBold" style={styles.pinVerifyBtnText}>
                          Verify & Start
                        </ThemedText>
                      )}
                    </Pressable>
                  </View>
                </View>
              )}
            </DetailCard>
          )}

          <DetailCard label="Status & Instructions">
            <ThemedText type="small" style={styles.statusDescription}>
              {statusDescription(status)}
            </ThemedText>
          </DetailCard>

          {notice ? (
            <View style={styles.notice}>
              <ThemedText type="smallBold" style={styles.noticeText}>
                {notice}
              </ThemedText>
            </View>
          ) : null}
        </ScrollView>

        <View style={styles.actionBar}>
          <Pressable
            style={styles.secondaryAction}
            onPress={() => {
              if (secondaryAction === 'Contact Member') {
                handleContactMember();
              } else if (secondaryAction === 'Back') {
                router.back();
              } else {
                setNotice(`${secondaryAction} initiated.`);
              }
            }}
          >
            <ThemedText type="smallBold" style={styles.secondaryText}>
              {secondaryAction}
            </ThemedText>
          </Pressable>
          <Pressable
            style={styles.primaryAction}
            onPress={() => {
              if (primaryAction === 'Get Directions') {
                handleGetDirections();
              } else if (primaryAction === 'Check Out & Complete') {
                handleCompleteTask();
              } else if (primaryAction === 'Return to Schedule') {
                router.back();
              } else {
                setNotice(`${primaryAction} selected.`);
              }
            }}
            disabled={completing}
          >
            {completing ? (
              <ActivityIndicator size="small" color="#111114" />
            ) : (
              <ThemedText type="smallBold" style={styles.primaryText}>
                {primaryAction}
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
}

function statusDescription(status: CommitmentStatus) {
  if (status === 'Upcoming')
    return 'Your commitment is confirmed. Please arrive on time to assist the community member.';
  if (status === 'In Progress')
    return 'This task is currently active. Once completed, please mark it as done.';
  if (status === 'Completed')
    return 'This task was successfully completed. Thank you for making a positive impact in your community!';
  return 'This task was cancelled. No further action is required.';
}

function DetailCard({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <ThemedText type="smallBold" style={styles.cardLabel}>
        {label}
      </ThemedText>
      {children}
    </View>
  );
}

function DetailItem({ label }: { label: string }) {
  return <ThemedText type="default" style={styles.detailText}>•  {label}</ThemedText>;
}

function StatusBadge({ status }: { status: CommitmentStatus }) {
  return (
    <View
      style={[
        styles.statusBadge,
        status === 'In Progress' && styles.statusInProgress,
        status === 'Completed' && styles.statusCompleted,
        status === 'Cancelled' && styles.statusCancelled,
      ]}
    >
      <ThemedText type="smallBold" style={styles.statusText}>
        {status}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  mainWrapper: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: '#A9A9B0',
    fontSize: 15,
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  back: {
    color: '#F7F7F8',
    fontSize: 34,
    lineHeight: 34,
  },
  headerTitle: {
    color: '#F7F7F8',
    fontSize: 20,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 18,
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  taskMark: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: '#45454B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E22',
  },
  taskMarkText: {
    color: '#F7F7F8',
    fontSize: 24,
  },
  taskType: {
    color: '#F7F7F8',
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  helpingText: {
    color: '#8CAEC9',
    fontSize: 15,
  },
  statusBadge: {
    backgroundColor: '#303036',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusInProgress: {
    backgroundColor: '#735D25',
  },
  statusCompleted: {
    backgroundColor: '#2E684B',
  },
  statusCancelled: {
    backgroundColor: '#7A2E2E',
  },
  statusText: {
    color: '#F7F7F8',
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    borderWidth: 1,
    borderColor: '#38383E',
    borderRadius: 14,
    padding: 18,
    gap: 12,
    backgroundColor: '#111114',
  },
  cardLabel: {
    color: '#C3C3C9',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontSize: 12,
  },
  description: {
    color: '#F7F7F8',
    fontSize: 15,
    lineHeight: 22,
  },
  detailList: {
    gap: 8,
  },
  detailText: {
    color: '#F7F7F8',
    fontSize: 15,
    lineHeight: 22,
  },
  cancellationText: {
    color: '#E06D6D',
    fontSize: 14,
    fontWeight: '600',
  },
  cancellationNote: {
    color: '#C3C3C9',
    fontSize: 13,
    marginTop: 4,
  },
  statusDescription: {
    color: '#C3C3C9',
    fontSize: 14,
    lineHeight: 20,
  },
  notice: {
    borderWidth: 1,
    borderColor: '#4E7D50',
    borderRadius: 10,
    padding: 14,
    backgroundColor: '#112213',
  },
  noticeText: {
    color: '#F7F7F8',
    textAlign: 'center',
    fontSize: 14,
  },
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingVertical: 14,
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2F',
  },
  secondaryAction: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryText: {
    color: '#F7F7F8',
    fontSize: 14,
    fontWeight: '600',
  },
  primaryAction: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryText: {
    color: '#111114',
    fontSize: 14,
    fontWeight: '700',
  },
  pinVerifySection: {
    gap: 12,
  },
  pinInstruction: {
    color: '#A9A9B0',
    fontSize: 13,
    lineHeight: 18,
  },
  pinInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pinTextInput: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#45454B',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 4,
    textAlign: 'center',
    backgroundColor: '#18181B',
  },
  pinVerifyBtn: {
    backgroundColor: '#10B981',
    height: 48,
    paddingHorizontal: 18,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinVerifyBtnDisabled: {
    backgroundColor: '#374151',
    opacity: 0.6,
  },
  pinVerifyBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  verifiedIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedCheck: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  verifiedTextWrap: {
    flex: 1,
  },
  verifiedTitle: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '700',
  },
  verifiedSubtitle: {
    color: '#D1FAE5',
    fontSize: 12,
    marginTop: 2,
  },
});
