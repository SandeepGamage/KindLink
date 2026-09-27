import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { AdminSpacing } from '@/components/admin/tokens';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  subtitleTop?: string;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  bottomContent?: React.ReactNode;
}

export function AdminHeader({ title, subtitle, subtitleTop, leftContent, rightContent, bottomContent }: AdminHeaderProps) {
  // Per AGENTS.md: insets rather than SafeAreaView, so the header background
  // stays continuous with the screen behind it.
  const insets = useSafeAreaInsets();
  const c = useAdminTheme();

  return (
    <View style={[styles.container, { paddingTop: insets.top + 24 }]}>
      <View style={styles.textContainer}>
        <View style={styles.titleRow}>
          <View style={styles.titleLeftGroup}>
            {leftContent && <View style={styles.leftContent}>{leftContent}</View>}
            <View style={styles.titleTextGroup}>
              {subtitleTop && (
                <Text style={[styles.subtitleTop, { color: c.primary }]}>{subtitleTop}</Text>
              )}
              <Text
                style={[
                  styles.title,
                  { color: c.text },
                  (!subtitle && !subtitleTop) && { marginBottom: 0 },
                ]}
              >
                {title}
              </Text>
              {subtitle && (
                <Text style={[styles.subtitle, { color: c.textSecondary }]}>{subtitle}</Text>
              )}
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
    paddingHorizontal: AdminSpacing.screenEdge,
    // The single source of the 24dp header-to-body gap on every admin screen.
    paddingBottom: AdminSpacing.headerGap,
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
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
  },
  subtitleTop: {
    fontSize: 14,
    marginBottom: 4,
  },
  bottomContent: {
    marginTop: 24,
  }
});
