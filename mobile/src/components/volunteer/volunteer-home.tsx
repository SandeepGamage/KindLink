import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  Clock,
  MapPin,
  Play,
  ShieldCheck,
  Star,
  Users,
  Zap,
  CircleCheck,
  Calendar,
  type LucideIcon,
} from 'lucide-react-native';

import { useAuthContext } from '@/context/auth-context';
import { useAppointments } from '@/hooks/useAppointments';
import { useTheme } from '@/hooks/use-theme';
import { reviewService, ReviewStats } from '@/services/review.service';
import { FunctionalColors, MaxContentWidth, Palette } from '@/constants/theme';
import { CATEGORY_META, URGENCY_META, formatRequestWhen } from '@/constants/request-meta';
import { AssistanceRequest } from '@/types/appointment';
import { RoleVolunteerIcon, KindLinkLogo } from '@/components/ui/onboarding-icons';

type Theme = ReturnType<typeof useTheme>;

const MAX_NEARBY = 3;

function greetingForNow() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning,';
  if (hour < 18) return 'Good afternoon,';
  return 'Good evening,';
}

function idOf(ref?: { _id?: string } | string | null): string | undefined {
  if (!ref) return undefined;
  return typeof ref === 'string' ? ref : ref._id;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function VolunteerHome() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuthContext();
  const { requests, loading, refreshRequests } = useAppointments();

  const [ratingStats, setRatingStats] = useState<ReviewStats | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const myId = user?._id ?? user?.id;

  const loadAll = useCallback(async () => {
    await Promise.all([
      refreshRequests(),
      myId ? reviewService.getReviewStats(myId).then(setRatingStats).catch(() => {}) : Promise.resolve(),
    ]);
    setHasLoaded(true);
  }, [refreshRequests, myId]);

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [loadAll])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAll();
    setRefreshing(false);
  };

  const summary = useMemo(() => {
    const mine = requests.filter((r) => idOf(r.provider) === myId);
    const pending = requests.filter((r) => r.status === 'pending');

    const directRequests = pending.filter((r) => idOf(r.provider) === myId);
    const openRequests = pending.filter((r) => !r.provider);
    const urgentOpen = openRequests.filter((r) => r.urgency === 'Urgent');

    const inProgress = mine.filter((r) => r.status === 'in-progress' || (r.status as string) === 'in_progress');
    const today = startOfToday();
    const upcoming = mine
      .filter((r) => r.status === 'accepted')
      .sort((a, b) => {
        const aPast = new Date(a.date).getTime() < today;
        const bPast = new Date(b.date).getTime() < today;
        if (aPast !== bPast) return aPast ? 1 : -1;
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      });

    const completed = mine.filter((r) => r.status === 'completed');
    const now = new Date();
    const completedThisMonth = completed.filter((r) => {
      const d = new Date(r.updatedAt ?? r.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
    const peopleHelped = new Set(completed.map((r) => idOf(r.requester)).filter(Boolean)).size;

    const nearby = [...openRequests]
      .sort((a, b) => {
        if ((a.urgency === 'Urgent') !== (b.urgency === 'Urgent')) return a.urgency === 'Urgent' ? -1 : 1;
        return new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime();
      })
      .slice(0, MAX_NEARBY);

    return {
      directRequests,
      openCount: openRequests.length,
      urgentCount: urgentOpen.length,
      inProgress: inProgress[0],
      nextUp: upcoming[0],
      upcomingCount: upcoming.length,
      completedCount: completed.length,
      completedThisMonth,
      peopleHelped,
      nearby,
    };
  }, [requests, myId]);

  const showPlaceholders = !hasLoaded && loading;
  const availability = user?.availability ?? [];
  const rated = !!ratingStats?.totalReviews;

  const openRequest = (r: AssistanceRequest) =>
    router.push({ pathname: '/volunteer/requests/[requestId]', params: { requestId: r._id } });
  const openCommitment = (r: AssistanceRequest) =>
    router.push({ pathname: '/volunteer/schedule/[commitmentId]', params: { commitmentId: r._id } });

  const hero = summary.directRequests.length > 0
    ? {
        title:
          summary.directRequests.length === 1
            ? 'Someone has asked for you'
            : `${summary.directRequests.length} people have asked for you`,
        subtitle: 'These requests were sent directly to you. A quick reply makes a big difference.',
        cta: 'Review requests for you',
        onPress: () => openRequest(summary.directRequests[0]),
      }
    : summary.urgentCount > 0
    ? {
        title: `${summary.urgentCount} urgent ${summary.urgentCount === 1 ? 'request needs' : 'requests need'} help`,
        subtitle: 'Seniors nearby are waiting for support. Pick one up if your schedule allows.',
        cta: 'View urgent requests',
        onPress: () => router.push('/requests' as any),
      }
    : {
        title: 'Ready to help your community?',
        subtitle: 'Browse nearby requests from seniors and offer support where it matters most.',
        cta: 'View Open Requests',
        onPress: () => router.push('/requests' as any),
      };

  const mutedColor = theme.textSecondary;

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} tintColor={theme.primary} />
        }>
        {/* Header */}
        <View style={[styles.card, styles.headerCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, { color: mutedColor }]}>{greetingForNow()}</Text>
            <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>
              {user?.name || 'KindLink Volunteer'}
            </Text>
            <View style={[styles.roleBadge, { backgroundColor: theme.backgroundSelected, borderColor: theme.border }]}>
              <RoleVolunteerIcon size={14} color={theme.primary} />
              <Text style={[styles.roleBadgeText, { color: theme.primary }]}>Volunteer Partner</Text>
              {user?.isVerified && <ShieldCheck size={13} color={theme.primary} />}
            </View>
          </View>
          <KindLinkLogo size={46} />
        </View>

        {/* Hero */}
        <View style={[styles.heroCard, { backgroundColor: Palette.secondary }]}>
          <Text style={styles.heroTitle}>{hero.title}</Text>
          <Text style={styles.heroSubtitle}>{hero.subtitle}</Text>
          <Pressable
            onPress={hero.onPress}
            style={({ pressed }) => [styles.heroButton, { opacity: pressed ? 0.88 : 1 }]}>
            <Text style={styles.heroButtonText}>{hero.cta}</Text>
          </Pressable>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            theme={theme}
            value={showPlaceholders ? '–' : String(summary.openCount)}
            label="Open Requests"
            color={Palette.secondary}
            onPress={() => router.push('/requests' as any)}
          />
          <StatCard
            theme={theme}
            value={showPlaceholders ? '–' : String(summary.upcomingCount)}
            label="Upcoming Visits"
            color={Palette.accent}
            onPress={() => router.push('/volunteer/schedule' as any)}
          />
          <StatCard
            theme={theme}
            value={rated ? `${ratingStats!.averageRating.toFixed(1)}★` : 'New'}
            label="Your Rating"
            color={FunctionalColors.success}
            onPress={() => router.push('/profile' as any)}
          />
        </View>

        {/* Happening now */}
        {summary.inProgress && (
          <>
            <SectionHeader theme={theme} title="Happening Now" />
            <CommitmentCard
              theme={theme}
              request={summary.inProgress}
              badge="In progress"
              badgeBg={FunctionalColors.warningBg}
              badgeColor={FunctionalColors.warningText}
              actionLabel="Continue task"
              ActionIcon={Play}
              onPress={() => openCommitment(summary.inProgress!)}
            />
          </>
        )}

        {/* Next commitment */}
        <SectionHeader
          theme={theme}
          title="Next Commitment"
          actionLabel="My schedule"
          onAction={() => router.push('/volunteer/schedule' as any)}
        />
        {summary.nextUp ? (
          <CommitmentCard
            theme={theme}
            request={summary.nextUp}
            badge="Upcoming"
            badgeBg={theme.backgroundSelected}
            badgeColor={theme.primary}
            actionLabel="View details"
            ActionIcon={Calendar}
            onPress={() => openCommitment(summary.nextUp!)}
          />
        ) : (
          <EmptyCard
            theme={theme}
            text={showPlaceholders ? 'Loading your schedule…' : 'No upcoming commitments. Accept a request to see it here.'}
          />
        )}

        {/* Requests for you */}
        {summary.directRequests.length > 0 && (
          <>
            <SectionHeader theme={theme} title="Requested For You" />
            <View style={styles.list}>
              {summary.directRequests.slice(0, MAX_NEARBY).map((r) => (
                <RequestRow key={r._id} theme={theme} request={r} onPress={() => openRequest(r)} />
              ))}
            </View>
          </>
        )}

        {/* Open requests */}
        <SectionHeader
          theme={theme}
          title="Open Requests"
          actionLabel="See all"
          onAction={() => router.push('/requests' as any)}
        />
        {summary.nearby.length > 0 ? (
          <View style={styles.list}>
            {summary.nearby.map((r) => (
              <RequestRow key={r._id} theme={theme} request={r} onPress={() => openRequest(r)} />
            ))}
          </View>
        ) : (
          <EmptyCard
            theme={theme}
            text={showPlaceholders ? 'Looking for requests…' : 'No open requests right now. Pull down to refresh.'}
          />
        )}

        {/* Impact */}
        <SectionHeader theme={theme} title="Your Impact" />
        <View style={styles.impactRow}>
          <ImpactCard theme={theme} Icon={CircleCheck} value={summary.completedCount} label="Tasks done" />
          <ImpactCard theme={theme} Icon={Users} value={summary.peopleHelped} label="People helped" />
          <ImpactCard theme={theme} Icon={Star} value={summary.completedThisMonth} label="This month" />
        </View>

        {/* Availability */}
        <SectionHeader
          theme={theme}
          title="Your Availability"
          actionLabel="Edit"
          onAction={() => router.push('/edit-profile' as any)}
        />
        <View style={[styles.card, styles.availabilityCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
          {availability.length > 0 ? (
            <View style={styles.chipWrap}>
              {availability.map((slot) => (
                <View key={slot} style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
                  <Text style={[styles.chipText, { color: theme.primary }]}>{slot}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: mutedColor }]}>
              Add the days you can help so seniors can find the right match.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function SectionHeader({
  theme,
  title,
  actionLabel,
  onAction,
}: {
  theme: Theme;
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionTitle, { color: theme.text }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Text style={[styles.sectionAction, { color: theme.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

function StatCard({
  theme,
  value,
  label,
  color,
  onPress,
}: {
  theme: Theme;
  value: string;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.statCard,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <Text style={[styles.statNumber, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </Pressable>
  );
}

function ImpactCard({ theme, Icon, value, label }: { theme: Theme; Icon: LucideIcon; value: number; label: string }) {
  return (
    <View style={[styles.card, styles.impactCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={[styles.impactIcon, { backgroundColor: theme.backgroundSelected }]}>
        <Icon size={18} color={theme.primary} />
      </View>
      <Text style={[styles.impactValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{label}</Text>
    </View>
  );
}

function EmptyCard({ theme, text }: { theme: Theme; text: string }) {
  return (
    <View style={[styles.card, styles.emptyCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Text style={[styles.emptyText, { color: theme.textSecondary }]}>{text}</Text>
    </View>
  );
}

function CommitmentCard({
  theme,
  request,
  badge,
  badgeBg,
  badgeColor,
  actionLabel,
  ActionIcon,
  onPress,
}: {
  theme: Theme;
  request: AssistanceRequest;
  badge: string;
  badgeBg: string;
  badgeColor: string;
  actionLabel: string;
  ActionIcon: LucideIcon;
  onPress: () => void;
}) {
  const meta = CATEGORY_META[request.taskType] ?? CATEGORY_META.Other;
  const Icon = meta.icon;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.commitmentCard,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.9 : 1 },
      ]}>
      <View style={styles.rowTop}>
        <View style={[styles.categoryIcon, { backgroundColor: meta.bg }]}>
          <Icon size={22} color={meta.color} />
        </View>
        <View style={styles.flex}>
          <Text style={[styles.rowTitle, { color: theme.text }]} numberOfLines={1}>
            {request.title || request.taskType}
          </Text>
          <Text style={[styles.rowSub, { color: theme.textSecondary }]} numberOfLines={1}>
            {request.requester?.name ? `with ${request.requester.name}` : request.taskType}
          </Text>
        </View>
        <View style={[styles.pill, { backgroundColor: badgeBg }]}>
          <Text style={[styles.pillText, { color: badgeColor }]}>{badge}</Text>
        </View>
      </View>

      <View style={styles.metaList}>
        <MetaLine theme={theme} Icon={Clock} text={formatRequestWhen(request.date, request.preferredTime)} />
        <MetaLine theme={theme} Icon={MapPin} text={request.location} />
      </View>

      <View style={[styles.commitmentAction, { backgroundColor: theme.primary }]}>
        <ActionIcon size={16} color="#FFFFFF" />
        <Text style={styles.commitmentActionText}>{actionLabel}</Text>
      </View>
    </Pressable>
  );
}

function RequestRow({ theme, request, onPress }: { theme: Theme; request: AssistanceRequest; onPress: () => void }) {
  const meta = CATEGORY_META[request.taskType] ?? CATEGORY_META.Other;
  const Icon = meta.icon;
  const urgency = URGENCY_META[request.urgency];
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        styles.requestRow,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.categoryIcon, { backgroundColor: meta.bg }]}>
        <Icon size={22} color={meta.color} />
      </View>
      <View style={styles.flex}>
        <View style={styles.titleRow}>
          <Text style={[styles.rowTitle, styles.flex, { color: theme.text }]} numberOfLines={1}>
            {request.title || request.taskType}
          </Text>
          {request.urgency === 'Urgent' && urgency && (
            <View style={[styles.pill, { backgroundColor: urgency.bg }]}>
              <Zap size={11} color={urgency.color} />
              <Text style={[styles.pillText, { color: urgency.color }]}>Urgent</Text>
            </View>
          )}
        </View>
        <Text style={[styles.rowSub, { color: theme.textSecondary }]} numberOfLines={1}>
          {formatRequestWhen(request.date, request.preferredTime)}
        </Text>
        <Text style={[styles.rowSub, { color: theme.textSecondary }]} numberOfLines={1}>
          {request.location}
        </Text>
      </View>
      <ChevronRight size={18} color={theme.textSecondary} />
    </Pressable>
  );
}

function MetaLine({ theme, Icon, text }: { theme: Theme; Icon: LucideIcon; text: string }) {
  return (
    <View style={styles.metaLine}>
      <Icon size={15} color={theme.textSecondary} />
      <Text style={[styles.rowSub, styles.flex, { color: theme.textSecondary }]} numberOfLines={1}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  flex: { flex: 1 },
  card: {
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderRadius: 24,
    marginTop: 8,
  },
  headerLeft: { flex: 1, marginRight: 12 },
  greeting: { fontSize: 14, fontWeight: '500' },
  name: { fontSize: 22, fontWeight: '800', marginTop: 2, letterSpacing: -0.5 },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    marginTop: 8,
    gap: 6,
  },
  roleBadgeText: { fontSize: 12, fontWeight: '700' },
  heroCard: {
    padding: 24,
    borderRadius: 24,
    marginTop: 16,
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 4,
  },
  heroTitle: { color: '#FFFFFF', fontSize: 20, fontWeight: '800', lineHeight: 26 },
  heroSubtitle: { color: '#E0E7FF', fontSize: 14, lineHeight: 20, marginTop: 8 },
  heroButton: {
    backgroundColor: Palette.primary,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  heroButtonText: { color: Palette.secondary, fontSize: 15, fontWeight: '700' },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: { flex: 1, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 20 },
  statNumber: { fontSize: 24, fontWeight: '800' },
  statLabel: { fontSize: 12, fontWeight: '600', marginTop: 4 },
  sectionHeader: {
    marginTop: 24,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  sectionAction: { fontSize: 14, fontWeight: '700' },
  list: { gap: 10 },
  requestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    gap: 12,
  },
  categoryIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rowTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rowTitle: { fontSize: 15, fontWeight: '700' },
  rowSub: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  pillText: { fontSize: 11, fontWeight: '700' },
  commitmentCard: { padding: 16, borderRadius: 20 },
  metaList: { marginTop: 14, gap: 6 },
  metaLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  commitmentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 16,
    paddingVertical: 12,
    borderRadius: 14,
  },
  commitmentActionText: { color: '#FFFFFF', fontSize: 14, fontWeight: '700' },
  impactRow: { flexDirection: 'row', gap: 10 },
  impactCard: { flex: 1, padding: 14, borderRadius: 20, alignItems: 'flex-start' },
  impactIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  impactValue: { fontSize: 24, fontWeight: '800' },
  availabilityCard: { padding: 16, borderRadius: 20 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { fontSize: 13, fontWeight: '700' },
  emptyCard: { padding: 18, borderRadius: 18 },
  emptyText: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
});
