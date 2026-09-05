import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { AdminHeader } from '@/components/ui/admin-header';
import { FilterDropdown } from '@/components/admin/filter-dropdown';
import { Avatar } from '@/components/admin/avatar';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/empty-state';
import { useAdminTheme } from '@/hooks/use-admin-theme';
import { AdminSpacing } from '@/components/admin/tokens';
import { ChevronLeft, ArrowUpDown, Inbox } from 'lucide-react-native';

// TODO: Mock data. Needs the same VolunteerApplication backend as (admin)/approvals.
const HISTORY_MOCK_DATA = [
  {
    id: 'h1',
    name: 'Robert Davis',
    role: 'Volunteer Driver',
    time: '2 days ago',
    status: 'Approved',
  },
  {
    id: 'h2',
    name: 'Emily Chen',
    role: 'Community Outreach',
    time: '4 days ago',
    status: 'Rejected',
  },
];

type HistoryFilter = 'All' | 'Approved' | 'Rejected';
const FILTER_OPTIONS: HistoryFilter[] = ['All', 'Approved', 'Rejected'];

export default function HistoryScreen() {
  const router = useRouter();
  const c = useAdminTheme();
  const [activeFilter, setActiveFilter] = useState<HistoryFilter>('All');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const filteredData = activeFilter === 'All'
    ? HISTORY_MOCK_DATA
    : HISTORY_MOCK_DATA.filter(req => req.status === activeFilter);

  return (
    <View style={[styles.container, { backgroundColor: c.background }]}>
      <AdminHeader
        title="Approval History"
        leftContent={
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <ChevronLeft size={24} color={c.text} />
          </Pressable>
        }
        rightContent={
          <Pressable
            onPress={() => setIsSortMenuOpen(true)}
            hitSlop={12}
            accessibilityRole="button"
            accessibilityLabel="Filter history by outcome"
          >
            <ArrowUpDown size={24} color={c.text} />
          </Pressable>
        }
      />

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredData.length === 0 ? (
          <EmptyState
            icon={<Inbox size={32} color={c.textMuted} />}
            title={`No ${activeFilter.toLowerCase()} applications`}
          />
        ) : (
          filteredData.map((request, index) => {
            const isLast = index === filteredData.length - 1;
            return (
              <View
                key={request.id}
                style={[
                  styles.userRow,
                  !isLast && { borderBottomWidth: 1, borderBottomColor: c.divider },
                ]}
              >
                <Avatar name={request.name} size={48} style={styles.avatar} />

                <View style={styles.userInfoContainer}>
                  <Text style={[styles.userName, { color: c.text }]}>{request.name}</Text>
                  <Text style={[styles.userRole, { color: c.textSecondary }]}>
                    {request.role} • {request.time}
                  </Text>
                </View>

                <StatusBadge
                  label={request.status}
                  tone={request.status === 'Approved' ? 'success' : 'danger'}
                />
              </View>
            );
          })
        )}
      </ScrollView>

      <FilterDropdown
        visible={isSortMenuOpen}
        onClose={() => setIsSortMenuOpen(false)}
        options={FILTER_OPTIONS}
        activeValue={activeFilter}
        onChange={setActiveFilter}
        offsetRight={16}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: AdminSpacing.screenEdge,
  },
  listContent: {
    paddingBottom: AdminSpacing.scrollBottom,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  avatar: {
    marginRight: 16,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
  },
});
