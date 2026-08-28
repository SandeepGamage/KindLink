import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Calendar,
  ChevronRight,
  Clock,
  MapPin,
  Search,
} from 'lucide-react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { CATEGORY_CHIPS, CATEGORY_META, URGENCY_CHIPS, URGENCY_META, formatRequestWhen } from '@/constants/request-meta';
import { useTheme } from '@/hooks/use-theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest, TaskType, UrgencyLevel } from '@/types/appointment';

function formatWhen(request: AssistanceRequest) {
  return formatRequestWhen(request.date, request.preferredTime);
}

export default function BrowseRequestsScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { requests, loading, refreshRequests } = useAppointments('pending');

  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | TaskType>('All');
  const [urgencyFilter, setUrgencyFilter] = useState<'All' | UrgencyLevel>('All');

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return requests.filter((r) => {
      if (categoryFilter !== 'All' && r.taskType !== categoryFilter) return false;
      if (urgencyFilter !== 'All' && r.urgency !== urgencyFilter) return false;
      if (
        q &&
        !r.title.toLowerCase().includes(q) &&
        !r.taskType.toLowerCase().includes(q) &&
        !r.description.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [requests, query, categoryFilter, urgencyFilter]);

  const hasActiveFilters = query !== '' || categoryFilter !== 'All' || urgencyFilter !== 'All';

  const resetAll = () => {
    setQuery('');
    setCategoryFilter('All');
    setUrgencyFilter('All');
  };

  const showSkeleton = loading && !refreshing && requests.length === 0;
  const showEmptyData = !showSkeleton && !loading && requests.length === 0;
  const showNoResults = !showSkeleton && requests.length > 0 && filtered.length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Sticky header */}
        <View style={[styles.headerBlock, { backgroundColor: theme.backgroundElement, borderBottomColor: theme.border }]}>
          <View style={styles.headerTopRow}>
            <View style={styles.headerTitleWrap}>
              <ThemedText type="title" style={styles.title}>Browse Requests</ThemedText>
              <ThemedText type="small" themeColor="textSecondary" style={styles.subtitle}>
                Find practical ways to help nearby.
              </ThemedText>
            </View>
            <Pressable
              onPress={() => router.push('/volunteer/schedule')}
              accessibilityLabel="View my schedule"
              style={[styles.scheduleButton, { borderColor: theme.border, backgroundColor: theme.background }]}>
              <Calendar size={20} color={theme.primary} />
            </Pressable>
          </View>

          <View style={[styles.searchBox, { borderColor: theme.border, backgroundColor: theme.background }]}>
            <Search size={18} color={theme.textSecondary} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search requests…"
              placeholderTextColor={theme.textSecondary}
              style={[styles.searchInput, { color: theme.text }]}
            />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: BottomTabInset + Spacing.six }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />}>

          {/* Filter bar */}
          <View style={[styles.filterBlock, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <View style={styles.filterHeaderRow}>
              <ThemedText type="smallBold" themeColor="textSecondary" style={styles.filterLabel}>Category</ThemedText>
              {hasActiveFilters && (
                <Pressable onPress={resetAll} hitSlop={8}>
                  <ThemedText type="small" style={[styles.resetText, { color: theme.primary }]}>Reset</ThemedText>
                </Pressable>
              )}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
              {CATEGORY_CHIPS.map((c) => (
                <FilterChip key={c} label={c} selected={categoryFilter === c} onPress={() => setCategoryFilter(c)} theme={theme} />
              ))}
            </ScrollView>

            <ThemedText type="smallBold" themeColor="textSecondary" style={[styles.filterLabel, styles.urgencyLabel]}>Urgency</ThemedText>
            <View style={styles.urgencyRow}>
              {URGENCY_CHIPS.map((u) => (
                <FilterChip key={u} label={u} selected={urgencyFilter === u} onPress={() => setUrgencyFilter(u)} theme={theme} />
              ))}
            </View>
          </View>

          {/* Results heading */}
          {!showSkeleton && (
            <View style={styles.resultsHeaderRow}>
              <ThemedText type="smallBold" style={styles.resultsTitle}>Available requests</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
              </ThemedText>
            </View>
          )}

          {showSkeleton && (
            <View style={styles.requestList}>
              <CardSkeleton theme={theme} />
              <CardSkeleton theme={theme} />
              <CardSkeleton theme={theme} />
            </View>
          )}

          {showEmptyData && (
            <EmptyState
              theme={theme}
              title="No requests available"
              message="There are no open requests near you right now. Check back soon — new requests are posted daily."
            />
          )}

          {showNoResults && (
            <EmptyState
              theme={theme}
              title="No matching requests"
              message="Your search or filters didn't match any open requests. Try broadening your criteria."
              actionLabel="Show all requests"
              onAction={resetAll}
            />
          )}

          {!showSkeleton && filtered.length > 0 && (
            <View style={styles.requestList}>
              {filtered.map((req) => (
                <RequestCard
                  key={req._id}
                  request={req}
                  theme={theme}
                  onPress={() => router.push({ pathname: '/volunteer/requests/[requestId]', params: { requestId: req._id } })}
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

function FilterChip({ label, selected, onPress, theme }: { label: string; selected: boolean; onPress: () => void; theme: Theme }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.filterChip,
        { borderColor: theme.border, backgroundColor: theme.background },
        selected && { backgroundColor: theme.primary, borderColor: theme.primary },
      ]}>
      <ThemedText type="small" style={[styles.filterChipText, { color: theme.textSecondary }, selected && { color: '#FFFFFF' }]}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function RequestCard({ request, theme, onPress }: { request: AssistanceRequest; theme: Theme; onPress: () => void }) {
  const meta = CATEGORY_META[request.taskType] ?? CATEGORY_META.Other;
  const Icon = meta.icon;
  const urgency = URGENCY_META[request.urgency] ?? URGENCY_META.Normal;

  return (
    <View style={[styles.requestCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={[styles.iconBadge, { backgroundColor: meta.bg }]}>
            <Icon size={20} color={meta.color} />
          </View>
          <View style={styles.cardTitleWrap}>
            <View style={styles.cardTitleTopRow}>
              <ThemedText type="small" themeColor="textSecondary" style={styles.categoryText}>
                {request.taskType}
              </ThemedText>
              <View style={[styles.urgencyBadge, { backgroundColor: urgency.bg }]}>
                <View style={[styles.urgencyDot, { backgroundColor: urgency.color }]} />
                <ThemedText type="small" style={[styles.urgencyText, { color: urgency.color }]}>
                  {request.urgency}
                </ThemedText>
              </View>
            </View>
            <ThemedText type="default" style={styles.requestTitle}>{request.title}</ThemedText>
          </View>
        </View>

        <ThemedText type="small" themeColor="textSecondary" style={styles.description} numberOfLines={2}>
          {request.description}
        </ThemedText>

        <View style={styles.metaGroup}>
          <View style={styles.metaItem}>
            <Clock size={14} color={theme.primary} />
            <ThemedText type="small" style={styles.metaTextStrong}>{formatWhen(request)}</ThemedText>
          </View>
          <View style={styles.metaItem}>
            <MapPin size={14} color={theme.textSecondary} />
            <ThemedText type="small" themeColor="textSecondary">{request.location}</ThemedText>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onPress}
        style={[styles.viewButton, { borderTopColor: theme.border, backgroundColor: theme.background }]}>
        <ThemedText type="small" themeColor="textSecondary">{request.requester?.name ?? 'Community request'}</ThemedText>
        <View style={styles.viewButtonAction}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>View request</ThemedText>
          <ChevronRight size={16} color={theme.primary} />
        </View>
      </Pressable>
    </View>
  );
}

function CardSkeleton({ theme }: { theme: Theme }) {
  const block = (style: object) => <View style={[styles.skeletonBlock, { backgroundColor: theme.border }, style]} />;
  return (
    <View style={[styles.requestCard, styles.cardBody, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.cardTopRow}>
        {block({ width: 40, height: 40, borderRadius: 12 })}
        <View style={styles.cardTitleWrap}>
          {block({ width: '50%', height: 12 })}
          {block({ width: '75%', height: 16, marginTop: Spacing.two })}
        </View>
      </View>
      {block({ width: '100%', height: 12, marginTop: Spacing.three })}
      {block({ width: '80%', height: 12, marginTop: Spacing.two })}
    </View>
  );
}

function EmptyState({
  theme,
  title,
  message,
  actionLabel,
  onAction,
}: {
  theme: Theme;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyState}>
      <View style={[styles.emptyIconBadge, { backgroundColor: theme.backgroundSelected }]}>
        <Search size={28} color={theme.primary} />
      </View>
      <ThemedText type="default" style={styles.emptyTitle}>{title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary" style={styles.emptyMessage}>{message}</ThemedText>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} style={[styles.emptyAction, { borderColor: theme.border }]}>
          <ThemedText type="smallBold" style={{ color: theme.primary }}>{actionLabel}</ThemedText>
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
  headerTopRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: Spacing.two },
  headerTitleWrap: { flex: 1 },
  scheduleButton: { width: 44, height: 44, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 26, lineHeight: 32 },
  subtitle: { marginTop: 2, marginBottom: Spacing.three },
  searchBox: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two, borderWidth: 1, borderRadius: 12, paddingHorizontal: Spacing.three, height: 46 },
  searchInput: { flex: 1, fontSize: 15, height: '100%' },
  content: { paddingHorizontal: Spacing.three, paddingTop: Spacing.three },
  filterBlock: { borderWidth: 1, borderRadius: 16, padding: Spacing.three, marginBottom: Spacing.four },
  filterHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.two },
  filterLabel: { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11 },
  urgencyLabel: { marginTop: Spacing.three, marginBottom: Spacing.two },
  resetText: { fontWeight: '600' },
  chipRow: { gap: Spacing.two },
  urgencyRow: { flexDirection: 'row', gap: Spacing.two, flexWrap: 'wrap' },
  filterChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  filterChipText: { fontWeight: '600' },
  resultsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.three },
  resultsTitle: { fontSize: 15 },
  requestList: { gap: Spacing.three },
  requestCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  cardBody: { padding: Spacing.three },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two },
  iconBadge: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitleWrap: { flex: 1 },
  cardTitleTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: Spacing.two, flexWrap: 'wrap' },
  categoryText: { textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.4, fontWeight: '700' },
  requestTitle: { fontSize: 16, fontWeight: '700', marginTop: 2 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  urgencyDot: { width: 6, height: 6, borderRadius: 3 },
  urgencyText: { fontSize: 12, fontWeight: '700' },
  description: { marginTop: Spacing.two, lineHeight: 20 },
  metaGroup: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, marginTop: Spacing.three },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaTextStrong: { fontWeight: '700' },
  viewButton: { borderTopWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.two + 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  viewButtonAction: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  skeletonBlock: { borderRadius: 6 },
  emptyState: { alignItems: 'center', paddingVertical: Spacing.five, paddingHorizontal: Spacing.three },
  emptyIconBadge: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.three },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: Spacing.two },
  emptyMessage: { textAlign: 'center', lineHeight: 20, maxWidth: 260 },
  emptyAction: { marginTop: Spacing.four, borderWidth: 1, borderRadius: 10, paddingHorizontal: Spacing.four, paddingVertical: Spacing.two + 2 },
});

