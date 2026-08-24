import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthContext } from '@/context/auth-context';
import { OnboardingColors, MaxContentWidth } from '@/constants/theme';

export default function ClientRequestsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const { user } = useAuthContext();
  const [activeFilter, setActiveFilter] = useState<'active' | 'completed'>('active');

  const isElderly =
    user?.role?.toLowerCase() === 'elderly' ||
    user?.role?.toLowerCase() === 'senior';

  const sampleRequests = [
    {
      id: 'req-1',
      title: 'Weekly Grocery Shopping Assistance',
      category: 'Groceries',
      status: 'In Progress',
      volunteerName: 'Alex Fernando',
      urgency: 'Medium',
      date: 'Today, 3:00 PM',
      address: 'Colombo 07, Cinnamon Gardens',
    },
    {
      id: 'req-2',
      title: 'Pharmacy Prescription Pickup',
      category: 'Medical',
      status: 'Pending Match',
      volunteerName: 'Finding volunteer...',
      urgency: 'High',
      date: 'Tomorrow, 10:00 AM',
      address: 'Union Place, Colombo 02',
    },
    {
      id: 'req-3',
      title: 'Help with Smartphone Settings & Video Calling',
      category: 'Tech Help',
      status: 'Completed',
      volunteerName: 'Sarah Jenkins',
      urgency: 'Normal',
      date: 'Aug 22, 2026',
      address: 'Bambalapitiya, Colombo 04',
    },
  ];

  const filteredRequests = sampleRequests.filter((r) =>
    activeFilter === 'active' ? r.status !== 'Completed' : r.status === 'Completed'
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isDark ? '#090D16' : '#F0F6FE',
          paddingTop: Math.max(insets.top, 16),
        },
      ]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Page Title & Action */}
        <View style={styles.titleRow}>
          <View>
            <Text
              style={[
                styles.pageTitle,
                { color: isDark ? '#FFFFFF' : '#0F172A' },
              ]}>
              Assistance Requests
            </Text>
            <Text
              style={[
                styles.pageSubtitle,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              {isElderly
                ? 'Your requested support tasks and updates'
                : 'Community requests you are supporting'}
            </Text>
          </View>
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          <Pressable
            onPress={() => setActiveFilter('active')}
            style={[
              styles.filterPill,
              activeFilter === 'active' && styles.filterPillActive,
              {
                backgroundColor:
                  activeFilter === 'active'
                    ? OnboardingColors.primary
                    : isDark ? '#1E293B' : '#FFFFFF',
              },
            ]}>
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === 'active'
                      ? '#FFFFFF'
                      : isDark ? '#94A3B8' : '#64748B',
                },
              ]}>
              Active & Pending ({sampleRequests.filter((r) => r.status !== 'Completed').length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveFilter('completed')}
            style={[
              styles.filterPill,
              activeFilter === 'completed' && styles.filterPillActive,
              {
                backgroundColor:
                  activeFilter === 'completed'
                    ? OnboardingColors.primary
                    : isDark ? '#1E293B' : '#FFFFFF',
              },
            ]}>
            <Text
              style={[
                styles.filterText,
                {
                  color:
                    activeFilter === 'completed'
                      ? '#FFFFFF'
                      : isDark ? '#94A3B8' : '#64748B',
                },
              ]}>
              Completed (1)
            </Text>
          </Pressable>
        </View>

        {/* Requests List */}
        <View style={styles.listContainer}>
          {filteredRequests.map((req) => (
            <View
              key={req.id}
              style={[
                styles.requestCard,
                {
                  backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                },
              ]}>
              <View style={styles.cardHeader}>
                <View
                  style={[
                    styles.categoryBadge,
                    {
                      backgroundColor: isDark
                        ? 'rgba(29, 97, 231, 0.2)'
                        : '#EFF6FF',
                    },
                  ]}>
                  <Text style={styles.categoryText}>{req.category}</Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        req.status === 'Completed'
                          ? '#DCFCE7'
                          : req.status === 'In Progress'
                          ? '#EFF6FF'
                          : '#FEF3C7',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {
                        color:
                          req.status === 'Completed'
                            ? '#15803D'
                            : req.status === 'In Progress'
                            ? '#1D61E7'
                            : '#B45309',
                      },
                    ]}>
                    {req.status}
                  </Text>
                </View>
              </View>

              <Text
                style={[
                  styles.cardTitle,
                  { color: isDark ? '#FFFFFF' : '#0F172A' },
                ]}>
                {req.title}
              </Text>

              <View style={styles.metaRow}>
                <Text
                  style={[
                    styles.metaText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  📅 {req.date}
                </Text>
                <Text
                  style={[
                    styles.metaText,
                    { color: isDark ? '#94A3B8' : '#64748B' },
                  ]}>
                  📍 {req.address}
                </Text>
              </View>

              <View
                style={[
                  styles.cardFooter,
                  { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' },
                ]}>
                <Text
                  style={[
                    styles.footerHelperText,
                    { color: isDark ? '#CBD5E1' : '#475569' },
                  ]}>
                  👤 {req.volunteerName}
                </Text>

                <Pressable
                  style={[
                    styles.actionBtn,
                    { backgroundColor: OnboardingColors.primary },
                  ]}>
                  <Text style={styles.actionBtnText}>View Details</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 110,
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    width: '100%',
  },
  titleRow: {
    marginTop: 8,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  filterPillActive: {},
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  listContainer: {
    gap: 14,
  },
  requestCard: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: OnboardingColors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    marginBottom: 10,
  },
  metaRow: {
    gap: 6,
    marginBottom: 14,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  footerHelperText: {
    fontSize: 13,
    fontWeight: '600',
  },
  actionBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
