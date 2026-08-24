import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import Svg, { Path, Circle } from 'react-native-svg';
import { Palette, FunctionalColors } from '@/constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ---------------------------------------------------------------------------
// SVG Icons
// ---------------------------------------------------------------------------

function ChevronDownIcon({
  size = 18,
  color = Palette.secondary,
  isOpen = false,
}: {
  size?: number;
  color?: string;
  isOpen?: boolean;
}) {
  return (
    <View style={{ transform: [{ rotate: isOpen ? '180deg' : '0deg' }] }}>
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M6 9L12 15L18 9"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}

function CheckIcon({ size = 14, color = Palette.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 6L9 17L4 12"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeartHandIcon({ size = 20, color = Palette.secondary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon({ size = 16, color = Palette.primary }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// Standard Preset Care Options
// ---------------------------------------------------------------------------

export const PRESET_CARE_NEEDS: { label: string; icon: string; description: string }[] = [
  {
    label: 'Mobility Assistance',
    icon: '🦯',
    description: 'Walking support, wheelchair aid, or gentle steadying',
  },
  {
    label: 'Companionship & Conversation',
    icon: '☕',
    description: 'Friendly social visits, tea chats, and emotional warmth',
  },
  {
    label: 'Meal Preparation & Nutrition',
    icon: '🍲',
    description: 'Cooking healthy home meals, tea prep, or dietary aid',
  },
  {
    label: 'Medication Reminders',
    icon: '💊',
    description: 'Timely dosage prompts and gentle medication check-ins',
  },
  {
    label: 'Grocery & Essential Shopping',
    icon: '🛒',
    description: 'Weekly food errands, pharmacy pickup, and market trips',
  },
  {
    label: 'Transportation to Appointments',
    icon: '🚗',
    description: 'Rides and escorting to GP clinics, hospital, or church',
  },
  {
    label: 'Light Housekeeping & Chores',
    icon: '🧹',
    description: 'Tidying up living areas, laundry, and light organizing',
  },
  {
    label: 'Tech & Digital Device Support',
    icon: '📱',
    description: 'Smartphone, tablet, video call, and TV remote guidance',
  },
  {
    label: 'Hearing / Vision Support',
    icon: '👓',
    description: 'Reading letters, audio assistance, and sensory care',
  },
];

// ---------------------------------------------------------------------------
// Component Props
// ---------------------------------------------------------------------------

interface CareNeedsPickerProps {
  selectedNeeds: string[];
  onChangeNeeds: (needs: string[]) => void;
  label?: string;
  sublabel?: string;
  isDark?: boolean;
  hideHeader?: boolean;
}

export function CareNeedsPicker({
  selectedNeeds = [],
  onChangeNeeds,
  label = 'Care Preferences & Needs',
  sublabel = 'Select assistance or mobility needs so volunteers can support you best',
  isDark = false,
  hideHeader = false,
}: CareNeedsPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [customNeedText, setCustomNeedText] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const toggleDropdown = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsOpen((prev) => !prev);
  };

  const handleToggleOption = (needLabel: string) => {
    if (selectedNeeds.includes(needLabel)) {
      onChangeNeeds(selectedNeeds.filter((item) => item !== needLabel));
    } else {
      onChangeNeeds([...selectedNeeds, needLabel]);
    }
  };

  const handleRemoveNeed = (needLabel: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChangeNeeds(selectedNeeds.filter((item) => item !== needLabel));
  };

  const handleToggleOther = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowOtherInput((prev) => !prev);
    setInputError(null);
  };

  const handleAddCustomNeed = () => {
    const trimmed = customNeedText.trim();
    if (!trimmed) {
      setInputError('Please enter a specific care need');
      return;
    }
    if (selectedNeeds.some((n) => n.toLowerCase() === trimmed.toLowerCase())) {
      setInputError('This need is already added');
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onChangeNeeds([...selectedNeeds, trimmed]);
    setCustomNeedText('');
    setInputError(null);
  };

  return (
    <View style={styles.container}>
      {/* ─── Header Label ─── */}
      {!hideHeader && (
        <View style={styles.labelRow}>
          <View style={styles.iconBox}>
            <HeartHandIcon size={19} color={isDark ? '#60A5FA' : Palette.secondary} />
          </View>
          <Text style={[styles.label, { color: isDark ? Palette.primary : Palette.ink }]}>
            {label}
          </Text>
          {selectedNeeds.length > 0 && (
            <View
              style={[
                styles.countBadge,
                { backgroundColor: isDark ? 'rgba(31, 92, 150, 0.4)' : Palette.blueTint },
              ]}>
              <Text
                style={[
                  styles.countBadgeText,
                  { color: isDark ? '#93C5FD' : Palette.secondary },
                ]}>
                {selectedNeeds.length} selected
              </Text>
            </View>
          )}
        </View>
      )}

      {sublabel ? (
        <Text
          style={[
            styles.sublabel,
            { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
          ]}>
          {sublabel}
        </Text>
      ) : null}

      {/* ─── Selected Needs Badges Row ─── */}
      {selectedNeeds.length > 0 && (
        <View style={styles.chipsContainer}>
          {selectedNeeds.map((need) => (
            <View
              key={need}
              style={[
                styles.chip,
                {
                  backgroundColor: isDark ? '#1C3247' : Palette.blueTint,
                  borderColor: isDark ? '#2B4A6A' : '#BFDBFE',
                },
              ]}>
              <Text
                style={[
                  styles.chipText,
                  { color: isDark ? '#93C5FD' : Palette.secondary },
                ]}>
                {need}
              </Text>
              <Pressable
                onPress={() => handleRemoveNeed(need)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.chipRemoveBtn}
                accessibilityRole="button"
                accessibilityLabel={`Remove ${need}`}>
                <Text style={[styles.chipRemoveText, { color: isDark ? '#93C5FD' : Palette.secondary }]}>
                  ✕
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}

      {/* ─── Dropdown Trigger Button ─── */}
      <Pressable
        onPress={toggleDropdown}
        style={({ pressed }) => [
          styles.dropdownTrigger,
          {
            backgroundColor: isDark ? Palette.ink : Palette.primary,
            borderColor: isOpen ? Palette.secondary : isDark ? '#23384B' : Palette.border,
            borderWidth: isOpen ? 1.8 : 1.5,
          },
          pressed && styles.dropdownTriggerPressed,
        ]}
        accessibilityRole="combobox"
        accessibilityState={{ expanded: isOpen }}
        accessibilityLabel="Select care preferences and needs">
        <View style={styles.triggerLeft}>
          <Text style={styles.triggerIcon}>📋</Text>
          <Text
            style={[
              styles.triggerText,
              {
                color:
                  selectedNeeds.length > 0
                    ? isDark
                      ? Palette.primary
                      : Palette.ink
                    : isDark
                      ? '#677B8D'
                      : FunctionalColors.textMuted,
              },
            ]}>
            {selectedNeeds.length > 0
              ? `${selectedNeeds.length} care need${selectedNeeds.length > 1 ? 's' : ''} specified`
              : 'Choose care preferences & needs...'}
          </Text>
        </View>
        <ChevronDownIcon
          size={18}
          color={isDark ? '#60A5FA' : Palette.secondary}
          isOpen={isOpen}
        />
      </Pressable>

      {/* ─── Dropdown Options Menu ─── */}
      {isOpen && (
        <View
          style={[
            styles.optionsMenu,
            {
              backgroundColor: isDark ? '#142230' : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
            },
          ]}>
          <Text
            style={[
              styles.menuNotice,
              { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
            ]}>
            Tap all that apply to you:
          </Text>

          {PRESET_CARE_NEEDS.map((preset) => {
            const isSelected = selectedNeeds.includes(preset.label);
            return (
              <Pressable
                key={preset.label}
                onPress={() => handleToggleOption(preset.label)}
                style={({ pressed }) => [
                  styles.optionRow,
                  isSelected && {
                    backgroundColor: isDark ? 'rgba(31, 92, 150, 0.25)' : Palette.blueTint,
                  },
                  pressed && { opacity: 0.8 },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={preset.label}>
                <Text style={styles.optionEmoji}>{preset.icon}</Text>
                <View style={styles.optionTextCol}>
                  <Text
                    style={[
                      styles.optionTitle,
                      { color: isDark ? Palette.primary : Palette.ink },
                      isSelected && { color: isDark ? '#93C5FD' : Palette.secondary },
                    ]}>
                    {preset.label}
                  </Text>
                  <Text
                    style={[
                      styles.optionDesc,
                      { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                    ]}>
                    {preset.description}
                  </Text>
                </View>
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: isSelected
                        ? Palette.secondary
                        : isDark
                          ? '#2B4A6A'
                          : Palette.border,
                      backgroundColor: isSelected
                        ? Palette.secondary
                        : isDark
                          ? '#0D151D'
                          : Palette.primary,
                    },
                  ]}>
                  {isSelected && <CheckIcon size={12} color="#FFFFFF" />}
                </View>
              </Pressable>
            );
          })}

          {/* ─── "Other" Option ─── */}
          <Pressable
            onPress={handleToggleOther}
            style={({ pressed }) => [
              styles.optionRow,
              styles.otherOptionRow,
              showOtherInput && {
                backgroundColor: isDark ? 'rgba(31, 92, 150, 0.25)' : Palette.blueTint,
              },
              pressed && { opacity: 0.8 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Add other custom care need">
            <Text style={styles.optionEmoji}>✨</Text>
            <View style={styles.optionTextCol}>
              <Text
                style={[
                  styles.optionTitle,
                  { color: isDark ? '#93C5FD' : Palette.secondary },
                ]}>
                Other (Add Custom Need)
              </Text>
              <Text
                style={[
                  styles.optionDesc,
                  { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                ]}>
                Type in any specific or unique care preferences
              </Text>
            </View>
            <View
              style={[
                styles.otherToggleBtn,
                {
                  backgroundColor: showOtherInput
                    ? Palette.secondary
                    : isDark
                      ? '#1C3247'
                      : Palette.blueTint,
                },
              ]}>
              <Text
                style={[
                  styles.otherToggleText,
                  {
                    color: showOtherInput
                      ? '#FFFFFF'
                      : isDark
                        ? '#93C5FD'
                        : Palette.secondary,
                  },
                ]}>
                {showOtherInput ? 'Hide' : '+ Add'}
              </Text>
            </View>
          </Pressable>

          {/* ─── Custom Input Field for "Other" ─── */}
          {showOtherInput && (
            <View
              style={[
                styles.customInputContainer,
                {
                  backgroundColor: isDark ? '#0D151D' : Palette.surface,
                  borderColor: isDark ? '#23384B' : Palette.border,
                },
              ]}>
              <Text
                style={[
                  styles.customInputTitle,
                  { color: isDark ? Palette.primary : Palette.ink },
                ]}>
                Enter custom care need:
              </Text>
              <View style={styles.customInputRow}>
                <TextInput
                  style={[
                    styles.customInput,
                    {
                      backgroundColor: isDark ? Palette.ink : Palette.primary,
                      borderColor: inputError
                        ? FunctionalColors.danger
                        : isDark
                          ? '#2B4A6A'
                          : Palette.border,
                      color: isDark ? Palette.primary : Palette.ink,
                    },
                  ]}
                  placeholder="e.g. Needs sign language / Pet care assistance"
                  placeholderTextColor={isDark ? '#677B8D' : FunctionalColors.textMuted}
                  value={customNeedText}
                  onChangeText={(text) => {
                    setCustomNeedText(text);
                    if (inputError) setInputError(null);
                  }}
                  autoCapitalize="sentences"
                  returnKeyType="done"
                  onSubmitEditing={handleAddCustomNeed}
                />
                <Pressable
                  onPress={handleAddCustomNeed}
                  style={({ pressed }) => [
                    styles.addBtn,
                    { backgroundColor: Palette.secondary },
                    pressed && styles.addBtnPressed,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel="Add custom care need">
                  <PlusIcon size={16} color="#FFFFFF" />
                  <Text style={styles.addBtnText}>Add</Text>
                </Pressable>
              </View>

              {inputError ? (
                <Text style={styles.customErrorText}>⚠️ {inputError}</Text>
              ) : null}
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  iconBox: {
    marginRight: 2,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.ink,
    letterSpacing: -0.2,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 'auto',
  },
  countBadgeText: {
    fontSize: 11.5,
    fontWeight: '800',
  },
  sublabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: FunctionalColors.textSecondary,
    lineHeight: 17,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 2,
    marginBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 14,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  chipRemoveBtn: {
    padding: 2,
  },
  chipRemoveText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dropdownTrigger: {
    height: 48,
    borderRadius: 14,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  dropdownTriggerPressed: {
    opacity: 0.85,
  },
  triggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  triggerIcon: {
    fontSize: 16,
  },
  triggerText: {
    fontSize: 14.5,
    fontWeight: '600',
    flex: 1,
  },
  optionsMenu: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
    marginTop: 4,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
    }),
  },
  menuNotice: {
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 10,
  },
  otherOptionRow: {
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 10,
    marginTop: 2,
  },
  optionEmoji: {
    fontSize: 18,
  },
  optionTextCol: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 13.5,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  optionDesc: {
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
    lineHeight: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otherToggleBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  otherToggleText: {
    fontSize: 12,
    fontWeight: '700',
  },
  customInputContainer: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 10,
    marginTop: 4,
    gap: 6,
  },
  customInputTitle: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  customInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customInput: {
    flex: 1,
    height: 42,
    borderRadius: 10,
    borderWidth: 1.2,
    paddingHorizontal: 12,
    fontSize: 13.5,
    fontWeight: '600',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 42,
    paddingHorizontal: 14,
    borderRadius: 10,
    justifyContent: 'center',
  },
  addBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  customErrorText: {
    color: FunctionalColors.danger,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
