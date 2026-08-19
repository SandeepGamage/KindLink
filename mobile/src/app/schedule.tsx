import React, { useState, useMemo } from 'react';
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
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';

type FilterType = 'All' | 'Upcoming' | 'Completed';

export default function MyAppointmentsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();

  const {
    requests,
    loading,
    deleteRequest,
  } = useAppointments();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredRequests = useMemo(() => {
    return requests.filter(request => {
      // Search filter
      const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            request.taskType.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      // Status filter
      if (activeFilter === 'Upcoming') {
        return request.status === 'pending' || request.status === 'accepted';
      }
      if (activeFilter === 'Completed') {
        return request.status === 'completed';
      }
      return true; // All
    });
  }, [requests, searchQuery, activeFilter]);

  const handleDeleteRequest = (id: string) => {
    Alert.alert(
      'Delete Appointment',
      'Are you sure you want to delete this appointment?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => deleteRequest(id) },
      ]
    );
  };

  const handleEditRequest = (id: string) => {
    Alert.alert('Edit', 'Navigate to edit screen for appointment: ' + id);
  };

  // Helper to extract date and time nicely
  const formatDateStr = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const parts = dateStr.split(' ');
    if (parts.length > 2) {
       return parts.slice(0, 3).join(' '); // e.g., "Monday, October 25" -> "Monday, October 25"
    }
    return dateStr;
  };

  const formatTimeStr = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    const parts = dateStr.split(' ');
    if (parts.length > 2) {
       return parts.slice(3).join(' ') || 'TBD'; // gets "6-7pm"
    }
    return dateStr;
  };

  const isDark = scheme === 'dark';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: isDark ? '#121212' : '#FFFFFF' }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          My Appointments
        </ThemedText>
        <View style={{ width: 24 }} /> {/* Empty space for centering */}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchInputWrapper, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#000000' }]}>
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
                { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#000000' },
                isActive && { backgroundColor: '#1769AA', borderColor: '#1769AA' }
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
          <ActivityIndicator size="large" color="#1769AA" style={{ marginTop: 40 }} />
        ) : filteredRequests.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText type="default" style={styles.emptyText}>No appointments found.</ThemedText>
          </View>
        ) : (
          filteredRequests.map((item) => (
            <View key={item._id} style={[styles.card, { backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF', borderColor: isDark ? '#333' : '#000000' }]}>
              <ThemedText type="subtitle" style={styles.cardTitle}>
                {item.title}
              </ThemedText>
              
              <View style={styles.cardDetailRow}>
                <ThemedText style={styles.cardDetailLabel}>DATE </ThemedText>
                <ThemedText style={styles.cardDetailValue}>
                  {item.date || formatDateStr(item.preferredTime)}
                </ThemedText>
              </View>
              <View style={styles.cardDetailRow}>
                <ThemedText style={styles.cardDetailLabel}>TIME </ThemedText>
                <ThemedText style={styles.cardDetailValue}>
                  {formatTimeStr(item.preferredTime)}
                </ThemedText>
              </View>
              
              <View style={styles.cardFooter}>
                <View style={[styles.statusBadge, { borderColor: isDark ? '#333' : '#000000' }]}>
                  <ThemedText style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </ThemedText>
                </View>
                <View style={styles.actionButtons}>
                  <TouchableOpacity style={[styles.actionButton, { borderColor: isDark ? '#333' : '#000000' }]} onPress={() => handleEditRequest(item._id)}>
                    <ThemedText style={styles.actionButtonText}>Edit</ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { borderColor: isDark ? '#333' : '#000000' }]} onPress={() => handleDeleteRequest(item._id)}>
                    <ThemedText style={styles.actionButtonText}>Delete</ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity 
        style={[styles.fab, { backgroundColor: '#1769AA', borderColor: '#1769AA', borderWidth: 1 }]} 
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
    width: 50,
  },
  cardDetailValue: {
    fontSize: 14,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  statusBadge: {
    borderWidth: 1.5,
    borderRadius: 6,
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
    borderWidth: 1.5,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
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
