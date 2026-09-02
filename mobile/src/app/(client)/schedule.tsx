import React, { useState, useMemo, useCallback } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Palette } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest, TaskType } from '@/types/appointment';

type ViewMode = 'agenda' | 'list';
type FilterType = 'All' | 'Upcoming' | 'Completed';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/** Formats a Date object to YYYY-MM-DD */
function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Parses date key from AssistanceRequest */
function getAppointmentDateKey(item: AssistanceRequest): string | null {
  if (item.date) {
    const d = new Date(item.date);
    if (!isNaN(d.getTime())) {
      return toDateKey(d);
    }
  }

  if (item.preferredTime) {
    const d = new Date(item.preferredTime);
    if (!isNaN(d.getTime())) {
      return toDateKey(d);
    }
  }

  if (item.createdAt) {
    const d = new Date(item.createdAt);
    if (!isNaN(d.getTime())) {
      return toDateKey(d);
    }
  }

  return null;
}

/** Get task icon */
function getTaskIcon(taskType: string): keyof typeof Ionicons.glyphMap {
  switch (taskType) {
    case 'Grocery Shopping': return 'cart-outline';
    case 'Medical Transport': return 'car-outline';
    case 'Companionship': return 'heart-outline';
    case 'Housekeeping & Repairs': return 'hammer-outline';
    case 'Tech Support': return 'desktop-outline';
    case 'Meal Preparation': return 'restaurant-outline';
    case 'Pet Care': return 'paw-outline';
    case 'Gardening & Yard': return 'leaf-outline';
    case 'Bill Payment & Errands': return 'cash-outline';
    case 'Mobility & Walking': return 'walk-outline';
    default: return 'calendar-outline';
  }
}

