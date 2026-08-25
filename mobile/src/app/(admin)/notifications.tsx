import React from 'react';
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

export default function AdminAlertsScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const alerts = [
    {
      id: 'al-1',
      title: 'High Priority SOS Check-in',
      detail: 'Senior Member Sunil W. pressed quick assist button in Bambalapitiya.',
      time: '12 mins ago',
      level: 'critical',
      resolved: false,
    },
    {
      id: 'al-2',
      title: 'Unusual Request Volume',
      detail: 'Spike in grocery delivery requests in Colombo 03 zone (+35%).',
      time: '1 hour ago',
      level: 'warning',
      resolved: false,
    },
    {
      id: 'al-3',
      title: 'System Backup Completed',
      detail: 'Automated encrypted backup of database snapshot completed successfully.',
      time: '4 hours ago',
      level: 'info',
      resolved: true,
    },
    {
      id: 'al-4',
      title: 'New Volunteer Background Checked',
      detail: 'Automated police record check cleared for 5 newly registered volunteers.',
      time: 'Yesterday',
      level: 'info',
      resolved: true,
    },
  ];

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
            System Alerts & Logs
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            Live monitoring of critical events, emergency SOS, and safety audits
          </Text>
        </View>

        <View style={styles.list}>
          {alerts.map((al) => (
            <View
              key={al.id}
              style={[
                styles.alertCard,
                {
                  backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                  borderColor:
                    al.level === 'critical'
                      ? '#DC2626'
                      : al.level === 'warning'
                      ? '#EA580C'
                      : isDark ? '#1E293B' : '#E2E8F0',
                  borderLeftWidth: al.level === 'critical' || al.level === 'warning' ? 4 : 1,
                },
              ]}>
              <View style={styles.cardTop}>
                <View
                  style={[
                    styles.levelPill,
                    {
                      backgroundColor:
                        al.level === 'critical'
                          ? '#FEE2E2'
                          : al.level === 'warning'
                          ? '#FFEDD5'
                          : '#EFF6FF',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.levelText,
                      {
                        color:
                          al.level === 'critical'
                            ? '#DC2626'
                            : al.level === 'warning'
                            ? '#C2410C'
                            : '#1D61E7',
                      },
                    ]}>
                    {al.level.toUpperCase()}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.timeText,
                    { color: isDark ? '#64748B' : '#94A3B8' },
                  ]}>
                  {al.time}
                </Text>
              </View>

              <Text
                style={[
                  styles.alertTitle,
                  { color: isDark ? '#FFFFFF' : '#0F172A' },
                ]}>
                {al.title}
              </Text>

              <Text
                style={[
                  styles.alertDetail,
                  { color: isDark ? '#CBD5E1' : '#475569' },
                ]}>
                {al.detail}
              </Text>

              {!al.resolved && (
                <View style={styles.cardActions}>
                  <Pressable style={styles.resolveBtn}>
                    <Text style={styles.resolveBtnText}>Acknowledge / Take Action</Text>
                  </Pressable>
                </View>
              )}
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
    gap: 12,
  },
  alertCard: {
    padding: 16,
    borderRadius: 18,
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
    alignItems: 'center',
    marginBottom: 8,
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  alertTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  alertDetail: {
    fontSize: 13,
    lineHeight: 18,
  },
  cardActions: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  resolveBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  resolveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
