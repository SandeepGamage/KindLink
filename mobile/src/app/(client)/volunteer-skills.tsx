import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { ElderlyTextAreaField } from '@/components/profile/profile-form-fields';
import { CareHeartNotesIcon } from '@/components/ui/profile-icons';
import { ChevronBackButton } from '@/components/ui/chevron-back-button';

const VOLUNTEER_SKILL_CATEGORIES = [
  { id: 'Companionship', label: 'Companionship & Conversation', icon: '🤝', desc: 'Friendly visits, conversations, reading together, emotional warmth' },
  { id: 'Grocery Shopping', label: 'Grocery Shopping & Errands', icon: '🛒', desc: 'Market runs, food shopping, picking up essentials and groceries' },
  { id: 'Transportation', label: 'Transportation & Travel Aid', icon: '🚗', desc: 'Accompaniment to clinics, doctor appointments, local pharmacy' },
  { id: 'Tech & Digital Help', label: 'Tech & Digital Help', icon: '📱', desc: 'Smartphone settings, video calls with family, TV setup' },
  { id: 'Light Home Tasks', label: 'Light Home Tasks', icon: '🏡', desc: 'Changing bulbs, basic household organization, pet care' },
  { id: 'Gardening & Yard', label: 'Gardening & Yard Work', icon: '🌱', desc: 'Watering plants, patio cleaning, light garden upkeep' },
];

export default function VolunteerSkillsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuthContext();
  const { showToast } = useToast();
  const submitting = useRef(false);

  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    user?.careNeeds || ['Companionship', 'Grocery Shopping']
  );
  const [bio, setBio] = useState<string>(user?.bio || user?.careNotes || '');
  const [isLoading, setIsLoading] = useState(false);
  const [bioError, setBioError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (Array.isArray(user.careNeeds)) {
        setSelectedSkills(user.careNeeds);
      }
      setBio(user.bio || user.careNotes || '');
    }
  }, [user]);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId) ? prev.filter((item) => item !== skillId) : [...prev, skillId]
    );
  };

  const handleSave = async () => {
    if (submitting.current) return;

    if (selectedSkills.length === 0) {
      showToast('Please select at least one assistance skill category.', { type: 'error' });
      return;
    }

    if (bio.trim().length > 500) {
      setBioError('Bio must be 500 characters or fewer');
      showToast('Please fix the validation errors before saving.', { type: 'error' });
      return;
    }

    if (bio.trim().length > 0 && bio.trim().length < 10) {
      setBioError('Bio should be at least 10 characters long');
      showToast('Please fix the validation errors before saving.', { type: 'error' });
      return;
    }
    setBioError(null);

    submitting.current = true;
    setIsLoading(true);

    try {
      await updateUser({
        careNeeds: selectedSkills,
        bio: bio.trim(),
        careNotes: bio.trim(),
      });

      showToast('Skills and experience updated successfully!', { type: 'success' });
      router.push('/(client)/profile' as any);
    } catch (err: any) {
      showToast(
        err?.message || 'Could not update skills and experience. Please try again.',
        { type: 'error' }
      );
    } finally {
      submitting.current = false;
      setIsLoading(false);
    }
  };

  const dynamicStyles = useMemo(
    () =>
      StyleSheet.create({
        root: {
          backgroundColor: isDark ? '#0D151D' : Palette.surface,
          paddingTop: insets.top,
        },
      }),
    [isDark, insets.top]
  );

  return (
    <View style={[styles.container, dynamicStyles.root]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Top Header */}
        <View style={styles.header}>
          <ChevronBackButton
            color={isDark ? '#60A5FA' : Palette.secondary}
            targetHref="/(client)/profile"
          />
          <Text
            style={[
              styles.headerTitle,
              { color: isDark ? Palette.primary : Palette.ink },
            ]}>
            Skills & Experience
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          
          <Text style={[styles.title, { color: isDark ? Palette.primary : Palette.ink }]}>
            Helping Skills & Experience
          </Text>
          <Text style={[styles.subtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
            Tap the cards below to select the assistance types you can provide, and share your background.
          </Text>

          {/* Assistance Types Cards (similar to Care Needs cards) */}
          <View style={styles.skillsGrid}>
            {VOLUNTEER_SKILL_CATEGORIES.map((skill) => {
              const isSelected = selectedSkills.includes(skill.id);
              return (
                <Pressable
                  key={skill.id}
                  onPress={() => toggleSkill(skill.id)}
                  style={({ pressed }) => [
                    styles.skillCard,
                    {
                      backgroundColor: isSelected
                        ? isDark
                          ? 'rgba(31, 92, 150, 0.4)'
                          : Palette.blueTint
                        : isDark
                        ? Palette.ink
                        : Palette.primary,
                      borderColor: isSelected
                        ? Palette.secondary
                        : isDark
                        ? '#23384B'
                        : Palette.border,
                      opacity: pressed ? 0.8 : 1,
                    },
                  ]}>
                  <View style={styles.skillHeaderRow}>
                    <Text style={styles.skillEmoji}>{skill.icon}</Text>
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
                      {isSelected && <Ionicons name="checkmark" size={14} color="#FFFFFF" />}
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.skillTitle,
                      { color: isDark ? Palette.primary : Palette.ink },
                    ]}>
                    {skill.label}
                  </Text>
                  <Text
                    style={[
                      styles.skillDesc,
                      { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                    ]}>
                    {skill.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Volunteer Bio Card */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ]}>
            <Text
              style={[
                styles.sectionHeader,
                { color: isDark ? Palette.primary : Palette.ink },
              ]}>
              📝 Volunteer Bio & Experience
            </Text>

            <ElderlyTextAreaField
              label="About You & Helping Skills"
              sublabel="Describe your background, languages spoken, certifications (e.g. First Aid, driving licence)."
              icon={<CareHeartNotesIcon size={22} color={Palette.secondary} />}
              value={bio}
              onChangeText={(text) => {
                setBio(text);
                if (bioError) setBioError(null);
              }}
              placeholder="e.g. Passionate about supporting local seniors with grocery runs and tech support. Friendly, patient, with full driving licence and first aid training."
              minHeight={130}
              errorMessage={bioError}
            />

            <View style={styles.charCountRow}>
              <Text style={[styles.charCountText, { color: isDark ? '#64748B' : FunctionalColors.textMuted }]}>
                {bio.length} / 500 characters
              </Text>
            </View>
          </View>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.saveBtn,
              {
                opacity: pressed || isLoading ? 0.85 : 1,
                backgroundColor: Palette.secondary,
              },
            ]}>
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Save Skills & Experience</Text>
            )}
          </Pressable>

          <Pressable
            onPress={() => router.push('/(client)/profile' as any)}
            style={({ pressed }) => [
              styles.cancelBtn,
              { opacity: pressed ? 0.7 : 1 },
            ]}>
            <Text
              style={[
                styles.cancelBtnText,
                { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
              ]}>
              Cancel and Return
            </Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  backText: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 60,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  skillsGrid: {
    gap: 12,
    marginTop: 4,
  },
  skillCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  skillHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skillEmoji: {
    fontSize: 24,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  skillDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  sectionCard: {
    padding: 20,
    borderRadius: 22,
    borderWidth: 1,
    gap: 14,
    marginTop: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  sectionHeader: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  charCountRow: {
    alignItems: 'flex-end',
    marginTop: -4,
  },
  charCountText: {
    fontSize: 12,
    fontWeight: '600',
  },
  saveBtn: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: Palette.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.28,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
    }),
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    marginBottom: 20,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
