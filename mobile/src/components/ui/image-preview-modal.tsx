import React from 'react';
import { View, Text, Modal, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { X, ImageOff } from 'lucide-react-native';
import { resolveMediaUrl } from '@/services/api-config';
import { Palette, FunctionalColors } from '@/constants/theme';

interface ImagePreviewModalProps {
  visible: boolean;
  /** Raw stored value — server paths are resolved to full URLs here. */
  uri?: string | null;
  /** Optional caption under the image, e.g. the file name. */
  title?: string;
  onClose: () => void;
}

/**
 * Full-screen image viewer on a dark scrim. Used for the ID document on the
 * volunteer approvals sheet; generic enough for any tap-to-expand thumbnail.
 *
 * Presented from inside another modal (the details bottom sheet), which React
 * Native supports on both platforms.
 */
export function ImagePreviewModal({ visible, uri, title, onClose }: ImagePreviewModalProps) {
  const insets = useSafeAreaInsets();
  const resolvedUri = resolveMediaUrl(uri);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <Pressable
          style={[styles.closeButton, { top: insets.top + 12 }]}
          onPress={onClose}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Close preview"
        >
          <X size={24} color={Palette.primary} />
        </Pressable>

        <Pressable style={styles.imageArea} onPress={onClose}>
          {resolvedUri ? (
            <Image
              source={{ uri: resolvedUri }}
              style={styles.image}
              contentFit="contain"
              transition={150}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View style={styles.placeholder}>
              <ImageOff size={40} color={FunctionalColors.textMuted} />
              <Text style={styles.placeholderText}>No document uploaded</Text>
            </View>
          )}
        </Pressable>

        {!!title && (
          <Text style={[styles.caption, { paddingBottom: insets.bottom + 24 }]} numberOfLines={2}>
            {title}
          </Text>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    zIndex: 2,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
  },
  imageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    alignItems: 'center',
    gap: 12,
  },
  placeholderText: {
    color: FunctionalColors.textMuted,
    fontSize: 15,
  },
  caption: {
    color: Palette.primary,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});