export default function ScheduleAppointmentsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    requests,
    loading,
    deleteRequest,
    refreshRequests,
  } = useAppointments();

  useFocusEffect(
    useCallback(() => {
      refreshRequests();
    }, [refreshRequests])
  );

  // Mode & Filters
  const [viewMode, setViewMode] = useState<ViewMode>('agenda');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  // Calendar State
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => toDateKey(today), [today]);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [isMonthExpanded, setIsMonthExpanded] = useState(true);

  const selectedDateKey = useMemo(() => toDateKey(selectedDate), [selectedDate]);

  // Styling Tokens (KindLink 60-30-10 Palette)
  const isDark = scheme === 'dark';
  const backgroundColor = isDark ? '#0D151C' : '#F4F7FA';
  const cardBg = isDark ? '#141E28' : '#FFFFFF';
  const borderColor = isDark ? '#233240' : '#DCE6EF';
  const primaryColor = Palette.secondary; // #1F5C96
  const accentColor = Palette.accent; // #E08A3C
  const blueTint = isDark ? '#1E2D3B' : '#E3EEF9';

  // Map appointments to date keys
  const appointmentsByDate = useMemo(() => {
    const map: Record<string, AssistanceRequest[]> = {};
    for (const req of requests) {
      const key = getAppointmentDateKey(req);
      if (key) {
        if (!map[key]) map[key] = [];
        map[key].push(req);
      }
    }
    return map;
  }, [requests]);

  // Appointments for the selected date in Agenda view
  const selectedDateAppointments = useMemo(() => {
    return appointmentsByDate[selectedDateKey] || [];
  }, [appointmentsByDate, selectedDateKey]);

  // Filtered requests for List view
  const filteredListRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch =
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.taskType.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (activeFilter === 'Upcoming') {
        return request.status === 'pending' || request.status === 'accepted';
      }
      if (activeFilter === 'Completed') {
        return request.status === 'completed';
      }
      return true;
    });
  }, [requests, searchQuery, activeFilter]);

  // Calendar Navigation
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleJumpToToday = () => {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(now);
  };

  // Calendar Days Computation
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: {
      date: Date;
      key: string;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
      appointmentsCount: number;
      hasUrgent: boolean;
    }[] = [];

    // Prev month padding
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const key = toDateKey(d);
      const appts = appointmentsByDate[key] || [];
      days.push({
        date: d,
        key,
        isCurrentMonth: false,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        appointmentsCount: appts.length,
        hasUrgent: appts.some(a => a.urgency === 'Urgent'),
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const d = new Date(year, month, day);
      const key = toDateKey(d);
      const appts = appointmentsByDate[key] || [];
      days.push({
        date: d,
        key,
        isCurrentMonth: true,
        isToday: key === todayKey,
        isSelected: key === selectedDateKey,
        appointmentsCount: appts.length,
        hasUrgent: appts.some(a => a.urgency === 'Urgent'),
      });
    }

    // Next month padding to fill complete weeks (multiples of 7)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const d = new Date(year, month + 1, day);
        const key = toDateKey(d);
        const appts = appointmentsByDate[key] || [];
        days.push({
          date: d,
          key,
          isCurrentMonth: false,
          isToday: key === todayKey,
          isSelected: key === selectedDateKey,
          appointmentsCount: appts.length,
          hasUrgent: appts.some(a => a.urgency === 'Urgent'),
        });
      }
    }

    return days;
  }, [currentMonth, appointmentsByDate, todayKey, selectedDateKey]);

  // Week view slice if collapsed
  const visibleCalendarDays = useMemo(() => {
    if (isMonthExpanded) return calendarDays;
    // Show the week containing the selected date
    const selectedIdx = calendarDays.findIndex(d => d.key === selectedDateKey);
    if (selectedIdx === -1) return calendarDays.slice(0, 7);
    const weekStartIdx = Math.floor(selectedIdx / 7) * 7;
    return calendarDays.slice(weekStartIdx, weekStartIdx + 7);
  }, [calendarDays, isMonthExpanded, selectedDateKey]);

  // Appointment Actions
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

  const handleEditRequest = (item: AssistanceRequest) => {
    if (item.status === 'completed') {
      Alert.alert('Cannot Reschedule', 'This appointment has already been completed.');
      return;
    }
    if (item.status === 'cancelled') {
      Alert.alert('Cannot Reschedule', 'This appointment has been cancelled.');
      return;
    }

    if (item.date) {
      const apptTime = new Date(item.date).getTime();
      const now = Date.now();
      const diffHours = (apptTime - now) / (1000 * 60 * 60);

      if (diffHours > 0 && diffHours < 2) {
        Alert.alert(
          'Short Notice Warning',
          'This appointment is scheduled in less than 2 hours. Your volunteer may already be on their way. Are you sure you want to reschedule?',
          [
            { text: 'Keep Appointment', style: 'cancel' },
            {
              text: 'Reschedule',
              onPress: () => router.push({ pathname: '/edit-request', params: { id: item._id } }),
            },
          ]
        );
        return;
      }
    }

    router.push({ pathname: '/edit-request', params: { id: item._id } });
  };

  const formatHeaderDate = (date: Date) => {
    const isToday = toDateKey(date) === todayKey;
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = toDateKey(date) === toDateKey(tomorrow);

    const prefix = isToday ? 'Today • ' : isTomorrow ? 'Tomorrow • ' : '';
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    return `${prefix}${formatted}`;
  };

  const formatTimeStr = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const parts = dateStr.split(' ');
    if (parts.length > 2) {
      return parts.slice(3).join(' ') || parts.slice(0, 3).join(' ');
    }
    return dateStr;
  };

  return (
    <View style={[styles.root, { backgroundColor, paddingTop: Math.max(insets.top, 16) }]}>
      {/* ─── Top Header ─── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Schedule & Agenda
        </ThemedText>
        <TouchableOpacity
          style={[styles.todayButton, { backgroundColor: blueTint, borderColor: primaryColor }]}
          onPress={handleJumpToToday}
        >
          <Ionicons name="today-outline" size={16} color={primaryColor} />
          <ThemedText style={[styles.todayButtonText, { color: primaryColor }]}>Today</ThemedText>
        </TouchableOpacity>
      </View>

      {/* ─── Segmented Mode Toggle (Agenda vs List) ─── */}
      <View style={styles.modeToggleContainer}>
        <View style={[styles.modeToggleWrap, { backgroundColor: cardBg, borderColor }]}>
          <TouchableOpacity
            style={[styles.modeTab, viewMode === 'agenda' && { backgroundColor: primaryColor }]}
            onPress={() => setViewMode('agenda')}
          >
            <Ionicons
              name="calendar"
              size={16}
              color={viewMode === 'agenda' ? '#FFFFFF' : colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.modeTabText,
                { color: viewMode === 'agenda' ? '#FFFFFF' : colors.textSecondary },
                viewMode === 'agenda' && { fontWeight: '700' },
              ]}
            >
              Calendar & Agenda
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.modeTab, viewMode === 'list' && { backgroundColor: primaryColor }]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'list' ? '#FFFFFF' : colors.textSecondary}
            />
            <ThemedText
              style={[
                styles.modeTabText,
                { color: viewMode === 'list' ? '#FFFFFF' : colors.textSecondary },
                viewMode === 'list' && { fontWeight: '700' },
              ]}
            >
              List View
            </ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {viewMode === 'agenda' ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* ─── Interactive Month / Week Calendar ─── */}
          <View style={[styles.calendarCard, { backgroundColor: cardBg, borderColor }]}>
            {/* Month Header with navigation */}
            <View style={styles.monthNavRow}>
              <View style={styles.monthTitleWrapper}>
                <ThemedText style={styles.monthTitle}>
                  {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </ThemedText>
                <TouchableOpacity
                  style={styles.expandToggle}
                  onPress={() => setIsMonthExpanded(!isMonthExpanded)}
                >
                  <Ionicons
                    name={isMonthExpanded ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.textSecondary}
                  />
                  <ThemedText style={[styles.expandToggleText, { color: colors.textSecondary }]}>
                    {isMonthExpanded ? 'Month' : 'Week'}
                  </ThemedText>
                </TouchableOpacity>
              </View>

              <View style={styles.monthNavControls}>
                <TouchableOpacity
                  style={[styles.navArrowBtn, { borderColor }]}
                  onPress={handlePrevMonth}
                >
                  <Ionicons name="chevron-back" size={18} color={colors.text} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.navArrowBtn, { borderColor }]}
                  onPress={handleNextMonth}
                >
                  <Ionicons name="chevron-forward" size={18} color={colors.text} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Weekdays Row */}
            <View style={styles.weekdaysRow}>
              {WEEKDAYS.map((wd, i) => (
                <ThemedText
                  key={wd}
                  style={[
                    styles.weekdayText,
                    { color: i === 0 || i === 6 ? accentColor : colors.textSecondary },
                  ]}
                >
                  {wd}
                </ThemedText>
              ))}
            </View>

            {/* Days Grid */}
            <View style={styles.daysGrid}>
              {visibleCalendarDays.map((item) => {
                return (
                  <TouchableOpacity
                    key={item.key}
                    style={styles.dayCell}
                    onPress={() => setSelectedDate(item.date)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.dayCircle,
                        item.isSelected && { backgroundColor: primaryColor },
                        item.isToday && !item.isSelected && {
                          borderWidth: 1.5,
                          borderColor: accentColor,
                        },
                      ]}
                    >
                      <ThemedText
                        style={[
                          styles.dayNumberText,
                          {
                            color: item.isSelected
                              ? '#FFFFFF'
                              : item.isCurrentMonth
                              ? colors.text
                              : colors.textSecondary + '66',
                          },
                          item.isSelected && { fontWeight: '700' },
                          item.isToday && !item.isSelected && { color: accentColor, fontWeight: '700' },
                        ]}
                      >
                        {item.date.getDate()}
                      </ThemedText>
                    </View>

                    {/* Appointment indicator dot(s) */}
                    <View style={styles.dotContainer}>
                      {item.appointmentsCount > 0 ? (
                        <View
                          style={[
                            styles.apptDot,
                            {
                              backgroundColor: item.isSelected
                                ? '#FFFFFF'
                                : item.hasUrgent
                                ? accentColor
                                : primaryColor,
                            },
                          ]}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* ─── Daily Agenda Section ─── */}
          <View style={styles.agendaSection}>
            <View style={styles.agendaHeaderRow}>
              <View style={{ flex: 1 }}>
                <ThemedText type="subtitle" style={styles.agendaDateTitle}>
                  {formatHeaderDate(selectedDate)}
                </ThemedText>
                <ThemedText style={[styles.agendaSubtitle, { color: colors.textSecondary }]}>
                  {selectedDateAppointments.length === 0
                    ? 'No appointments scheduled'
                    : `${selectedDateAppointments.length} appointment${selectedDateAppointments.length > 1 ? 's' : ''}`}
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.addForDateBtn, { backgroundColor: primaryColor }]}
                onPress={() =>
                  router.push({
                    pathname: '/create-request',
                    params: { initialDate: selectedDateKey },
                  })
                }
              >
                <Ionicons name="add" size={16} color="#FFFFFF" />
                <ThemedText style={styles.addForDateBtnText}>Schedule</ThemedText>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 24 }} />
            ) : selectedDateAppointments.length === 0 ? (
              /* Empty Agenda State */
              <View style={[styles.agendaEmptyCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={[styles.emptyIconCircle, { backgroundColor: blueTint }]}>
                  <Ionicons name="calendar-outline" size={32} color={primaryColor} />
                </View>
                <ThemedText style={styles.emptyTitle}>Free Day</ThemedText>
                <ThemedText style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  You don’t have any care appointments scheduled for this date.
                </ThemedText>
                <TouchableOpacity
                  style={[styles.emptyActionBtn, { borderColor: primaryColor }]}
                  onPress={() =>
                    router.push({
                      pathname: '/create-request',
                      params: { initialDate: selectedDateKey },
                    })
                  }
                >
                  <Ionicons name="add-circle-outline" size={18} color={primaryColor} />
                  <ThemedText style={[styles.emptyActionBtnText, { color: primaryColor }]}>
                    Book an Appointment for this Day
                  </ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              /* Daily Timeline */
              <View style={styles.timelineList}>
                {selectedDateAppointments.map((item, idx) => {
                  const statusStr = item.status ? String(item.status) : 'pending';
                  const isAccepted = statusStr === 'accepted';
                  const isCompleted = statusStr === 'completed';
                  const formattedStatus = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
                  const isLast = idx === selectedDateAppointments.length - 1;

                  return (
                    <View key={item._id || idx.toString()} style={styles.timelineItem}>
                      {/* Left timeline axis */}
                      <View style={styles.timelineAxis}>
                        <View
                          style={[
                            styles.timelineNode,
                            {
                              backgroundColor: isCompleted
                                ? '#10B981'
                                : isAccepted
                                ? primaryColor
                                : accentColor,
                            },
                          ]}
                        />
                        {!isLast && <View style={[styles.timelineLine, { backgroundColor: borderColor }]} />}
                      </View>

                      {/* Right timeline card */}
                      <View style={[styles.agendaCard, { backgroundColor: cardBg, borderColor }]}>
                        <View style={styles.agendaCardHeader}>
                          <View style={styles.taskBadgeWrap}>
                            <Ionicons
                              name={getTaskIcon(item.taskType)}
                              size={16}
                              color={primaryColor}
                              style={{ marginRight: 6 }}
                            />
                            <ThemedText style={[styles.taskBadgeText, { color: primaryColor }]}>
                              {item.taskType}
                            </ThemedText>
                          </View>

                          <View
                            style={[
                              styles.urgencyBadge,
                              {
                                backgroundColor:
                                  item.urgency === 'Urgent'
                                    ? 'rgba(224, 138, 60, 0.15)'
                                    : blueTint,
                              },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.urgencyText,
                                {
                                  color:
                                    item.urgency === 'Urgent' ? accentColor : primaryColor,
                                },
                              ]}
                            >
                              {item.urgency || 'Normal'}
                            </ThemedText>
                          </View>
                        </View>

                        <ThemedText type="subtitle" style={styles.agendaCardTitle}>
                          {item.title || `${item.taskType} Assistance`}
                        </ThemedText>

                        {item.description ? (
                          <ThemedText
                            style={[styles.agendaCardDesc, { color: colors.textSecondary }]}
                            numberOfLines={2}
                          >
                            {item.description}
                          </ThemedText>
                        ) : null}

                        {/* Details */}
                        <View style={styles.detailsGroup}>
                          <View style={styles.detailRow}>
                            <Ionicons name="time-outline" size={15} color={colors.textSecondary} />
                            <ThemedText style={[styles.detailText, { color: colors.text }]}>
                              {formatTimeStr(item.preferredTime)}
                            </ThemedText>
                          </View>

                          {item.location ? (
                            <View style={styles.detailRow}>
                              <Ionicons name="location-outline" size={15} color={colors.textSecondary} />
                              <ThemedText
                                style={[styles.detailText, { color: colors.text }]}
                                numberOfLines={1}
                              >
                                {item.location}
                              </ThemedText>
                            </View>
                          ) : null}

                          {item.provider?.name || item.assignedVolunteerName ? (
                            <View style={styles.detailRow}>
                              <Ionicons name="person-outline" size={15} color={primaryColor} />
                              <ThemedText style={[styles.detailText, { color: primaryColor, fontWeight: '600' }]}>
                                Volunteer: {item.provider?.name || item.assignedVolunteerName}
                              </ThemedText>
                            </View>
                          ) : null}
                        </View>

                        {/* Footer & Actions */}
                        <View style={styles.agendaCardFooter}>
                          <View
                            style={[
                              styles.statusPill,
                              {
                                backgroundColor: isCompleted
                                  ? '#DCFCE7'
                                  : isAccepted
                                  ? blueTint
                                  : 'rgba(224, 138, 60, 0.15)',
                              },
                            ]}
                          >
                            <ThemedText
                              style={[
                                styles.statusPillText,
                                {
                                  color: isCompleted
                                    ? '#15803D'
                                    : isAccepted
                                    ? primaryColor
                                    : accentColor,
                                },
                              ]}
                            >
                              {formattedStatus}
                            </ThemedText>
                          </View>

                          <View style={styles.actionRow}>
                            <TouchableOpacity
                              style={[styles.agendaActionBtn, { borderColor: primaryColor, backgroundColor: blueTint }]}
                              onPress={() => handleEditRequest(item)}
                            >
                              <Ionicons name="calendar-outline" size={13} color={primaryColor} style={{ marginRight: 4 }} />
                              <ThemedText style={[styles.agendaActionBtnText, { color: primaryColor }]}>Reschedule</ThemedText>
                            </TouchableOpacity>

                            <TouchableOpacity
                              style={[styles.agendaActionBtn, { borderColor: accentColor }]}
                              onPress={() => handleDeleteRequest(item._id)}
                            >
                              <Ionicons name="close-circle-outline" size={13} color={accentColor} style={{ marginRight: 4 }} />
                              <ThemedText style={[styles.agendaActionBtnText, { color: accentColor }]}>Cancel</ThemedText>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}
          </View>
        </ScrollView>
      ) : (
        /* ─── List View (Preserved functionality) ─── */
        <View style={{ flex: 1 }}>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputWrapper, { backgroundColor: cardBg, borderColor }]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Search appointments..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>

          {/* Filter Chips */}
          <View style={styles.filtersContainer}>
            {(['All', 'Upcoming', 'Completed'] as FilterType[]).map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <TouchableOpacity
                  key={filter}
                  style={[
                    styles.filterChip,
                    { backgroundColor: cardBg, borderColor },
                    isActive && { backgroundColor: primaryColor, borderColor: primaryColor }
                  ]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <ThemedText style={[styles.filterText, isActive && { color: '#FFFFFF', fontWeight: '700' }]}>
                    {filter}
                  </ThemedText>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Appointments List */}
          <ScrollView
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {loading ? (
              <ActivityIndicator size="large" color={primaryColor} style={{ marginTop: 40 }} />
            ) : filteredListRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText type="default" style={styles.emptyText}>No appointments found.</ThemedText>
              </View>
            ) : (
              filteredListRequests.map((item) => {
                const statusStr = item.status ? String(item.status) : 'pending';
                const formattedStatus = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
                const dateDisplay = item.date
                  ? new Date(item.date).toLocaleDateString()
                  : item.preferredTime;

                return (
                  <View key={item._id || Math.random().toString()} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                    <ThemedText type="subtitle" style={styles.cardTitle}>
                      {item.title ? String(item.title) : 'Assistance Request'}
                    </ThemedText>

                    <View style={styles.cardDetailRow}>
                      <ThemedText style={styles.cardDetailLabel}>DATE </ThemedText>
                      <ThemedText style={styles.cardDetailValue}>{String(dateDisplay)}</ThemedText>
                    </View>
                    <View style={styles.cardDetailRow}>
                      <ThemedText style={styles.cardDetailLabel}>TIME </ThemedText>
                      <ThemedText style={styles.cardDetailValue}>{String(formatTimeStr(item.preferredTime))}</ThemedText>
                    </View>
                    {item.location ? (
                      <View style={styles.cardDetailRow}>
                        <ThemedText style={styles.cardDetailLabel}>LOCATION </ThemedText>
                        <ThemedText style={styles.cardDetailValue} numberOfLines={1}>{String(item.location)}</ThemedText>
                      </View>
                    ) : null}

                    <View style={styles.cardFooter}>
                      <View style={[styles.statusBadge, { backgroundColor: blueTint, borderColor: primaryColor }]}>
                        <ThemedText style={[styles.statusText, { color: primaryColor }]}>
                          {formattedStatus}
                        </ThemedText>
                      </View>
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={[styles.actionButton, { borderColor: primaryColor, backgroundColor: blueTint }]}
                          onPress={() => handleEditRequest(item)}
                        >
                          <Ionicons name="calendar-outline" size={14} color={primaryColor} style={{ marginRight: 4 }} />
                          <ThemedText style={[styles.actionButtonText, { color: primaryColor }]}>Reschedule</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={[styles.actionButton, { borderColor: accentColor }]}
                          onPress={() => handleDeleteRequest(item._id)}
                        >
                          <Ionicons name="close-circle-outline" size={14} color={accentColor} style={{ marginRight: 4 }} />
                          <ThemedText style={[styles.actionButtonText, { color: accentColor }]}>Cancel</ThemedText>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </ScrollView>
        </View>
      )}

      {/* ─── Floating Action Button ─── */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: primaryColor, borderColor: primaryColor, borderWidth: 1 }]}
        onPress={() => router.push('/create-request')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  todayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  todayButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  modeToggleContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  modeToggleWrap: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 8,
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
  },
  calendarCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  monthTitleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  expandToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  expandToggleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  monthNavControls: {
    flexDirection: 'row',
    gap: 6,
  },
  navArrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekdaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E2E8F0',
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '700',
    width: 38,
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    paddingVertical: 4,
  },
  dayCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayNumberText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dotContainer: {
    height: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  apptDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  agendaSection: {
    marginTop: 4,
  },
  agendaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  agendaDateTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  agendaSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addForDateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  addForDateBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  agendaEmptyCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
    maxWidth: 240,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  emptyActionBtnText: {
    fontSize: 13,
    fontWeight: '700',
  },
  timelineList: {
    gap: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    gap: 12,
  },
  timelineAxis: {
    alignItems: 'center',
    width: 16,
  },
  timelineNode: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 18,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
  },
  agendaCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 4,
  },
  agendaCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  taskBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  urgencyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '700',
  },
  agendaCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  agendaCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 10,
  },
  detailsGroup: {
    gap: 6,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
  },
  agendaCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E2E8F0',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 6,
  },
  agendaActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  agendaActionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  // List View Styles
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 16,
  },
  filterChip: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyState: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#6B7280',
    fontSize: 15,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDetailLabel: {
    fontSize: 13,
    fontWeight: '600',
    width: 90,
  },
  cardDetailValue: {
    fontSize: 13,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
