import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Modal, Animated, ActivityIndicator, Dimensions, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
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
  /**
   * True while the confirm action's request is in flight. Shows a spinner on
   * Confirm and ignores further taps, so a slow network doesn't read as a
   * missed tap that the user repeats.
   */
  loading?: boolean;
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
  loading = false,
}: ActionModalProps) {
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      requestAnimationFrame(() => {
        slideAnim.setValue(Dimensions.get('window').height);
        Animated.spring(slideAnim, {
          toValue: 0,
          // JS-driven on purpose: on the New Architecture a native-driven transform
          // never reaches the layout React Native hit-tests against, so the buttons
          // were still "off-screen" there and the first tap on a real phone was
          // cancelled by the finger's slight movement.
          useNativeDriver: false,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }).start();
      });
    } else if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        useNativeDriver: false,
      }).start(({ finished }) => {
        // Interrupted by a re-open: the modal is showing again, so don't hide it.
        if (finished) setModalVisible(false);
      });
    }
  }, [visible, slideAnim]);

  // Dismissing mid-request would hide the outcome, so every way out is locked too.
  const handleCancel = () => {
    if (!loading) onCancel();
  };

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleCancel} />
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
                pressed && styles.buttonPressed,
                loading && styles.buttonDisabled
              ]} 
              onPress={handleCancel}
              disabled={loading}
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
              disabled={loading}
              accessibilityRole="button"
              accessibilityState={{ busy: loading, disabled: loading }}
            >
              {/* The hidden label keeps the button's height while the spinner shows. */}
              <Text style={[styles.buttonText, styles.confirmTextDefault, confirmTextStyle, loading && styles.hiddenText]}>{confirmText}</Text>
              {loading && (
                <ActivityIndicator color={Palette.primary} style={StyleSheet.absoluteFill} />
              )}
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
    borderRadius: 24,
    alignItems: 'center',
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  hiddenText: {
    opacity: 0,
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
