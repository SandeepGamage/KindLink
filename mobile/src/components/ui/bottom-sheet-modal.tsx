import React, { useEffect, useRef } from 'react';
import { View, Modal, Pressable, Animated, Dimensions } from 'react-native';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function BottomSheetModal({ visible, onClose, children }: BottomSheetModalProps) {
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
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View className="flex-1 justify-end">
        <Pressable className="absolute inset-0 bg-black/40" onPress={onClose} />
        <Animated.View 
          style={{ transform: [{ translateY: slideAnim }] }}
          className="bg-white rounded-t-[24px] p-6 pt-4 max-h-[90%] min-h-[40%]"
        >
          {/* Handle */}
          <View className="w-12 h-1.5 bg-[#DCE6EF] rounded-full self-center mb-6" />
          
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}
