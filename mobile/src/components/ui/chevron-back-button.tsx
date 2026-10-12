import React from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { Palette } from '@/constants/theme';

export interface ChevronBackButtonProps {
  onPress?: () => void;
  /** Direct route to navigate to (e.g. '/(client)/profile'). Defaults to '/(client)/profile' */
  targetHref?: string;
  /** Fallback path if targetHref is not set */
  fallbackHref?: string;
  /** If true, strictly attempts router.back() instead of navigating directly to targetHref/fallbackHref */
  useGoBack?: boolean;
  color?: string;
  size?: number;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

/**
 * Reusable Chevron Back Button component.
 * Replaces old text "← Back" buttons with a consistent, accessible ChevronLeft touch target.
 * In tab-based layouts, explicitly navigates to the target tab (defaults to '/(client)/profile')
 * so that React Navigation's default tab backBehavior does not unexpectedly kick the user back to Home.
 */
export function ChevronBackButton({
  onPress,
  targetHref = '/(client)/profile',
  fallbackHref = '/(client)/profile',
  useGoBack = false,
  color = Palette.secondary,
  size = 26,
  style,
  accessibilityLabel = 'Go back',
}: ChevronBackButtonProps) {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (useGoBack && router.canGoBack()) {
      router.back();
      return;
    }

    const destination = targetHref || fallbackHref;
    if (destination) {
      if (typeof router.navigate === 'function') {
        router.navigate(destination as any);
      } else {
        router.push(destination as any);
      }
      return;
    }

    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 12, bottom: 12, left: 16, right: 16 }}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        style,
      ]}>
      <ChevronLeft size={size} color={color} strokeWidth={2.4} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.6,
    transform: [{ scale: 0.94 }],
  },
});
