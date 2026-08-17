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
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { AssistanceRequest, TaskType, UrgencyLevel } from '@/types/appointment';

const { width } = Dimensions.get('window');

const TASK_TYPES: { type: TaskType; subtitle: string; color: string }[] = [
  { type: 'Grocery Shopping', subtitle: 'Food & Essentials', color: '#10B981' },
  { type: 'Medical Transport', subtitle: 'Clinic / Pharmacy', color: '#EF4444' },
  { type: 'Companionship', subtitle: 'Walks & Visits', color: '#8B5CF6' },
  { type: 'Housekeeping & Repairs', subtitle: 'Light Maintenance', color: '#F59E0B' },
  { type: 'Tech Support', subtitle: 'Phone & TV Setup', color: '#3B82F6' },
  { type: 'Meal Preparation', subtitle: 'Cooking Delivery', color: '#EC4899' },
  { type: 'Pet Care', subtitle: 'Dog Walking & Pet Feeding', color: '#14B8A6' },
  { type: 'Gardening & Yard', subtitle: 'Lawn & Watering', color: '#84CC16' },
  { type: 'Bill Payment & Errands', subtitle: 'Post & Bank', color: '#6366F1' },
  { type: 'Mobility & Walking', subtitle: 'Outdoor Escort', color: '#06B6D4' },
  { type: 'Other', subtitle: 'Helping Hand', color: '#6B7280' },
];

const AVAILABLE_SLOTS = [
  { id: '1', date: 'Monday, October 25', time: '6-7pm' },
  { id: '2', date: 'Monday, October 25', time: '6-7pm' },
  { id: '3', date: 'Monday, October 25', time: '6-7pm' },
  { id: '4', date: 'Monday, October 25', time: '6-7pm' },
  { id: '5', date: 'Tuesday, October 26', time: '9:30-10:30am' },
  { id: '6', date: 'Tuesday, October 26', time: '9:30-10:30am' },
  { id: '7', date: 'Tuesday, October 26', time: '9:30-10:30am' },
  { id: '8', date: 'Tuesday, October 26', time: '9:30-10:30am' },
  { id: '9', date: 'Wednesday, October 27', time: '6:30-7:30pm' },
  { id: '10', date: 'Wednesday, October 27', time: '6:30-7:30pm' },
  { id: '11', date: 'Wednesday, October 27', time: '6:30-7:30pm' },
  { id: '12', date: 'Wednesday, October 27', time: '6:30-7:30pm' },
];

