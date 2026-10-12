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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { ChevronBackButton } from '@/components/ui/chevron-back-button';

const AVAILABILITY_OPTIONS = [
  { id: 'Weekends', label: 'Weekends', icon: '🗓️', desc: 'Saturday & Sunday support sessions' },
  { id: 'Mornings', label: 'Mornings', icon: '🌅', desc: '8:00 AM – 12:00 PM time slots' },
  { id: 'Afternoons', label: 'Afternoons', icon: '☀️', desc: '12:00 PM – 5:00 PM time slots' },
  { id: 'Evenings', label: 'Evenings', icon: '🌆', desc: '5:00 PM – 8:00 PM check-ins & visits' },
  { id: 'Flexible', label: 'Flexible / On-Demand', icon: '⚡', desc: 'Available on notice based on daily free time' },
];

export default function VolunteerAvailabilityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuthContext();
  const { showToast } = useToast();
  const submitting = useRef(false);

  const [availability, setAvailability] = useState<string[]>(
    user?.availability || ['Weekends', 'Flexible']
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && Array.isArray(user.availability)) {
      setAvailability(user.availability);
    }
  }, [user]);

  const toggleAvailability = (opt: string) => {
    setAvailability((prev) =>
      prev.includes(opt) ? prev.filter((item) => item !== opt) : [...prev, opt]
    );
  };

  const handleSave = async () => {
    if (submitting.current) return;

    if (availability.length === 0) {
      showToast('Please select at least one availability schedule option.', { type: 'error' });
      return;
    }

    submitting.current = true;
    setIsLoading(true);

    try {
      await updateUser({
        availability,
      });

      showToast('Availability schedule updated successfully!', { type: 'success' });
      router.push('/(client)/profile' as any);
    } catch (err: any) {
      showToast(
        err?.message || 'Could not update availability. Please try again.',
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
          Availability & Schedule
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.title, { color: isDark ? Palette.primary : Palette.ink }]}>
          Helper Availability & Schedule
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
          Select the days and time slots when you are typically free to assist community members.
        </Text>

        {/* Schedule Cards */}
        <View style={styles.cardsList}>
          {AVAILABILITY_OPTIONS.map((opt) => {
            const isSelected = availability.includes(opt.id);
            return (
              <Pressable
                key={opt.id}
                onPress={() => toggleAvailability(opt.id)}
                style={({ pressed }) => [
                  styles.optionCard,
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
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{opt.icon}</Text>
                  <View
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor: isSelected
                          ? Palette.secondary
                          : isDark
                          ? '#142230'
                          : Palette.surface,
                        borderColor: isSelected
                          ? Palette.secondary
                          : isDark
                          ? '#23384B'
                          : Palette.border,
                      },
                    ]}>
                    <Text
                      style={[
                        styles.checkText,
                        { color: isSelected ? '#FFFFFF' : 'transparent' },
                      ]}>
                      ✓
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  {opt.label}
                </Text>
                <Text
                  style={[
                    styles.cardDesc,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                  ]}>
                  {opt.desc}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Info Card */}
        <View
          style={[
            styles.infoCard,
            {
              backgroundColor: isDark ? '#142230' : '#F0F6FC',
              borderColor: isDark ? '#23384B' : '#BFDBFE',
            },
          ]}>
          <Text style={styles.infoIcon}>💡</Text>
          <Text
            style={[
              styles.infoText,
              { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
            ]}>
            Local requests will prioritize volunteers whose schedules match. You can change this at any time.
          </Text>
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
            <Text style={styles.saveBtnText}>Save Availability Schedule</Text>
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
  cardsList: {
    gap: 12,
    marginTop: 4,
  },
  optionCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 24,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: {
    fontSize: 14,
    fontWeight: '900',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
    flex: 1,
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
