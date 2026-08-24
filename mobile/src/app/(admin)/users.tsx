import { View, Text, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MoreVertical } from 'lucide-react-native';
import { useState } from 'react';

type UserRole = 'Volunteer' | 'Member' | 'Admin';
type UserStatus = 'Active' | 'Suspended';

interface User {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: UserRole;
  status: UserStatus;
}

const USERS: User[] = [
  { id: '1', name: 'Emma Watson', email: 'emma@org.com', initials: 'EW', role: 'Volunteer', status: 'Active' },
  { id: '2', name: 'David Miller', email: 'david@org.com', initials: 'DM', role: 'Member', status: 'Suspended' },
  { id: '3', name: 'Alex Lin', email: 'alex.lin@org.com', initials: 'AL', role: 'Admin', status: 'Active' },
];

const FILTERS = ['All Roles', 'Admins', 'Volunteers', 'Members'];

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const [activeFilter, setActiveFilter] = useState('All Roles');

  const renderUser = ({ item, index }: { item: User; index: number }) => {
    const isLast = index === USERS.length - 1;

    return (
      <View
        key={item.id}
        className={`flex-row items-center p-4 bg-white ${!isLast ? 'border-b border-slate-100' : ''}`}
      >
        <View className="h-12 w-12 rounded-full bg-blue-50 items-center justify-center mr-4">
          <Text className="text-blue-700 font-semibold text-lg">{item.initials}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <Text className="text-slate-800 font-semibold text-base">{item.name}</Text>
          </View>
          <Text className="text-slate-500 text-sm">{item.email}</Text>
        </View>

        <View className="flex-row items-center gap-2">
          <View className="bg-slate-100 px-2 py-1 rounded">
            <Text className="text-slate-600 text-xs font-medium">{item.role}</Text>
          </View>
          <View
            className={`px-2 py-1 rounded-full border ${item.status === 'Active'
                ? 'bg-green-50 border-green-200'
                : 'bg-red-50 border-red-200'
              }`}
          >
            <Text
              className={`text-xs font-medium ${item.status === 'Active' ? 'text-green-700' : 'text-red-700'
                }`}
            >
              {item.status}
            </Text>
          </View>
          <TouchableOpacity className="ml-2 pl-2">
            <MoreVertical size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </View>
    );
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
        <View className="px-6 pt-6 pb-4">
          <Text className="text-2xl font-bold text-slate-800 mb-6">User Management</Text>

          <View className="flex-row items-center bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 shadow-sm">
            <Search size={20} color="#94a3b8" />
            <TextInput
              placeholder="Search name, email, or role..."
              className="flex-1 ml-3 text-base text-slate-800"
              placeholderTextColor="#94a3b8"
            />
          </View>

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
                  className={`px-5 py-2 rounded-full border ${activeFilter === filter
                      ? 'bg-blue-100 border-blue-200'
                      : 'bg-white border-slate-200'
                    }`}
                >
                  <Text
                    className={`font-medium ${activeFilter === filter ? 'text-blue-800' : 'text-slate-600'
                      }`}
                  >
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        <View className="px-6 pb-24 mt-2">
          <View className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {USERS.map((item, index) => renderUser({ item, index }))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
