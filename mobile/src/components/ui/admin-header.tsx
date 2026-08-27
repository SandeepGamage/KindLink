import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, FunctionalColors } from '@/constants/theme';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  subtitleTop?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, subtitleTop, leftContent, rightContent, bottomContent }: AdminHeaderProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeftGroup}>
            {leftContent && <View style={styles.leftContent}>{leftContent}</View>}
            <View style={styles.titleTextGroup}>
              {subtitleTop && <Text style={styles.subtitleTop}>{subtitleTop}</Text>}
              <Text style={[styles.title, (!subtitle && !subtitleTop) && { marginBottom: 0 }]}>{title}</Text>
              {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            </View>
          </View>
          {rightContent && <View style={styles.rightContent}>{rightContent}</View>}
        </View>
      </View>
      
      {bottomContent && <View style={styles.bottomContent}>{bottomContent}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 12,
    paddingBottom: 24,
  },
  textContainer: {
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleLeftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  titleTextGroup: {
    flex: 1,
  },
  leftContent: {
    marginRight: 8,
  },
  rightContent: {
    marginLeft: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
  },
  subtitleTop: {
    fontSize: 14,
    color: Palette.secondary,
    marginBottom: 4,
  },
  bottomContent: {
    marginTop: 24,
  }
});
