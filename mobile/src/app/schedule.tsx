import React, { useState, useEffect } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest, TaskType, UrgencyLevel } from '@/types/appointment';

const TASK_TYPES: { type: TaskType; icon: string; subtitle: string; color: string }[] = [
  { type: 'Grocery Shopping', icon: '🛒', subtitle: 'Food & Essentials Supplies', color: '#10B981' },
  { type: 'Medical Transport', icon: '🏥', subtitle: 'Rides to Clinic / Pharmacy', color: '#EF4444' },
  { type: 'Companionship', icon: '🤝', subtitle: 'Walks, Conversations & Visits', color: '#8B5CF6' },
  { type: 'Housekeeping & Repairs', icon: '🧹', subtitle: 'Light Home Maintenance', color: '#F59E0B' },
  { type: 'Tech Support', icon: '📱', subtitle: 'Phone, Tablet & TV Setup', color: '#3B82F6' },
  { type: 'Meal Preparation', icon: '🍲', subtitle: 'Cooking & Hot Meal Delivery', color: '#EC4899' },
  { type: 'Pet Care', icon: '🐾', subtitle: 'Dog Walking & Pet Feeding', color: '#14B8A6' },
  { type: 'Gardening & Yard', icon: '🌱', subtitle: 'Lawn Care & Plant Watering', color: '#84CC16' },
  { type: 'Bill Payment & Errands', icon: '📫', subtitle: 'Post Office, Bank & Bills', color: '#6366F1' },
  { type: 'Mobility & Walking', icon: '🚶', subtitle: 'Exercise & Outdoor Escort', color: '#06B6D4' },
  { type: 'Other', icon: '💡', subtitle: 'General Helping Hand', color: '#6B7280' },
];

const PRESET_TIMES = [
  'Today at 2:00 PM',
  'Tomorrow at 10:00 AM',
  'Tomorrow at 3:00 PM',
  'This Weekend (Morning)',
];

const PRESET_LOCATIONS = [
  'Home Address',
  'Local Grocery Market',
  'Community Health Clinic',
];

