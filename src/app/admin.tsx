import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface PendingApproval {
  id: string;
  name: string;
  role: 'Volunteer' | 'Elderly User' | 'Caregiver';
  date: string;
}

const INITIAL_APPROVALS: PendingApproval[] = [
  { id: '1', name: 'John Doe', role: 'Volunteer', date: 'Today' },
  { id: '2', name: 'Sarah Smith', role: 'Volunteer', date: 'Yesterday' },
  { id: '3', name: 'Michael Brown', role: 'Caregiver', date: '2 days ago' },
];

export default function AdminDashboardScreen() {
  const theme = useTheme();
  const [approvals, setApprovals] = useState<PendingApproval[]>(INITIAL_APPROVALS);

  const handleApprove = (id: string, name: string) => {
    setApprovals((prev) => prev.filter((item) => item.id !== id));
    if (Platform.OS === 'web') {
      window.alert(`Approved ${name}'s request successfully!`);
    } else {
      Alert.alert('Approved', `Approved ${name}'s request successfully!`);
    }
  };

  const handleReject = (id: string, name: string) => {
    setApprovals((prev) => prev.filter((item) => item.id !== id));
    if (Platform.OS === 'web') {
      window.alert(`Rejected ${name}'s request.`);
    } else {
      Alert.alert('Rejected', `Rejected ${name}'s request.`);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Header matching Wireframe 2 */}
        <View style={styles.headerRow}>
          <Pressable style={styles.iconButton} accessibilityLabel="Back">
            <SymbolView
              tintColor={theme.text}
              name="chevron.left"
              size={20}
            />
          </Pressable>

          <ThemedText type="subtitle" style={styles.headerTitle}>
            Admin Dashboard
          </ThemedText>

          <Pressable style={styles.iconButton} accessibilityLabel="Admin Profile">
            <SymbolView
              tintColor={theme.text}
              name="person.circle"
              size={24}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {/* Stat Cards Grid (Wireframe 2: 3 boxes side-by-side) */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Total Users</Text>
              <Text style={styles.statValue}>3,250</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Active Volunteers</Text>
              <Text style={styles.statValue}>2,184</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Pending Requests</Text>
              <Text style={styles.statValue}>45</Text>
            </View>
          </View>

          {/* Pending Approvals Section */}
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Pending Approvals
            </ThemedText>
          </View>

          <View style={styles.approvalsContainer}>
            {approvals.map((item) => (
              <View key={item.id} style={styles.approvalCard}>
                <View style={styles.applicantInfo}>
                  <Text style={styles.applicantName}>{item.name}</Text>
                  <Text style={styles.applicantRole}>{item.role}</Text>
                </View>

                <View style={styles.actionButtons}>
                  <Pressable
                    style={[styles.btn, styles.btnApprove]}
                    onPress={() => handleApprove(item.id, item.name)}>
                    <Text style={styles.btnText}>Approve</Text>
                  </Pressable>

                  <Pressable
                    style={[styles.btn, styles.btnReject]}
                    onPress={() => handleReject(item.id, item.name)}>
                    <Text style={styles.btnText}>Reject</Text>
                  </Pressable>
                </View>
              </View>
            ))}

            {approvals.length === 0 && (
              <View style={styles.emptyCard}>
                <ThemedText type="small" themeColor="textSecondary">
                  All approvals have been processed!
                </ThemedText>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: MaxContentWidth,
  },
  headerRow: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 4,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.one,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    minHeight: 90,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333333',
    marginBottom: Spacing.one,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000000',
  },
  sectionHeader: {
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  approvalsContainer: {
    gap: Spacing.three,
  },
  approvalCard: {
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 6,
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  applicantInfo: {
    flex: 1,
  },
  applicantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  applicantRole: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  btn: {
    borderWidth: 1.5,
    borderColor: '#333333',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#FFFFFF',
  },
  btnApprove: {
    backgroundColor: '#FFFFFF',
  },
  btnReject: {
    backgroundColor: '#FFFFFF',
  },
  btnText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  emptyCard: {
    padding: Spacing.four,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 6,
    alignItems: 'center',
  },
});
