import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, FunctionalColors } from '@/constants/theme';

// Map route names to their icons and labels based on the screenshot
const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'grid-outline',
  approvals: 'shield-checkmark-outline',
  notifications: 'notifications-outline',
  users: 'people-outline',
  settings: 'settings-outline', // Fallback for existing settings route
};

export function AdminTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      style={[
        styles.container,
        { paddingBottom: insets.bottom || 16 }
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        // Skip routes that we might not want to show, if any.
        if (route.name === 'settings') {
            return null; // The image only shows 4 tabs: Overview, Approvals, Notifications, Users
        }

        const isFocused = state.index === index;
        const iconName = TAB_ICONS[route.name] || 'ellipse-outline';

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        const color = isFocused ? Palette.secondary : FunctionalColors.textSecondary;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            style={styles.tabButton}
          >
            <View style={styles.iconContainer}>
              {/* Active Indicator Line */}
              {isFocused && (
                <View style={styles.activeIndicator} />
              )}
              
              <Ionicons
                name={iconName}
                color={color}
                size={24}
                style={styles.icon}
              />
            </View>
            <Text 
              style={[
                styles.tabLabel,
                { color }
              ]}
            >
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Palette.primary,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
    paddingTop: 8,
    elevation: 8,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    width: 48,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 32,
    height: 3,
    backgroundColor: Palette.secondary,
    borderRadius: 1.5,
  },
  icon: {
    marginTop: 4,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
});
