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
import { MaxContentWidth } from '@/constants/theme';

export default function AdminApprovalsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const [items, setItems] = useState([
    {
      id: 'app-1',
      name: 'Kasun Wickramasinghe',
      type: 'Volunteer Verification',
      submitted: '2 hours ago',
      docType: 'National Identity Card (NIC)',
      status: 'Pending',
      email: 'kasun.w@example.com',
    },
    {
      id: 'app-2',
      name: 'Nalani Perera',
      type: 'Senior Registration',
      submitted: '5 hours ago',
      docType: 'Proof of Address & Medical Contact',
      status: 'Pending',
      email: 'nalani.p@example.com',
    },
    {
      id: 'app-3',
      name: 'Dr. Rohan Jayawardena',
      type: 'Volunteer Doctor / Nurse',
      submitted: 'Yesterday',
      docType: 'Medical Council License',
      status: 'Pending',
      email: 'rohan.j@health.lk',
    },
  ]);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

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
        <View style={styles.header}>
          <Text
            style={[
              styles.pageTitle,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}>
            Verification Approvals
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            {items.length} pending applications awaiting admin review
          </Text>
        </View>

        {items.length === 0 ? (
          <View
            style={[
              styles.emptyCard,
              { backgroundColor: isDark ? '#131D31' : '#FFFFFF' },
            ]}>
            <Text style={styles.emptyIcon}>🎉</Text>
            <Text
              style={[
                styles.emptyTitle,
                { color: isDark ? '#FFFFFF' : '#0F172A' },
              ]}>
              All Caught Up!
            </Text>
            <Text
              style={[
                styles.emptySub,
                { color: isDark ? '#94A3B8' : '#64748B' },
              ]}>
              There are no pending verification requests in the queue.
            </Text>
          </View>
        ) : (
          <View style={styles.list}>
            {items.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                    borderColor: isDark ? '#1E293B' : '#E2E8F0',
                  },
                ]}>
                <View style={styles.cardTop}>
                  <View>
                    <Text
                      style={[
                        styles.cardName,
                        { color: isDark ? '#FFFFFF' : '#0F172A' },
                      ]}>
                      {item.name}
                    </Text>
                    <Text
                      style={[
                        styles.cardEmail,
                        { color: isDark ? '#94A3B8' : '#64748B' },
                      ]}>
                      {item.email}
                    </Text>
                  </View>
                  <View style={styles.typeBadge}>
                    <Text style={styles.typeBadgeText}>{item.type}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.docBox,
                    { backgroundColor: isDark ? '#1E293B' : '#F8FAFC' },
                  ]}>
                  <Text
                    style={[
                      styles.docLabel,
                      { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    📄 Attached: {item.docType}
                  </Text>
                  <Text
                    style={[
                      styles.docTime,
                      { color: isDark ? '#64748B' : '#94A3B8' },
                    ]}>
                    Submitted {item.submitted}
                  </Text>
                </View>

                <View style={styles.btnRow}>
                  <Pressable
                    onPress={() => handleAction(item.id, 'reject')}
                    style={[styles.btn, styles.rejectBtn]}>
                    <Text style={styles.rejectBtnText}>Decline</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleAction(item.id, 'approve')}
                    style={[styles.btn, styles.approveBtn]}>
                    <Text style={styles.approveBtnText}>Approve & Verify</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        )}
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
  header: {
    marginTop: 8,
    marginBottom: 20,
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
  list: {
    gap: 14,
  },
  card: {
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardName: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  typeBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeBadgeText: {
    color: '#1D61E7',
    fontSize: 11,
    fontWeight: '700',
  },
  docBox: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  docLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  docTime: {
    fontSize: 11,
    marginTop: 3,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  btn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    backgroundColor: '#FEE2E2',
  },
  rejectBtnText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '700',
  },
  approveBtn: {
    backgroundColor: '#1D61E7',
  },
  approveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 24,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  emptySub: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },
});
