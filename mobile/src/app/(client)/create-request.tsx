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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MapView, { Marker, Region } from 'react-native-maps';

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
  const [contactNumber, setContactNumber] = useState('');
  const [description, setDescription] = useState('');
  const [locating, setLocating] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingPlaces, setSearchingPlaces] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const searchTimeoutRef = useRef<any>(null);

  const handleLocationChange = (text: string) => {
    setLocation(text);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (text.trim().length >= 2) {
      setSearchingPlaces(true);
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(text)}&countrycodes=lk&limit=6`,
            { headers: { 'User-Agent': 'KindLinkApp/1.0' } }
          );
          if (res.ok) {
            const data = await res.json();
            setSearchResults(Array.isArray(data) ? data : []);
          }
        } catch {
          setSearchResults([]);
        } finally {
          setSearchingPlaces(false);
        }
      }, 350);
    } else {
      setSearchResults([]);
      setSearchingPlaces(false);
    }
  };

  const handleSelectPlace = (place: any) => {
    const formatted = place.display_name.split(',').slice(0, 4).join(', ').trim();
    setLocation(formatted || place.display_name);
    setSearchResults([]);
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
    setLocating(true);
    try {
      // 1. Try IP Geolocation first
      try {
        const ipRes = await fetch('http://ip-api.com/json', {
          headers: { Accept: 'application/json' },
        });
        if (ipRes.ok) {
          const data = await ipRes.json();
          if (data && data.status === 'success' && data.city) {
            const formattedIp = [data.city, data.regionName, data.country].filter(Boolean).join(', ');
            if (formattedIp) {
              setLocation(formattedIp);
              if (errors.location) setErrors(e => ({ ...e, location: '' }));
              setLocating(false);
              return;
            }
          }
        }
      } catch {
        // IP check failed -> fallback to native device GPS
      }

      // 2. Try Native Device Hardware GPS
      let hasPerm = false;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        hasPerm = status === 'granted';
      } catch {
        hasPerm = false;
      }

      if (hasPerm) {
        try {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          }).catch(() => Location.getLastKnownPositionAsync({}));

          if (pos && pos.coords) {
            const { latitude, longitude } = pos.coords;
            const geocoded = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (geocoded && geocoded.length > 0) {
              const addr = geocoded[0];
              const formatted = [
                addr.name || addr.streetNumber,
                addr.street,
                addr.district || addr.subregion || addr.city,
                addr.region,
                addr.country,
              ]
                .filter(Boolean)
                .join(', ');

              if (formatted) {
                setLocation(formatted);
                if (errors.location) setErrors(e => ({ ...e, location: '' }));
                setLocating(false);
                return;
              }
            }
          }
        } catch {
          // GPS fallback
        }
      }

      setLocation('Colombo, Western Province, Sri Lanka');
    } catch {
      setLocation('Colombo, Western Province, Sri Lanka');
    } finally {
      setLocating(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // 1. Title validation
    if (!title.trim()) {
      newErrors.title = 'Title is required.';
    } else if (title.trim().length < 3) {
      newErrors.title = 'Title must be at least 3 characters.';
    }

    // 2. Preferred Date / Time validation
    if (!preferredTime.trim()) {
      newErrors.preferredTime = 'Please select a preferred date & time.';
    }

    // 3. Location validation
    if (!location.trim()) {
      newErrors.location = 'Location/address is required.';
    }

    // 4. Contact Phone Number validation
    const digitsOnly = contactNumber.replace(/\D/g, '');
    if (!contactNumber.trim()) {
      newErrors.contactNumber = 'Contact phone number is required.';
    } else if (digitsOnly.length < 9 || digitsOnly.length > 15) {
      newErrors.contactNumber = 'Please enter a valid phone number (9-12 digits).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fill in all required fields highlighted in red.');
      return;
    }

    const newRequest = await createRequest({
      title: title.trim(),
      taskType,
      urgency,
      preferredTime: preferredTime.trim() || 'As soon as possible',
      location: location.trim() || 'Home',
      contactNumber: contactNumber.trim(),
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
            <View style={[styles.inputWithIconWrapper, { borderColor: errors.title ? '#D32F2F' : chipBorder }]}>
              <Ionicons name="create-outline" size={20} color={errors.title ? '#D32F2F' : colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="e.g. Weekly Grocery Run"
                placeholderTextColor={colors.textSecondary}
                value={title}
                onChangeText={(t) => { setTitle(t); if (errors.title) setErrors(e => ({ ...e, title: '' })); }}
              />
            </View>
            {errors.title ? <ThemedText style={styles.errorText}>{errors.title}</ThemedText> : null}
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
              Urgency Level
            </ThemedText>
            <View style={styles.urgencyRow}>
              {URGENCY_LEVELS.map((lvl) => {
                const isSelected = urgency === lvl;
                const selectedColor = lvl === 'Urgent' ? '#D32F2F' : primaryColor;
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
                Preferred Date / Time *
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

            <View style={[styles.inputWithIconWrapper, { borderColor: errors.preferredTime ? '#D32F2F' : chipBorder }]}>
              <Ionicons name="calendar-outline" size={20} color={errors.preferredTime ? '#D32F2F' : colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="Select date & time or type note"
                placeholderTextColor={colors.textSecondary}
                value={preferredTime}
                onChangeText={(t) => { setPreferredTime(t); if (errors.preferredTime) setErrors(e => ({ ...e, preferredTime: '' })); }}
              />
              <TouchableOpacity onPress={() => openPicker('date')} style={{ padding: 6 }}>
                <Ionicons name="time-outline" size={20} color={primaryColor} />
              </TouchableOpacity>
            </View>
            {errors.preferredTime ? <ThemedText style={styles.errorText}>{errors.preferredTime}</ThemedText> : null}
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
              maximumDate={new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)}
            />
          )}

          {/* Location */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <ThemedText type="subtitle" style={styles.label}>
                Location / Address *
              </ThemedText>
              <TouchableOpacity style={styles.detectLocationBtn} onPress={handleDetectLocation} disabled={locating}>
                {locating ? (
                  <View style={styles.btnContentRow}>
                    <ActivityIndicator size="small" color={primaryColor} />
                    <ThemedText style={[styles.detectLocationText, { color: primaryColor }]}>Locating...</ThemedText>
                  </View>
                ) : (
                  <View style={styles.btnContentRow}>
                    <Ionicons name="navigate-outline" size={14} color={primaryColor} />
                    <ThemedText style={[styles.detectLocationText, { color: primaryColor }]}>Use GPS</ThemedText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
            <View style={[styles.inputWithIconWrapper, { borderColor: errors.location ? '#D32F2F' : chipBorder }]}>
              <Ionicons name="location-outline" size={20} color={errors.location ? '#D32F2F' : colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="Search any road, area, hospital, city..."
                placeholderTextColor={colors.textSecondary}
                value={location}
                onChangeText={(t) => { handleLocationChange(t); if (errors.location) setErrors(e => ({ ...e, location: '' })); }}
              />
              {searchingPlaces ? (
                <ActivityIndicator size="small" color={primaryColor} style={{ marginRight: 6 }} />
              ) : location.length > 0 ? (
                <TouchableOpacity onPress={() => { setLocation(''); setSearchResults([]); }} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              ) : null}
            </View>
            {errors.location ? <ThemedText style={styles.errorText}>{errors.location}</ThemedText> : null}

            {/* PickMe / Uber Style Place Search Suggestions Dropdown */}
            {searchResults.length > 0 && (
              <View style={[styles.suggestionsDropdown, { backgroundColor: cardBg, borderColor }]}>
                {searchResults.map((item) => {
                  const title = item.name || item.display_name.split(',')[0];
                  const subtitle = item.display_name;
                  return (
                    <TouchableOpacity
                      key={item.place_id}
                      style={[styles.suggestionItem, { borderBottomColor: chipBorder }]}
                      onPress={() => handleSelectPlace(item)}
                    >
                      <View style={[styles.suggestionIconWrapper, { backgroundColor: 'rgba(31, 92, 150, 0.1)' }]}>
                        <Ionicons name="location-sharp" size={18} color={primaryColor} />
                      </View>
                      <View style={{ flex: 1 }}>
                        <ThemedText style={styles.suggestionTitle} numberOfLines={1}>
                          {title}
                        </ThemedText>
                        <ThemedText style={styles.suggestionSubtitle} numberOfLines={1}>
                          {subtitle}
                        </ThemedText>
                      </View>
                      <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Contact Phone Number */}
          <View style={styles.fieldGroup}>
            <ThemedText type="subtitle" style={styles.label}>
              Contact Phone Number *
            </ThemedText>
            <View style={[styles.inputWithIconWrapper, { borderColor: errors.contactNumber ? '#D32F2F' : chipBorder }]}>
              <Ionicons name="call-outline" size={20} color={errors.contactNumber ? '#D32F2F' : colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={[styles.textInputWithIcon, { color: colors.text }]}
                placeholder="e.g. 077 123 4567"
                placeholderTextColor={colors.textSecondary}
                value={contactNumber}
                onChangeText={(t) => { setContactNumber(t); if (errors.contactNumber) setErrors(e => ({ ...e, contactNumber: '' })); }}
                keyboardType="phone-pad"
              />
              {contactNumber.length > 0 && (
                <TouchableOpacity onPress={() => setContactNumber('')} style={{ padding: 4 }}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
            {errors.contactNumber ? <ThemedText style={styles.errorText}>{errors.contactNumber}</ThemedText> : null}
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
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mapWrapper: {
    flex: 1,
    position: 'relative',
  },
  centerPinContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingGpsBtn: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  mapBottomCard: {
    borderTopWidth: 1.5,
    padding: 16,
  },
  mapAddressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  mapCardAddressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#17242E',
  },
  mapCardAddressSubtitle: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 2,
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
    fontSize: 22,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 110,
  },
  formContainer: {
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 18,
    marginTop: 6,
  },
  fieldGroup: {
    marginBottom: 22,
  },
  errorText: {
    fontSize: 13,
    color: '#D32F2F',
    fontWeight: '600',
    marginTop: 6,
    marginLeft: 2,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 17,
    fontWeight: '700',
  },
  detectLocationBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(31, 92, 150, 0.12)',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detectLocationText: {
    fontSize: 13,
    fontWeight: '700',
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  inputWithIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 14,
    minHeight: 54,
    backgroundColor: '#FFFFFF',
  },
  inputIcon: {
    marginRight: 10,
  },
  textInputWithIcon: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 110,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
  },
  suggestionsDropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 10,
  },
  suggestionIconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#17242E',
  },
  suggestionSubtitle: {
    fontSize: 12,
    color: '#60646C',
    marginTop: 2,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 6,
  },
  chip: {
    borderWidth: 1.5,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 11,
    backgroundColor: '#FFFFFF',
  },
  urgencyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  urgencyChip: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  chipText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#17242E',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
  },
  submitButtonText: {
    fontSize: 18,
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
});
