import React from 'react';
import { View, Modal, Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Palette } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface DropdownMenuProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  offsetRight?: number;
  offsetTop?: number;
}

export function DropdownMenu({
  visible,
  onClose,
  children,
  containerStyle,
  offsetRight = 60,
  offsetTop = 64,
}: DropdownMenuProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View 
          style={[
            styles.container, 
            { 
              top: insets.top + offsetTop, 
              right: offsetRight 
            },
            containerStyle
          ]}
        >
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  container: {
    position: 'absolute',
    backgroundColor: Palette.primary,
    borderRadius: 24,
    padding: 16,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
});
