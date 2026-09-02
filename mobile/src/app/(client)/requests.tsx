import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';

import { useAuthContext } from '@/context/auth-context';
import { useAppointments } from '@/hooks/useAppointments';
import { MaxContentWidth } from '@/constants/theme';
import { AssistanceRequest } from '@/types/appointment';

// ---------------------------------------------------------------------------
// KindLink Official 60-30-10 Color Palette
// 60% Dominant: Primary (#FFFFFF), Surface (#F4F7FA), Border (#DCE6EF)
// 30% Secondary: Secondary (#1F5C96), Blue Tint (#E3EEF9), Ink (#17242E)
// 10% Accent: Accent Orange (#E08A3C)
// ---------------------------------------------------------------------------
const Palette = {
  primary: '#FFFFFF',
  surface: '#F4F7FA',
  border: '#DCE6EF',
  blueTint: '#E3EEF9',
  secondary: '#1F5C96',
  ink: '#17242E',
  accent: '#E08A3C',
};

export default function ClientRequestsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const { requests, loading, deleteRequest, refreshRequests } = useAppointments();

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [refreshRequests])
  );

  const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');
  const [refreshing, setRefreshing] = useState(false);

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshRequests();
    setRefreshing(false);
  };

  const activeRequests = requests.filter(
    (r) => r.status?.toLowerCase() !== 'completed' && r.status?.toLowerCase() !== 'cancelled'
  );

  const completedRequests = requests.filter(
    (r) => r.status?.toLowerCase() === 'completed' || r.status?.toLowerCase() === 'cancelled'
  );

  const filteredRequests = activeFilter === 'active' ? activeRequests : completedRequests;

  const handleDeleteRequest = (id: string) => {
    Alert.alert(
      'Cancel Assistance Request',
      'Are you sure you want to cancel this assistance request?',
      [
        { text: 'Keep Request', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => deleteRequest(id) },
      ]
    );
  };

  const handleEditRequest = (id: string) => {
    router.push({ pathname: '/edit-request', params: { id } });
  };

  const getStatusBadge = (status?: string) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') {
      return {
        bg: '#DCFCE7',
        text: '#15803D',
        label: 'Completed',
      };
    }
    if (s === 'in progress' || s === 'in-progress' || s === 'confirmed') {
      return {
        bg: Palette.blueTint,
        text: Palette.secondary,
        label: 'In Progress',
      };
    }
    if (s === 'cancelled') {
      return {
        bg: '#FEE2E2',
        text: '#DC2626',
        label: 'Cancelled',
      };
    }
    return {
      bg: 'rgba(224, 138, 60, 0.15)',
      text: Palette.accent,
      label: 'Pending Match',
    };
  };

  const currentBg = isDark ? '#0D151C' : Palette.surface;
  const currentCard = isDark ? '#141E28' : Palette.primary;
  const currentBorder = isDark ? '#233240' : Palette.border;
  const currentInk = isDark ? '#FFFFFF' : Palette.ink;
  const currentSubtext = isDark ? '#94A3B8' : '#5A6E7F';

  return (
    <View style={[styles.container, { backgroundColor: currentBg, paddingTop: Math.max(insets.top, 16) }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Palette.secondary]}
          />
        }>
        {/* ─── 30% Header Text ─── */}
        <View style={styles.titleRow}>
          <View style={styles.titleTextContainer}>
            <Text style={[styles.pageTitle, { color: currentInk }]}>Assistance Requests</Text>
            <Text style={[styles.pageSubtitle, { color: currentSubtext }]}>
              {isElderly
                ? 'Your scheduled appointments and live assistance tasks'
                : 'Community requests you are supporting'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.calendarNavBtn, { backgroundColor: Palette.blueTint, borderColor: Palette.secondary }]}
            onPress={() => router.push('/schedule' as any)}
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={16} color={Palette.secondary} />
            <Text style={[styles.calendarNavText, { color: Palette.secondary }]}>Agenda</Text>
          </TouchableOpacity>
        </View>

        {/* ─── 30% Secondary Hero Banner (#1F5C96) ─── */}
        <View style={[styles.heroBanner, { backgroundColor: Palette.secondary }]}>
          <Text style={styles.heroBannerTitle}>Need a helping hand today?</Text>
          <Text style={styles.heroBannerSubtitle}>
            Connect with trusted local volunteers for grocery shopping, transport, or friendly check-ins.
          </Text>
          <TouchableOpacity
            style={[styles.heroBannerBtn, { backgroundColor: Palette.primary }]}
            onPress={() => router.push('/create-request' as never)}
            activeOpacity={0.9}>
            <Text style={[styles.heroBannerBtnText, { color: Palette.secondary }]}>+ Request Assistance</Text>
          </TouchableOpacity>
        </View>

        {/* ─── 60% Filter Pills with 30% Active Secondary (#1F5C96) ─── */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setActiveFilter('active')}
            style={[
              styles.filterPill,
              {
                backgroundColor:
                  activeFilter === 'active'
                    ? Palette.secondary
                    : currentCard,
                borderColor: currentBorder,
              },
            ]}>
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === 'active' ? Palette.primary : currentSubtext },
              ]}>
              Active & Pending ({activeRequests.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('completed')}
            style={[
              styles.filterPill,
              {
                backgroundColor:
                  activeFilter === 'completed'
                    ? Palette.secondary
                    : currentCard,
                borderColor: currentBorder,
              },
            ]}>
            <Text
              style={[
                styles.filterText,
                { color: activeFilter === 'completed' ? Palette.primary : currentSubtext },
              ]}>
              Completed ({completedRequests.length})
            </Text>
          </Pressable>
        </View>

        {/* ─── Loading Indicator ─── */}
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Palette.secondary} />
            <Text style={[styles.emptySubtitle, { color: currentSubtext, marginTop: 8 }]}>
              Loading your appointments...
            </Text>
          </View>
        )}

        {/* ─── 60% Dominant Clean Empty State ─── */}
        {!loading && filteredRequests.length === 0 && (
          <View style={[styles.emptyCard, { backgroundColor: currentCard, borderColor: currentBorder }]}>
            <Ionicons
              name={activeFilter === 'active' ? 'calendar-outline' : 'checkmark-done-circle-outline'}
              size={48}
              color={Palette.secondary}
            />
            <Text style={[styles.emptyTitle, { color: currentInk }]}>
              {activeFilter === 'active' ? 'No Active Requests' : 'No Completed Requests'}
            </Text>
            <Text style={[styles.emptySubtitle, { color: currentSubtext }]}>
              {activeFilter === 'active'
                ? 'Tap "+ New Request" below to schedule assistance.'
                : 'Your completed or finalized appointments will appear here.'}
            </Text>
            {activeFilter === 'active' && (
              <TouchableOpacity
                style={[styles.createFirstBtn, { backgroundColor: Palette.secondary }]}
                onPress={() => router.push('/create-request' as never)}>
                <Ionicons name="add-circle" size={18} color={Palette.primary} style={{ marginRight: 6 }} />
                <Text style={[styles.createFirstBtnText, { color: Palette.primary }]}>Create Request</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ─── Appointment Cards (60% Card Surface + 30% Ink + 10% Accent) ─── */}
        <View style={styles.listContainer}>
          {filteredRequests.map((req) => {
            const statusConfig = getStatusBadge(req.status);
            return (
              <View
                key={req._id}
                style={[
                  styles.requestCard,
                  {
                    backgroundColor: currentCard,
                    borderColor: currentBorder,
                  },
                ]}>
                {/* Header: Category (30% Blue Tint) & Status (10% Accent) */}
                <View style={styles.cardHeader}>
                  <View
                    style={[
                      styles.categoryBadge,
                      {
                        backgroundColor: isDark
                          ? 'rgba(31, 92, 150, 0.2)'
                          : Palette.blueTint,
                      },
                    ]}>
                    <Text style={[styles.categoryText, { color: Palette.secondary }]}>
                      {req.taskType || 'Assistance'}
                    </Text>
                  </View>

                  <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
                    <Text style={[styles.statusText, { color: statusConfig.text }]}>
                      {statusConfig.label}
                    </Text>
                  </View>
                </View>

                {/* 30% Ink Title */}
                <Text style={[styles.cardTitle, { color: currentInk }]}>{req.title}</Text>

                {/* 60% Meta Text */}
                <View style={styles.metaRow}>
                  <Text style={[styles.metaText, { color: currentSubtext }]}>
                    📅 {req.preferredTime || (req.date ? new Date(req.date).toLocaleDateString() : 'As soon as possible')}
                  </Text>
                  {req.location ? (
                    <Text style={[styles.metaText, { color: currentSubtext }]} numberOfLines={1}>
                      📍 {req.location}
                    </Text>
                  ) : null}
                  {req.contactNumber ? (
                    <Text style={[styles.metaText, { color: Palette.secondary, fontWeight: '700' }]}>
                      📞 {req.contactNumber}
                    </Text>
                  ) : null}
                  {req.description ? (
                    <Text style={[styles.metaText, { color: currentSubtext, fontStyle: 'italic' }]} numberOfLines={2}>
                      📝 {req.description}
                    </Text>
                  ) : null}
                </View>

                {/* Footer Actions */}
                <View style={[styles.cardFooter, { borderTopColor: currentBorder }]}>
                  <Text style={[styles.footerHelperText, { color: currentSubtext }]}>
                    👤 {req.assignedVolunteerName || 'Finding volunteer...'}
                  </Text>

                  <View style={styles.cardActions}>
                    {/* 30% Secondary Button: Reschedule */}
                    <TouchableOpacity
                      style={[
                        styles.rescheduleBtn,
                        {
                          borderColor: Palette.secondary,
                          backgroundColor: isDark ? 'rgba(31, 92, 150, 0.15)' : Palette.blueTint,
                        },
                      ]}
                      onPress={() => handleEditRequest(req._id)}>
                      <Ionicons
                        name="calendar-outline"
                        size={13}
                        color={Palette.secondary}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.rescheduleBtnText, { color: Palette.secondary }]}>
                        Reschedule
                      </Text>
                    </TouchableOpacity>

                    {/* 10% Accent Button: Cancel */}
                    <TouchableOpacity
                      style={[
                        styles.cancelBtn,
                        {
                          borderColor: Palette.accent,
                          backgroundColor: isDark ? 'rgba(224, 138, 60, 0.15)' : 'rgba(224, 138, 60, 0.08)',
                        },
                      ]}
                      onPress={() => handleDeleteRequest(req._id)}>
                      <Ionicons
                        name="close-circle-outline"
                        size={13}
                        color={Palette.accent}
                        style={{ marginRight: 4 }}
                      />
                      <Text style={[styles.cancelBtnText, { color: Palette.accent }]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ─── 30% Secondary Floating Action Button (#1F5C96) ─── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: Palette.secondary }]}
        onPress={() => router.push('/create-request' as never)}
        activeOpacity={0.85}>
        <Ionicons name="add" size={28} color={Palette.primary} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  titleRow: {
    marginTop: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleTextContainer: {
    flex: 1,
  },
  calendarNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  calendarNavText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  heroBanner: {
    borderRadius: 20,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#1F5C96',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroBannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  heroBannerSubtitle: {
    fontSize: 14,
    color: '#E3EEF9',
    lineHeight: 20,
    marginBottom: 16,
  },
  heroBannerBtn: {
    borderRadius: 25,
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  heroBannerBtnText: {
    fontSize: 15,
    fontWeight: '700',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 14,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  createFirstBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 18,
  },
  createFirstBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  listContainer: {
    gap: 14,
  },
  requestCard: {
    borderRadius: 16,
    borderWidth: 1.2,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  ratedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  ratedBadgeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  ratedScoreText: {
    fontSize: 12,
    fontWeight: '700',
  },
  ratedCommentPreview: {
    fontSize: 12,
    fontStyle: 'italic',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  footerHelperText: {
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  rescheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  rescheduleBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 96,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#1F5C96',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
});
