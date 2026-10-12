import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Palette, FunctionalColors } from '@/constants/theme';
import { CheckCircleIcon } from '@/components/ui/profile-icons';

interface ToastOptions {
  type?: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const { width } = Dimensions.get('window');

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('success');
  const [isVisible, setIsVisible] = useState(false);
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const insets = useSafeAreaInsets();

  const hideToast = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsVisible(false);
      setToastMessage('');
    });
  }, [translateY, opacity]);

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setToastMessage(message);
      setToastType(options?.type || 'success');
      setIsVisible(true);

      Animated.parallel([
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 15,
          stiffness: 100,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, options?.duration || 3000);
    },
    [translateY, opacity, hideToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {isVisible && (
        <Animated.View
          style={[
            styles.toastContainer,
            {
              top: Math.max(insets.top + 12, 24),
              transform: [{ translateY }],
              opacity,
            },
          ]}>
          <View
            style={[
              styles.toastContent,
              toastType === 'success' && styles.successContent,
              toastType === 'error' && styles.errorContent,
              toastType === 'info' && styles.infoContent,
            ]}>
            {toastType === 'success' && <CheckCircleIcon size={24} color="#FFFFFF" />}
            {toastType === 'error' && <Text style={styles.iconText}>⚠️</Text>}
            {toastType === 'info' && <Text style={styles.iconText}>ℹ️</Text>}
            
            <Text
              style={[
                styles.messageText,
                toastType === 'success' && { color: '#FFFFFF' },
              ]}>
              {toastMessage}
            </Text>
          </View>
        </Animated.View>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  toastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 24,
    minWidth: Math.min(width - 40, 400),
    gap: 12,
  },
  successContent: {
    backgroundColor: '#10B981', // Solid success green
  },
  errorContent: {
    backgroundColor: FunctionalColors.danger,
  },
  infoContent: {
    backgroundColor: Palette.secondary,
  },
  iconText: {
    fontSize: 20,
  },
  messageText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
});
