import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MoreVertical } from 'lucide-react-native';
import { useState } from 'react';

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
    <View
      className="flex-1 bg-[#F8FAFC]"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {/* Header Section */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-slate-800 mb-6">User Management</Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search name or email..."
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
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
              className="flex-row"
              contentContainerStyle={{ paddingRight: 24, gap: 8 }}
            >
              {FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => setActiveFilter(filter)}
                  className={`px-5 py-2 rounded-full border ${
                    activeFilter === filter
                      ? 'bg-blue-100 border-blue-200'
                      : 'bg-white border-slate-200'
                  }`}
                >
                  <Text
                    className={`font-medium ${
                      activeFilter === filter ? 'text-blue-800' : 'text-slate-600'
                    }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Users List */}
        <View className="px-6 pb-24 mt-2">
          {filteredUsers.length === 0 ? (
            <View className="items-center justify-center py-16">
              <Text className="text-slate-400 text-base">No users found</Text>
            </View>
          ) : (
            <View className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              {filteredUsers.map((user, index) => {
                const isLast = index === filteredUsers.length - 1;
                return (
                  <View
                    key={user._id}
                    className={`flex-row items-center p-4 bg-white ${
                      !isLast ? 'border-b border-slate-100' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <View className="h-12 w-12 rounded-full bg-blue-50 items-center justify-center mr-4">
                      <Text className="text-blue-700 font-semibold text-lg">
                        {getInitials(user.name)}
                      </Text>
                    </View>

                    {/* User Info */}
                    <View className="flex-1">
                      <View className="flex-row items-center justify-between mb-1">
                        <Text className="text-slate-800 font-semibold text-base">
                          {user.name}
                        </Text>
                      </View>
                      <Text className="text-slate-500 text-sm">{user.email}</Text>
                    </View>

                    {/* Status & Role Badges */}
                    <View className="flex-row items-center gap-2">
                      <View className="bg-slate-100 px-2 py-1 rounded">
                        <Text className="text-slate-600 text-xs font-medium capitalize">
                          {user.role}
                        </Text>
                      </View>
                      <View
                        className={`px-2 py-1 rounded-full border ${
                          user.isVerified
                            ? 'bg-green-50 border-green-200'
                            : 'bg-amber-50 border-amber-200'
                        }`}
                      >
                        <Text
                          className={`text-xs font-medium ${
                            user.isVerified ? 'text-green-700' : 'text-amber-700'
                          }`}
                        >
                          {user.isVerified ? 'Verified' : 'Pending'}
                        </Text>
                      </View>
                      <TouchableOpacity className="ml-2 pl-2">
                        <MoreVertical size={20} color="#94a3b8" />
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
