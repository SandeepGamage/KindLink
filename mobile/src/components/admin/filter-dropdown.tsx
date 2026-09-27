import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Check } from 'lucide-react-native';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Radius } from './tokens';
import { DropdownMenu } from '@/components/ui/dropdown-menu';

interface FilterDropdownProps<T extends string> {
  visible: boolean;
  onClose: () => void;
  options: readonly T[];
  activeValue: T;
  onChange: (value: T) => void;
  offsetRight?: number;
  offsetTop?: number;
}

/**
 * Anchored single-select list, ticking the active option.
 * Wraps `DropdownMenu` so the sort/filter popups share one implementation.
 */
export function FilterDropdown<T extends string>({
  visible,
  onClose,
  options,
  activeValue,
  onChange,
  offsetRight = 64,
  offsetTop = 40,
}: FilterDropdownProps<T>) {
  return (
    <DropdownMenu
      visible={visible}
      onClose={onClose}
      offsetRight={offsetRight}
      offsetTop={offsetTop}
    >
      <View style={styles.optionsContainer}>
        {options.map((option) => {
          const isActive = option === activeValue;
          return (
            <Pressable
              key={option}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: isActive }}
              style={({ pressed }) => [
                styles.option,
                isActive && styles.optionActive,
                pressed && styles.optionPressed,
              ]}
              onPress={() => {
                onChange(option);
                onClose();
              }}
            >
              <Text style={[styles.optionText, isActive && styles.optionTextActive]}>
                {option}
              </Text>
              {isActive && <Check size={20} color={Palette.secondary} />}
            </Pressable>
          );
        })}
      </View>
    </DropdownMenu>
  );
}

const styles = StyleSheet.create({
  optionsContainer: {
    gap: 4,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: Radius.md,
    minHeight: 44,
  },
  optionActive: {
    backgroundColor: Palette.blueTint,
  },
  optionPressed: {
    opacity: 0.7,
  },
  optionText: {
    fontSize: 15,
    color: FunctionalColors.textSecondary,
  },
  optionTextActive: {
    color: Palette.secondary,
    fontWeight: '600',
  },
});
