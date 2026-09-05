import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleProp, ViewStyle, DimensionValue } from 'react-native';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { Radius } from './tokens';

interface SkeletonProps {
  width: DimensionValue;
  height: number;
  /** Defaults to `Radius.sm`. Pass `Radius.pill` for circles and pills. */
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

/**
 * Pulsing placeholder block used while a screen's first payload is in flight.
 *
 * Prefer composing these into the real page shape over a centered spinner — the
 * layout stops jumping once data lands, which matters most on the dashboard
 * where several sections resolve together.
 *
 * Uses RN's own `Animated` rather than reanimated: this needs a single
 * native-driven opacity loop, and reanimated is otherwise confined to two
 * components in this app.
 */
export function Skeleton({ width, height, radius = Radius.sm, style }: SkeletonProps) {
  const c = useAdminTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[
        { width, height, borderRadius: radius, backgroundColor: c.tint, opacity: pulse },
        style,
      ]}
    />
  );
}
