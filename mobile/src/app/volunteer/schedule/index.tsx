import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import Svg, { Rect } from 'react-native-svg';
import { Clock, MapPin } from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, FunctionalColors, MaxContentWidth, Palette, Spacing } from '@/constants/theme';
import { CATEGORY_META, formatRequestWhen } from '@/constants/request-meta';
import { useTheme } from '@/hooks/use-theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest } from '@/types/appointment';

type CommitmentStatus = 'upcoming' | 'in-progress' | 'completed' | 'cancelled';

const TABS: Array<{ key: CommitmentStatus; label: string }> = [
  { key: 'upcoming', label: 'Upcoming' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_META: Record<CommitmentStatus, { label: string; bg: string; color: string; footerBg: string; footerText: string; caption: string; action: string }> = {
  'upcoming': { label: 'Upcoming', bg: Palette.blueTint, color: Palette.secondary, footerBg: '#F7FBFF', footerText: '#5D7182', caption: 'Scheduled', action: 'View details' },
  'in-progress': { label: 'In Progress', bg: FunctionalColors.warningBg, color: FunctionalColors.warningText, footerBg: FunctionalColors.warningBg, footerText: FunctionalColors.warningText, caption: 'Active now', action: 'Check out / complete' },
  'completed': { label: 'Completed', bg: FunctionalColors.successBg, color: FunctionalColors.successText, footerBg: FunctionalColors.successBg, footerText: FunctionalColors.successText, caption: 'Finished', action: 'View summary' },
  'cancelled': { label: 'Cancelled', bg: FunctionalColors.dangerBg, color: FunctionalColors.dangerText, footerBg: '#F7FBFF', footerText: '#5D7182', caption: 'Not attended', action: 'View cancellation details' },
};

const EMPTY_COPY: Record<CommitmentStatus, { heading: string; body: string }> = {
  'upcoming': { heading: 'No upcoming commitments', body: 'Browse nearby requests and accept one to see it here.' },
  'in-progress': { heading: 'Nothing in progress', body: 'Commitments move here automatically when they start today.' },
  'completed': { heading: 'No completed tasks yet', body: 'Your finished visits and tasks will appear here for your records.' },
  'cancelled': { heading: 'No cancelled commitments', body: 'Any commitments you or an elder cancel will be shown here.' },
};

/** Accepted tasks are split into Upcoming / In Progress by whether their start time has passed */
function deriveStatus(request: AssistanceRequest): CommitmentStatus | null {
  if (request.status === 'completed') return 'completed';
  if (request.status === 'cancelled') return 'cancelled';
  if (request.status === 'accepted') {
    return new Date(request.date).getTime() <= Date.now() ? 'in-progress' : 'upcoming';
  }
  return null;
}

export default function MyCommitmentsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { requests, loading, refreshRequests } = useAppointments();

  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<CommitmentStatus>('upcoming');

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [refreshRequests])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRequests();
    setRefreshing(false);
  };

  const commitments = useMemo(() => {
    return requests
      .map((r) => ({ request: r, status: deriveStatus(r) }))
      .filter((c): c is { request: AssistanceRequest; status: CommitmentStatus } => c.status !== null);
  }, [requests]);

  const countsByTab = useMemo(() => {
    const counts: Record<CommitmentStatus, number> = { upcoming: 0, 'in-progress': 0, completed: 0, cancelled: 0 };
    commitments.forEach((c) => { counts[c.status] += 1; });
    return counts;
  }, [commitments]);

  const visible = useMemo(() => commitments.filter((c) => c.status === activeTab), [commitments, activeTab]);

  const showSkeleton = loading && !refreshing && requests.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <View style={[styles.headerBlock, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
          <ThemedText type="title" style={styles.title}>My Commitments</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
            Keep track of the people and tasks you have committed to.
          </ThemedText>
        </View>

        <View style={[styles.tabBar, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
            {TABS.map(({ key, label }) => {
              const isActive = activeTab === key;
              const count = countsByTab[key];
              return (
                <Pressable key={key} onPress={() => setActiveTab(key)} style={styles.tabItem}>
                  <View style={styles.tabItemInner}>
                    <ThemedText type="smallBold" style={[styles.tabLabel, { color: isActive ? theme.primary : theme.textSecondary }]}>
                      {label}
                    </ThemedText>
                    {count > 0 && (
                      <View style={[styles.countPill, { backgroundColor: isActive ? theme.primary : theme.backgroundSelected }]}>
                        <ThemedText type="small" style={[styles.countText, { color: isActive ? '#FFFFFF' : theme.textSecondary }]}>{count}</ThemedText>
                      </View>
                    )}
                  </View>
                  {isActive && <View style={[styles.tabUnderline, { backgroundColor: theme.primary }]} />}
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}>

          {showSkeleton && (
            <View style={styles.commitmentList}>
              <CardSkeleton theme={theme} />
              <CardSkeleton theme={theme} />
            </View>
          )}

          {!showSkeleton && visible.length === 0 && <EmptyTabState tab={activeTab} theme={theme} onBrowse={() => router.push('/volunteer/requests')} />}

          {!showSkeleton && visible.length > 0 && (
            <View style={styles.commitmentList}>
              {visible.map(({ request, status }) => (
                <CommitmentCard
                  key={request._id}
                  request={request}
                  status={status}
                  theme={theme}
                  onPress={() => router.push({ pathname: '/volunteer/schedule/[commitmentId]', params: { commitmentId: request._id } })}
                />
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

type Theme = ReturnType<typeof useTheme>;

function CommitmentCard({ request, status, theme, onPress }: { request: AssistanceRequest; status: CommitmentStatus; theme: Theme; onPress: () => void }) {
  const meta = CATEGORY_META[request.taskType] ?? CATEGORY_META.Other;
  const Icon = meta.icon;
  const statusMeta = STATUS_META[status];
  const isCancelled = status === 'cancelled';

  return (
    <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, isCancelled && styles.cardMuted]}>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBadge, { backgroundColor: meta.bg }, isCancelled && styles.iconBadgeMuted]}>
            <Icon size={20} color={meta.color} />
          </View>
          <View style={styles.cardTitleWrap}>
            <ThemedText type="small" themeColor="textSecondary" style={styles.personLabel}>
              Helping {request.requester?.name ?? 'a community member'}
            </ThemedText>
            <View style={styles.cardTitleTopRow}>
              <ThemedText type="default" style={[styles.commitmentTitle, isCancelled && styles.commitmentTitleCancelled]} numberOfLines={1}>
                {request.title}
              </ThemedText>
              <View style={[styles.statusBadge, { backgroundColor: statusMeta.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: statusMeta.color }]} />
                <ThemedText type="small" style={[styles.statusText, { color: statusMeta.color }]}>{statusMeta.label}</ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.metaGroup}>
          <View style={styles.metaItem}>
            <Clock size={14} color={isCancelled ? theme.textSecondary : theme.primary} />
            <ThemedText type="small" style={styles.metaTextStrong}>{formatRequestWhen(request.date, request.preferredTime)}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">{request.location}</ThemedText>
          </View>
        </View>
      </View>

      <Pressable onPress={onPress} style={[styles.footerStrip, { backgroundColor: statusMeta.footerBg }]}>
        <ThemedText type="small" style={{ color: statusMeta.footerText }}>{statusMeta.caption}</ThemedText>
        <ThemedText type="smallBold" style={{ color: statusMeta.footerText }}>{statusMeta.action} ›</ThemedText>
      </Pressable>
    </View>
  );
}

function CardSkeleton({ theme }: { theme: Theme }) {
  const block = (style: object) => <View style={[styles.skeletonBlock, { backgroundColor: theme.border }, style]} />;
  return (
    <View style={[styles.card, styles.cardBody, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.cardTopRow}>
        {block({ width: 40, height: 40, borderRadius: 12 })}
        <View style={styles.cardTitleWrap}>
          {block({ width: '40%', height: 12 })}
          {block({ width: '70%', height: 16, marginTop: Spacing.two })}
        </View>
      </View>
      {block({ width: '60%', height: 12, marginTop: Spacing.three })}
    </View>
  );
}

function CalendarIllustration() {
  return (
    <Svg width={72} height={72} viewBox="0 0 72 72">
      <Rect x={8} y={14} width={56} height={50} rx={8} fill={Palette.blueTint} />
      <Rect x={8} y={14} width={56} height={16} rx={8} fill="#C7E3F7" />
      <Rect x={8} y={22} width={56} height={8} fill="#C7E3F7" />
      <Rect x={22} y={8} width={5} height={14} rx={2.5} fill={Palette.secondary} opacity={0.5} />
      <Rect x={45} y={8} width={5} height={14} rx={2.5} fill={Palette.secondary} opacity={0.5} />
      {[0, 1, 2, 3].map((col) =>
        [0, 1, 2].map((row) => (
          <Rect
            key={`${col}-${row}`}
            x={18 + col * 12}
            y={38 + row * 10}
            width={8}
            height={6}
            rx={2}
            fill={col === 0 && row === 0 ? Palette.secondary : '#EAF5FD'}
            opacity={col === 0 && row === 0 ? 0.8 : 1}
          />
        ))
      )}
    </Svg>
  );
}

function EmptyTabState({ tab, theme, onBrowse }: { tab: CommitmentStatus; theme: Theme; onBrowse: () => void }) {
  const { heading, body } = EMPTY_COPY[tab];
  return (
    <View style={styles.emptyState}>
      <CalendarIllustration />
      <ThemedText type="default" style={styles.emptyTitle}>{heading}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyMessage}>{body}</ThemedText>
      {tab === 'upcoming' && (
        <Pressable onPress={onBrowse} style={[styles.emptyAction, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={{ color: '#FFFFFF' }}>Browse requests</ThemedText>
        </Pressable>
      )}
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  headerBlock: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three, paddingBottom: Spacing.three, borderBottomWidth: 1 },
  title: { fontSize: 26, lineHeight: 32 },
  subtitle: { marginTop: 2 },
  tabBar: { borderBottomWidth: 1 },
  tabRow: { paddingHorizontal: Spacing.three },
  tabItem: { paddingVertical: Spacing.three, paddingHorizontal: Spacing.two },
  tabItemInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tabLabel: { fontSize: 14 },
  tabUnderline: { position: 'absolute', bottom: 0, left: Spacing.two, right: Spacing.two, height: 2.5, borderRadius: 2 },
  countPill: { borderRadius: 999, paddingHorizontal: 6, paddingVertical: 1 },
  countText: { fontSize: 11, fontWeight: '700' },
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four },
  commitmentList: { gap: Spacing.three },
  card: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  cardMuted: { opacity: 0.8 },
  cardBody: { padding: Spacing.three },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  iconBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  iconBadgeMuted: { opacity: 0.6 },
  cardTitleWrap: { flex: 1 },
  personLabel: { textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.4, fontWeight: '700' },
  cardTitleTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: Spacing.two, marginTop: 2 },
  commitmentTitle: { flex: 1, fontSize: 16, fontWeight: '700' },
  commitmentTitleCancelled: { textDecorationLine: 'line-through' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 12, fontWeight: '700' },
  metaGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.three, paddingLeft: 52 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTextStrong: { fontWeight: '700' },
  footerStrip: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  skeletonBlock: { borderRadius: 6 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.five, paddingHorizontal: Spacing.three },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginTop: Spacing.three, marginBottom: Spacing.two },
  emptyMessage: { textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  emptyAction: { marginTop: Spacing.four, borderRadius: 12, paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
});
