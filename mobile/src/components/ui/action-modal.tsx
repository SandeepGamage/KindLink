import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, Animated, Dimensions, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { Palette, FunctionalColors } from '@/constants/theme';

interface ActionModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconContainerStyle?: StyleProp<ViewStyle>;
  cancelText?: string;
  confirmText?: string;
  cancelButtonStyle?: StyleProp<ViewStyle>;
  cancelTextStyle?: StyleProp<TextStyle>;
  confirmButtonStyle?: StyleProp<ViewStyle>;
  confirmTextStyle?: StyleProp<TextStyle>;
}

export function ActionModal({
  visible,
  onCancel,
  onConfirm,
  title,
  subtitle,
  icon,
  iconContainerStyle,
  cancelText = 'Cancel',
  confirmText = 'Confirm',
  cancelButtonStyle,
  cancelTextStyle,
  confirmButtonStyle,
  confirmTextStyle,
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
      <View style={styles.overlay}>
        <Animated.View style={[styles.bottomSheet, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.handle} />
          
          <View style={[styles.iconContainer, iconContainerStyle]}>
            {icon}
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
          
          <View style={styles.actionsContainer}>
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                styles.cancelButtonDefault,
                cancelButtonStyle,
                pressed && styles.buttonPressed
              ]} 
              onPress={onCancel}
            >
              <Text style={[styles.buttonText, styles.cancelTextDefault, cancelTextStyle]}>{cancelText}</Text>
            </Pressable>
            
            <Pressable 
              style={({ pressed }) => [
                styles.button,
                styles.confirmButtonDefault,
                confirmButtonStyle,
                pressed && styles.buttonPressed
              ]} 
              onPress={onConfirm}
            >
              <Text style={[styles.buttonText, styles.confirmTextDefault, confirmTextStyle]}>{confirmText}</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: Palette.primary,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Palette.border,
    borderRadius: 2,
    marginBottom: 24,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: FunctionalColors.dangerBg, // default
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Palette.ink,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: FunctionalColors.textMuted,
    marginBottom: 32,
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: 'row',
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  cancelButtonDefault: {
    backgroundColor: Palette.blueTint,
  },
  confirmButtonDefault: {
    backgroundColor: FunctionalColors.danger,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelTextDefault: {
    color: Palette.secondary,
  },
  confirmTextDefault: {
    color: Palette.primary,
  },
});
