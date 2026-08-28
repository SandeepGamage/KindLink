import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  ChevronLeft,
  Clock,
  Info,
  MapPin,
  Phone,
  Star,
  XCircle,
} from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ActionModal } from '@/components/ui/action-modal';
import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { BottomTabInset, FunctionalColors, MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { CATEGORY_META, formatRequestWhen } from '@/constants/request-meta';
import { STATUS_META, deriveCommitmentStatus } from '@/constants/commitment-meta';
import { useTheme } from '@/hooks/use-theme';
import { appointmentService } from '@/services/appointmentService';
import { AssistanceRequest } from '@/types/appointment';

type ModalKey = 'start' | 'reschedule' | 'complete' | 'rate' | null;

export default function CommitmentDetailsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { commitmentId } = useLocalSearchParams<{ commitmentId: string }>();

  const [request, setRequest] = useState<AssistanceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<ModalKey>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState('');

  const loadRequest = useCallback(async () => {
    setLoading(true);
    const data = await appointmentService.getAppointmentById(commitmentId);
    setRequest(data);
    setLoading(false);
  }, [commitmentId]);

  useEffect(() => {
    loadRequest();
  }, [loadRequest]);

  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const handleStartActivity = async () => {
    setSubmitting(true);
    const result = await appointmentService.updateStatus(commitmentId, 'in-progress');
    setSubmitting(false);
    if (result) {
      setModal(null);
      setRequest(result);
      showToast('Task started. Have a great visit!');
    } else {
      showToast('Unable to start this activity. Please try again.');
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    const result = await appointmentService.updateStatus(commitmentId, 'completed');
    setSubmitting(false);
    setModal(null);
    if (result) {
      setRequest(result);
      showToast('Task completed. Thank you for your help.');
    }
  };

  // Reschedule/rating flows aren't backed by an API yet — confirmed locally for now
  const handleRescheduleRequest = () => {
    setModal(null);
    showToast("Reschedule request sent. They'll confirm a new time with you.");
  };

  const handleRateSubmit = () => {
    setModal(null);
    setRating(0);
    setNote('');
    showToast('Thank you for your feedback!');
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

  const status = request ? deriveCommitmentStatus(request) : null;

  if (!request || !status) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={[styles.safeArea, styles.centerFill]} edges={['top', 'left', 'right']}>
          <ThemedText type="default" style={styles.notFoundText}>Commitment not found.</ThemedText>
          <Pressable onPress={() => router.back()} style={[styles.outlineButton, { borderColor: theme.border }]}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>Go back</ThemedText>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const meta = CATEGORY_META[request.taskType] ?? CATEGORY_META.Other;
  const Icon = meta.icon;
  const statusMeta = STATUS_META[status];
  const requesterName = request.requester?.name ?? 'this member';

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {toast && (
          <View style={[styles.toast, { backgroundColor: FunctionalColors.successBg }]}>
            <CheckCircle2 size={18} color={FunctionalColors.successText} />
            <ThemedText type="smallBold" style={[styles.toastText, { color: FunctionalColors.successText }]}>{toast}</ThemedText>
          </View>
        )}

        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBackButton}>
            <ChevronLeft size={24} color={theme.text} />
          </Pressable>
          <ThemedText type="smallBold" style={styles.headerTitle}>Task Details</ThemedText>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + 120 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={[styles.heroIcon, { backgroundColor: meta.bg }]}>
              <Icon size={32} color={meta.color} />
            </View>
            <ThemedText type="subtitle" style={styles.heroTitle}>{request.title}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={styles.helpingText}>Helping {requesterName}</ThemedText>
            <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
              <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
              <ThemedText type="smallBold" style={{ color: statusMeta.color }}>{statusMeta.label}</ThemedText>
            </View>
          </View>

          <DetailCard label="Task overview" theme={theme}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.overviewText}>{request.description}</ThemedText>
            {status === 'in-progress' && (
              <View style={[styles.inlineNotice, { borderTopColor: theme.border }]}>
                <View style={[styles.pulseDot, { backgroundColor: FunctionalColors.warningText }]} />
                <ThemedText type="smallBold" style={{ color: FunctionalColors.warningText }}>Task is currently active</ThemedText>
              </View>
            )}
            {status === 'completed' && (
              <View style={[styles.inlineNotice, { borderTopColor: theme.border }]}>
                <CheckCircle2 size={15} color={FunctionalColors.successText} />
                <ThemedText type="smallBold" style={{ color: FunctionalColors.successText }}>Completed successfully</ThemedText>
              </View>
            )}
          </DetailCard>

          <DetailCard label="When & where" theme={theme}>
            <View style={styles.detailList}>
              <MetaRow icon={<Clock size={18} color={theme.primary} />} label="Date & time" value={formatRequestWhen(request.date, request.preferredTime)} />
              <MetaRow icon={<MapPin size={18} color={theme.primary} />} label="Location" value={request.location} last />
            </View>
          </DetailCard>

          <StatusInfoCard status={status} requesterName={requesterName} />

          {status === 'in-progress' && (
            <View style={[styles.supportRow, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={[styles.supportIcon, { backgroundColor: theme.backgroundSelected }]}>
                <Phone size={16} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold" style={styles.supportTitle}>Need help while on task?</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">Our safety team is available 24/7.</ThemedText>
              </View>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.disabledAction}>Contact</ThemedText>
            </View>
          )}

          {status === 'completed' && (
            <View style={[styles.completedNote, { backgroundColor: FunctionalColors.successBg, borderColor: '#B3DECA' }]}>
              <ThemedText style={styles.completedEmoji}>🌸</ThemedText>
              <ThemedText type="smallBold" style={[styles.completedTitle, { color: FunctionalColors.successText }]}>You made a real difference today.</ThemedText>
              <ThemedText type="small" style={[styles.completedBody, { color: FunctionalColors.successText }]}>Your contribution has been recorded. Thank you for your time.</ThemedText>
            </View>
          )}
        </ScrollView>

        <View style={[styles.actionBar, { borderTopColor: theme.border, backgroundColor: theme.backgroundElement }]}>
          {status === 'upcoming' && (
            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => setModal('reschedule')}>
                <ThemedText type="smallBold" themeColor="textSecondary">Reschedule</ThemedText>
              </Pressable>
              <Pressable
                style={[styles.primaryButton, { backgroundColor: submitting ? theme.border : theme.primary }]}
                onPress={handleStartActivity}
                disabled={submitting}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>Start Activity</ThemedText>
              </Pressable>
            </View>
          )}

          {status === 'in-progress' && (
            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]}>
                <ThemedText type="smallBold" themeColor="textSecondary">Contact support</ThemedText>
              </Pressable>
              <Pressable style={[styles.primaryButton, { backgroundColor: FunctionalColors.warningText }]} onPress={() => setModal('complete')}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>Check out & complete</ThemedText>
              </Pressable>
            </View>
          )}

          {status === 'completed' && (
            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]}>
                <ThemedText type="smallBold" themeColor="textSecondary">View summary</ThemedText>
              </Pressable>
              <Pressable style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={() => setModal('rate')}>
                <ThemedText type="smallBold" style={styles.primaryButtonText}>Rate experience</ThemedText>
              </Pressable>
            </View>
          )}

          {status === 'cancelled' && (
            <View style={styles.actionRow}>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]}>
                <ThemedText type="smallBold" themeColor="textSecondary">Details</ThemedText>
              </Pressable>
              <Pressable style={[styles.secondaryButton, styles.flexGrow2, { borderColor: theme.border }]} onPress={() => router.push('/volunteer/schedule')}>
                <ThemedText type="smallBold" themeColor="textSecondary">Return to commitments</ThemedText>
              </Pressable>
            </View>
          )}
        </View>
      </SafeAreaView>

      <ActionModal
        visible={modal === 'complete'}
        onCancel={() => setModal(null)}
        onConfirm={handleComplete}
        title="Complete this task?"
        subtitle={`By confirming, you mark this visit as finished and ${requesterName} will be notified.`}
        icon={<CheckCircle2 color={FunctionalColors.success} size={32} />}
        iconContainerStyle={{ backgroundColor: FunctionalColors.successBg }}
        confirmText={submitting ? 'Completing…' : 'Yes, complete'}
        confirmButtonStyle={{ backgroundColor: FunctionalColors.success }}
      />

      <ActionModal
        visible={modal === 'reschedule'}
        onCancel={() => setModal(null)}
        onConfirm={handleRescheduleRequest}
        title="Reschedule this task?"
        subtitle={`A reschedule request will be sent to ${requesterName}. They will confirm a new date and time with you directly via the app.`}
        icon={<Clock color={Palette.secondary} size={32} />}
        iconContainerStyle={{ backgroundColor: Palette.blueTint }}
        confirmText="Send request"
        confirmButtonStyle={{ backgroundColor: Palette.secondary }}
      />

      <BottomSheetModal visible={modal === 'rate'} onClose={() => setModal(null)}>
        <ThemedText type="default" style={styles.rateTitle}>Rate your experience</ThemedText>
        <ThemedText type="small" themeColor="textSecondary" style={styles.rateSubtitle}>
          How was your {request.taskType.toLowerCase()} visit with {requesterName}?
        </ThemedText>
        <View style={styles.starRow}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setRating(n)} hitSlop={6} style={styles.starButton}>
              <Star size={32} color={n <= rating ? FunctionalColors.warningText : theme.border} fill={n <= rating ? FunctionalColors.warningText : 'transparent'} />
            </Pressable>
          ))}
        </View>
        <TextInput
          value={note}
          onChangeText={setNote}
          placeholder={`Leave an optional note for ${requesterName}…`}
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={3}
          style={[styles.noteInput, { borderColor: theme.border, color: theme.text, backgroundColor: theme.background }]}
        />
        <View style={styles.rateActions}>
          <Pressable style={[styles.secondaryButton, { borderColor: theme.border }]} onPress={() => setModal(null)}>
            <ThemedText type="smallBold" themeColor="textSecondary">Skip</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: rating === 0 ? theme.border : theme.primary }]}
            disabled={rating === 0}
            onPress={handleRateSubmit}>
            <ThemedText type="smallBold" style={styles.primaryButtonText}>Submit rating</ThemedText>
          </Pressable>
        </View>
      </BottomSheetModal>
    </ThemedView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

