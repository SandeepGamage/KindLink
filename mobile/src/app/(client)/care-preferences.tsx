import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { useToast } from '@/context/toast-context';
import { Palette, FunctionalColors, MaxContentWidth } from '@/constants/theme';
import { PRESET_CARE_NEEDS } from '@/components/profile/care-needs-picker';
import Ionicons from '@expo/vector-icons/Ionicons';

export default function CarePreferencesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user, updateUser } = useAuthContext();
  const { showToast } = useToast();
  const submitting = useRef(false);

  const [careNeeds, setCareNeeds] = useState<string[]>(
    user?.careNeeds || []
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setCareNeeds(Array.isArray(user.careNeeds) ? user.careNeeds : []);
    }
  }, [user]);

  const handleToggleOption = (needLabel: string) => {
    if (careNeeds.includes(needLabel)) {
      setCareNeeds(careNeeds.filter((item) => item !== needLabel));
    } else {
      setCareNeeds([...careNeeds, needLabel]);
    }
  };

  const handleSave = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setIsLoading(true);

    try {
      await updateUser({
        careNeeds,
      });

      showToast('Your care preferences have been updated!');
      router.push('/(client)/profile' as any);
    } catch (err: any) {
      Alert.alert(
        'Update Failed',
        err?.message || 'Could not update preferences. Please try again.'
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
        <Pressable
          onPress={() => router.push('/(client)/profile' as any)}
          hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
          style={styles.backButton}>
          <Text style={[styles.backText, { color: Palette.secondary }]}>
            ← Back
          </Text>
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: isDark ? Palette.primary : Palette.ink },
          ]}>
          Care Needs
        </Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        
        <Text style={[styles.title, { color: isDark ? Palette.primary : Palette.ink }]}>
          How can we assist you?
        </Text>
        <Text style={[styles.subtitle, { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary }]}>
          Tap the cards below to select the type of help you need. You can select more than one.
        </Text>

        <View style={styles.grid}>
          {PRESET_CARE_NEEDS.map((preset) => {
            const isSelected = careNeeds.includes(preset.label);
            return (
              <Pressable
                key={preset.label}
                onPress={() => handleToggleOption(preset.label)}
                style={({ pressed }) => [
                  styles.card,
                  {
                    backgroundColor: isSelected 
                      ? (isDark ? 'rgba(31, 92, 150, 0.4)' : Palette.blueTint)
                      : (isDark ? Palette.ink : Palette.primary),
                    borderColor: isSelected 
                      ? Palette.secondary 
                      : (isDark ? '#23384B' : Palette.border),
                  },
                  pressed && { opacity: 0.8 },
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={preset.label}>
                
                <View style={styles.cardHeader}>
                  <Text style={styles.cardEmoji}>{preset.icon}</Text>
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
                    {isSelected && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                </View>
                
                <Text
                  style={[
                    styles.cardTitle,
                    { color: isDark ? Palette.primary : Palette.ink },
                  ]}>
                  {preset.label}
                </Text>
                
                <Text
                  style={[
                    styles.cardDesc,
                    { color: isDark ? '#94A7B8' : FunctionalColors.textSecondary },
                  ]}>
                  {preset.description}
                </Text>
              </Pressable>
            );
          })}
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
            <Text style={styles.saveBtnText}>Save Preferences</Text>
          )}
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
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 8,
    marginTop: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 22,
  },
  grid: {
    gap: 16,
    marginBottom: 30,
  },
  card: {
    borderRadius: 20,
    borderWidth: 2,
    padding: 20,
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 32,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  cardDesc: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
  saveBtn: {
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
