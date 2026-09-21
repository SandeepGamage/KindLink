import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth } from '@/constants/theme';
import { appointmentService } from '@/services/appointmentService';
import { AssistanceRequest } from '@/types/appointment';

export default function RequestDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'accepted' | 'declined'>('idle');

  useEffect(() => {
    let isMounted = true;

    async function loadRequest() {
      if (!requestId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await appointmentService.getAppointmentById(requestId);
        if (isMounted) {
          setRequest(data);
          if (data?.status === 'accepted') {
            setStatus('accepted');
          }
        }
      } catch (err) {
        console.error('Failed to load request details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRequest();
    return () => {
      isMounted = false;
    };
  }, [requestId]);

  const handleAccept = async () => {
    if (!requestId) return;
    setAccepting(true);
    try {
      const result = await appointmentService.acceptAppointment(requestId);
      if (result) {
        setStatus('accepted');
        setRequest(result);
        Alert.alert(
          'Request Accepted!',
          'You have successfully accepted this assistance request. It has been added to your schedule.',
          [
            {
              text: 'View Schedule',
              onPress: () => router.push('/volunteer/schedule'),
            },
            {
              text: 'OK',
            },
          ]
        );
      } else {
        Alert.alert('Error', 'Unable to accept request. Please try again.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to accept request';
      Alert.alert('Cannot Accept Request', msg);
    } finally {
      setAccepting(false);
    }
  };

  const handleDecline = () => {
    setStatus('declined');
    Alert.alert(
      'Request Declined',
      'You have declined this request. It remains available for other volunteers.',
      [
        {
          text: 'Back to Requests',
          onPress: () => router.back(),
        },
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <ThemedText style={styles.loadingText}>Loading request details...</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const requesterName = request?.requester?.name || 'Community Elder';
  const taskTitle = request?.title || request?.taskType || 'Assistance Request';
  const taskDescription = request?.description || 'No additional details provided.';
  const preferredTime = request?.preferredTime || 'As soon as possible';
  const location = request?.location || 'Home';
  const contactNumber = request?.contactNumber;
  const urgency = request?.urgency || 'Normal';
  const isHigh = urgency === 'Urgent';

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mainWrapper}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.backButton}>
            <ThemedText style={styles.back}>‹</ThemedText>
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Request Details
          </ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 112 }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.personSection}>
            <View style={styles.avatar}>
              <ThemedText style={styles.avatarIcon}>●</ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.personName}>
              {requesterName}
            </ThemedText>
            <View style={styles.badgeRow}>
              <ThemedText type="small" style={styles.rating}>
                ★ 4.9 Verified Member
              </ThemedText>
              <View style={[styles.urgencyBadge, isHigh && styles.highBadge]}>
                <ThemedText type="smallBold" style={styles.urgencyText}>
                  {urgency} Priority
                </ThemedText>
              </View>
            </View>
          </View>

          <DetailCard label="Request Details">
            <ThemedText type="default" style={styles.requestTitle}>
              {taskTitle}
            </ThemedText>
            <ThemedText type="small" style={styles.categoryLabel}>
              Category: {request?.taskType || 'General'}
            </ThemedText>
            <ThemedText type="small" style={styles.quote}>
              “{taskDescription}”
            </ThemedText>
          </DetailCard>

          <DetailCard label="When & Where">
            <View style={styles.detailList}>
              <DetailItem label={`Time: ${preferredTime}`} />
              <DetailItem label={`Location: ${location}`} />
              {contactNumber ? <DetailItem label={`Contact: ${contactNumber}`} /> : null}
            </View>
          </DetailCard>

          <View style={styles.trustCard}>
            <ThemedText type="smallBold" style={styles.cardLabel}>
              Safety & Trust Guidelines
            </ThemedText>
            <ThemedText type="default" style={styles.trustText}>
              ✓ User Identity Verified
            </ThemedText>
            <ThemedText type="default" style={styles.trustText}>
              ✓ Direct Community Member
            </ThemedText>
            <ThemedText type="default" style={styles.trustText}>
              ✓ Official KindLink Care Protection
            </ThemedText>
          </View>

          {status !== 'idle' && (
            <View
              style={[
                styles.confirmation,
                status === 'accepted' ? styles.acceptedConfirm : styles.declinedConfirm,
              ]}
            >
              <ThemedText type="smallBold" style={styles.confirmationText}>
                {status === 'accepted'
                  ? '✓ Request accepted. It has been added to your schedule commitments.'
                  : '✕ Request declined.'}
              </ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={styles.actionBar}>
          <Pressable
            style={styles.declineButton}
            onPress={handleDecline}
            disabled={accepting || status === 'accepted'}
          >
            <ThemedText type="smallBold" style={styles.declineText}>
              Decline
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.acceptButton, (status === 'accepted' || accepting) && styles.disabledButton]}
            onPress={handleAccept}
            disabled={accepting || status === 'accepted'}
          >
            {accepting ? (
              <ActivityIndicator color="#111114" />
            ) : (
              <ThemedText type="smallBold" style={styles.acceptText}>
                {status === 'accepted' ? 'Accepted ✓' : 'Accept Request'}
              </ThemedText>
            )}
          </Pressable>
        </View>
      </View>
    </ThemedView>
  );
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
    gap: 20,
  },
  personSection: {
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#45454B',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E1E22',
  },
  avatarIcon: {
    color: '#B7B7C0',
    fontSize: 32,
  },
  personName: {
    color: '#F7F7F8',
    fontSize: 22,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rating: {
    color: '#C3C3C9',
    fontSize: 14,
  },
  urgencyBadge: {
    backgroundColor: '#303036',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  highBadge: {
    backgroundColor: '#7A2E2E',
  },
  urgencyText: {
    color: '#F7F7F8',
    fontSize: 11,
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
  requestTitle: {
    color: '#F7F7F8',
    fontSize: 19,
    fontWeight: '600',
  },
  categoryLabel: {
    color: '#8CAEC9',
    fontSize: 13,
  },
  quote: {
    color: '#F7F7F8',
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    borderLeftWidth: 3,
    borderLeftColor: '#606068',
    paddingLeft: 12,
  },
  detailList: {
    gap: 8,
  },
  detailText: {
    color: '#F7F7F8',
    fontSize: 15,
    lineHeight: 22,
  },
  trustCard: {
    borderWidth: 1,
    borderColor: '#38383E',
    borderRadius: 14,
    padding: 18,
    gap: 10,
    backgroundColor: '#16161B',
  },
  trustText: {
    color: '#D8D8DF',
    fontSize: 14,
    lineHeight: 20,
  },
  confirmation: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 14,
  },
  acceptedConfirm: {
    borderColor: '#4E7D50',
    backgroundColor: '#112213',
  },
  declinedConfirm: {
    borderColor: '#7A3535',
    backgroundColor: '#241212',
  },
  confirmationText: {
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
  declineButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#45454B',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  declineText: {
    color: '#F7F7F8',
    fontSize: 15,
    fontWeight: '600',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#F4F4F5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptText: {
    color: '#111114',
    fontSize: 15,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.6,
  },
});