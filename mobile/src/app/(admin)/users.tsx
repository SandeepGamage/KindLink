import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { AdminHeader } from '@/components/ui/admin-header';
import { Search, MoreVertical } from 'lucide-react-native';
import { useState } from 'react';
import { Palette, FunctionalColors } from '@/constants/theme';

const getInitials = (name?: string | null) => {
  if (!name) return 'A';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

// Dummy data for the UI
const DUMMY_USERS = [
  {
    _id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@example.com',
    role: 'admin',
    isVerified: true,
  },
  {
    _id: '2',
    name: 'Michael Chen',
    email: 'm.chen@example.com',
    role: 'volunteer',
    isVerified: true,
  },
  {
    _id: '3',
    name: 'Eleanor Vance',
    email: 'eleanor.v@example.com',
    role: 'elderly',
    isVerified: false,
  },
  {
    _id: '4',
    name: 'David Wilson',
    email: 'david.wilson@example.com',
    role: 'volunteer',
    isVerified: true,
  },
];

export default function UsersDirectoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Local filtering for dummy data
  const filteredUsers = DUMMY_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'All') return matchesSearch;
    return matchesSearch && user.role.toLowerCase() === activeFilter.toLowerCase();
  });

  return (
    <View style={styles.container}>
      <AdminHeader
        title="Users Directory"
        subtitle="Manage users system wide"
        bottomContent={
          <>
            <View style={styles.searchContainer}>
              <Search size={20} color={FunctionalColors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor={FunctionalColors.textSecondary}
              />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filtersScroll} contentContainerStyle={styles.filtersContent}>
              {['All', 'Volunteers', 'Elders', 'Pending', 'Active'].map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, activeFilter === filter ? styles.filterChipActive : styles.filterChipInactive]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter ? styles.filterTextActive : styles.filterTextInactive]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.listContainer}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            <>
              {filteredUsers.map((user, index) => {
                const isLast = index === filteredUsers.length - 1;
                return (
                  <View
                    key={user._id}
                    style={[
                      styles.userRow,
                      !isLast && styles.userRowBorder
                    ]}
                  >
                    {/* Avatar */}
                    <View style={styles.avatarContainer}>
                      <Text style={styles.avatarText}>
                        {getInitials(user.name)}
                      </Text>
                    </View>

                    {/* User Info */}
                    <View style={styles.userInfoContainer}>
                      <View style={styles.userNameContainer}>
                        <Text style={styles.userName}>
                          {user.name}
                        </Text>
                      </View>
                      <Text style={styles.userEmail}>{user.email}</Text>
                    </View>

                    {/* Status & Role Badges */}
                    <View style={styles.badgesContainer}>
                      <View style={styles.roleBadge}>
                        <Text style={styles.roleBadgeText}>
                          {user.role}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          user.isVerified ? styles.statusBadgeVerified : styles.statusBadgePending
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            user.isVerified ? styles.statusTextVerified : styles.statusTextPending
                          ]}
                        >
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </Text>
                      </View>
                      <TouchableOpacity style={styles.moreButton}>
                        <MoreVertical size={20} color={FunctionalColors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.surface,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: Palette.ink,
  },
  filtersScroll: {
    flexDirection: 'row',
  },
  filtersContent: {
    paddingRight: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: Palette.blueTint,
    borderColor: Palette.secondary,
  },
  filterChipInactive: {
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
  },
  filterText: {
    fontWeight: '500',
  },
  filterTextActive: {
    color: Palette.secondary,
  },
  filterTextInactive: {
    color: FunctionalColors.textSecondary,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingBottom: 96,
    marginTop: 0,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    color: FunctionalColors.textMuted,
    fontSize: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: 'transparent',
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  avatarContainer: {
    height: 48,
    width: 48,
    borderRadius: 24,
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: Palette.secondary,
    fontWeight: '600',
    fontSize: 18,
  },
  userInfoContainer: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  userName: {
    color: Palette.ink,
    fontWeight: '600',
    fontSize: 16,
  },
  userEmail: {
    color: FunctionalColors.textSecondary,
    fontSize: 14,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roleBadge: {
    backgroundColor: Palette.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
  },
  roleBadgeText: {
    color: FunctionalColors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 24,
    borderWidth: 1,
  },
  statusBadgeVerified: {
    backgroundColor: FunctionalColors.successBg,
    borderColor: '#bbf7d0',
  },
  statusBadgePending: {
    backgroundColor: FunctionalColors.warningBg,
    borderColor: '#fde68a',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  statusTextVerified: {
    color: FunctionalColors.successText,
  },
  statusTextPending: {
    color: FunctionalColors.warningText,
  },
  moreButton: {
    marginLeft: 8,
    paddingLeft: 8,
  },
});
