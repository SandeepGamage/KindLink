import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  Dimensions,
  ActivityIndicator,
  useColorScheme,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Palette } from '@/constants/theme';
import { AssistanceRequest, CancellationReason } from '@/types/appointment';

export const CANCELLATION_REASONS: { label: CancellationReason; icon: keyof typeof Ionicons.glyphMap; description: string }[] = [
  {
    label: 'Schedule conflict / Need to reschedule',
    icon: 'calendar-outline',
    description: 'My timing changed or I need a different date.',
  },
  {
    label: 'Health or medical situation changed',
    icon: 'medkit-outline',
    description: 'Medical condition improved or doctor appointment moved.',
  },
  {
    label: 'Found alternative help / Family assisted',
    icon: 'people-outline',
    description: 'A family member, neighbor, or friend helped me.',
  },
  {
    label: 'No longer need this assistance',
    icon: 'checkmark-circle-outline',
    description: 'The task is no longer necessary.',
  },
  {
    label: 'Volunteer unavailable or unresponsive',
    icon: 'person-remove-outline',
    description: 'Unable to coordinate with the assigned volunteer.',
  },
  {
    label: 'Weather or transportation issue',
    icon: 'rainy-outline',
    description: 'Bad weather, road closures, or transit delays.',
  },
  {
    label: 'Personal emergency',
    icon: 'warning-outline',
    description: 'An unexpected urgent matter occurred.',
  },
  {
    label: 'Other reason',
    icon: 'ellipsis-horizontal-circle-outline',
    description: 'Something else not listed above.',
  },
];

interface CancellationModalProps {
  visible: boolean;
  request: AssistanceRequest | null;
  loading?: boolean;
  onClose: () => void;
  onConfirmCancel: (reason: string, note: string) => void;
  onReschedule?: (request: AssistanceRequest) => void;
}

