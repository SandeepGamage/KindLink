import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';

interface ActionModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconContainerClassName?: string;
  cancelText?: string;
  confirmText?: string;
  cancelButtonClassName?: string;
  cancelTextClassName?: string;
  confirmButtonClassName?: string;
  confirmTextClassName?: string;
}

export function ActionModal({
  visible,
  onCancel,
  onConfirm,
  title,
  subtitle,
  icon,
  iconContainerClassName = 'bg-danger/10',
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  cancelButtonClassName = 'bg-blueTint',
  cancelTextClassName = 'text-secondary',
  confirmButtonClassName = 'bg-danger',
  confirmTextClassName = 'text-primary',
}: ActionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View className="flex-1 bg-black/40 justify-end">
        <View className="bg-primary rounded-t-[24px] p-6 items-center">
          <View className="w-10 h-1 bg-border rounded-full mb-6" />
          
          <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${iconContainerClassName}`}>
            {icon}
          </View>
          
          <Text className="text-xl font-bold text-ink mb-2 text-center">{title}</Text>
          <Text className="text-sm text-muted mb-8 text-center">{subtitle}</Text>
          
          <View className="flex-row w-full gap-3">
            <Pressable className={`flex-1 py-3.5 rounded-xl items-center ${cancelButtonClassName}`} onPress={onCancel}>
              <Text className={`text-base font-semibold ${cancelTextClassName}`}>{cancelText}</Text>
            </Pressable>
            
            <Pressable className={`flex-1 py-3.5 rounded-xl items-center ${confirmButtonClassName}`} onPress={onConfirm}>
              <Text className={`text-base font-semibold ${confirmTextClassName}`}>{confirmText}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
