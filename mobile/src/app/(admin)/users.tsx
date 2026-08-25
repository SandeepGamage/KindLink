import { View, Text, TextInput, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MoreVertical } from 'lucide-react-native';
import { useState } from 'react';
import { Palette, FunctionalColors } from '@/constants/theme';

const FILTERS = ['All Roles', 'Admins', 'Volunteers', 'Elderly'];

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

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All Roles');
  const [searchText, setSearchText] = useState('');

  // Local filtering for dummy data
  const filteredUsers = DUMMY_USERS.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchText.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchText.toLowerCase());
    
    if (activeFilter === 'All Roles') return matchesSearch;
    return matchesSearch && user.role.toLowerCase() === activeFilter.toLowerCase();
  });

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header Section */}
        <View style={styles.headerSection}>
          <Text style={styles.headerTitle}>User Management</Text>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Search size={20} color={FunctionalColors.textMuted} />
            <TextInput
              placeholder="Search name or email..."
              style={styles.searchInput}
              placeholderTextColor={FunctionalColors.textMuted}
              value={searchText}
              onChangeText={setSearchText}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Role Filters */}
          <View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filtersScroll}
              contentContainerStyle={styles.filtersContent}
            >
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  style={[
                    styles.filterChip,
                    activeFilter === filter ? styles.filterChipActive : styles.filterChipInactive
                  ]}
                >
                  <Text
                    style={[
                      styles.filterText,
                      activeFilter === filter ? styles.filterTextActive : styles.filterTextInactive
                    ]}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Users List */}
        <View style={styles.listContainer}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            <View style={styles.usersCard}>
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
            </View>
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
  headerSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 24,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    paddingRight: 24,
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
    paddingHorizontal: 24,
    paddingBottom: 96,
    marginTop: 8,
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
  usersCard: {
    backgroundColor: Palette.primary,
    borderColor: Palette.border,
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: Palette.ink,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Palette.primary,
  },
  userRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Palette.surface,
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
    borderRadius: 4,
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
    borderRadius: 12,
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
