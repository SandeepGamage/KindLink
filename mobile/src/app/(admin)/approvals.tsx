import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Check, X } from 'lucide-react-native';
import { ActionModal } from '@/components/ui/action-modal';

const MOCK_DATA = [
  {
    id: '1',
    name: 'Michael Chang',
    role: 'Community Lead',
    initials: 'MC',
    time: 'Today, 09:30 AM',
    tags: ['First Aid Certified', '5+ Yrs Exp'],
  },
  {
    id: '2',
    name: 'Jessica Taylor',
    role: 'Youth Care Assistant',
    initials: 'JT',
    time: 'Yesterday, 04:15 PM',
    tags: ['Background Checked', 'Bilingual'],
  },
];

export default function ApprovalsScreen() {
  const [activeTab, setActiveTab] = useState('Pending');
  const [userToApprove, setUserToApprove] = useState<typeof MOCK_DATA[0] | null>(null);
  const [userToReject, setUserToReject] = useState<typeof MOCK_DATA[0] | null>(null);
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-white" style={{ paddingTop: insets.top }}>
      {/* Header */}
      <View className="px-6 pt-6 pb-4">
        <Text className="text-[#17242E] text-2xl font-bold mb-1">Volunteer Requests</Text>
        <Text className="text-[#667085] text-sm">3 pending applications</Text>
      </View>

      {/* Tabs */}
      <View className="px-6 flex-row gap-3 mb-4">
        <TabButton title="Pending (3)" isActive={activeTab === 'Pending'} onPress={() => setActiveTab('Pending')} />
        <TabButton title="Approved" isActive={activeTab === 'Approved'} onPress={() => setActiveTab('Approved')} />
        <TabButton title="Rejected" isActive={activeTab === 'Rejected'} onPress={() => setActiveTab('Rejected')} />
      </View>

      {/* Border below tabs, based on screenshot there's a horizontal line across the screen separating header from content */}
      <View className="h-[1px] bg-[#DCE6EF] w-full" />

      {/* List */}
      <ScrollView className="flex-1 bg-[#F4F7FA] pt-6 px-4" contentContainerStyle={{ paddingBottom: 100 }}>
        {activeTab === 'Pending' ? (
          MOCK_DATA.map((request) => (
            <RequestCard 
              key={request.id} 
              request={request} 
              onApprove={() => setUserToApprove(request)}
              onReject={() => setUserToReject(request)}
            />
          ))
        ) : (
          <View className="items-center mt-10">
            <Text className="text-[#667085]">No {activeTab.toLowerCase()} applications.</Text>
          </View>
        )}
      </ScrollView>

      {userToApprove && (
        <ActionModal
          visible={!!userToApprove}
          onCancel={() => setUserToApprove(null)}
          onConfirm={() => {
            // TODO: API call to actually approve the user
            setUserToApprove(null);
          }}
          title={`Approve ${userToApprove.name}?`}
          subtitle={`${userToApprove.name} will be granted active ${userToApprove.role} volunteer permissions.`}
          icon={<Check color="#2E7D32" size={32} />}
          iconContainerClassName="bg-[#E8F5E9]"
          cancelText="Cancel"
          cancelButtonClassName="bg-[#E3EEF9]"
          cancelTextClassName="text-[#1F5C96]"
          confirmText="Confirm Approval"
          confirmButtonClassName="bg-[#2E7D32]"
          confirmTextClassName="text-white"
        />
      )}

      {userToReject && (
        <ActionModal
          visible={!!userToReject}
          onCancel={() => setUserToReject(null)}
          onConfirm={() => {
            // TODO: API call to actually reject the user
            setUserToReject(null);
          }}
          title={`Reject ${userToReject.name}?`}
          subtitle={`${userToReject.name}'s request for the ${userToReject.role} position will be declined.`}
          icon={<X color="#EF5350" size={32} />}
          iconContainerClassName="bg-[#FDEAEA]"
          cancelText="Cancel"
          cancelButtonClassName="bg-[#E3EEF9]"
          cancelTextClassName="text-[#1F5C96]"
          confirmText="Reject Application"
          confirmButtonClassName="bg-[#EF5350]"
          confirmTextClassName="text-white"
        />
      )}
    </View>
  );
}

function TabButton({ title, isActive, onPress }: { title: string; isActive: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`px-4 py-2 rounded-full border ${
        isActive 
          ? 'bg-[#E3F2FD] border-[#E3F2FD]' // Light blue bg
          : 'bg-white border-[#DCE6EF]'
      }`}
    >
      <Text
        className={`text-[13px] ${
          isActive ? 'text-[#17242E] font-bold' : 'text-[#667085] font-medium'
        }`}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

function RequestCard({ request, onApprove, onReject }: { request: typeof MOCK_DATA[0], onApprove: () => void, onReject: () => void }) {
  return (
    <View className="bg-white p-5 rounded-[20px] mb-4 border border-[#DCE6EF] shadow-sm">
      {/* Top Row: User Info */}
      <View className="flex-row items-start justify-between mb-4">
        <View className="flex-row items-center gap-3">
          {/* Avatar */}
          <View className="w-[46px] h-[46px] rounded-full bg-[#F4F7FA] border border-[#DCE6EF] items-center justify-center">
            <Text className="text-[#1F5C96] font-bold text-[15px]">{request.initials}</Text>
          </View>
          
          <View>
            <Text className="text-[#17242E] font-bold text-base">{request.name}</Text>
            <Text className="text-[#667085] text-sm mt-0.5">{request.role}</Text>
          </View>
        </View>
        <Text className="text-[#667085] text-[11px] mt-1">{request.time}</Text>
      </View>

      {/* Middle Row: Tags & Link */}
      <View className="flex-row items-end justify-between mb-4">
        <View className="flex-row flex-wrap gap-2 flex-1 pr-4">
          {request.tags.map((tag, index) => (
            <View key={index} className="bg-[#F4F7FA] px-3 py-1.5 rounded-md border border-[#DCE6EF]">
              <Text className="text-[#17242E] text-[11px] font-semibold">{tag}</Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity className="items-center justify-center">
          <Text className="text-[#1F5C96] font-bold text-[13px] text-center leading-[18px]">View Profile Details</Text>
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View className="h-[1px] bg-[#DCE6EF] w-full mb-4 opacity-50" />

      {/* Bottom Row: Actions */}
      <View className="flex-row gap-3">
        <TouchableOpacity 
          className="flex-1 bg-[#D32F2F] py-3 rounded-xl border border-[#D32F2F]"
          onPress={onReject}
        >
          <Text className="text-white text-center font-bold text-[13px]">Reject</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-1 bg-[#1F5C96] py-3 rounded-xl border border-[#1F5C96]"
          onPress={onApprove}
        >
          <Text className="text-white text-center font-bold text-[13px]">Approve</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
