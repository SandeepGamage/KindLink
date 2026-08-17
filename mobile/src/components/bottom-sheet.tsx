import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from './themed-text';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  gradientColors?: readonly [string, string, ...string[]];
  backgroundColor?: string;
}

export function BottomSheet({ visible, onClose, children, title, gradientColors, backgroundColor }: BottomSheetProps) {
  const insets = useSafeAreaInsets();
  const theme = useTheme();

  const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const [showModal, setShowModal] = React.useState(visible);

  React.useEffect(() => {
    if (visible) {
      setShowModal(true);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          damping: 25,
          stiffness: 200,
        })
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowModal(false);
      });
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!showModal && !visible) return null;

  return (
    <Modal
      visible={showModal}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}>
      <View style={styles.modalContainer}>
        {/* Animated Background Overlay */}
        <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0, 0, 0, 0.4)', opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sliding Sheet */}
        <Animated.View
          style={[
            styles.sheet,
              { 
                backgroundColor: gradientColors ? 'transparent' : (backgroundColor || theme.background), 
                paddingBottom: Math.max(insets.bottom, Spacing.four),
                transform: [{ translateY: slideAnim }],
                overflow: 'hidden',
              },
            ]}>
            {gradientColors && (
              <LinearGradient
                colors={gradientColors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={styles.handleContainer}>
              <View style={[styles.dragHandle, { backgroundColor: gradientColors ? 'rgba(255,255,255,0.4)' : theme.textSecondary }]} />
            </View>
            
            {title && (
              <View style={[styles.header, gradientColors && { borderBottomColor: 'rgba(255,255,255,0.2)' }]}>
                <ThemedText type="subtitle" style={[styles.title, gradientColors && { color: '#FFFFFF' }]}>
                  {title}
                </ThemedText>
                <Pressable onPress={onClose} style={styles.closeButton} hitSlop={12}>
                  <Ionicons name="close" color={gradientColors ? '#FFFFFF' : theme.textSecondary} size={24} />
                </Pressable>
              </View>
            )}
            
            <View style={styles.content}>
              {children}
            </View>
          </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    minHeight: '30%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: Spacing.one,
  },
  content: {
    padding: Spacing.four,
  },
});
