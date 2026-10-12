/**
 * social-button.tsx
 *
 * Reusable social login button for Google, Facebook, and Apple.
 * Icons are rendered with inline SVG-like paths via react-native-svg or
 * simple Unicode/emoji fallbacks to avoid a heavy dependency.
 *
 * Design: light grey pill-shaped button with the provider logo centred.
 */

import React, { useCallback } from 'react';
import {
  Pressable,
  View,
  Text,
  StyleSheet,
  Platform,
  type PressableProps,
} from 'react-native';
import { AuthColors } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SocialProvider = 'google' | 'facebook' | 'apple';

export interface SocialButtonProps extends Omit<PressableProps, 'style'> {
  provider: SocialProvider;
  /** Defaults to a toast saying "coming soon" */
  onPress?: () => void;
}

// ---------------------------------------------------------------------------
// Icon components (pure RN, no extra dep needed)
// ---------------------------------------------------------------------------

/**
 * Renders a coloured "G" in Google's brand font weight to represent Google.
 * A proper SVG icon would require react-native-svg; we use styled text here
 * for zero-dependency correctness and perfect match to the mockup's simple icons.
 */
function GoogleIcon() {
  return (
    <Text style={[styles.iconText, { color: '#4285F4' }]} accessibilityLabel="Google">
      G
    </Text>
  );
}

function FacebookIcon() {
  return (
    <Text style={[styles.iconText, { color: '#1877F2' }]} accessibilityLabel="Facebook">
      f
    </Text>
  );
}

function AppleIcon() {
  return (
    <Text
      style={[
        styles.iconText,
        { color: '#000000', fontSize: Platform.OS === 'android' ? 22 : 24 },
      ]}
      accessibilityLabel="Apple">
      {'\uF8FF'  /* Private use Apple logo — shows correctly on iOS/macOS */}
    </Text>
  );
}

const ICONS: Record<SocialProvider, React.FC> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  apple: AppleIcon,
};

const A11Y_LABELS: Record<SocialProvider, string> = {
  google: 'Continue with Google',
  facebook: 'Continue with Facebook',
  apple: 'Continue with Apple',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function SocialButton({ provider, onPress, ...rest }: SocialButtonProps) {
  const Icon = ICONS[provider];

  const handlePress = useCallback(() => {
    if (onPress) {
      onPress();
    }
    // Placeholder: "coming soon" toast is handled by the screen
  }, [onPress]);

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
      onPress={handlePress}
      accessibilityLabel={A11Y_LABELS[provider]}
      accessibilityRole="button"
      {...rest}>
      <View style={styles.iconWrapper}>
        <Icon />
      </View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  button: {
    width: 64,
    height: 56,
    backgroundColor: AuthColors.socialBg,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
      },
      android: { elevation: 1 },
    }),
  },
  pressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
});