export default function ScheduleScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Active Tab: 'create' | 'my_requests' | 'volunteer_feed'
  const [activeTab, setActiveTab] = useState<'create' | 'my_requests' | 'volunteer_feed'>('create');

  // Custom Reusable Hook for Appointments CRUD State
  const {
    requests,
    loading,
    submitting,
    createRequest,
    acceptRequest,
    deleteRequest,
  } = useAppointments();

  // Form State for Request Creation
  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>('Grocery Shopping');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [preferredTime, setPreferredTime] = useState('Tomorrow at 10:00 AM');
  const [location, setLocation] = useState('Home Address');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Submit Handler for Elderly Request Creation
  const handleCreateRequest = async () => {
    if (!description.trim() && !title.trim()) {
      Alert.alert('Details Required', 'Please enter a short title or description for your request.');
      return;
    }

    setSuccessBanner(null);

    const newRequest = await createRequest({
      taskType: selectedTaskType,
      title: title.trim() || `${selectedTaskType} Assistance`,
      description: description.trim(),
      preferredTime: preferredTime.trim() || 'As soon as possible',
      location: location.trim() || 'Home',
      urgency,
    });

    if (newRequest) {
      setTitle('');
      setDescription('');
      setSuccessBanner(`Your "${newRequest.taskType}" request has been posted successfully! Volunteers nearby will be notified.`);
      setTimeout(() => setSuccessBanner(null), 5000);
    }
  };

  // Volunteer Accepts Request
  const handleAcceptRequest = async (id: string) => {
    const success = await acceptRequest(id);
    if (success) {
      Alert.alert('Success', 'Thank you! You have accepted this assistance request.');
    }
  };

  // Delete / Cancel Request
  const handleDeleteRequest = async (id: string) => {
    await deleteRequest(id);
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <ThemedText type="subtitle" style={styles.headerTitle}>
              Scheduling & Appointments
            </ThemedText>
            <View style={styles.memberTagBadge}>
              <ThemedText style={styles.memberTagText}>Member 3 • IT23594586</ThemedText>
            </View>
          </View>
          <ThemedText type="small" themeColor="textSecondary">
            Location & Volunteer Matching Assistance Portal
          </ThemedText>
        </View>

        {/* Tab Selector Buttons */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'create' && styles.tabButtonActive]}
            onPress={() => setActiveTab('create')}
            activeOpacity={0.8}>
            <ThemedText style={[styles.tabText, activeTab === 'create' && styles.tabTextActive]}>
              ➕ New Request
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'my_requests' && styles.tabButtonActive]}
            onPress={() => setActiveTab('my_requests')}
            activeOpacity={0.8}>
            <ThemedText style={[styles.tabText, activeTab === 'my_requests' && styles.tabTextActive]}>
              📋 My Requests ({requests.length})
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'volunteer_feed' && styles.tabButtonActive]}
            onPress={() => setActiveTab('volunteer_feed')}
            activeOpacity={0.8}>
            <ThemedText style={[styles.tabText, activeTab === 'volunteer_feed' && styles.tabTextActive]}>
              🤝 Nearby Open ({pendingRequests.length})
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Success Banner Overlay */}
        {successBanner && (
          <View style={styles.successBanner}>
            <ThemedText style={styles.successBannerText}>✅ {successBanner}</ThemedText>
          </View>
        )}

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          {/* TAB 1: CREATE REQUEST (ELDERLY USER STORY) */}
          {activeTab === 'create' && (
            <View style={styles.formWrapper}>
              <ThemedText type="subtitle" style={styles.sectionHeading}>
                Request Assistance
              </ThemedText>

              {/* 1. Task Type Selector */}
              <ThemedText type="smallBold" style={styles.fieldLabel}>
                1. Select Task Type
              </ThemedText>
              <View style={styles.taskTypeGrid}>
                {TASK_TYPES.map(item => {
                  const isSelected = selectedTaskType === item.type;
                  return (
                    <TouchableOpacity
                      key={item.type}
                      style={[
                        styles.taskTypeCard,
                        { borderColor: isSelected ? item.color : '#E5E7EB' },
                        isSelected && styles.taskTypeCardSelected,
                      ]}
                      onPress={() => setSelectedTaskType(item.type)}
                      activeOpacity={0.7}>
                      <ThemedText style={styles.taskTypeIcon}>{item.icon}</ThemedText>
                      <View style={styles.taskTypeInfo}>
                        <ThemedText type="smallBold" style={{ color: isSelected ? item.color : colors.text }}>
                          {item.type}
                        </ThemedText>
                        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 11 }}>
                          {item.subtitle}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* 2. Request Title / Headline */}
              <ThemedText type="smallBold" style={styles.fieldLabel}>
                2. Request Headline / Short Title
              </ThemedText>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: '#D1D5DB' }]}
                placeholder="e.g., Weekly groceries at Sunshine Market"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />

              {/* 3. Detailed Description */}
              <ThemedText type="smallBold" style={styles.fieldLabel}>
                3. Detailed Description & Special Notes
              </ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea, { color: colors.text, borderColor: '#D1D5DB' }]}
                placeholder="Describe what you need help with (e.g. heavy items, walking assistance, specific time preferences)..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />

              {/* 4. Preferred Time */}
              <ThemedText type="smallBold" style={styles.fieldLabel}>
                4. Preferred Time
              </ThemedText>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: '#D1D5DB' }]}
                placeholder="e.g. Tomorrow at 10:00 AM"
                placeholderTextColor={colors.textSecondary}
                value={preferredTime}
                onChangeText={setPreferredTime}
              />
              {/* Quick Time Presets */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetRow}>
                {PRESET_TIMES.map(preset => (
                  <TouchableOpacity
                    key={preset}
                    style={[styles.chip, preferredTime === preset && styles.chipSelected]}
                    onPress={() => setPreferredTime(preset)}>
                    <ThemedText style={[styles.chipText, preferredTime === preset && styles.chipTextSelected]}>
                      {preset}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* 5. Location / Address */}
              <ThemedText type="smallBold" style={styles.fieldLabel}>
                5. Location / Meeting Point
              </ThemedText>
              <TextInput
                style={[styles.textInput, { color: colors.text, borderColor: '#D1D5DB' }]}
                placeholder="e.g. 45 Maple Avenue or City Clinic"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
              <View style={styles.presetWrap}>
                {PRESET_LOCATIONS.map(loc => (
                  <TouchableOpacity
                    key={loc}
                    style={[styles.chip, location === loc && styles.chipSelected]}
                    onPress={() => setLocation(loc)}>
                    <ThemedText style={[styles.chipText, location === loc && styles.chipTextSelected]}>
                      📍 {loc}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>

              {/* 6. Urgency Selector */}
              <ThemedText type="smallBold" style={styles.fieldLabel}>
                6. Priority / Urgency Level
              </ThemedText>
              <View style={styles.urgencyRow}>
                {(['Normal', 'Urgent', 'Low'] as UrgencyLevel[]).map(level => {
                  const isSelected = urgency === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyButton,
                        isSelected && level === 'Urgent' && { backgroundColor: '#EF4444' },
                        isSelected && level === 'Normal' && { backgroundColor: '#2563EB' },
                        isSelected && level === 'Low' && { backgroundColor: '#10B981' },
                      ]}
                      onPress={() => setUrgency(level)}>
                      <ThemedText style={[styles.urgencyText, isSelected && { color: '#FFFFFF' }]}>
                        {level === 'Urgent' ? '⚡ Urgent' : level === 'Normal' ? '🔵 Normal' : '🟢 Low'}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Submit Action Button */}
              <TouchableOpacity
                style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
                onPress={handleCreateRequest}
                disabled={submitting}
                activeOpacity={0.85}>
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <ThemedText style={styles.submitButtonText}>
                    📢 Post Assistance Request
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* TAB 2: MY REQUESTS */}
          {activeTab === 'my_requests' && (
            <View style={styles.listWrapper}>
              <ThemedText type="subtitle" style={styles.sectionHeading}>
                My Assistance Requests
              </ThemedText>

              {loading ? (
                <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 20 }} />
              ) : requests.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={{ fontSize: 32 }}>📭</ThemedText>
                  <ThemedText type="default">No assistance requests created yet.</ThemedText>
                  <TouchableOpacity
                    style={styles.emptyActionButton}
                    onPress={() => setActiveTab('create')}>
                    <ThemedText style={styles.emptyActionText}>Create your first request</ThemedText>
                  </TouchableOpacity>
                </View>
              ) : (
                requests.map(item => (
                  <ThemedView key={item._id} type="backgroundElement" style={styles.requestCard}>
                    <View style={styles.requestCardHeader}>
                      <View style={styles.taskTypeBadge}>
                        <ThemedText style={styles.taskTypeBadgeText}>{item.taskType}</ThemedText>
                      </View>
                      <View
                        style={[
                          styles.statusChip,
                          item.status === 'pending' && { backgroundColor: '#FEF3C7' },
                          item.status === 'accepted' && { backgroundColor: '#D1FAE5' },
                        ]}>
                        <ThemedText
                          style={[
                            styles.statusChipText,
                            item.status === 'pending' && { color: '#D97706' },
                            item.status === 'accepted' && { color: '#059669' },
                          ]}>
                          {item.status.toUpperCase()}
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText type="subtitle" style={styles.cardTitle}>
                      {item.title}
                    </ThemedText>
                    {item.description ? (
                      <ThemedText type="default" style={styles.cardDesc}>
                        {item.description}
                      </ThemedText>
                    ) : null}

                    <View style={styles.detailsGrid}>
                      <ThemedText type="small" themeColor="textSecondary">
                        ⏰ Preferred Time: <ThemedText type="smallBold">{item.preferredTime}</ThemedText>
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        📍 Location: <ThemedText type="smallBold">{item.location}</ThemedText>
                      </ThemedText>
                      {item.provider ? (
                        <ThemedText type="small" style={{ color: '#059669', marginTop: 4 }}>
                          👤 Accepted by Volunteer: <ThemedText type="smallBold">{item.provider.name || 'Nearby Volunteer'}</ThemedText>
                        </ThemedText>
                      ) : (
                        <ThemedText type="small" style={{ color: '#D97706', marginTop: 4 }}>
                          ⏳ Waiting for nearby volunteer...
                        </ThemedText>
                      )}
                    </View>

                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteRequest(item._id)}>
                      <ThemedText style={styles.deleteButtonText}>🗑 Cancel Request</ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                ))
              )}
            </View>
          )}

          {/* TAB 3: NEARBY REQUESTS (VOLUNTEER VIEW & MATCHING) */}
          {activeTab === 'volunteer_feed' && (
            <View style={styles.listWrapper}>
              <View style={styles.volunteerFeedHeader}>
                <ThemedText type="subtitle">Nearby Open Assistance Requests</ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  Volunteers can view elderly requests and accept them to assist nearby residents.
                </ThemedText>
              </View>

              {loading ? (
                <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 20 }} />
              ) : pendingRequests.length === 0 ? (
                <View style={styles.emptyState}>
                  <ThemedText style={{ fontSize: 32 }}>🎉</ThemedText>
                  <ThemedText type="default">No open pending requests nearby right now.</ThemedText>
                </View>
              ) : (
                pendingRequests.map(item => (
                  <ThemedView key={item._id} type="backgroundElement" style={styles.volunteerCard}>
                    <View style={styles.requestCardHeader}>
                      <View style={styles.taskTypeBadge}>
                        <ThemedText style={styles.taskTypeBadgeText}>{item.taskType}</ThemedText>
                      </View>
                      <View style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
                        <ThemedText style={[styles.statusChipText, { color: '#DC2626' }]}>
                          {item.urgency} Priority
                        </ThemedText>
                      </View>
                    </View>

                    <ThemedText type="subtitle" style={styles.cardTitle}>
                      {item.title}
                    </ThemedText>
                    <ThemedText type="default" style={styles.cardDesc}>
                      {item.description || 'No additional details provided.'}
                    </ThemedText>

                    <View style={styles.detailsGrid}>
                      <ThemedText type="small">
                        ⏰ Preferred Time: <ThemedText type="smallBold">{item.preferredTime}</ThemedText>
                      </ThemedText>
                      <ThemedText type="small">
                        📍 Location: <ThemedText type="smallBold">{item.location}</ThemedText>
                      </ThemedText>
                      <ThemedText type="small" themeColor="textSecondary">
                        👵 Requester: {item.requester?.name || 'Elderly Resident'}
                      </ThemedText>
                    </View>

                    <TouchableOpacity
                      style={styles.acceptButton}
                      onPress={() => handleAcceptRequest(item._id)}
                      activeOpacity={0.85}>
                      <ThemedText style={styles.acceptButtonText}>
                        🤝 Accept & Volunteer to Help
                      </ThemedText>
                    </TouchableOpacity>
                  </ThemedView>
                ))
              )}
            </View>
          )}

        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
  },
  header: {
    marginBottom: Spacing.two,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.one,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  memberTagBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  memberTagText: {
    color: '#0284C7',
    fontSize: 12,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: Spacing.three,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabButtonActive: {
    backgroundColor: '#0066CC',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  successBanner: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
  },
  successBannerText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 13,
  },
  scrollContent: {
    paddingBottom: Spacing.six,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: Spacing.three,
  },
  formWrapper: {
    gap: Spacing.two,
  },
  fieldLabel: {
    fontSize: 14,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
  taskTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  taskTypeCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    backgroundColor: '#FFFFFF',
    gap: 8,
  },
  taskTypeCardSelected: {
    backgroundColor: '#F0F9FF',
  },
  taskTypeIcon: {
    fontSize: 24,
  },
  taskTypeInfo: {
    flex: 1,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  textArea: {
    height: 90,
  },
  presetRow: {
    flexDirection: 'row',
    marginTop: 6,
  },
  presetWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
  },
  chip: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 6,
  },
  chipSelected: {
    backgroundColor: '#0066CC',
  },
  chipText: {
    fontSize: 12,
    color: '#374151',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: Spacing.four,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  listWrapper: {
    gap: Spacing.three,
  },
  requestCard: {
    padding: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
  },
  volunteerCard: {
    padding: Spacing.three,
    borderRadius: 14,
    gap: Spacing.two,
    borderLeftWidth: 4,
    borderLeftColor: '#0066CC',
  },
  volunteerFeedHeader: {
    marginBottom: Spacing.two,
  },
  requestCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTypeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskTypeBadgeText: {
    color: '#1E40AF',
    fontSize: 12,
    fontWeight: '600',
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  cardDesc: {
    fontSize: 14,
  },
  detailsGrid: {
    backgroundColor: 'rgba(0,0,0,0.03)',
    padding: 10,
    borderRadius: 8,
    gap: 4,
  },
  deleteButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  deleteButtonText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '600',
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyActionButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
