import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { AdminHeader } from '@/components/ui/admin-header';
import { DropdownMenu } from '@/components/ui/dropdown-menu';
import { Palette, FunctionalColors } from '@/constants/theme';
import { Check, X, ChevronLeft, ArrowUpDown } from 'lucide-react-native';

const HISTORY_MOCK_DATA = [
  {
    id: 'h1',
    name: 'Robert Davis',
    role: 'Volunteer Driver',
    initials: 'RD',
    time: '2 days ago',
    status: 'Approved',
  },
  {
    id: 'h2',
    name: 'Emily Chen',
    role: 'Community Outreach',
    initials: 'EC',
    time: '4 days ago',
    status: 'Rejected',
  },
];

export default function HistoryScreen() {
  const router = useRouter();
  const [activeFilter, setActiveFilter] = useState('All');
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const filteredData = activeFilter === 'All' 
    ? HISTORY_MOCK_DATA 
    : HISTORY_MOCK_DATA.filter(req => req.status === activeFilter);

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Approval History"
        leftContent={
          <TouchableOpacity onPress={() => router.push('/(admin)/approvals')}>
            <ChevronLeft size={24} color={Palette.ink} />
          </TouchableOpacity>
        }
        rightContent={
          <TouchableOpacity onPress={() => setIsSortMenuOpen(true)}>
            <ArrowUpDown size={24} color={Palette.ink} />
          </TouchableOpacity>
        }
      />

      <ScrollView style={styles.listContainer} contentContainerStyle={styles.listContent}>
        {filteredData.map((request, index) => {
          const isLast = index === filteredData.length - 1;
          return (
            <View key={request.id} style={[styles.userRow, !isLast && styles.userRowBorder]}>
              <View style={styles.avatarContainer}>
                <Text style={styles.avatarText}>{request.initials}</Text>
              </View>

              <View style={styles.userInfoContainer}>
                <View style={styles.userNameContainer}>
                  <Text style={styles.userName}>{request.name}</Text>
                </View>
                <Text style={styles.userRole}>{request.role} • {request.time}</Text>
              </View>

              <View style={styles.badgesContainer}>
                {request.status === 'Approved' ? (
                  <View style={[styles.statusBadge, styles.badgeApproved]}>
                    <Check size={14} color={FunctionalColors.success} style={styles.statusIcon} />
                    <Text style={styles.statusTextApproved}>Approved</Text>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, styles.badgeRejected]}>
                    <X size={14} color={FunctionalColors.danger} style={styles.statusIcon} />
                    <Text style={styles.statusTextRejected}>Rejected</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <DropdownMenu
        visible={isSortMenuOpen}
        onClose={() => setIsSortMenuOpen(false)}
        offsetRight={16}
        offsetTop={40}
      >
        <View style={styles.drawerOptionsContainer}>
          {['All', 'Approved', 'Rejected'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.drawerOption,
                activeFilter === status && styles.drawerOptionActive
              ]}
              onPress={() => {
                setActiveFilter(status);
                setIsSortMenuOpen(false);
              }}
            >
              <Text
                style={[
                  styles.drawerOptionText,
                  activeFilter === status && styles.drawerOptionTextActive
                ]}
              >
                {status}
              </Text>
              {activeFilter === status && (
                <Check size={20} color={Palette.secondary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </DropdownMenu>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },
  listContainer: {
    flex: 1,
    backgroundColor: Palette.surface,
    paddingHorizontal: 12,
  },
  listContent: {
    paddingBottom: 100,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.blueTint,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Palette.secondary,
    fontWeight: 'bold',
    fontSize: 16,
  },
  userInfoContainer: {
    flex: 1,
    marginRight: 12,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Palette.ink,
  },
  userRole: {
    fontSize: 14,
    color: FunctionalColors.textSecondary,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 24,
  },
  badgeApproved: {
    backgroundColor: '#E8F5E9',
  },
  badgeRejected: {
    backgroundColor: '#FFEBEE',
  },
  statusIcon: {
    marginRight: 6,
  },
  statusTextApproved: {
    color: FunctionalColors.success,
    fontWeight: '600',
    fontSize: 14,
  },
  statusTextRejected: {
    color: FunctionalColors.danger,
    fontWeight: '600',
    fontSize: 14,
  },
  drawerOptionsContainer: {
    gap: 8,
  },
  drawerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Palette.border,
    backgroundColor: Palette.surface,
  },
  drawerOptionActive: {
    borderColor: Palette.secondary,
    backgroundColor: '#E3F2FD',
  },
  drawerOptionText: {
    fontSize: 16,
    color: Palette.ink,
  },
  drawerOptionTextActive: {
    fontWeight: 'bold',
    color: Palette.secondary,
  },
});
