import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <ThemedText type="subtitle">User Profile & Account</ThemedText>
        </View>
        
        <ThemedView type="backgroundElement" style={styles.card}>
          <ThemedText type="smallBold" style={styles.memberTag}>
            Assigned to Member 1 (IT23672932)
          </ThemedText>
          <ThemedText type="default">
            Authentication & User Management / Feedback & Rating System
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary" style={styles.hint}>
            This placeholder page can be filled with login/registration controls, profile details, and user ratings/feedback forms.
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    padding: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    paddingVertical: Spacing.two,
  },
  card: {
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.two,
  },
  memberTag: {
    color: '#0066CC',
  },
  hint: {
    marginTop: Spacing.two,
  },
});
