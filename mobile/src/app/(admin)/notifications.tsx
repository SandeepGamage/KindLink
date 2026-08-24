import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
  danger: '#D32F2F',
  dangerBg: '#FFEBEE',
};

export default function AdminNotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState('All (24)');

  return (
    <View className="flex-1 bg-[#F4F7FA]">
      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-4 pb-4">
          <View className="flex-1 mr-4">
            <Text className="text-xl font-bold text-[#17242E] mb-1">Notifications</Text>
            <Text className="text-[14px] text-[#667085]">Create & broadcast messages</Text>
          </View>
          <Pressable className="bg-[#1F5C96] rounded-xl flex-row items-center justify-center px-4 py-2 h-[40px]">
            <Ionicons name="add" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
            <Text className="text-white font-bold text-[13px] leading-4 text-center">Add</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <View className="px-5 mb-5 mt-2">
          <View className="bg-[#E3EEF9] rounded-2xl p-1 flex-row">
            {['All (24)', 'Sent', 'Drafts (2)'].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <Pressable
                  key={tab}
                  onPress={() => setActiveTab(tab)}
                  style={[
                    { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
                    isActive && {
                      backgroundColor: '#FFFFFF',
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.05,
                      shadowRadius: 2,
                      elevation: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      { fontSize: 14 },
                      isActive
                        ? { color: '#17242E', fontWeight: 'bold' }
                        : { color: '#667085', fontWeight: '500' },
                    ]}
                  >
                    {tab}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}>
          
          {(activeTab === 'All (24)' || activeTab === 'Sent') ? (
            <View>
              {/* Card 1 - Sent */}
              <View className="bg-white rounded-2xl border border-[#DCE6EF] p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                    <Text className="text-[11px] font-bold text-[#2E7D32]">Sent</Text>
                  </View>
                  <Text className="text-[12px] text-[#667085]">May 18, 10:00 AM</Text>
                </View>
                <Text className="text-[15px] font-bold text-[#17242E] mb-2">Emergency Relief Volunteer Call</Text>
                <Text className="text-[14px] text-[#667085] leading-5 mb-4">
                  All volunteers in Zone 4 are requested to report to the local community shelter by
                </Text>
                
                <View className="h-[1px] bg-[#F4F7FA] mb-3" />
                
                <View className="flex-row justify-end items-center gap-x-5">
                  <Pressable>
                    <Ionicons name="pencil" size={18} color="#1F5C96" />
                  </Pressable>
                  <Pressable>
                    <Ionicons name="copy-outline" size={18} color="#667085" />
                  </Pressable>
                  <Pressable>
                    <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                  </Pressable>
                </View>
              </View>
              
              {/* Card 3 - Sent */}
              <View className="bg-white rounded-2xl border border-[#DCE6EF] p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-[#E8F5E9] px-2.5 py-1 rounded-full">
                    <Text className="text-[11px] font-bold text-[#2E7D32]">Sent</Text>
                  </View>
                  <Text className="text-[12px] text-[#667085]">May 15, 2:30 PM</Text>
                </View>
                <Text className="text-[15px] font-bold text-[#17242E] mb-2">Donation Drive Update</Text>
                <Text className="text-[14px] text-[#667085] leading-5 mb-4">
                  Thank you to everyone who participated! We have reached our goal for this month's food drive.
                </Text>
                
                <View className="h-[1px] bg-[#F4F7FA] mb-3" />
                
                <View className="flex-row justify-end items-center gap-x-5">
                  <Pressable>
                    <Ionicons name="pencil" size={18} color="#1F5C96" />
                  </Pressable>
                  <Pressable>
                    <Ionicons name="copy-outline" size={18} color="#667085" />
                  </Pressable>
                  <Pressable>
                    <Ionicons name="trash-outline" size={18} color="#D32F2F" />
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

          {(activeTab === 'All (24)' || activeTab === 'Drafts (2)') ? (
            <View>
              {/* Card 2 - Draft */}
              <View className="bg-white rounded-2xl border border-[#DCE6EF] p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-[#FEF3E7] px-2.5 py-1 rounded-full">
                    <Text className="text-[11px] font-bold text-[#E08A3C]">Draft</Text>
                  </View>
                  <Text className="text-[12px] text-[#667085]">Saved 15m ago</Text>
                </View>
                <Text className="text-[15px] font-bold text-[#17242E] mb-2">Monthly Orientation Webinar</Text>
                <Text className="text-[14px] text-[#667085] leading-5 mb-4">
                  Join us for the upcoming monthly onboarding session for new community leads.
                </Text>
                
                <View className="h-[1px] bg-[#F4F7FA] mb-3" />
                
                <View className="flex-row items-center gap-x-2">
                  <Pressable className="bg-[#1F5C96] px-4 py-2.5 rounded-xl">
                    <Text className="text-white font-bold text-[13px]">Publish Now</Text>
                  </Pressable>
                  <Pressable className="bg-[#F4F7FA] px-4 py-2.5 rounded-xl">
                    <Text className="text-[#17242E] font-bold text-[13px]">Edit</Text>
                  </Pressable>
                  <Pressable className="bg-[#D32F2F] px-4 py-2.5 rounded-xl">
                    <Text className="text-white font-bold text-[13px]">Delete</Text>
                  </Pressable>
                </View>
              </View>
              
              {/* Card 4 - Draft */}
              <View className="bg-white rounded-2xl border border-[#DCE6EF] p-4 mb-4">
                <View className="flex-row justify-between items-center mb-3">
                  <View className="bg-[#FEF3E7] px-2.5 py-1 rounded-full">
                    <Text className="text-[11px] font-bold text-[#E08A3C]">Draft</Text>
                  </View>
                  <Text className="text-[12px] text-[#667085]">Saved 2 days ago</Text>
                </View>
                <Text className="text-[15px] font-bold text-[#17242E] mb-2">Policy Change Notice</Text>
                <Text className="text-[14px] text-[#667085] leading-5 mb-4">
                  Please review the updated guidelines regarding volunteer hours logging and submission.
                </Text>
                
                <View className="h-[1px] bg-[#F4F7FA] mb-3" />
                
                <View className="flex-row items-center gap-x-2">
                  <Pressable className="bg-[#1F5C96] px-4 py-2.5 rounded-xl">
                    <Text className="text-white font-bold text-[13px]">Publish Now</Text>
                  </Pressable>
                  <Pressable className="bg-[#F4F7FA] px-4 py-2.5 rounded-xl">
                    <Text className="text-[#17242E] font-bold text-[13px]">Edit</Text>
                  </Pressable>
                  <Pressable className="bg-[#D32F2F] px-4 py-2.5 rounded-xl">
                    <Text className="text-white font-bold text-[13px]">Delete</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : null}

        </ScrollView>
      </View>
    </View>
  );
}
