import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Palette } from '@/constants/theme';

export interface OrbitBadge {
  Icon: LucideIcon;
  color?: string;
}

export interface OrbitHeroProps {
  /** Icon shown in white on the brand-blue centre tile */
  CenterIcon: LucideIcon;
  /** Fill the centre icon solid white (e.g. the KindLink heart) */
  centerFilled?: boolean;
  /** Up to three badges, placed top-left, right and bottom-left */
  badges: [OrbitBadge, OrbitBadge, OrbitBadge];
  /** Overall diameter of the outer ring */
  size?: number;
}

/** Badge centres as fractions of the hero size: top-left, right, bottom-left */
const BADGE_POSITIONS = [
  { x: 0.168, y: 0.196 },
  { x: 0.932, y: 0.346 },
  { x: 0.211, y: 0.818 },
];

/**
 * Brand hero: a blue icon tile inside two soft rings, orbited by small white icon badges
 * that gently float. Used on the welcome and onboarding screens.
 */
export function OrbitHero({ CenterIcon, centerFilled = false, badges, size = 280 }: OrbitHeroProps) {
  const float = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(float, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float]);

  const tileSize = size * 0.343;
  const badgeSize = Math.round(size * 0.18);
  const innerRing = size * 0.66;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={[styles.ring, { width: size, height: size, borderRadius: size / 2, backgroundColor: Palette.surface }]}
      />
      <View
        style={[
          styles.ring,
          { width: innerRing, height: innerRing, borderRadius: innerRing / 2, backgroundColor: Palette.blueTint },
        ]}
      />

      <View style={[styles.tile, { width: tileSize, height: tileSize, borderRadius: tileSize * 0.26 }]}>
        <CenterIcon
          size={tileSize * 0.46}
          color={Palette.primary}
          fill={centerFilled ? Palette.primary : 'none'}
          strokeWidth={2}
        />
      </View>

      {badges.map(({ Icon, color = Palette.secondary }, idx) => {
        const { x, y } = BADGE_POSITIONS[idx];
        // Alternate float direction so the badges drift independently
        const translateY = float.interpolate({
          inputRange: [0, 1],
          outputRange: idx % 2 === 0 ? [0, -5] : [-5, 0],
        });
        return (
          <Animated.View
            key={idx}
            style={[
              styles.badge,
              {
                width: badgeSize,
                height: badgeSize,
                borderRadius: badgeSize / 2,
                left: x * size - badgeSize / 2,
                top: y * size - badgeSize / 2,
                transform: [{ translateY }],
              },
            ]}>
            <Icon size={badgeSize * 0.44} color={color} strokeWidth={2} />
          </Animated.View>
        );
      })}

      <View style={[styles.dot, { top: size * 0.064, left: size * 0.743, backgroundColor: Palette.accent }]} />
      <View style={[styles.dot, { top: size * 0.829, left: size * 0.829, backgroundColor: Palette.secondary }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  ring: {
    position: 'absolute',
  },
  tile: {
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  badge: {
    position: 'absolute',
    backgroundColor: Palette.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: Palette.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: { elevation: 4 },
    }),
  },
  dot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
