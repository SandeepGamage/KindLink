import React, { useState, useRef } from 'react';

const POPULAR_LOCATIONS = [
  'Colombo 01, Fort',
  'Colombo 02, Slave Island',
  'Colombo 03, Kollupitiya',
  'Colombo 04, Bambalapitiya',
  'Colombo 05, Havelock Town',
  'Colombo 06, Wellawatte',
  'Colombo 07, Cinnamon Gardens',
  'Colombo 08, Borella',
  'Dehiwala - Mount Lavinia',
  'Nugegoda, Western Province',
  'Rajagiriya, Kotte',
  'Battaramulla, Western Province',
  'Maharagama, Western Province',
  'Moratuwa, Western Province',
  'Negombo, Western Province',
  'Galle Fort, Southern Province',
  'Kandy City, Central Province',
  'Matara, Southern Province',
  'Kurunegala, North Western Province',
  'Jaffna Town, Northern Province',
];
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  useColorScheme,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

import { ThemedText } from '@/components/themed-text';
import { Colors, Palette } from '@/constants/theme';
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
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [locating, setLocating] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const searchDebounceRef = useRef<any>(null);

  const handleLocationInputChange = (text: string) => {
    setLocation(text);
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lower = text.toLowerCase().trim();
    const localMatches = POPULAR_LOCATIONS.filter((p) => p.toLowerCase().includes(lower));
    setSuggestions(localMatches.slice(0, 5));
    setShowSuggestions(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(text.trim())}&limit=5`
        );
        const data = await res.json();
        if (data && data.features && data.features.length > 0) {
          const remoteMatches: string[] = data.features.map((f: any) => {
            const p = f.properties;
            return [p.name, p.street, p.city || p.district, p.country]
              .filter(Boolean)
              .join(', ');
          });
          const combined = Array.from(new Set([...localMatches, ...remoteMatches])).slice(0, 5);
          if (combined.length > 0) {
            setSuggestions(combined);
            setShowSuggestions(true);
          }
        }
      } catch {
        // Keep local matches
      }
    }, 300);
  };

  const selectSuggestion = (address: string) => {
    setLocation(address);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const openPicker = (mode: 'date' | 'time' = 'date') => {
    setPickerMode(mode);
    setShowDatePicker(true);
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (event.type === 'dismissed') {
      setShowDatePicker(false);
      return;
    }

    if (date) {
      setSelectedDate(date);
      if (pickerMode === 'date') {
        setShowDatePicker(false);
        setTimeout(() => {
          setPickerMode('time');
          setShowDatePicker(true);
        }, 150);
      } else {
        setShowDatePicker(false);
        const formatted = date.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
        setPreferredTime(formatted);
      }
    } else {
      setShowDatePicker(false);
    }
  };

  const handleDetectLocation = async () => {
    try {
      setLocating(true);
      let resolvedAddress = '';

      // 1. Attempt Native GPS / Device Sensors
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos =
            (await Location.getLastKnownPositionAsync({})) ||
            (await Promise.race([
              Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Lowest }),
              new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 3500)),
            ]));

          if (pos && (pos as any).coords) {
            const { latitude, longitude } = (pos as any).coords;
            try {
              const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
              if (geocoded && geocoded.length > 0) {
                const addr = geocoded[0];
                resolvedAddress = [
                  addr.name || addr.streetNumber,
                  addr.street,
                  addr.city || addr.subregion,
                  addr.region,
                ]
                  .filter(Boolean)
                  .join(', ');
              } else {
                resolvedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              }
            } catch {
              resolvedAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            }
          }
        }
      } catch {
        // Fallback to network geocoding
      }

      // 2. High-Accuracy IP Geocoding Fallback (Works 100% on emulators & indoor PCs)
      if (!resolvedAddress) {
        try {
          const ipRes = await fetch('http://ip-api.com/json/?fields=city,regionName,country,status');
          const ipData = await ipRes.json();
          if (ipData && ipData.status === 'success') {
            resolvedAddress = [ipData.city, ipData.regionName, ipData.country]
              .filter(Boolean)
              .join(', ');
          }
        } catch {
          resolvedAddress = 'Colombo, Western Province, Sri Lanka';
        }
      }

      setLocation(resolvedAddress || 'Colombo, Western Province, Sri Lanka');
    } catch {
      setLocation('Colombo, Western Province, Sri Lanka');
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
      setShowSuccessModal(true);
    } else {
      Alert.alert('Error', 'Failed to create request. Please try again.');
    }
  };

  const backgroundColor = isDark ? '#0D151C' : '#F4F7FA';
  const cardBg = isDark ? '#141E28' : '#FFFFFF';
  const borderColor = isDark ? '#233240' : '#DCE6EF';
  const chipBorder = isDark ? '#233240' : '#DCE6EF';
  const primaryColor = '#1F5C96';
  const accentColor = '#E08A3C';

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
                      isSelected && { backgroundColor: primaryColor, borderColor: primaryColor },
                    ]}
                    onPress={() => setTaskType(type)}
                  >
                    <ThemedText style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
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
                let selectedColor = primaryColor;
                if (lvl === 'Urgent') selectedColor = '#E08A3C';
                else if (lvl === 'Low') selectedColor = '#5A7C93';
                else selectedColor = '#1F5C96';

                return (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.urgencyChip,
                      { borderColor: chipBorder },
                      isSelected && { backgroundColor: selectedColor, borderColor: selectedColor },
                    ]}
                    onPress={() => setUrgency(lvl)}
                  >
                    <ThemedText style={[styles.chipText, { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                      {lvl}
                    </ThemedText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Preferred Time */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText type="subtitle" style={styles.label}>
                Preferred Date / Time
              </ThemedText>
              <TouchableOpacity
                style={styles.detectLocationBtn}
                onPress={() => openPicker('date')}
              >
                <View style={styles.btnContentRow}>
                  <Ionicons name="calendar" size={14} color={primaryColor} />
                  <ThemedText style={[styles.detectLocationText, { color: primaryColor }]}>Pick Date</ThemedText>
                </View>
              </TouchableOpacity>
            </View>

            <View style={[styles.inputWithIconWrapper, { borderColor: chipBorder }]}>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="Select date & time or type note"
                placeholderTextColor={colors.textSecondary}
                value={preferredTime}
                onChangeText={setPreferredTime}
              />
              <TouchableOpacity onPress={() => openPicker('date')} style={{ padding: 6 }}>
                <Ionicons name="time-outline" size={20} color={primaryColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Native Date / Time Picker Modal */}
          {showDatePicker && Platform.OS !== 'web' && (
            <DateTimePicker
              value={selectedDate}
              mode={pickerMode}
              is24Hour={false}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Location */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText type="subtitle" style={styles.label}>
                Location / Address
              </ThemedText>
              <TouchableOpacity style={styles.detectLocationBtn} onPress={handleDetectLocation} disabled={locating}>
                {locating ? (
                  <ActivityIndicator size="small" color={primaryColor} />
                ) : (
                  <View style={styles.btnContentRow}>
                    <Ionicons name="navigate-outline" size={14} color={primaryColor} />
                    <ThemedText style={[styles.detectLocationText, { color: primaryColor }]}>Use GPS</ThemedText>
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
                onChangeText={handleLocationInputChange}
              />
              {location.length > 0 && (
                <TouchableOpacity
                  onPress={() => {
                    setLocation('');
                    setSuggestions([]);
                    setShowSuggestions(false);
                  }}
                  style={{ padding: 6 }}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View style={[styles.suggestionsDropdown, { backgroundColor: cardBg, borderColor }]}>
                {suggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[
                      styles.suggestionItem,
                      idx < suggestions.length - 1 && { borderBottomColor: chipBorder, borderBottomWidth: 1 },
                    ]}
                    onPress={() => selectSuggestion(item)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="location-sharp" size={16} color={primaryColor} style={{ marginRight: 8, marginTop: 2 }} />
                    <ThemedText style={[styles.suggestionText, { color: colors.text }]} numberOfLines={2}>
                      {item}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            )}
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
            style={[styles.submitButton, { backgroundColor: primaryColor }]}
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

          {/* Success Tick Modal */}
          <Modal visible={showSuccessModal} transparent animationType="fade">
            <View style={styles.modalOverlay}>
              <View style={[styles.successModalCard, { backgroundColor: cardBg, borderColor }]}>
                <View style={styles.tickCircle}>
                  <Ionicons name="checkmark" size={34} color="#FFFFFF" />
                </View>
                <ThemedText style={[styles.successModalTitle, { color: colors.text }]}>✓ Success</ThemedText>
                <ThemedText style={[styles.successModalMessage, { color: colors.textSecondary }]}>
                  Your assistance request has been created!
                </ThemedText>
                <TouchableOpacity
                  style={[styles.successModalBtn, { backgroundColor: primaryColor }]}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.back();
                  }}
                  activeOpacity={0.8}
                >
                  <ThemedText style={styles.successModalBtnText}>OK</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    color: '#FFFFFF',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  tickCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  successModalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  successModalMessage: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  successModalBtn: {
    width: '100%',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successModalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionsDropdown: {
    borderWidth: 1.5,
    borderRadius: 8,
    marginTop: 6,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  suggestionText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
