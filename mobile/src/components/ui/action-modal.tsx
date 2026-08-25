import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, Animated, Dimensions } from 'react-native';

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
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;

  useEffect(() => {
    if (visible) {
      slideAnim.setValue(Dimensions.get('window').height);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        damping: 20,
        mass: 0.8,
        stiffness: 100,
      }).start();
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      <View className="flex-1 bg-black/40 justify-end">
        <Animated.View style={{ transform: [{ translateY: slideAnim }] }} className="bg-primary rounded-t-[24px] p-6 items-center">
          <View className="w-10 h-1 bg-border rounded-full mb-6" />
          
          <View className={`w-16 h-16 rounded-full items-center justify-center mb-4 ${iconContainerClassName}`}>
            {icon}
          </View>
          
          <Text className="text-xl font-bold text-ink mb-2 text-center">{title}</Text>
          <Text className="text-sm text-muted mb-8 text-center">{subtitle}</Text>
          
          <View className="flex-row w-full gap-3 mb-6">
            <Pressable className={`flex-1 py-3.5 rounded-xl items-center ${cancelButtonClassName}`} onPress={onCancel}>
              <Text className={`text-base font-semibold ${cancelTextClassName}`}>{cancelText}</Text>
            </Pressable>
            
            <Pressable className={`flex-1 py-3.5 rounded-xl items-center ${confirmButtonClassName}`} onPress={onConfirm}>
              <Text className={`text-base font-semibold ${confirmTextClassName}`}>{confirmText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