type Theme = ReturnType<typeof useTheme>;

function DetailCard({ label, theme, children }: { label: string; theme: Theme; children: React.ReactNode }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <ThemedText type="smallBold" themeColor="textSecondary" style={styles.cardLabel}>{label}</ThemedText>
      {children}
    </View>
  );
}

function MetaRow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <View style={[styles.metaRow, !last && styles.metaRowBorder]}>
      <View style={styles.metaIcon}>{icon}</View>
      <View style={{ flex: 1 }}>
        <ThemedText type="small" themeColor="textSecondary">{label}</ThemedText>
        <ThemedText type="default" style={styles.metaValue}>{value}</ThemedText>
      </View>
    </View>
  );
}

const STATUS_INFO: Record<string, { icon: React.ComponentType<{ size?: number; color?: string }>; bg: string; border: string; color: string; message: (name: string) => string }> = {
  'upcoming': {
    icon: Info,
    bg: Palette.blueTint,
    border: '#C7E3F7',
    color: Palette.secondary,
    message: () => 'Your commitment is confirmed. You can reschedule or start the activity once you arrive.',
  },
  'in-progress': {
    icon: Clock,
    bg: FunctionalColors.warningBg,
    border: '#F5D48A',
    color: FunctionalColors.warningText,
    message: (name) => `This task is now in progress. Check out once you have completed the visit so ${name} knows you have finished.`,
  },
  'completed': {
    icon: CheckCircle2,
    bg: FunctionalColors.successBg,
    border: '#B3DECA',
    color: FunctionalColors.successText,
    message: () => 'Thank you for making a difference! Your time and kindness are appreciated.',
  },
  'cancelled': {
    icon: XCircle,
    bg: '#F7FBFF',
    border: '#D6E3EC',
    color: '#5D7182',
    message: () => 'This commitment was cancelled. No further action is needed. We hope to see you volunteer again soon.',
  },
};

