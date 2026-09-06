import React, { useEffect, useRef } from 'react';
import { View, Modal, Pressable, Animated, Dimensions, StyleSheet, DimensionValue } from 'react-native';
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
}

export function BottomSheetModal({
  visible,
  onClose,
  children,
  minHeight = '40%',
  backgroundColor = Palette.primary,
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
});
