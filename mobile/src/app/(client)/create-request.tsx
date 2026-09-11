import React, { useState, useRef, useEffect } from 'react';

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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Location from 'expo-location';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import MapView, { Marker, Region } from 'react-native-maps';

import { ThemedText } from '@/components/themed-text';
import { Colors, Palette } from '@/constants/theme';
import { useAppointments } from '@/hooks/useAppointments';
import { appointmentService } from '@/services/appointmentService';
import { TaskType, UrgencyLevel, Volunteer } from '@/types/appointment';

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

export interface CreateRequestRouteParams {
  initialDate?: string;
  title?: string;
  taskType?: string;
  description?: string;
  urgency?: string;
  location?: string;
  contactNumber?: string;
  preferredTime?: string;
}

function parseLocalDateString(dateStr?: string): Date | null {
  if (!dateStr) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const [y, m, d] = dateStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return isNaN(date.getTime()) ? null : date;
  }
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export default function CreateRequestScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const colors = Colors[isDark ? 'dark' : 'light'];
  const router = useRouter();
  const params = useLocalSearchParams<{
    initialDate?: string;
    title?: string;
    taskType?: string;
    description?: string;
    urgency?: string;
    location?: string;
    contactNumber?: string;
    preferredTime?: string;
  }>();

  const { createRequest, submitting } = useAppointments();

  const [title, setTitle] = useState(params.title || '');
  const [taskType, setTaskType] = useState<TaskType>((params.taskType as TaskType) || 'Grocery Shopping');
  const [urgency, setUrgency] = useState<UrgencyLevel>((params.urgency as UrgencyLevel) || 'Normal');
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
  const [createdRequestData, setCreatedRequestData] = useState<{
    title: string;
    taskType: string;
    preferredTime: string;
    volunteerName: string;
  } | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => {
    if (params.initialDate) {
      const parsed = parseLocalDateString(params.initialDate);
      if (parsed) return parsed;
    }
    return new Date();
  });
  const [preferredTime, setPreferredTime] = useState(() => {
    if (params.preferredTime) {
      return params.preferredTime;
    }
    if (params.initialDate) {
      const parsed = parseLocalDateString(params.initialDate);
      if (parsed) {
        return parsed.toLocaleString([], {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      }
    }
    return '';
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [location, setLocation] = useState(params.location || '');
  const [contactNumber, setContactNumber] = useState(params.contactNumber || '');
  const [description, setDescription] = useState(params.description || '');

  useEffect(() => {
    if (params.title !== undefined) setTitle(params.title);
    if (params.taskType) setTaskType(params.taskType as TaskType);
    if (params.urgency) setUrgency(params.urgency as UrgencyLevel);
    if (params.location !== undefined) setLocation(params.location);
    if (params.contactNumber !== undefined) setContactNumber(params.contactNumber);
    if (params.description !== undefined) setDescription(params.description);
    if (params.preferredTime !== undefined) setPreferredTime(params.preferredTime);
    if (params.initialDate) {
      const parsed = parseLocalDateString(params.initialDate);
      if (parsed) {
        setSelectedDate(parsed);
        if (!params.preferredTime) {
          setPreferredTime(
            parsed.toLocaleString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })
          );
        }
      }
    }
  }, [
    params.title,
    params.taskType,
    params.urgency,
    params.location,
    params.contactNumber,
    params.description,
    params.preferredTime,
    params.initialDate,
  ]);

  useEffect(() => {
    let isMounted = true;
    const fetchVolunteers = async () => {
      setLoadingVolunteers(true);
      try {
        const list = await appointmentService.getVolunteers();
        if (isMounted && list) {
          setVolunteers(list);
        }
      } catch (err) {
        console.log('Error fetching volunteers:', err);
      } finally {
        if (isMounted) setLoadingVolunteers(false);
      }
    };
    fetchVolunteers();
    return () => {
      isMounted = false;
    };
  }, []);

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
      date: selectedDate.toISOString(),
      preferredTime: preferredTime.trim() || 'As soon as possible',
      location: location.trim() || 'Home',
      contactNumber: contactNumber.trim(),
      description: description.trim(),
      provider: selectedVolunteer ? selectedVolunteer._id : null,
    });

    if (newRequest) {
      setCreatedRequestData({
        title: title.trim(),
        taskType,
        preferredTime: preferredTime.trim() || 'As soon as possible',
        volunteerName: selectedVolunteer ? selectedVolunteer.name : 'Broadcasted to All Available Volunteers',
      });
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
    <View style={[styles.safeArea, { backgroundColor, paddingTop: insets.top }]}>
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
                const selectedColor = primaryColor;
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

          {/* Available Volunteers Selection */}
          <View style={styles.fieldGroup}>
            <View style={styles.labelRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="people" size={18} color={primaryColor} />
                <ThemedText type="subtitle" style={styles.label}>
                  Available Volunteers
                </ThemedText>
              </View>
              <View style={[styles.badgePill, { backgroundColor: isDark ? 'rgba(31, 92, 150, 0.25)' : '#E8F2FB' }]}>
                <ThemedText style={[styles.badgePillText, { color: primaryColor }]}>
                  {volunteers.length} Active
                </ThemedText>
              </View>
            </View>
            <ThemedText style={[styles.helperSubtext, { color: colors.textSecondary }]}>
              Select a preferred volunteer, or choose Broadcast to notify all available volunteers in your area.
            </ThemedText>

            {loadingVolunteers ? (
              <View style={styles.volunteersLoadingBox}>
                <ActivityIndicator size="small" color={primaryColor} />
                <ThemedText style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading volunteers...
                </ThemedText>
              </View>
            ) : (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.volunteerScrollContainer}
              >
                {/* Broadcast to All Card */}
                <TouchableOpacity
                  style={[
                    styles.volunteerCard,
                    { backgroundColor: cardBg, borderColor: selectedVolunteer === null ? primaryColor : chipBorder },
                    selectedVolunteer === null && styles.volunteerCardSelected,
                  ]}
                  onPress={() => setSelectedVolunteer(null)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.volunteerAvatarCircle, { backgroundColor: '#E08A3C' }]}>
                    <Ionicons name="radio-outline" size={24} color="#FFFFFF" />
                  </View>
                  <ThemedText style={[styles.volunteerName, { color: colors.text }]} numberOfLines={1}>
                    All Volunteers
                  </ThemedText>
                  <ThemedText style={[styles.volunteerRoleTag, { color: '#E08A3C', backgroundColor: 'rgba(224, 138, 60, 0.12)' }]}>
                    Broadcast
                  </ThemedText>
                  <ThemedText style={[styles.volunteerBio, { color: colors.textSecondary }]} numberOfLines={2}>
                    Notify any nearby volunteer to accept this request
                  </ThemedText>
                  <View style={styles.selectionIndicator}>
                    {selectedVolunteer === null ? (
                      <View style={[styles.selectedRadioCheck, { backgroundColor: primaryColor }]}>
                        <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                      </View>
                    ) : (
                      <View style={[styles.unselectedRadioCircle, { borderColor: chipBorder }]} />
                    )}
                  </View>
                </TouchableOpacity>

                {/* Individual Volunteer Cards */}
                {volunteers.map((vol) => {
                  const isSelected = selectedVolunteer?._id === vol._id;
                  const initials = vol.name
                    ? vol.name
                        .split(' ')
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'V';

                  return (
                    <TouchableOpacity
                      key={vol._id}
                      style={[
                        styles.volunteerCard,
                        { backgroundColor: cardBg, borderColor: isSelected ? primaryColor : chipBorder },
                        isSelected && styles.volunteerCardSelected,
                      ]}
                      onPress={() => setSelectedVolunteer(vol)}
                      activeOpacity={0.85}
                    >
                      <View style={[styles.volunteerAvatarCircle, { backgroundColor: primaryColor }]}>
                        <ThemedText style={styles.volunteerInitials}>{initials}</ThemedText>
                      </View>
                      <View style={styles.volunteerNameRow}>
                        <ThemedText style={[styles.volunteerName, { color: colors.text }]} numberOfLines={1}>
                          {vol.name}
                        </ThemedText>
                        <Ionicons name="checkmark-circle" size={14} color="#10B981" />
                      </View>
                      {vol.rating ? (
                        <View style={styles.ratingBadge}>
                          <Ionicons name="star" size={12} color="#F59E0B" />
                          <ThemedText style={styles.ratingText}>{vol.rating.toFixed(1)}</ThemedText>
                        </View>
                      ) : null}
                      <ThemedText style={[styles.volunteerBio, { color: colors.textSecondary }]} numberOfLines={2}>
                        {vol.bio || vol.address || 'Verified KindLink Volunteer'}
                      </ThemedText>
                      {vol.availability && vol.availability.length > 0 && (
                        <View style={[styles.availBadge, { backgroundColor: isDark ? '#1C2936' : '#EEF4FA' }]}>
                          <ThemedText style={[styles.availBadgeText, { color: primaryColor }]} numberOfLines={1}>
                            {vol.availability[0]}
                          </ThemedText>
                        </View>
                      )}
                      <View style={styles.selectionIndicator}>
                        {isSelected ? (
                          <View style={[styles.selectedRadioCheck, { backgroundColor: primaryColor }]}>
                            <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                          </View>
                        ) : (
                          <View style={[styles.unselectedRadioCircle, { borderColor: chipBorder }]} />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {selectedVolunteer && (
              <View style={[styles.selectedBanner, { backgroundColor: isDark ? 'rgba(31, 92, 150, 0.18)' : '#EDF5FD', borderColor: primaryColor }]}>
                <Ionicons name="information-circle" size={18} color={primaryColor} />
                <ThemedText style={[styles.selectedBannerText, { color: colors.text }]}>
                  Preferred volunteer selected: <ThemedText style={{ fontWeight: '700', color: primaryColor }}>{selectedVolunteer.name}</ThemedText>
                </ThemedText>
                <TouchableOpacity onPress={() => setSelectedVolunteer(null)} style={{ padding: 2 }}>
                  <Ionicons name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            )}
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
                <ThemedText style={[styles.successModalTitle, { color: colors.text }]}>✓ Request Created</ThemedText>
                <ThemedText style={[styles.successModalMessage, { color: colors.textSecondary }]}>
                  Your assistance request has been posted successfully!
                </ThemedText>

                {createdRequestData && (
                  <View style={[styles.modalSummaryBox, { backgroundColor: isDark ? '#1B2633' : '#F1F6FB', borderColor: chipBorder }]}>
                    <View style={styles.summaryRow}>
                      <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Task:</ThemedText>
                      <ThemedText style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>{createdRequestData.title}</ThemedText>
                    </View>
                    <View style={styles.summaryRow}>
                      <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Time:</ThemedText>
                      <ThemedText style={[styles.summaryValue, { color: colors.text }]} numberOfLines={1}>{createdRequestData.preferredTime}</ThemedText>
                    </View>
                    <View style={styles.summaryRow}>
                      <ThemedText style={[styles.summaryLabel, { color: colors.textSecondary }]}>Volunteer:</ThemedText>
                      <ThemedText style={[styles.summaryValue, { color: primaryColor, fontWeight: '700' }]} numberOfLines={1}>{createdRequestData.volunteerName}</ThemedText>
                    </View>
                  </View>
                )}

                <TouchableOpacity
                  style={[styles.successModalBtn, { backgroundColor: primaryColor }]}
                  onPress={() => {
                    setShowSuccessModal(false);
                    router.back();
                  }}
                  activeOpacity={0.8}
                >                  <ThemedText style={styles.successModalBtnText}>View My Schedule</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </View>
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
  label: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  detectLocationBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detectLocationText: {
    fontSize: 13,
    fontWeight: '600',
  },
  helperSubtext: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  volunteersLoadingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
  },
  volunteerScrollContainer: {
    gap: 12,
    paddingVertical: 4,
  },
  volunteerCard: {
    width: 170,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    position: 'relative',
  },
  volunteerCardSelected: {
    borderWidth: 2,
  },
  volunteerAvatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  volunteerInitials: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  volunteerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  volunteerName: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  volunteerRoleTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F59E0B',
  },
  volunteerBio: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 15,
    marginBottom: 8,
    minHeight: 30,
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    maxWidth: '100%',
  },
  availBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  selectionIndicator: {
    marginTop: 'auto',
  },
  selectedRadioCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unselectedRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  selectedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    gap: 8,
  },
  selectedBannerText: {
    flex: 1,
    fontSize: 13,
  },
  inputWithIconWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    minHeight: 52,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInputWithIcon: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 10,
  },
  textInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 90,
  },
  suggestionsDropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 6,
    overflow: 'hidden',
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
    marginBottom: 16,
    lineHeight: 22,
  },
  modalSummaryBox: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 20,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '500',
    maxWidth: '65%',
    textAlign: 'right',
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
