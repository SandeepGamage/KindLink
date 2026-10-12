import React, { useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  StatusBar,
  Animated,
  FlatList,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import {
  HeartHandshake,
  HouseHeart,
  ShoppingBasket,
  Footprints,
  CalendarCheck,
  Clock,
  BellRing,
  ShieldCheck,
  Star,
  IdCard,
  BadgeCheck,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { PillButton, PILL_BUTTON_HEIGHT } from '@/components/auth/pill-button';
import { OrbitHero, type OrbitHeroProps } from '@/components/ui/orbit-hero';
import { Palette, FunctionalColors } from '@/constants/theme';

interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  /** Centre tile icon and the three orbiting badges */
  hero: Pick<OrbitHeroProps, 'CenterIcon' | 'badges'>;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Find a friendly helper\nnearby',
    subtitle:
      'Local volunteers can help with everyday visits, walks, grocery runs, and simple errands.',
    hero: {
      CenterIcon: HeartHandshake,
      badges: [
        { Icon: HouseHeart, color: Palette.accent },
        { Icon: ShoppingBasket },
        { Icon: Footprints },
      ],
    },
  },
  {
    id: 2,
    title: 'Schedule visits\neasily',
    subtitle:
      'Simply pick a day and time that works best for your routine. We make booking effortless.',
    hero: {
      CenterIcon: CalendarCheck,
      badges: [{ Icon: Clock, color: Palette.accent }, { Icon: BellRing }, { Icon: HouseHeart }],
    },
  },
  {
    id: 3,
    title: 'Safe and verified\nvolunteers',
    subtitle:
      'Every volunteer is identity-checked and rated by the community for peace of mind.',
    hero: {
      CenterIcon: ShieldCheck,
      badges: [{ Icon: Star, color: Palette.accent }, { Icon: IdCard }, { Icon: BadgeCheck }],
    },
  },
];

const DOT_SIZE = 7;
const DOT_ACTIVE_WIDTH = 22;
const CONTROLS_GAP = 28;
const HEADER_HEIGHT = 48;
/** Height of the fixed dots + button block, so slide text sits just above it */
const CONTROLS_HEIGHT = DOT_SIZE + CONTROLS_GAP + PILL_BUTTON_HEIGHT;

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const listRef = useRef<FlatList<OnboardingStep>>(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const isLastStep = currentStepIndex === STEPS.length - 1;
  const bottomPadding = insets.bottom + 24;
  const heroSize = Math.min(width - 80, height * 0.36, 300);

  const finishOnboarding = useCallback(() => {
    router.push('/(auth)/role-select');
  }, [router]);

  const handleNext = useCallback(() => {
    if (isLastStep) {
      finishOnboarding();
      return;
    }
    const nextIndex = currentStepIndex + 1;
    listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    setCurrentStepIndex(nextIndex);
  }, [isLastStep, currentStepIndex, finishOnboarding]);

  const handleMomentumEnd = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      setCurrentStepIndex(Math.round(event.nativeEvent.contentOffset.x / width));
    },
    [width]
  );

  const renderStep = useCallback(
    ({ item }: { item: OnboardingStep }) => (
      <View
        style={[
          styles.slide,
          {
            width,
            height,
            paddingTop: insets.top + HEADER_HEIGHT,
            paddingBottom: bottomPadding + CONTROLS_HEIGHT + 28,
          },
        ]}>
        <View style={styles.heroContainer}>
          <OrbitHero {...item.hero} size={heroSize} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.subtitle}>{item.subtitle}</Text>
        </View>
      </View>
    ),
    [width, height, insets.top, bottomPadding, heroSize]
  );

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />

      {/* ─── Swipeable full-screen slides ─── */}
      <Animated.FlatList
        ref={listRef}
        data={STEPS}
        keyExtractor={(step) => String(step.id)}
        renderItem={renderStep}
        horizontal
        pagingEnabled
        bounces={false}
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        onMomentumScrollEnd={handleMomentumEnd}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
        style={StyleSheet.absoluteFill}
      />

      {/* ─── Header: Skip ─── */}
      <View style={[styles.header, { paddingTop: insets.top, height: insets.top + HEADER_HEIGHT }]} pointerEvents="box-none">
        {!isLastStep && (
          <Pressable
            onPress={finishOnboarding}
            style={({ pressed }) => [styles.skipButton, pressed && styles.skipButtonPressed]}
            hitSlop={{ top: 10, bottom: 10, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding">
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        )}
      </View>

      {/* ─── Bottom: Pagination & Action Button ─── */}
      <View
        style={[styles.bottomContainer, { paddingBottom: bottomPadding }]}
        pointerEvents="box-none">
        <View style={styles.paginationRow}>
          {STEPS.map((step, idx) => {
            const inputRange = [(idx - 1) * width, idx * width, (idx + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [DOT_SIZE, DOT_ACTIVE_WIDTH, DOT_SIZE],
              extrapolate: 'clamp',
            });
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [Palette.border, Palette.secondary, Palette.border],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={step.id}
                style={[styles.dot, { width: dotWidth, backgroundColor }]}
              />
            );
          })}
        </View>

        <PillButton label={isLastStep ? 'Get Started' : 'Next'} onPress={handleNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Palette.primary,
  },
  slide: {
    alignItems: 'center',
  },
  heroContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
  },
  skipButton: {
    paddingHorizontal: 4,
    paddingVertical: 8,
  },
  skipButtonPressed: {
    opacity: 0.7,
  },
  skipText: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.secondary,
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 36,
    paddingTop: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: Palette.ink,
    textAlign: 'center',
    letterSpacing: -0.4,
    lineHeight: 31,
  },
  subtitle: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
    marginTop: 12,
    fontWeight: '500',
  },
  bottomContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    gap: CONTROLS_GAP,
    paddingHorizontal: 24,
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
});
