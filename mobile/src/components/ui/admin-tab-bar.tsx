import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const COLORS = {
  primary: '#FFFFFF',
  surface: '#F4F7FA',
  border: '#DCE6EF',
  secondary: '#1F5C96',
  ink: '#17242E',
  accent: '#E08A3C',
  accentBg: '#FEF3E7',
  gray: '#667085',
};

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
      className="flex-row bg-white border-t border-[#DCE6EF] pt-2"
      style={{
        paddingBottom: insets.bottom || 16,
        elevation: 8, // for Android shadow
        shadowColor: '#000', // for iOS shadow
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
      }}
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

        const color = isFocused ? COLORS.secondary : COLORS.gray;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarButtonTestID}
            onPress={onPress}
            onLongPress={onLongPress}
            className="flex-1 items-center justify-center"
          >
            <View className="relative items-center justify-center h-8 w-12">
              {/* Active Indicator Line */}
              {isFocused && (
                <View className="absolute -top-2 w-8 h-[3px] bg-[#1F5C96] rounded-[1.5px]" />
              )}
              
              <Ionicons
                name={iconName}
                color={color}
                size={24}
                style={{ marginTop: 4 }}
              />
            </View>
            <Text 
              className="text-[11px] mt-1 font-semibold"
              style={{ color }}
            >
              {label as string}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}
