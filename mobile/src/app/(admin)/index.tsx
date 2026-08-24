import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SymbolView } from 'expo-symbols';

const COLORS = {
  primary: '#FFFFFF',
  surface: '#F4F7FA',
  border: '#DCE6EF',
  blueTint: '#E3EEF9',
  secondary: '#1F5C96',
  ink: '#17242E',
  accent: '#E08A3C',
  success: '#2E7D32',
  successBg: '#E8F5E9',
  accentBg: '#FEF3E7',
  gray: '#667085',
};

const STATS = [
  {
    title: 'Pending Volunteers',
    value: '12',
    badgeText: '3 New today',
    badgeType: 'accent',
  },
  {
    title: 'Active Users',
    value: '1,420',
    badgeText: '+8.4%',
    badgeType: 'success',
  },
  {
    title: 'Sent Broadcasts',
    value: '38',
    subtext: 'Last sent 2h ago',
  },
  {
    title: 'System Status',
    value: 'Optimal',
    isStatus: true,
    subtext: 'All nodes online',
    subtextColor: COLORS.success,
  },
];

const RECENT_ACTIONS = [
  { id: '1', action: 'John Doe applied for Volunteer', time: '10m ago' },
  { id: '2', action: 'System Alert #104 published', time: '1h ago' },
  { id: '3', action: 'Sarah Jenkins account approved', time: '3h ago' },
];

export default function AdminDashboardScreen() {
  const insets = useSafeAreaInsets();
  
  return (
    <View className="flex-1 bg-[#F4F7FA]">
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-6">
          <View>
            <Text className="text-[14px] text-[#1F5C96] mb-1">Welcome back, Admin</Text>
            <Text className="text-2xl font-bold text-[#17242E]">Dashboard</Text>
          </View>
          <View className="w-11 h-11 rounded-full bg-[#E3EEF9] items-center justify-center">
            <Text className="text-[#1F5C96] font-bold text-base">AD</Text>
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          
          {/* Stat Cards Grid */}
          <View className="flex-row flex-wrap justify-between gap-y-3">
            {STATS.map((stat, index) => (
              <View 
                key={index} 
                className="w-[48%] bg-white rounded-2xl p-4 border border-[#DCE6EF] min-h-[120px] justify-center"
              >
                <Text className="text-[13px] text-[#667085] mb-2">{stat.title}</Text>
                
                {stat.isStatus ? (
                  <View className="flex-row items-center mb-2">
                    <View className="w-2 h-2 rounded-full bg-[#2E7D32] mr-1.5" />
                    <Text className="text-lg font-bold text-[#2E7D32]">{stat.value}</Text>
                  </View>
                ) : (
                  <Text className="text-2xl font-bold text-[#17242E] mb-2">{stat.value}</Text>
                )}

                {stat.badgeText && (
                  <View
                    className={`self-start px-2 py-1 rounded-xl ${
                      stat.badgeType === 'accent' ? 'bg-[#FEF3E7]' : 'bg-[#E8F5E9]'
                    }`}
                  >
                    <Text
                      className={`text-[11px] font-semibold ${
                        stat.badgeType === 'accent' ? 'text-[#E08A3C]' : 'text-[#2E7D32]'
                      }`}
                    >
                      {stat.badgeText}
                    </Text>
                  </View>
                )}

                {stat.subtext && (
                  <Text
                    className="text-xs mt-1"
                    style={{ color: stat.subtextColor || COLORS.gray }}
                  >
                    {stat.subtext}
                  </Text>
                )}
              </View>
            ))}
          </View>

          {/* Quick Actions */}
          <View className="mt-6">
            <Text className="text-xs font-bold text-[#1F5C96] tracking-widest mb-3 uppercase">
              QUICK ACTIONS
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
              <Pressable className="flex-row items-center bg-[#E3EEF9] px-4 py-2.5 rounded-full border border-[#DCE6EF]">
                <SymbolView name="plus" size={16} tintColor={COLORS.secondary} style={{ marginRight: 8 }} />
                <Text className="text-sm font-semibold text-[#1F5C96]">Send Notice</Text>
              </Pressable>
              <Pressable className="flex-row items-center bg-[#E3EEF9] px-4 py-2.5 rounded-full border border-[#DCE6EF]">
                <SymbolView name="shield" size={16} tintColor={COLORS.secondary} style={{ marginRight: 8 }} />
                <Text className="text-sm font-semibold text-[#1F5C96]">Review Volunteers</Text>
              </Pressable>
            </ScrollView>
          </View>

          {/* Recent Actions */}
          <View className="mt-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-lg font-bold text-[#17242E]">Recent Actions</Text>
              <Pressable>
                <Text className="text-sm font-semibold text-[#1F5C96]">See all</Text>
              </Pressable>
            </View>

            <View className="bg-white rounded-2xl border border-[#DCE6EF] overflow-hidden">
              {RECENT_ACTIONS.map((item, index) => (
                <View
                  key={item.id}
                  className={`flex-row justify-between items-center p-4 border-[#DCE6EF] ${
                    index === RECENT_ACTIONS.length - 1 ? 'border-b-0' : 'border-b'
                  }`}
                >
                  <Text className="text-sm text-[#17242E] font-medium flex-1 mr-3" numberOfLines={1}>
                    {item.action}
                  </Text>
                  <Text className="text-[13px] text-[#667085]">{item.time}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
