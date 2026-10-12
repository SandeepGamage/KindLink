import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FunctionalColors, Palette, ClientFontSize } from '@/constants/theme';

export interface FilterTab<T extends string> {
  key: T;
  label: string;
  count?: number;
}

interface FilterTabsProps<T extends string> {
  tabs: FilterTab<T>[];
  active: T;
  onChange: (key: T) => void;
}

/** Segmented "All (3) | Unread (1)" filter used at the top of client lists. */
export function FilterTabs<T extends string>({ tabs, active, onChange }: FilterTabsProps<T>) {
  return (
    <View style={styles.container}>
      <View style={styles.wrapper} accessibilityRole="tablist">
        {tabs.map((tab) => {
          const isActive = tab.key === active;
          const label = tab.count === undefined ? tab.label : `${tab.label} (${tab.count})`;
          return (
            <Pressable
              key={tab.key}
              onPress={() => onChange(tab.key)}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              style={[styles.tab, isActive && styles.tabActive]}>
              <Text style={[styles.tabText, isActive ? styles.tabTextActive : styles.tabTextInactive]}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  wrapper: {
    backgroundColor: Palette.blueTint,
    borderRadius: 16,
    padding: 4,
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabActive: {
    backgroundColor: Palette.primary,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: ClientFontSize.caption,
  },
  tabTextActive: {
    color: Palette.ink,
    fontWeight: 'bold',
  },
  tabTextInactive: {
    color: FunctionalColors.textMuted,
    fontWeight: '500',
  },
});
