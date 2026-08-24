import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  useColorScheme,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, OnboardingColors, Palette, MaxContentWidth } from '@/constants/theme';
import { NavIconProps } from './navigation-icons';

export type UserNavRole = 'elderly' | 'volunteer' | 'admin' | 'client';

export interface TabItemConfig {
  name: string;
  label: string;
  icon: React.ComponentType<NavIconProps>;
  badge?: number | string | boolean;
  badgeColor?: string;
  accessibilityLabel?: string;
}

export interface ReusableNavBarProps {
  /** User role controlling styling, sizing, and contrast */
  role?: UserNavRole;
  /** List of tab items to render */
  tabs?: TabItemConfig[];
  /** Controlled active tab name (used in standalone mode) */
  activeTab?: string;
  /** Tab press callback (used in standalone mode) */
  onTabPress?: (tabName: string) => void;
  /** Badge counts mapped by tab name */
  badgeCounts?: Record<string, number | string | boolean | undefined>;
  /** Optional React Navigation tabBar props (when used with Expo Router <Tabs>) */
  navigationProps?: BottomTabBarProps;
  /** Custom container style */
  style?: object;
  /** Custom active tint color */
  activeTintColor?: string;
  /** Custom inactive tint color */
  inactiveTintColor?: string;
  /** Floating pill style instead of edge-to-edge docked bar */
  floating?: boolean;
}

/**
 * Reusable polymorphic navigation bar component.
 * Works seamlessly with Expo Router (<Tabs tabBar={...}>) and standalone custom screens.
 */