function StatusInfoCard({ status, requesterName }: { status: string; requesterName: string }) {
  const info = STATUS_INFO[status];
  const Icon = info.icon;
  return (
    <View style={[styles.statusInfoCard, { backgroundColor: info.bg, borderColor: info.border }]}>
      <Icon size={18} color={info.color} />
      <ThemedText type="small" style={[styles.statusInfoText, { color: info.color }]}>{info.message(requesterName)}</ThemedText>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  centerFill: { alignItems: 'center', justifyContent: 'center', gap: Spacing.three },
  notFoundText: { marginBottom: Spacing.three },
  toast: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, marginHorizontal: Spacing.three, marginTop: Spacing.two, padding: Spacing.two, borderRadius: 12 },
  toastText: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 56, paddingHorizontal: Spacing.two, borderBottomWidth: 1 },
  headerBackButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 17 },
  headerSpacer: { width: 40 },
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, gap: Spacing.four },
  outlineButton: { borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two },
  hero: { alignItems: 'center', gap: Spacing.two },
  heroIcon: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 20, textAlign: 'center' },
  helpingText: { marginTop: -4 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 999 },
  statusDot: { width: 7, height: 7, borderRadius: 4 },
  card: { borderWidth: 1, borderRadius: 16, padding: Spacing.three, gap: Spacing.two },
  cardLabel: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  overviewText: { lineHeight: 20 },
  inlineNotice: { flexDirection: 'row', alignItems: 'center', gap: 6, borderTopWidth: 1, paddingTop: Spacing.two, marginTop: Spacing.two },
  pulseDot: { width: 8, height: 8, borderRadius: 4 },
  detailList: { gap: 0 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.two },
  metaRowBorder: { borderBottomWidth: 1, borderBottomColor: 'rgba(23, 36, 46, 0.08)' },
  metaIcon: { width: 24, alignItems: 'center' },
  metaValue: { fontWeight: '700', marginTop: 1 },
  statusInfoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, borderWidth: 1, borderRadius: 14, padding: Spacing.three },
  statusInfoText: { flex: 1, lineHeight: 20 },
  supportRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderWidth: 1, borderRadius: 16, padding: Spacing.three },
  supportIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  supportTitle: { fontSize: 13 },
  disabledAction: { opacity: 0.5 },
  completedNote: { borderWidth: 1, borderRadius: 16, padding: Spacing.three, alignItems: 'center' },
  completedEmoji: { fontSize: 22, marginBottom: 4 },
  completedTitle: { textAlign: 'center' },
  completedBody: { textAlign: 'center', marginTop: 4, lineHeight: 18 },
  actionBar: { borderTopWidth: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.four },
  actionRow: { flexDirection: 'row', gap: Spacing.two },
  secondaryButton: { flex: 1, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  primaryButton: { flex: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 14 },
  primaryButtonText: { color: '#FFFFFF' },
  flexGrow2: { flex: 2 },
  rateTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  rateSubtitle: { textAlign: 'center', marginTop: Spacing.two },
  starRow: { flexDirection: 'row', justifyContent: 'center', gap: Spacing.two, marginVertical: Spacing.four },
  starButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  noteInput: { borderWidth: 1, borderRadius: 12, padding: Spacing.three, minHeight: 88, textAlignVertical: 'top' },
  rateActions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.four },
});
