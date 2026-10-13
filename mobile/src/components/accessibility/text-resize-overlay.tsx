import React, { useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  Animated,
  StyleSheet,
  Platform,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { useFontSize } from '@/context/font-size-context';
import { useToast } from '@/context/toast-context';
import { Palette } from '@/constants/theme';

/**
 * Universal "AA" Text Resize Icon matching the requested reader-mode typography icon.
 * Displays a smaller serif 'A' aligned side-by-side with a larger serif 'A'.
 */
export function AaIcon({
  color = Palette.secondary,
  size = 22,
}: {
  color?: string;
  size?: number;
}) {
  const smallSize = Math.round(size * 0.65);
  const largeSize = size;

  return (
    <View style={iconStyles.row}>
      <Text
        allowFontScaling={false}
        style={[
          iconStyles.smallLetter,
          {
            color,
            fontSize: smallSize,
            lineHeight: smallSize + 2,
          },
        ]}>
        A
      </Text>
      <Text
        allowFontScaling={false}
        style={[
          iconStyles.largeLetter,
          {
            color,
            fontSize: largeSize,
            lineHeight: largeSize + 2,
          },
        ]}>
        A
      </Text>
    </View>
  );
}

const iconStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
  },
  smallLetter: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '900',
    marginRight: -1,
  },
  largeLetter: {
    fontFamily: Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' }),
    fontWeight: '900',
  },
});

/**
 * Floating Text Resize Overlay
 * Displayed exclusively across the Elderly member side as a convenient overlay.
 * Tapping toggles between Normal (100%) and Large (+20%).
 */
export function TextResizeOverlay() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const { fontSizeMode, toggleFontSize } = useFontSize();
  const { showToast } = useToast();

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // Display only for elderly members
  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  if (!isElderly) {
    return null;
  }

  const isLarge = fontSizeMode === 'large';

  const handlePress = async () => {
    // Micro-animation bounce on press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.88,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();

    const nextMode = await toggleFontSize();
    if (nextMode === 'large') {
      showToast('Text enlarged (+20%) across all screens', { type: 'info' });
    } else {
      showToast('Text reset to normal size', { type: 'info' });
    }
  };

  const backgroundColor = isLarge
    ? Palette.secondary
    : isDark
    ? '#17242E'
    : '#FFFFFF';

  const borderColor = isLarge
    ? isDark
      ? '#60A5FA'
      : '#174A7A'
    : isDark
    ? '#2B4A6A'
    : '#CBD5E1';

  const iconColor = isLarge
    ? '#FFFFFF'
    : isDark
    ? '#93C5FD'
    : Palette.secondary;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.container,
        {
          bottom: insets.bottom + 84,
          transform: [{ scale: scaleAnim }],
        },
      ]}>
      <Pressable
        onPress={handlePress}
        accessibilityRole="button"
        accessibilityLabel={
          isLarge
            ? 'Text size enlarged by 20%. Tap to reset to normal size'
            : 'Normal text size. Tap to enlarge text by 20%'
        }
        accessibilityHint="Toggles between normal text size and 20% enlarged text size across all screens"
        style={({ pressed }) => [
          styles.button,
          {
            backgroundColor,
            borderColor,
            opacity: pressed ? 0.85 : 1,
          },
        ]}>
        <AaIcon color={iconColor} size={23} />

        {isLarge && (
          <View style={styles.badge}>
            <Text allowFontScaling={false} style={styles.badgeText}>
              +20%
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 18,
    zIndex: 9999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: '#10B981',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: -0.2,
  },
});