export function ReusableNavBar({
  role = 'client',
  tabs,
  activeTab,
  onTabPress,
  badgeCounts = {},
  navigationProps,
  style,
  activeTintColor,
  inactiveTintColor,
  floating = false,
}: ReusableNavBarProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = Colors[isDark ? 'dark' : 'light'];

  const isElderly = role === 'elderly';
  const isAdmin = role === 'admin';

  // Determine active colors based on role
  const defaultActiveColor = isAdmin
    ? isDark ? '#60A5FA' : '#1E40AF'
    : isElderly
    ? isDark ? '#60A5FA' : Palette.secondary
    : isDark ? '#60A5FA' : Palette.secondary;

  const defaultInactiveColor = isDark
    ? '#8B9DAE'
    : isElderly
    ? '#5A6E7F'
    : '#7E92A2';

  const finalActiveColor = activeTintColor ?? defaultActiveColor;
  const finalInactiveColor = inactiveTintColor ?? defaultInactiveColor;

  const bottomPadding = floating
    ? 10
    : Math.max(insets.bottom, Platform.OS === 'ios' ? 24 : 12);

  // If used with Expo Router's navigationProps
  if (navigationProps && tabs) {
    const { state, descriptors, navigation } = navigationProps;

    return (
      <View
        style={[
          styles.outerContainer,
          floating && styles.floatingOuterContainer,
        ]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
              paddingBottom: bottomPadding,
            },
            floating && [
              styles.floatingContainer,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ],
            style,
          ]}>
          <View style={styles.tabRow}>
            {tabs.map((tab) => {
              // Find matching route in navigation state
              const routeIndex = state.routes.findIndex((r) => r.name === tab.name);
              if (routeIndex === -1) return null;

              const route = state.routes[routeIndex];
              const isFocused = state.index === routeIndex;
              const { options } = descriptors[route.key];

              const badgeValue =
                badgeCounts[tab.name] ??
                (typeof options.tabBarBadge !== 'undefined'
                  ? options.tabBarBadge
                  : tab.badge);

              const handlePress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };

              const handleLongPress = () => {
                navigation.emit({
                  type: 'tabLongPress',
                  target: route.key,
                });
              };

              const IconComponent = tab.icon;
              const iconSize = isElderly ? 26 : 24;

              return (
                <Pressable
                  key={tab.name}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel={tab.accessibilityLabel ?? tab.label}
                  testID={options.tabBarButtonTestID}
                  onPress={handlePress}
                  onLongPress={handleLongPress}
                  style={({ pressed }) => [
                    styles.tabItem,
                    isElderly && styles.elderlyTabItem,
                    pressed && styles.tabPressed,
                  ]}>
                  {/* Active background pill indicator for modern feedback */}
                  {isFocused && (
                    <View
                      style={[
                        styles.activePill,
                        {
                          backgroundColor: isAdmin
                            ? isDark ? 'rgba(96, 165, 250, 0.18)' : '#EFF6FF'
                            : isDark ? 'rgba(31, 92, 150, 0.3)' : Palette.blueTint,
                        },
                        isElderly && styles.elderlyActivePill,
                      ]}
                    />
                  )}

                  {/* Tab Icon with badge wrapper */}
                  <View style={styles.iconWrapper}>
                    <IconComponent
                      size={iconSize}
                      color={isFocused ? finalActiveColor : finalInactiveColor}
                      focused={isFocused}
                    />

                    {/* Badge notification pill */}
                    {badgeValue !== undefined && badgeValue !== false && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: tab.badgeColor ?? (isAdmin ? '#DC2626' : Palette.accent),
                          },
                        ]}>
                        {typeof badgeValue === 'number' || typeof badgeValue === 'string' ? (
                          <Text style={styles.badgeText}>
                            {typeof badgeValue === 'number' && badgeValue > 99
                              ? '99+'
                              : badgeValue}
                          </Text>
                        ) : (
                          <View style={styles.dotBadge} />
                        )}
                      </View>
                    )}
                  </View>

                  {/* Tab Label */}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? finalActiveColor : finalInactiveColor,
                        fontWeight: isFocused
                          ? isElderly ? '800' : '700'
                          : isElderly ? '600' : '500',
                        fontSize: isElderly ? 13 : 11,
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  // Standalone mode (without React Navigation BottomTabBarProps)
  if (tabs && tabs.length > 0) {
    return (
      <View
        style={[
          styles.outerContainer,
          floating && styles.floatingOuterContainer,
        ]}>
        <View
          style={[
            styles.container,
            {
              backgroundColor: isDark ? Palette.ink : Palette.primary,
              borderColor: isDark ? '#23384B' : Palette.border,
              paddingBottom: bottomPadding,
            },
            floating && [
              styles.floatingContainer,
              {
                backgroundColor: isDark ? Palette.ink : Palette.primary,
                borderColor: isDark ? '#23384B' : Palette.border,
              },
            ],
            style,
          ]}>
          <View style={styles.tabRow}>
            {tabs.map((tab) => {
              const isFocused = activeTab === tab.name;
              const IconComponent = tab.icon;
              const iconSize = isElderly ? 26 : 24;
              const badgeValue = badgeCounts[tab.name] ?? tab.badge;

              return (
                <Pressable
                  key={tab.name}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: isFocused }}
                  accessibilityLabel={tab.accessibilityLabel ?? tab.label}
                  onPress={() => onTabPress?.(tab.name)}
                  style={({ pressed }) => [
                    styles.tabItem,
                    isElderly && styles.elderlyTabItem,
                    pressed && styles.tabPressed,
                  ]}>
                  {isFocused && (
                    <View
                      style={[
                        styles.activePill,
                        {
                          backgroundColor: isAdmin
                            ? isDark ? 'rgba(96, 165, 250, 0.18)' : '#EFF6FF'
                            : isDark ? 'rgba(31, 92, 150, 0.3)' : Palette.blueTint,
                        },
                        isElderly && styles.elderlyActivePill,
                      ]}
                    />
                  )}

                  <View style={styles.iconWrapper}>
                    <IconComponent
                      size={iconSize}
                      color={isFocused ? finalActiveColor : finalInactiveColor}
                      focused={isFocused}
                    />

                    {badgeValue !== undefined && badgeValue !== false && (
                      <View
                        style={[
                          styles.badge,
                          {
                            backgroundColor: tab.badgeColor ?? (isAdmin ? '#DC2626' : Palette.accent),
                          },
                        ]}>
                        {typeof badgeValue === 'number' || typeof badgeValue === 'string' ? (
                          <Text style={styles.badgeText}>
                            {typeof badgeValue === 'number' && badgeValue > 99
                              ? '99+'
                              : badgeValue}
                          </Text>
                        ) : (
                          <View style={styles.dotBadge} />
                        )}
                      </View>
                    )}
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.tabLabel,
                      {
                        color: isFocused ? finalActiveColor : finalInactiveColor,
                        fontWeight: isFocused
                          ? isElderly ? '800' : '700'
                          : isElderly ? '600' : '500',
                        fontSize: isElderly ? 13 : 11,
                      },
                    ]}>
                    {tab.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  outerContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingOuterContainer: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    borderTopWidth: 1,
    paddingTop: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8,
  },
  floatingContainer: {
    borderRadius: 24,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 12,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    minHeight: 48,
    borderRadius: 16,
    position: 'relative',
  },
  elderlyTabItem: {
    minHeight: 56,
    paddingVertical: 6,
  },
  tabPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  activePill: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    left: 6,
    right: 6,
    borderRadius: 14,
  },
  elderlyActivePill: {
    top: 1,
    bottom: 1,
    left: 4,
    right: 4,
    borderRadius: 16,
  },
  iconWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 28,
    minHeight: 28,
  },
  tabLabel: {
    marginTop: 3,
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    zIndex: 10,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 12,
  },
  dotBadge: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
  },
});