export function CancellationModal({
  visible,
  request,
  loading = false,
  onClose,
  onConfirmCancel,
  onReschedule,
}: CancellationModalProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [selectedReason, setSelectedReason] = useState<CancellationReason | ''>('');
  const [additionalNote, setAdditionalNote] = useState('');
  const [validationError, setValidationError] = useState('');

  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      setSelectedReason('');
      setAdditionalNote('');
      setValidationError('');
      slideAnim.setValue(Dimensions.get('window').height);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 24,
        mass: 0.8,
        stiffness: 120,
      }).start();
    }
  }, [visible, slideAnim]);

  const handleSelectReason = (reason: CancellationReason) => {
    setSelectedReason(reason);
    if (validationError) setValidationError('');
  };

  const handleConfirm = () => {
    if (!selectedReason) {
      setValidationError('Please select a reason for cancellation.');
      return;
    }

    if (selectedReason === 'Other reason' && !additionalNote.trim()) {
      setValidationError('Please provide a brief explanation for "Other reason".');
      return;
    }

    onConfirmCancel(selectedReason, additionalNote.trim());
  };

  const handleRescheduleClick = () => {
    if (request && onReschedule) {
      onClose();
      onReschedule(request);
    }
  };

  if (!visible && !request) return null;

  const bgCard = isDark ? '#141E28' : Palette.primary;
  const bgSurface = isDark ? '#0D151C' : Palette.surface;
  const borderCol = isDark ? '#233240' : Palette.border;
  const inkCol = isDark ? '#FFFFFF' : Palette.ink;
  const subtextCol = isDark ? '#94A3B8' : '#5A6E7F';

  const volunteerName = request?.provider?.name || request?.assignedVolunteerName;
  const isAssigned = !!volunteerName;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={[
            styles.sheetContainer,
            {
              backgroundColor: bgCard,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Drag Handle */}
          <View style={[styles.dragHandle, { backgroundColor: borderCol }]} />

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerIconContainer}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={[styles.headerTitle, { color: inkCol }]}>Cancel Request</Text>
              <Text style={[styles.headerSubtitle, { color: subtextCol }]}>
                Help us understand why you are cancelling this service
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn} hitSlop={12}>
              <Ionicons name="close" size={22} color={subtextCol} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Request Summary Card */}
            {request && (
              <View style={[styles.summaryCard, { backgroundColor: bgSurface, borderColor: borderCol }]}>
                <View style={styles.summaryRow}>
                  <View style={[styles.badgePill, { backgroundColor: Palette.blueTint }]}>
                    <Text style={[styles.badgePillText, { color: Palette.secondary }]}>
                      {request.taskType}
                    </Text>
                  </View>
                  <Text style={[styles.summaryDateText, { color: subtextCol }]}>
                    📅 {request.preferredTime || (request.date ? new Date(request.date).toLocaleDateString() : '')}
                  </Text>
                </View>
                <Text style={[styles.summaryTitle, { color: inkCol }]} numberOfLines={1}>
                  {request.title || `${request.taskType} Assistance`}
                </Text>
              </View>
            )}

            {/* Volunteer Alert Banner if Assigned */}
            {isAssigned && (
              <View style={styles.volunteerAlertBanner}>
                <Ionicons name="information-circle" size={20} color="#E08A3C" style={styles.volunteerAlertIcon} />
                <View style={styles.volunteerAlertContent}>
                  <Text style={styles.volunteerAlertTitle}>Volunteer Assigned</Text>
                  <Text style={styles.volunteerAlertDesc}>
                    <Text style={styles.volunteerAlertBoldName}>{volunteerName}</Text> has accepted this request.
                    Cancelling will notify them immediately and free their schedule.
                  </Text>
                </View>
              </View>
            )}

            {/* Reschedule Suggestion Card */}
            {onReschedule && request && request.status !== 'completed' && (
              <TouchableOpacity
                style={[styles.reschedulePromptCard, { borderColor: Palette.secondary }]}
                onPress={handleRescheduleClick}
                activeOpacity={0.8}
              >
                <View style={styles.reschedulePromptLeft}>
                  <View style={[styles.rescheduleIconCircle, { backgroundColor: Palette.blueTint }]}>
                    <Ionicons name="calendar" size={18} color={Palette.secondary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.reschedulePromptTitle, { color: Palette.secondary }]}>
                      Need a different time instead?
                    </Text>
                    <Text style={[styles.reschedulePromptSubtitle, { color: subtextCol }]}>
                      Tap here to reschedule without losing your request.
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={18} color={Palette.secondary} />
              </TouchableOpacity>
            )}

            {/* Prompt Label */}
            <Text style={[styles.sectionHeading, { color: inkCol }]}>
              Please select a cancellation reason: <Text style={{ color: '#DC2626' }}>*</Text>
            </Text>

            {/* Reason Options List */}
            <View style={styles.reasonsList}>
              {CANCELLATION_REASONS.map((item) => {
                const isSelected = selectedReason === item.label;
                return (
                  <TouchableOpacity
                    key={item.label}
                    style={[
                      styles.reasonCard,
                      {
                        backgroundColor: isSelected
                          ? isDark
                            ? 'rgba(31, 92, 150, 0.2)'
                            : 'rgba(31, 92, 150, 0.06)'
                          : bgSurface,
                        borderColor: isSelected ? Palette.secondary : borderCol,
                      },
                    ]}
                    onPress={() => handleSelectReason(item.label)}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.reasonIconWrap,
                        {
                          backgroundColor: isSelected
                            ? Palette.secondary
                            : isDark
                            ? '#233240'
                            : Palette.blueTint,
                        },
                      ]}
                    >
                      <Ionicons
                        name={item.icon}
                        size={18}
                        color={isSelected ? '#FFFFFF' : Palette.secondary}
                      />
                    </View>

                    <View style={styles.reasonTextContainer}>
                      <Text
                        style={[
                          styles.reasonTitle,
                          {
                            color: isSelected ? Palette.secondary : inkCol,
                            fontWeight: isSelected ? '700' : '600',
                          },
                        ]}
                      >
                        {item.label}
                      </Text>
                      <Text style={[styles.reasonSubtitle, { color: subtextCol }]}>
                        {item.description}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.radioCircle,
                        {
                          borderColor: isSelected ? Palette.secondary : borderCol,
                        },
                      ]}
                    >
                      {isSelected && <View style={[styles.radioDot, { backgroundColor: Palette.secondary }]} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Optional/Required Detail Input */}
            <View style={styles.noteSection}>
              <View style={styles.noteHeaderRow}>
                <Text style={[styles.noteHeading, { color: inkCol }]}>
                  Additional Details & Notes{' '}
                  {selectedReason === 'Other reason' ? (
                    <Text style={{ color: '#DC2626' }}>*</Text>
                  ) : (
                    <Text style={[styles.optionalTag, { color: subtextCol }]}> (optional)</Text>
                  )}
                </Text>
                <Text style={[styles.charCount, { color: subtextCol }]}>
                  {additionalNote.length}/200
                </Text>
              </View>

              <TextInput
                style={[
                  styles.noteInput,
                  {
                    backgroundColor: bgSurface,
                    borderColor: validationError && selectedReason === 'Other reason' && !additionalNote.trim() ? '#DC2626' : borderCol,
                    color: inkCol,
                  },
                ]}
                placeholder={
                  selectedReason === 'Other reason'
                    ? 'Please specify your reason here...'
                    : 'Provide any additional context or instructions...'
                }
                placeholderTextColor={subtextCol}
                value={additionalNote}
                onChangeText={(text) => {
                  setAdditionalNote(text.slice(0, 200));
                  if (validationError) setValidationError('');
                }}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Validation Message */}
            {validationError ? (
              <View style={styles.validationBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.validationText}>{validationError}</Text>
              </View>
            ) : null}
          </ScrollView>

          {/* Action Buttons */}
          <View style={[styles.footerActions, { borderTopColor: borderCol }]}>
            <TouchableOpacity
              style={[styles.keepBtn, { backgroundColor: isDark ? '#233240' : Palette.blueTint }]}
              onPress={onClose}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={[styles.keepBtnText, { color: Palette.secondary }]}>Keep Request</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.cancelBtn,
                { backgroundColor: '#DC2626', opacity: loading ? 0.7 : 1 },
              ]}
              onPress={handleConfirm}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="close-circle" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.cancelBtnText}>Confirm Cancel</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: Dimensions.get('window').height * 0.88,
    paddingTop: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 10,
  },
  dragHandle: {
    width: 44,
    height: 5,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 14,
    gap: 12,
  },
  headerIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  scrollBody: {
    maxHeight: Dimensions.get('window').height * 0.62,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  summaryCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 14,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  summaryDateText: {
    fontSize: 12,
    fontWeight: '500',
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  volunteerAlertBanner: {
    flexDirection: 'row',
    backgroundColor: 'rgba(224, 138, 60, 0.12)',
    borderColor: '#E08A3C',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 14,
  },
  volunteerAlertIcon: {
    marginTop: 2,
  },
  volunteerAlertContent: {
    flex: 1,
  },
  volunteerAlertTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#E08A3C',
    marginBottom: 2,
  },
  volunteerAlertDesc: {
    fontSize: 12,
    color: '#9A5B1E',
    lineHeight: 18,
  },
  volunteerAlertBoldName: {
    fontWeight: '700',
  },
  reschedulePromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(31, 92, 150, 0.08)',
    borderWidth: 1.2,
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 12,
    marginBottom: 18,
  },
  reschedulePromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  rescheduleIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reschedulePromptTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  reschedulePromptSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 10,
  },
  reasonsList: {
    gap: 8,
    marginBottom: 16,
  },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.2,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  reasonIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonTextContainer: {
    flex: 1,
  },
  reasonTitle: {
    fontSize: 13,
  },
  reasonSubtitle: {
    fontSize: 11,
    marginTop: 2,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  noteSection: {
    marginBottom: 12,
  },
  noteHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  noteHeading: {
    fontSize: 13,
    fontWeight: '600',
  },
  optionalTag: {
    fontSize: 12,
    fontWeight: '400',
  },
  charCount: {
    fontSize: 11,
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    fontSize: 13,
    minHeight: 70,
  },
  validationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  validationText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    borderTopWidth: 1,
  },
  keepBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keepBtnText: {
    fontSize: 14,
    fontWeight: '700',
  },
  cancelBtn: {
    flex: 1.3,
    flexDirection: 'row',
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
