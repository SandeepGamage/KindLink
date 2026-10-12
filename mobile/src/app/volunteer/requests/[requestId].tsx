import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  XCircle,
} from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionModal } from '@/components/ui/action-modal';
import { BottomTabInset, FunctionalColors, MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { CATEGORY_META, formatRequestWhen } from '@/constants/request-meta';
import { useTheme } from '@/hooks/use-theme';
import { useAuthContext } from '@/context/auth-context';
import { appointmentService } from '@/services/appointmentService';
import { reviewService, ReviewStats } from '@/services/review.service';
import { AssistanceRequest } from '@/types/appointment';

type ActionState = 'none' | 'accepted' | 'declined';

function getInitials(name?: string) {
  if (!name) return '?';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

export default function RequestDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthContext();
  const { requestId } = useLocalSearchParams<{ requestId: string }>();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [ratingStats, setRatingStats] = useState<ReviewStats | null>(null);
  const [modal, setModal] = useState<'accept' | 'decline' | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [actionState, setActionState] = useState<ActionState>('none');

  const loadRequest = useCallback(async () => {
    setLoading(true);
    const data = await appointmentService.getAppointmentById(requestId);
    setRequest(data);
    setLoading(false);
  }, [requestId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  useEffect(() => {
    const requesterId = request?.requester?._id;
    if (!requesterId) return;
    reviewService.getReviewStats(requesterId).then(setRatingStats);
  }, [request?.requester?._id]);

  const handleConfirmAccept = async () => {
    setSubmitting(true);
    const result = await appointmentService.acceptAppointment(requestId);
    setSubmitting(false);
    setModal(null);
    if (result) {
      setRequest(result);
      setActionState('accepted');
    }
  };

  const handleConfirmDecline = async () => {
    setSubmitting(true);
    await appointmentService.declineAppointment(requestId);
    setSubmitting(false);
    setModal(null);
    setActionState('declined');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centerFill]} edges={['top', 'left', 'right']}>
          <ActivityIndicator color={theme.primary} size="large" />
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (!request) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centerFill]} edges={['top', 'left', 'right']}>
          <ThemedText type="default" style={styles.notFoundText}>Request not found.</ThemedText>
          <Pressable onPress={() => router.back()} style={[styles.outlineButton, { borderColor: theme.border }]}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>Go back</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const meta = CATEGORY_META[request.taskType] ?? CATEGORY_META.Other;
  const Icon = meta.icon;
  const isMyAcceptedRequest = actionState === 'accepted' || (request.status === 'accepted' && request.provider?._id === (user?._id || user?.id));
  const isTakenByOther = request.status !== 'pending' && !isMyAcceptedRequest;
  const canRespond = request.status === 'pending' && actionState === 'none';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBackButton}>
            <ChevronLeft size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>Request Details</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 120 }]} showsVerticalScrollIndicator={false}>
          {actionState === 'accepted' && (
            <StatusBanner
              tone="success"
              title="Request accepted"
              message="It has been added to your schedule."
              onDismiss={() => setActionState('none')}
            />
          )}
          {actionState === 'declined' && (
            <StatusBanner
              tone="danger"
              title="Request declined"
              message="We'll look for another volunteer to help."
              onDismiss={() => setActionState('none')}
            />
          )}

          <View style={styles.personSection}>
            <View style={[styles.avatar, { backgroundColor: Palette.blueTint }]}>
              <ThemedText type="subtitle" style={[styles.avatarText, { color: Palette.secondary }]}>
                {getInitials(request.requester?.name)}
              </ThemedText>
            </View>
            <ThemedText type="subtitle" style={styles.personName}>{request.requester?.name ?? 'Community member'}</ThemedText>
            <View style={styles.personMetaRow}>
              {!!ratingStats?.totalReviews && (
                <View style={styles.inlineRow}>
                  <Star size={14} color={FunctionalColors.warningText} fill={FunctionalColors.warningText} />
                  <ThemedText type="smallBold" style={styles.ratingText}>{ratingStats.averageRating.toFixed(1)}</ThemedText>
                </View>
              )}
              {request.requester?.isVerified && (
                <View style={[styles.verifiedPill, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
                  <ShieldCheck size={13} color={theme.primary} />
                  <ThemedText type="small" style={{ color: theme.primary, fontWeight: '700' }}>Verified</ThemedText>
                </View>
              )}
            </View>
          </View>

          <DetailCard label="Request" theme={theme}>
            <View style={styles.requestHeaderStrip}>
              <View style={[styles.iconBadge, { backgroundColor: meta.bg }]}>
                <Icon size={18} color={meta.color} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="small" style={[styles.categoryLabel, { color: meta.color }]}>{request.taskType}</ThemedText>
                <ThemedText type="default" style={styles.requestTitle}>{request.title}</ThemedText>
              </View>
            </View>
            <ThemedText type="small" themeColor="textSecondary" style={styles.quote}>
              “{request.description}”
            </ThemedText>
          </DetailCard>

          <DetailCard label="When & where" theme={theme}>
            <View style={styles.detailList}>
              <MetaRow icon={<Clock size={18} color={theme.primary} />} label="Date & time" value={formatRequestWhen(request.date, request.preferredTime)} />
              <MetaRow icon={<MapPin size={18} color={theme.primary} />} label="Location" value={request.location} />
            </View>
          </DetailCard>

          <View style={[styles.trustCard, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
            <ThemedText type="smallBold" themeColor="textSecondary" style={styles.cardLabel}>Safety & trust</ThemedText>
            <TrustRow
              icon={<ShieldCheck size={17} color={theme.primary} />}
              label={request.requester?.isVerified ? 'Identity Verified' : 'Identity Not Verified'}
              sub={request.requester?.isVerified ? 'Government ID confirmed' : 'This member has not completed verification'}
            />
            <TrustRow
              icon={<Users size={17} color={theme.primary} />}
              label="Community Member"
              sub={request.requester?.createdAt ? `Active since ${new Date(request.requester.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}` : 'KindLink community member'}
            />
            {!!ratingStats?.totalReviews && (
              <TrustRow
                icon={<Star size={17} color={FunctionalColors.warningText} fill={FunctionalColors.warningText} />}
                label={`${ratingStats.averageRating.toFixed(1)} User Rating`}
                sub={`Based on ${ratingStats.totalReviews} review${ratingStats.totalReviews === 1 ? '' : 's'}`}
                last
              />
            )}
          </View>

          {isTakenByOther && (
            <View style={[styles.takenNotice, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
              <ThemedText type="small" themeColor="textSecondary">
                This request is no longer open — its status is now &quot;{request.status}&quot;.
              </ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={[styles.actionBar, { borderTopColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          {canRespond && (
            <View style={styles.actionRow}>
              <Pressable style={[styles.declineButton, { borderColor: theme.border }]} onPress={() => setModal('decline')}>
                <ThemedText type="smallBold" themeColor="textSecondary">Decline</ThemedText>
              </Pressable>
              <Pressable style={[styles.acceptButton, { backgroundColor: theme.primary }]} onPress={() => setModal('accept')}>
                <ThemedText type="smallBold" style={styles.acceptText}>Accept Request</ThemedText>
              </Pressable>
            </View>
          )}

          {isMyAcceptedRequest && actionState !== 'declined' && (
            <Pressable style={[styles.acceptButton, { backgroundColor: theme.primary }]} onPress={() => router.push('/volunteer/schedule')}>
              <ThemedText type="smallBold" style={styles.acceptText}>View in My Schedule</ThemedText>
            </Pressable>
          )}

          {(actionState === 'declined' || (isTakenByOther && actionState === 'none')) && (
            <Pressable style={[styles.declineButton, styles.fullWidthButton, { borderColor: theme.border }]} onPress={() => router.back()}>
              <ThemedText type="smallBold" themeColor="textSecondary">Back to requests</ThemedText>
            </Pressable>
          )}
        </View>
      </SafeAreaView>

      <ActionModal
        visible={modal === 'accept'}
        onCancel={() => setModal(null)}
        onConfirm={handleConfirmAccept}
        title="Accept this request?"
        subtitle={`By confirming, you commit to helping ${request.requester?.name ?? 'this member'}. Please only confirm if you can attend at ${formatRequestWhen(request.date, request.preferredTime)}.`}
        icon={<CheckCircle2 color={FunctionalColors.success} size={32} />}
        iconContainerStyle={{ backgroundColor: FunctionalColors.successBg }}
        confirmText={submitting ? 'Confirming…' : 'Confirm Acceptance'}
        confirmButtonStyle={{ backgroundColor: Palette.secondary }}
      />

      <ActionModal
        visible={modal === 'decline'}
        onCancel={() => setModal(null)}
        onConfirm={handleConfirmDecline}
        title="Decline this request?"
        subtitle="We'll let them know and look for another volunteer. You won't be penalised for declining."
        icon={<XCircle color={FunctionalColors.danger} size={32} />}
        iconContainerStyle={{ backgroundColor: FunctionalColors.dangerBg }}
        confirmText={submitting ? 'Declining…' : 'Yes, decline'}
        confirmButtonStyle={{ backgroundColor: FunctionalColors.danger }}
      />
    </ThemedView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

type Theme = ReturnType<typeof useTheme>;

function StatusBanner({ tone, title, message, onDismiss }: { tone: 'success' | 'danger'; title: string; message: string; onDismiss: () => void }) {
  const bg = tone === 'success' ? FunctionalColors.successBg : FunctionalColors.dangerBg;
  const text = tone === 'success' ? FunctionalColors.successText : FunctionalColors.dangerText;
  const Icon = tone === 'success' ? CheckCircle2 : XCircle;
  return (
    <View style={[styles.banner, { backgroundColor: bg }]}>
      <Icon size={20} color={text} />
      <View style={{ flex: 1 }}>
        <ThemedText type="smallBold" style={{ color: text }}>{title}</ThemedText>
        <ThemedText type="small" style={{ color: text, marginTop: 2 }}>{message}</ThemedText>
      </View>
      <Pressable onPress={onDismiss} hitSlop={8}>
        <XCircle size={16} color={text} />
      </Pressable>
    </View>
  );
}

function DetailCard({ label, theme, children }: { label: string; theme: Theme; children: React.ReactNode }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.cardLabel}>{label}</ThemedText>
      {children}
    </View>
  );
}

function MetaRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
        <ThemedText type="default" style={styles.metaValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

function TrustRow({ icon, label, sub, last }: { icon: React.ReactNode; label: string; sub: string; last?: boolean }) {
  return (
    <View style={[styles.trustRow, !last && styles.trustRowBorder]}>
      <View style={styles.metaIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <ThemedText type="smallBold" style={styles.trustLabel}>{label}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">{sub}</ThemedText>
      </View>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  centerFill: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  notFoundText: { marginBottom: Spacing.three },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: Spacing.two, borderBottomWidth: 1 },
  headerBackButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, gap: Spacing.four },
  banner: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, borderRadius: 14, padding: Spacing.three },
  personSection: { alignItems: 'center', gap: Spacing.two },
  avatar: { width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28 },
  personName: { fontSize: 20 },
  personMetaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  inlineRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  ratingText: { fontSize: 14 },
  verifiedPill: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  card: { borderWidth: 1, borderRadius: 16, padding: Spacing.three, gap: Spacing.three },
  cardLabel: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  requestHeaderStrip: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  iconBadge: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  categoryLabel: { textTransform: 'uppercase', fontSize: 11, fontWeight: '700', letterSpacing: 0.4 },
  requestTitle: { fontSize: 17, fontWeight: '700', marginTop: 2 },
  quote: { fontStyle: 'italic', lineHeight: 20 },
  detailList: { gap: Spacing.three },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  metaIcon: { width: 24, alignItems: 'center' },
  metaValue: { fontWeight: '700', marginTop: 1 },
  trustCard: { borderWidth: 1, borderRadius: 16, padding: Spacing.three },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  trustRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(23, 36, 46, 0.08)' },
  trustLabel: { fontSize: 14 },
  takenNotice: { borderWidth: 1, borderRadius: 12, padding: Spacing.three },
  actionBar: { borderTopWidth: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.four },
  actionRow: { flexDirection: 'row', gap: Spacing.two },
  declineButton: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  acceptButton: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  acceptText: { color: '#FFFFFF' },
  fullWidthButton: { flex: undefined, width: '100%' },
  outlineButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
});
