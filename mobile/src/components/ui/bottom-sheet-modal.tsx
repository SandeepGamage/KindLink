import React, { useEffect, useRef } from 'react';
import { View, Modal, Pressable, Animated, Dimensions, StyleSheet, DimensionValue } from 'react-native';
import { X } from 'lucide-react-native';
import { Palette } from '@/constants/theme';

interface BottomSheetModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /**
   * Floor for the sheet's height. Defaults to '40%', which suits the form-like
   * sheets; a short list of actions passes 0 so it hugs its content.
   */
  minHeight?: DimensionValue;
  /** Sheet fill. Defaults to white; themed screens pass their card colour. */
  backgroundColor?: string;
  /**
   * Adds an X in the top-right corner. Off by default — sheets that already end
   * in a Cancel or Close button don't need a second dismiss affordance.
   */
  showCloseButton?: boolean;
  /** Icon tint for that X. Defaults to the ink used on the untinted default fill. */
  closeButtonColor?: string;
  /** Fill of the X's circle. Defaults to the surface grey. */
  closeButtonBackgroundColor?: string;
  /** 1px ring around that circle. Defaults to the standard border grey. */
  closeButtonBorderColor?: string;
}

export function BottomSheetModal({
  visible,
  onClose,
  children,
  minHeight = '40%',
  backgroundColor = Palette.primary,
  showCloseButton = false,
  closeButtonColor = Palette.ink,
  closeButtonBackgroundColor = Palette.surface,
  closeButtonBorderColor = Palette.border,
}: BottomSheetModalProps) {
  const slideAnim = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const [modalVisible, setModalVisible] = React.useState(visible);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      // Let the modal mount before starting the entrance animation
      requestAnimationFrame(() => {
        slideAnim.setValue(Dimensions.get('window').height);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          mass: 0.8,
          stiffness: 100,
        }).start();
      });
    } else if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 250,
        useNativeDriver: true,
      }).start(() => {
        setModalVisible(false);
      });
    }
  }, [visible, slideAnim]);

  return (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.container}>
        <Pressable style={styles.overlay} onPress={onClose} />
        <Animated.View
          style={[
            styles.bottomSheet,
            { minHeight, backgroundColor },
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          {/* Handle */}
          <View style={styles.handle} />

          {/* Sits in the handle row — the handle is 48pt wide and centred, so
              the two never collide, and the children start below both. */}
          {showCloseButton && (
            <Pressable
              onPress={onClose}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Close"
              style={({ pressed }) => [
                styles.closeButton,
                {
                  backgroundColor: closeButtonBackgroundColor,
                  borderColor: closeButtonBorderColor,
                },
                pressed && styles.closePressed,
              ]}
            >
              <X size={20} color={closeButtonColor} />
            </Pressable>
          )}

          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  bottomSheet: {
    // Fill comes from the `backgroundColor` prop so themed screens can override it.
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    maxHeight: '90%',
  },
  handle: {
    width: 48,
    height: 6,
    backgroundColor: Palette.border,
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    // 8 to clear the sheet's own top padding, plus 12 of breathing room.
    top: 20,
    right: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    borderWidth: 1,
    zIndex: 1,
  },
  closePressed: {
    opacity: 0.6,
  },
});
