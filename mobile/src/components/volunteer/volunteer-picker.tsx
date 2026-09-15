import React from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import { Volunteer } from '@/types/appointment';

export interface VolunteerPickerProps {
  volunteers: Volunteer[];
  loadingVolunteers: boolean;
  selectedVolunteer: Volunteer | null;
  onSelectVolunteer: (volunteer: Volunteer | null) => void;
  isDark?: boolean;
  primaryColor?: string;
  colors?: {
    text?: string;
    textSecondary?: string;
    [key: string]: any;
  };
}

export function VolunteerPicker({
  volunteers,
  loadingVolunteers,
  selectedVolunteer,
  onSelectVolunteer,
  isDark: isDarkProp,
  primaryColor = '#1F5C96',
  colors: colorsProp,
}: VolunteerPickerProps) {
  const scheme = useColorScheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : scheme === 'dark';
  const colors = colorsProp || Colors[isDark ? 'dark' : 'light'];

  return (
    <View style={styles.fieldGroup}>
      <View style={styles.labelRow}>
        <View style={styles.pickerLabelRow}>
          <Ionicons name="people" size={18} color={primaryColor} />
          <ThemedText type="subtitle" style={styles.label}>
            Available Volunteers
          </ThemedText>
        </View>
        <View style={[styles.badgePill, isDark ? styles.badgePillDark : styles.badgePillLight]}>
          <ThemedText style={styles.badgePillText}>
            {volunteers.length} Active
          </ThemedText>
        </View>
      </View>
      <ThemedText style={[styles.helperSubtext, isDark ? styles.helperSubtextDark : styles.helperSubtextLight]}>
        Select a preferred volunteer, or choose Broadcast to notify all available volunteers in your area.
      </ThemedText>

      {loadingVolunteers ? (
        <View style={styles.volunteersLoadingBox}>
          <ActivityIndicator size="small" color={primaryColor} />
          <ThemedText style={[styles.loadingText, isDark ? styles.loadingTextDark : styles.loadingTextLight]}>
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
              isDark ? styles.volunteerCardDark : styles.volunteerCardLight,
              selectedVolunteer === null && styles.volunteerCardSelected,
            ]}
            onPress={() => onSelectVolunteer(null)}
            activeOpacity={0.85}
          >
            <View style={[styles.volunteerAvatarCircle, styles.volunteerAvatarBroadcast]}>
              <Ionicons name="radio-outline" size={24} color="#FFFFFF" />
            </View>
            <ThemedText style={[styles.volunteerName, isDark ? styles.volunteerNameDark : styles.volunteerNameLight]} numberOfLines={1}>
              All Volunteers
            </ThemedText>
            <ThemedText style={[styles.volunteerRoleTag, styles.volunteerRoleTagBroadcast]}>
              Broadcast
            </ThemedText>
            <ThemedText style={[styles.volunteerBio, isDark ? styles.volunteerBioDark : styles.volunteerBioLight]} numberOfLines={2}>
              Notify any nearby volunteer to accept this request
            </ThemedText>
            <View style={styles.selectionIndicator}>
              {selectedVolunteer === null ? (
                <View style={styles.selectedRadioCheck}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.unselectedRadioCircle, isDark ? styles.unselectedRadioCircleDark : styles.unselectedRadioCircleLight]} />
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
                  isDark ? styles.volunteerCardDark : styles.volunteerCardLight,
                  isSelected && styles.volunteerCardSelected,
                ]}
                onPress={() => onSelectVolunteer(vol)}
                activeOpacity={0.85}
              >
                <View style={[styles.volunteerAvatarCircle, styles.volunteerAvatarPrimary]}>
                  <ThemedText style={styles.volunteerInitials}>{initials}</ThemedText>
                </View>
                <View style={styles.volunteerNameRow}>
                  <ThemedText style={[styles.volunteerName, isDark ? styles.volunteerNameDark : styles.volunteerNameLight]} numberOfLines={1}>
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
                <ThemedText style={[styles.volunteerBio, isDark ? styles.volunteerBioDark : styles.volunteerBioLight]} numberOfLines={2}>
                  {vol.bio || vol.address || 'Verified KindLink Volunteer'}
                </ThemedText>
                {vol.availability && vol.availability.length > 0 && (
                  <View style={[styles.availBadge, isDark ? styles.availBadgeDark : styles.availBadgeLight]}>
                    <ThemedText style={styles.availBadgeText} numberOfLines={1}>
                      {vol.availability[0]}
                    </ThemedText>
                  </View>
                )}
                <View style={styles.selectionIndicator}>
                  {isSelected ? (
                    <View style={styles.selectedRadioCheck}>
                      <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                    </View>
                  ) : (
                    <View style={[styles.unselectedRadioCircle, isDark ? styles.unselectedRadioCircleDark : styles.unselectedRadioCircleLight]} />
                  )}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {selectedVolunteer && (
        <View style={[styles.selectedBanner, isDark ? styles.selectedBannerDark : styles.selectedBannerLight]}>
          <Ionicons name="information-circle" size={18} color={primaryColor} />
          <ThemedText style={[styles.selectedBannerText, isDark ? styles.selectedBannerTextDark : styles.selectedBannerTextLight]}>
            Preferred volunteer selected: <ThemedText style={styles.selectedBannerHighlightText}>{selectedVolunteer.name}</ThemedText>
          </ThemedText>
          <TouchableOpacity onPress={() => onSelectVolunteer(null)} style={styles.selectedBannerDismissBtn}>
            <Ionicons name="close" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  pickerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helperSubtext: {
    fontSize: 13,
    marginBottom: 10,
    lineHeight: 18,
  },
  helperSubtextLight: {
    color: '#5A6E7F',
  },
  helperSubtextDark: {
    color: '#94A7B8',
  },
  badgePill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgePillLight: {
    backgroundColor: '#E8F2FB',
  },
  badgePillDark: {
    backgroundColor: 'rgba(31, 92, 150, 0.25)',
  },
  badgePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1F5C96',
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
  loadingTextLight: {
    color: '#5A6E7F',
  },
  loadingTextDark: {
    color: '#94A7B8',
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
  volunteerCardLight: {
    backgroundColor: '#FFFFFF',
    borderColor: '#DCE6EF',
  },
  volunteerCardDark: {
    backgroundColor: '#141E28',
    borderColor: '#233240',
  },
  volunteerCardSelected: {
    borderColor: '#1F5C96',
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
  volunteerAvatarBroadcast: {
    backgroundColor: '#E08A3C',
  },
  volunteerAvatarPrimary: {
    backgroundColor: '#1F5C96',
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
  volunteerNameLight: {
    color: '#17242E',
  },
  volunteerNameDark: {
    color: '#FFFFFF',
  },
  volunteerRoleTag: {
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  volunteerRoleTagBroadcast: {
    color: '#E08A3C',
    backgroundColor: 'rgba(224, 138, 60, 0.12)',
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
  volunteerBioLight: {
    color: '#5A6E7F',
  },
  volunteerBioDark: {
    color: '#94A7B8',
  },
  availBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
    maxWidth: '100%',
  },
  availBadgeLight: {
    backgroundColor: '#EEF4FA',
  },
  availBadgeDark: {
    backgroundColor: '#1C2936',
  },
  availBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1F5C96',
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
    backgroundColor: '#1F5C96',
  },
  unselectedRadioCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  unselectedRadioCircleLight: {
    borderColor: '#DCE6EF',
  },
  unselectedRadioCircleDark: {
    borderColor: '#233240',
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
    borderColor: '#1F5C96',
  },
  selectedBannerLight: {
    backgroundColor: '#EDF5FD',
  },
  selectedBannerDark: {
    backgroundColor: 'rgba(31, 92, 150, 0.18)',
  },
  selectedBannerText: {
    flex: 1,
    fontSize: 13,
  },
  selectedBannerTextLight: {
    color: '#17242E',
  },
  selectedBannerTextDark: {
    color: '#FFFFFF',
  },
  selectedBannerHighlightText: {
    fontWeight: '700',
    color: '#1F5C96',
  },
  selectedBannerDismissBtn: {
    padding: 2,
  },
});
