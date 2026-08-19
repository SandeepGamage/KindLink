import React, { useState } from 'react';
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
import * as Location from 'expo-location';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { TaskType, UrgencyLevel } from '@/types/appointment';

const TASK_TYPES: TaskType[] = [
  'Grocery Shopping',
  'Medical Transport',
  'Companionship',
  'Housekeeping & Repairs',
  'Tech Support',
  'Meal Preparation',
  'Pet Care',
  'Gardening & Yard',
  'Bill Payment & Errands',
  'Mobility & Walking',
  'Other',
];

const URGENCY_LEVELS: UrgencyLevel[] = ['Normal', 'Urgent', 'Low'];

export default function CreateRequestScreen() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();

  const { createRequest, submitting } = useAppointments();

  const [title, setTitle] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('Grocery Shopping');
  const [urgency, setUrgency] = useState<UrgencyLevel>('Normal');
  const [preferredTime, setPreferredTime] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [locating, setLocating] = useState(false);

  const handleDetectLocation = async () => {
    try {
      setLocating(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const geocoded = await Location.reverseGeocodeAsync({
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      });

      if (geocoded && geocoded.length > 0) {
        const addr = geocoded[0];
        const formatted = [
          addr.name || addr.streetNumber,
          addr.street,
          addr.city || addr.subregion,
          addr.region,
        ]
          .filter(Boolean)
          .join(', ');

        setLocation(formatted || `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      } else {
        setLocation(`${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`);
      }
    } catch (err) {
      Alert.alert('Location Error', 'Unable to fetch current location.');
    } finally {
      setLocating(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Please enter a title for your request.');
      return;
    }

    const newRequest = await createRequest({
      title: title.trim(),
      taskType,
      urgency,
      preferredTime: preferredTime.trim() || 'As soon as possible',
      location: location.trim() || 'Home',
      description: description.trim(),
    });

    if (newRequest) {
      Alert.alert('Success', 'Your assistance request has been created!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } else {
      Alert.alert('Error', 'Failed to create request. Please try again.');
    }
  };

  const backgroundColor = isDark ? '#121212' : '#FFFFFF';
  const cardBg = isDark ? '#1E1E1E' : '#FAFAFA';
  const borderColor = isDark ? '#333333' : '#000000';
  const chipBorder = isDark ? '#444444' : '#CCCCCC';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.headerTitle}>
          Create Request
        </ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Form Card */}
        <View style={[styles.formContainer, { backgroundColor: cardBg, borderColor }]}>
          {/* Title */}
          <View style={styles.fieldGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              Title *
            </ThemedText>
            <View style={[styles.inputWithIconWrapper, { borderColor: chipBorder }]}>
              <Ionicons name="create-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="e.g. Weekly Grocery Run"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={setTitle}
              />
            </View>
          </View>

          {/* Task Type */}
          <View style={styles.fieldGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              Category
            </ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsContainer}>
              {TASK_TYPES.map((type) => {
                const isSelected = taskType === type;
                return (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.chip,
                      { borderColor: chipBorder },
                      isSelected && { backgroundColor: '#1769AA', borderColor: '#1769AA' },
                    ]}
                    onPress={() => setTaskType(type)}
                  >
                    <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {type}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Urgency */}
          <View style={styles.fieldGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              Urgency
            </ThemedText>
            <View style={styles.urgencyRow}>
              {URGENCY_LEVELS.map((lvl) => {
                const isSelected = urgency === lvl;
                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.urgencyChip,
                      { borderColor: chipBorder },
                      isSelected && { backgroundColor: '#1769AA', borderColor: '#1769AA' },
                    ]}
                    onPress={() => setUrgency(lvl)}
                  >
                    <ThemedText style={[styles.chipText, isSelected && styles.chipTextSelected]}>
                      {lvl}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preferred Time */}
          <View style={styles.fieldGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              Preferred Date / Time
            </ThemedText>
            <View style={[styles.inputWithIconWrapper, { borderColor: chipBorder }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="e.g. Tomorrow 10:00 AM or ASAP"
                placeholderTextColor={colors.textSecondary}
                value={preferredTime}
                onChangeText={setPreferredTime}
              />
            </View>
          </View>

          {/* Location */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText type="subtitle" style={styles.label}>
                Location / Address
              </ThemedText>
              <TouchableOpacity style={styles.detectLocationBtn} onPress={handleDetectLocation} disabled={locating}>
                {locating ? (
                  <ActivityIndicator size="small" color="#1769AA" />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Ionicons name="navigate-outline" size={14} color="#1769AA" />
                    <ThemedText style={styles.detectLocationText}>Use GPS</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWithIconWrapper, { borderColor: chipBorder }]}>
              <Ionicons name="location-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="e.g. 123 Main St, Springfield"
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={setLocation}
              />
            </View>
          </View>

          {/* Description */}
          <View style={styles.fieldGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              Description / Notes
            </ThemedText>
            <TextInput
              style={[
                styles.textInput,
                styles.multilineInput,
                { color: colors.text, borderColor: chipBorder },
              ]}
              placeholder="Provide any additional details or instructions..."
              placeholderTextColor={colors.textSecondary}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, { backgroundColor: '#1769AA' }]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ThemedText style={[styles.submitButtonText, { color: '#FFFFFF' }]}>
                Submit Request
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  formContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 20,
    marginTop: 8,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  detectLocationBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(23, 105, 170, 0.1)',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detectLocationText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1769AA',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  inputWithIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputWithIcon: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 100,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  urgencyChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
  },
});