export default function ScheduleScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  const [activeTab, setActiveTab] = useState<'create' | 'my_requests' | 'volunteer_feed'>('create');

  const {
    requests,
    loading,
    submitting,
    createRequest,
    acceptRequest,
    deleteRequest,
  } = useAppointments();

  const [selectedTaskType, setSelectedTaskType] = useState<TaskType>('Grocery Shopping');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [location, setLocation] = useState('Home Address');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

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
      preferredTime: selectedSlots.length > 0 
        ? selectedSlots.map(id => {
            const slot = AVAILABLE_SLOTS.find(s => s.id === id);
            return `${slot?.date} ${slot?.time}`;
          }).join(', ')
        : 'As soon as possible',
      location: location.trim() || 'Home',
      urgency,
    });

    if (newRequest) {
      setTitle('');
      setDescription('');
      setSelectedSlots([]);
      setSuccessBanner(`Your request has been posted successfully!`);
      setTimeout(() => setSuccessBanner(null), 5000);
      setActiveTab('my_requests');
    }
  };

  const handleAcceptRequest = async (id: string) => {
    const success = await acceptRequest(id);
    if (success) {
      Alert.alert('Success', 'Thank you! You have accepted this assistance request.');
    }
  };

  const handleDeleteRequest = async (id: string) => {
    Alert.alert(
      'Cancel Request',
      'Are you sure you want to cancel this request?',
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => deleteRequest(id) },
      ]
    );
  };

  const pendingRequests = requests.filter(r => r.status === 'pending');

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: scheme === 'dark' ? '#121212' : '#F9FAFB' }]} edges={['top', 'left', 'right']}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleRow}>
          <ThemedText type="title" style={styles.headerTitle}>
            Schedule
          </ThemedText>
          <View style={styles.memberTagBadge}>
            <ThemedText style={styles.memberTagText}>IT23594586</ThemedText>
          </View>
        </View>
        <ThemedText type="default" themeColor="textSecondary" style={styles.headerSubtitle}>
          Match with volunteers and manage your appointments
        </ThemedText>
      </View>

      {/* Segmented Control Tab Selector */}
      <View style={[styles.segmentedControl, { backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#F3F4F6' }]}>
        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'create' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('create')}
          activeOpacity={0.8}>
          <ThemedText style={[styles.segmentText, activeTab === 'create' && styles.segmentTextActive]}>
            New
          </ThemedText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'my_requests' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('my_requests')}
          activeOpacity={0.8}>
          <ThemedText style={[styles.segmentText, activeTab === 'my_requests' && styles.segmentTextActive]}>
            My Requests
          </ThemedText>
          {requests.length > 0 && (
            <View style={styles.badgeCount}>
              <ThemedText style={styles.badgeText}>{requests.length}</ThemedText>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentButton, activeTab === 'volunteer_feed' && styles.segmentButtonActive]}
          onPress={() => setActiveTab('volunteer_feed')}
          activeOpacity={0.8}>
          <ThemedText style={[styles.segmentText, activeTab === 'volunteer_feed' && styles.segmentTextActive]}>
            Nearby
          </ThemedText>
          {pendingRequests.length > 0 && (
            <View style={[styles.badgeCount, { backgroundColor: '#EF4444' }]}>
              <ThemedText style={styles.badgeText}>{pendingRequests.length}</ThemedText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Success Banner Overlay */}
      {successBanner && (
        <View style={styles.successBanner}>
          <ThemedText style={styles.successBannerText}>{successBanner}</ThemedText>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        
        {/* TAB 1: CREATE REQUEST */}
        {activeTab === 'create' && (
          <View style={styles.formWrapper}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle" style={styles.sectionHeading}>
                What do you need help with?
              </ThemedText>
            </View>

            {/* Task Type Grid */}
            <View style={styles.taskTypeGrid}>
              {TASK_TYPES.map(item => {
                const isSelected = selectedTaskType === item.type;
                return (
                  <TouchableOpacity
                    key={item.type}
                    style={[
                      styles.taskTypeCard,
                      { backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF' },
                      isSelected && { borderColor: item.color, backgroundColor: `${item.color}08` },
                    ]}
                    onPress={() => setSelectedTaskType(item.type)}
                    activeOpacity={0.7}>
                    <ThemedText type="default" style={[styles.taskTypeTitle, isSelected && { color: item.color }]}>
                      {item.type}
                    </ThemedText>
                    <ThemedText type="small" style={styles.taskTypeSubtitle} numberOfLines={1}>
                      {item.subtitle}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="default" style={styles.fieldLabel}>Request Headline</ThemedText>
              <TextInput
                style={[styles.textInput, { color: colors.text, backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF', borderColor: scheme === 'dark' ? '#333' : '#E5E7EB' }]}
                placeholder="e.g., Weekly groceries at Sunshine Market"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="default" style={styles.fieldLabel}>Detailed Description</ThemedText>
              <TextInput
                style={[styles.textInput, styles.textArea, { color: colors.text, backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF', borderColor: scheme === 'dark' ? '#333' : '#E5E7EB' }]}
                placeholder="Describe specific details, preferences, or heavy items..."
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="default" style={styles.fieldLabel}>Available Slots</ThemedText>
              <View style={styles.slotsGrid}>
                {AVAILABLE_SLOTS.map(slot => {
                  const isSelected = selectedSlots.includes(slot.id);
                  return (
                    <TouchableOpacity
                      key={slot.id}
                      style={styles.slotCard}
                      onPress={() => {
                        if (isSelected) {
                          setSelectedSlots(selectedSlots.filter(s => s !== slot.id));
                        } else {
                          setSelectedSlots([...selectedSlots, slot.id]);
                        }
                      }}
                      activeOpacity={0.7}
                    >
                      <ThemedText style={styles.slotDate}>{slot.date}</ThemedText>
                      <View style={styles.slotTimeRow}>
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <View style={styles.checkboxInner} />}
                        </View>
                        <ThemedText style={styles.slotTime}>{slot.time}</ThemedText>
                      </View>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="default" style={styles.fieldLabel}>Meeting Location</ThemedText>
              <View style={[styles.textInputWithIcon, { backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF', borderColor: scheme === 'dark' ? '#333' : '#E5E7EB' }]}>
                <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInputInner, { color: colors.text }]}
                  placeholder="e.g. 45 Maple Avenue"
                  placeholderTextColor={colors.textSecondary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <ThemedText type="default" style={styles.fieldLabel}>Priority Level</ThemedText>
              <View style={styles.urgencyRow}>
                {(['Low', 'Normal', 'Urgent'] as UrgencyLevel[]).map(level => {
                  const isSelected = urgency === level;
                  return (
                    <TouchableOpacity
                      key={level}
                      style={[
                        styles.urgencyButton,
                        { backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF', borderColor: scheme === 'dark' ? '#333' : '#E5E7EB' },
                        isSelected && level === 'Urgent' && { backgroundColor: '#FEF2F2', borderColor: '#EF4444' },
                        isSelected && level === 'Normal' && { backgroundColor: '#EFF6FF', borderColor: '#3B82F6' },
                        isSelected && level === 'Low' && { backgroundColor: '#ECFDF5', borderColor: '#10B981' },
                      ]}
                      onPress={() => setUrgency(level)}>
                      <ThemedText style={[styles.urgencyText, 
                        isSelected && level === 'Urgent' && { color: '#EF4444' },
                        isSelected && level === 'Normal' && { color: '#3B82F6' },
                        isSelected && level === 'Low' && { color: '#10B981' },
                      ]}>
                        {level === 'Urgent' ? 'Urgent' : level === 'Normal' ? 'Normal' : 'Low'}
                      </ThemedText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submitting && styles.submitButtonDisabled]}
              onPress={handleCreateRequest}
              disabled={submitting}
              activeOpacity={0.85}>
              {submitting ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <ThemedText style={styles.submitButtonText}>
                  Post Request
                </ThemedText>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* TAB 2: MY REQUESTS */}
        {activeTab === 'my_requests' && (
          <View style={styles.listWrapper}>
            {loading ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 40 }} />
            ) : requests.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText type="subtitle">No Requests Yet</ThemedText>
                <ThemedText type="default" style={styles.emptyDesc}>You haven't posted any assistance requests.</ThemedText>
                <TouchableOpacity style={styles.emptyActionButton} onPress={() => setActiveTab('create')}>
                  <ThemedText style={styles.emptyActionText}>Create New Request</ThemedText>
                </TouchableOpacity>
              </View>
            ) : (
              requests.map(item => (
                <View key={item._id} style={[styles.card, { backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.taskTypeBadge}>
                      <ThemedText style={styles.taskTypeBadgeText}>{item.taskType}</ThemedText>
                    </View>
                    <View style={[styles.statusChip, item.status === 'pending' ? styles.statusPending : styles.statusAccepted]}>
                      <View style={[styles.statusDot, item.status === 'pending' ? { backgroundColor: '#D97706' } : { backgroundColor: '#059669' }]} />
                      <ThemedText style={[styles.statusChipText, item.status === 'pending' ? { color: '#D97706' } : { color: '#059669' }]}>
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="subtitle" style={styles.cardTitle}>{item.title}</ThemedText>
                  {item.description ? (
                    <ThemedText type="default" style={styles.cardDesc} numberOfLines={2}>
                      {item.description}
                    </ThemedText>
                  ) : null}

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <ThemedText type="small" style={styles.detailText}>{item.preferredTime}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText type="small" style={styles.detailText}>{item.location}</ThemedText>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.providerInfo}>
                      {item.provider ? (
                        <>
                          <ThemedText type="smallBold" style={{ color: '#059669', marginLeft: 6 }}>
                            {item.provider.name || 'Volunteer Assigned'}
                          </ThemedText>
                        </>
                      ) : (
                        <>
                          <ThemedText type="small" style={{ color: '#D97706', marginLeft: 6 }}>Waiting for volunteer...</ThemedText>
                        </>
                      )}
                    </View>
                    <TouchableOpacity style={styles.iconButton} onPress={() => handleDeleteRequest(item._id)}>
                      </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* TAB 3: NEARBY REQUESTS */}
        {activeTab === 'volunteer_feed' && (
          <View style={styles.listWrapper}>
            <View style={styles.feedIntro}>
              <ThemedText type="default" style={{ color: '#6B7280' }}>
                Discover requests from elderly residents nearby and offer your help.
              </ThemedText>
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#0066CC" style={{ marginTop: 40 }} />
            ) : pendingRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <ThemedText type="subtitle">All Caught Up!</ThemedText>
                <ThemedText type="default" style={styles.emptyDesc}>No open requests nearby at the moment.</ThemedText>
              </View>
            ) : (
              pendingRequests.map(item => (
                <View key={item._id} style={[styles.card, { backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF' }]}>
                  <View style={styles.cardHeader}>
                    <View style={styles.taskTypeBadge}>
                      <ThemedText style={styles.taskTypeBadgeText}>{item.taskType}</ThemedText>
                    </View>
                    <View style={[styles.statusChip, { backgroundColor: '#FEE2E2' }]}>
                      <ThemedText style={[styles.statusChipText, { color: '#DC2626' }]}>
                        {item.urgency}
                      </ThemedText>
                    </View>
                  </View>

                  <ThemedText type="subtitle" style={styles.cardTitle}>{item.title}</ThemedText>
                  {item.description ? (
                    <ThemedText type="default" style={styles.cardDesc} numberOfLines={3}>
                      {item.description}
                    </ThemedText>
                  ) : null}

                  <View style={styles.detailsGrid}>
                    <View style={styles.detailRow}>
                      <ThemedText type="small" style={styles.detailText}>{item.preferredTime}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText type="small" style={styles.detailText}>{item.location}</ThemedText>
                    </View>
                    <View style={styles.detailRow}>
                      <ThemedText type="small" style={styles.detailText}>{item.requester?.name || 'Elderly Resident'}</ThemedText>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.acceptButton}
                    onPress={() => handleAcceptRequest(item._id)}
                    activeOpacity={0.85}>
                    <ThemedText style={styles.acceptButtonText}>
                      Offer Help
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    fontSize: 15,
  },
  memberTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  memberTagText: {
    color: '#0284C7',
    fontSize: 13,
    fontWeight: '700',
  },
  segmentedControl: {
    flexDirection: 'row',
    marginHorizontal: Spacing.three,
    padding: 4,
    borderRadius: 14,
    marginBottom: Spacing.three,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 10,
    gap: 6,
  },
  segmentButtonActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabIcon: {
    marginRight: 2,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  segmentTextActive: {
    color: '#0066CC',
    fontWeight: '700',
  },
  badgeCount: {
    backgroundColor: '#0066CC',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    marginHorizontal: Spacing.three,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 8,
  },
  successBannerText: {
    color: '#065F46',
    fontWeight: '600',
    fontSize: 14,
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.three,
    paddingBottom: 100,
  },
  formWrapper: {
    gap: Spacing.four,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '700',
  },
  taskTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  taskTypeCard: {
    width: (width - Spacing.three * 2 - 12) / 2,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  taskTypeIcon: {
    fontSize: 22,
  },
  taskTypeTitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  taskTypeSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  inputGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 15,
    color: '#374151',
    marginLeft: 2,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textInputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputInner: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
    marginTop: 4,
  },
  slotCard: {
    width: (width - Spacing.three * 2 - 16) / 2,
    marginBottom: 8,
  },
  slotDate: {
    color: '#4B5563',
    fontWeight: '700',
    fontSize: 14,
    marginBottom: 6,
  },
  slotTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTime: {
    color: '#6B7280',
    fontSize: 14,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#9CA3AF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    borderColor: '#0066CC',
    backgroundColor: '#0066CC',
  },
  checkboxInner: {
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  urgencyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  urgencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563',
  },
  submitButton: {
    backgroundColor: '#0066CC',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: Spacing.two,
    shadowColor: '#0066CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  listWrapper: {
    gap: 16,
  },
  feedIntro: {
    marginBottom: 4,
  },
  card: {
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  taskTypeBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  taskTypeBadgeText: {
    color: '#1D4ED8',
    fontSize: 12,
    fontWeight: '700',
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  statusPending: {
    backgroundColor: '#FEF3C7',
  },
  statusAccepted: {
    backgroundColor: '#D1FAE5',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 22,
    marginBottom: 16,
  },
  detailsGrid: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    gap: 10,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    color: '#4B5563',
    flex: 1,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
  },
  acceptButton: {
    flexDirection: 'row',
    backgroundColor: '#0066CC',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyDesc: {
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  emptyActionButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 15,
  },
});

