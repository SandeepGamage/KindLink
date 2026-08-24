import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  useColorScheme,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaxContentWidth } from '@/constants/theme';

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';
  const [filterRole, setFilterRole] = useState<'all' | 'elderly' | 'volunteer'>('all');
  const [search, setSearch] = useState('');

  const usersList = [
    {
      id: 'u1',
      name: 'Sunil Weerasinghe',
      role: 'elderly',
      email: 'sunil.w@gmail.com',
      joined: 'Joined Jan 2026',
      status: 'Active',
      tasksCompleted: 8,
    },
    {
      id: 'u2',
      name: 'Alex Fernando',
      role: 'volunteer',
      email: 'alex.f@volunteers.lk',
      joined: 'Joined Feb 2026',
      status: 'Active',
      tasksCompleted: 24,
    },
    {
      id: 'u3',
      name: 'Kamala Silva',
      role: 'elderly',
      email: 'kamala.silva@gmail.com',
      joined: 'Joined Mar 2026',
      status: 'Active',
      tasksCompleted: 3,
    },
    {
      id: 'u4',
      name: 'Sarah Jenkins',
      role: 'volunteer',
      email: 'sarah.j@outlook.com',
      joined: 'Joined Mar 2026',
      status: 'Active',
      tasksCompleted: 19,
    },
  ];

  const filtered = usersList.filter((u) => {
    const matchesRole = filterRole === 'all' || u.role === filterRole;
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

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
            User Directory
          </Text>
          <Text
            style={[
              styles.pageSubtitle,
              { color: isDark ? '#94A3B8' : '#64748B' },
            ]}>
            Manage all senior members and community volunteers
          </Text>
        </View>

        {/* Search Box */}
        <View
          style={[
            styles.searchBox,
            {
              backgroundColor: isDark ? '#131D31' : '#FFFFFF',
              borderColor: isDark ? '#1E293B' : '#E2E8F0',
            },
          ]}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            placeholder="Search by name or email..."
            placeholderTextColor={isDark ? '#64748B' : '#94A3B8'}
            value={search}
            onChangeText={setSearch}
            style={[
              styles.searchInput,
              { color: isDark ? '#FFFFFF' : '#0F172A' },
            ]}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['all', 'elderly', 'volunteer'] as const).map((r) => (
            <Pressable
              key={r}
              onPress={() => setFilterRole(r)}
              style={[
                styles.pill,
                filterRole === r && styles.pillActive,
                {
                  backgroundColor:
                    filterRole === r
                      ? '#1D61E7'
                      : isDark ? '#1E293B' : '#FFFFFF',
                },
              ]}>
              <Text
                style={[
                  styles.pillText,
                  {
                    color:
                      filterRole === r
                        ? '#FFFFFF'
                        : isDark ? '#94A3B8' : '#64748B',
                  },
                ]}>
                {r === 'all'
                  ? 'All Users'
                  : r === 'elderly'
                  ? 'Senior Members'
                  : 'Volunteers'}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* User Cards */}
        <View style={styles.list}>
          {filtered.map((u) => (
            <View
              key={u.id}
              style={[
                styles.userCard,
                {
                  backgroundColor: isDark ? '#131D31' : '#FFFFFF',
                  borderColor: isDark ? '#1E293B' : '#E2E8F0',
                },
              ]}>
              <View style={styles.cardHeader}>
                <View>
                  <Text
                    style={[
                      styles.userName,
                      { color: isDark ? '#FFFFFF' : '#0F172A' },
                    ]}>
                    {u.name}
                  </Text>
                  <Text
                    style={[
                      styles.userEmail,
                      { color: isDark ? '#94A3B8' : '#64748B' },
                    ]}>
                    {u.email}
                  </Text>
                </View>

                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        u.role === 'elderly' ? '#FCE7F3' : '#EFF6FF',
                    },
                  ]}>
                  <Text
                    style={[
                      styles.roleText,
                      {
                        color:
                          u.role === 'elderly' ? '#DB2777' : '#1D61E7',
                      },
                    ]}>
                    {u.role === 'elderly' ? 'Senior' : 'Volunteer'}
                  </Text>
                </View>
              </View>

              <View
                style={[
                  styles.cardFooter,
                  { borderTopColor: isDark ? '#1E293B' : '#F1F5F9' },
                ]}>
                <Text
                  style={[
                    styles.footerMeta,
                    { color: isDark ? '#64748B' : '#94A3B8' },
                  ]}>
                  {u.joined}
                </Text>
                <Text
                  style={[
                    styles.footerStats,
                    { color: isDark ? '#93C5FD' : '#2563EB' },
                  ]}>
                  {u.tasksCompleted} Requests Handled
                </Text>
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
  header: {
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    padding: 0,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
  },
  pillActive: {},
  pillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  list: {
    gap: 12,
  },
  userCard: {
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
  },
  footerMeta: {
    fontSize: 12,
  },
  footerStats: {
    fontSize: 12,
    fontWeight: '700',
  },
});
