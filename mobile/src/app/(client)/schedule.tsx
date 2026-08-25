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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useFocusEffect } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Palette, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest } from '@/types/appointment';

type FilterType = 'All' | 'Upcoming' | 'Completed';

export default function MyAppointmentsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
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

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const isDark = scheme === 'dark';
  const cardBg = isDark ? '#1E1E1E' : Palette.surface;
  const borderColor = isDark ? '#333333' : Palette.border;
  const primaryColor = Palette.secondary; // #1F5C96
  const accentColor = Palette.accent; // #E08A3C
  const blueTint = isDark ? '#1E2D3B' : Palette.blueTint;

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
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

      // If scheduled in less than 2 hours from now
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

  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const parts = dateStr.split(' ');
    if (parts.length > 2) {
       return parts.slice(0, 3).join(' ');
    }
    return dateStr;
  };

  const formatTimeStr = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const parts = dateStr.split(' ');
    if (parts.length > 2) {
       return parts.slice(3).join(' ') || 'TBD';
    }
    return dateStr;
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : Palette.primary }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          My Appointments
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: cardBg, borderColor }]}>
          <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search"
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
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText type="default" style={styles.emptyText}>No appointments found.</ThemedText>
          </View>
        ) : (
          filteredRequests.map((item) => {
            const statusStr = item.status ? String(item.status) : 'pending';
            const formattedStatus = statusStr.charAt(0).toUpperCase() + statusStr.slice(1);
            const dateDisplay = item.date
              ? new Date(item.date).toLocaleDateString()
              : formatDateStr(item.preferredTime);

            return (
              <View key={item._id || Math.random().toString()} style={[styles.card, { backgroundColor: cardBg, borderColor }]}>
                <ThemedText type="subtitle" style={styles.cardTitle}>
                  {item.title ? String(item.title) : 'Assistance Request'}
                </ThemedText>
                
                <View style={styles.cardDetailRow}>
                  <ThemedText style={styles.cardDetailLabel}>DATE </ThemedText>
                  <ThemedText style={styles.cardDetailValue}>
                    {String(dateDisplay)}
                  </ThemedText>
                </View>
                <View style={styles.cardDetailRow}>
                  <ThemedText style={styles.cardDetailLabel}>TIME </ThemedText>
                  <ThemedText style={styles.cardDetailValue}>
                    {String(formatTimeStr(item.preferredTime))}
                  </ThemedText>
                </View>
                {item.location ? (
                  <View style={styles.cardDetailRow}>
                    <ThemedText style={styles.cardDetailLabel}>LOCATION </ThemedText>
                    <ThemedText style={styles.cardDetailValue} numberOfLines={1}>
                      {String(item.location)}
                    </ThemedText>
                  </View>
                ) : null}
                {item.contactNumber ? (
                  <View style={styles.cardDetailRow}>
                    <ThemedText style={styles.cardDetailLabel}>PHONE </ThemedText>
                    <ThemedText style={[styles.cardDetailValue, { color: primaryColor, fontWeight: '700' }]}>
                      {String(item.contactNumber)}
                    </ThemedText>
                  </View>
                ) : null}
                
                <View style={styles.cardFooter}>
                  <View style={[styles.statusBadge, { backgroundColor: blueTint, borderColor: primaryColor }]}>
                    <ThemedText style={[styles.statusText, { color: primaryColor }]}>
                      {formattedStatus}
                    </ThemedText>
                  </View>
                  <View style={styles.actionButtons}>
                    <TouchableOpacity style={[styles.actionButton, { borderColor: primaryColor, backgroundColor: blueTint }]} onPress={() => handleEditRequest(item)}>
                      <Ionicons name="calendar-outline" size={14} color={primaryColor} style={{ marginRight: 4 }} />
                      <ThemedText style={[styles.actionButtonText, { color: primaryColor }]}>Reschedule</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { borderColor: '#E08A3C' }]} onPress={() => handleDeleteRequest(item._id)}>
                      <Ionicons name="close-circle-outline" size={14} color="#E08A3C" style={{ marginRight: 4 }} />
                      <ThemedText style={[styles.actionButtonText, { color: '#E08A3C' }]}>Cancel</ThemedText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: primaryColor, borderColor: primaryColor, borderWidth: 1 }]} 
        onPress={() => router.push('/create-request')}
      >
        <Ionicons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
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
    fontSize: 16,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
  },
  filterChip: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    fontWeight: '700',
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
    fontSize: 16,
  },
  card: {
    borderWidth: 1.5,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  cardDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardDetailLabel: {
    fontSize: 14,
    fontWeight: '600',
    width: 90,
  },
  cardDetailValue: {
    fontSize: 14,
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  statusText: {
    fontSize: 13,
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
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});
