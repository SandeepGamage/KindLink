import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { Palette, FunctionalColors } from '@/constants/theme';
import type { DocumentPickerState } from '@/hooks/use-document-picker';
import { DocumentUploadIcon } from '@/components/ui/onboarding-icons';
import { CheckCircleIcon } from '@/components/ui/profile-icons';

interface Props {
  document: DocumentPickerState;
  disabled?: boolean;
}

export function IdDocumentField({ document, disabled }: Props) {
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const busy = disabled || document.busy;
  const hasDocument = !!document.uri;

  return (
    <View style={styles.container}>
      {hasDocument ? (
        /* Selected State: Rich Preview Card */
        <View style={styles.cardContainer}>
          <View style={styles.cardHeader}>
            <View style={styles.statusBadge}>
              <CheckCircleIcon size={18} color="#10B981" />
              <Text style={styles.statusBadgeText}>NIC Document Attached</Text>
            </View>
            <Pressable
              onPress={() => setIsPreviewModalVisible(true)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Preview attached NIC document in full view"
              style={({ pressed }) => [styles.inspectBadge, pressed && styles.pressed]}>
              <Text style={styles.inspectBadgeText}>🔍 View Card</Text>
            </Pressable>
          </View>

          {/* Thumbnail preview with natural 16:10 card aspect ratio */}
          <Pressable
            onPress={() => setIsPreviewModalVisible(true)}
            accessibilityRole="imagebutton"
            accessibilityLabel="Tap to enlarge NIC image"
            style={({ pressed }) => [styles.imageWrap, pressed && styles.imageWrapPressed]}>
            <Image
              source={{ uri: document.uri }}
              style={styles.thumbnail}
              contentFit="contain"
              transition={200}
            />
            <View style={styles.tapToZoomHint}>
              <Text style={styles.tapToZoomText}>Tap to inspect card details</Text>
            </View>
          </Pressable>

          {/* Document details & actions */}
          <View style={styles.fileDetailsRow}>
            <Text style={styles.fileNameText} numberOfLines={1} ellipsizeMode="middle">
              {document.fileName || 'National_Identity_Card.jpg'}
            </Text>
          </View>

          {/* Change & Remove Buttons */}
          <View style={styles.actionsRow}>
            {Platform.OS !== 'web' && (
              <DocButton
                label="Retake Photo"
                disabled={busy}
                onPress={document.takePhoto}
                variant="secondary"
              />
            )}
            <DocButton
              label="Choose Library"
              disabled={busy}
              onPress={document.chooseFromLibrary}
              variant="secondary"
            />
            <DocButton
              label="Remove"
              disabled={busy}
              onPress={document.removeDocument}
              variant="danger"
            />
          </View>
        </View>
      ) : (
        /* Empty State: Clean Interactive Dashed Box */
        <View style={styles.emptyContainer}>
          <View style={styles.iconCircle}>
            <DocumentUploadIcon size={36} color={Palette.secondary} />
          </View>
          <Text style={styles.emptyTitle}>Upload National ID / Verification Card</Text>
          <Text style={styles.emptySubtitle}>
            Capture or select a clear, readable photo of your NIC, driving licence, or student card.
          </Text>

          <View style={styles.actionsRow}>
            {Platform.OS !== 'web' && (
              <DocButton
                label="📷 Take Photo"
                disabled={busy}
                onPress={document.takePhoto}
                variant="primary"
              />
            )}
            <DocButton
              label="🖼️ Choose from Gallery"
              disabled={busy}
              onPress={document.chooseFromLibrary}
              variant={Platform.OS === 'web' ? 'primary' : 'secondary'}
            />
          </View>
        </View>
      )}

      {/* Busy Spinner */}
      {document.busy && (
        <View style={styles.busyRow}>
          <ActivityIndicator color={Palette.secondary} size="small" />
          <Text style={styles.busyText}>Optimizing and securing document...</Text>
        </View>
      )}

      {/* Error Message & Settings */}
      {!!document.error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText} accessibilityRole="alert">
            ⚠️ {document.error}
          </Text>
          {document.canOpenSettings && (
            <Pressable
              onPress={document.openSettings}
              style={styles.settingsBtn}
              accessibilityRole="button">
              <Text style={styles.settingsBtnText}>Open Settings</Text>
            </Pressable>
          )}
        </View>
      )}

      {/* Full-Screen Document Inspection Modal */}
      <Modal
        visible={isPreviewModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsPreviewModalVisible(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Verification Document</Text>
                <Text style={styles.modalSub}>Verify that text and details are legible</Text>
              </View>
              <Pressable
                onPress={() => setIsPreviewModalVisible(false)}
                hitSlop={12}
                style={styles.modalCloseBtn}
                accessibilityRole="button"
                accessibilityLabel="Close document preview">
                <Text style={styles.modalCloseText}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.modalImageContainer}>
              {document.uri ? (
                <Image
                  source={{ uri: document.uri }}
                  style={styles.modalImage}
                  contentFit="contain"
                />
              ) : null}
            </View>

            <View style={styles.modalFooter}>
              <Pressable
                onPress={() => setIsPreviewModalVisible(false)}
                style={styles.modalConfirmBtn}
                accessibilityRole="button">
                <Text style={styles.modalConfirmBtnText}>Done</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DocButton({
  label,
  disabled,
  onPress,
  variant = 'secondary',
}: {
  label: string;
  disabled?: boolean;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.button,
        variant === 'primary' && styles.buttonPrimary,
        variant === 'secondary' && styles.buttonSecondary,
        variant === 'danger' && styles.buttonDanger,
        (pressed || disabled) && styles.buttonDisabled,
      ]}>
      <Text
        style={[
          styles.buttonText,
          variant === 'primary' && styles.buttonTextPrimary,
          variant === 'secondary' && styles.buttonTextSecondary,
          variant === 'danger' && styles.buttonTextDanger,
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 4,
  },
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#D1E3F8',
    padding: 16,
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#065F46',
  },
  inspectBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: Palette.blueTint,
    borderRadius: 8,
  },
  inspectBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.secondary,
  },
  imageWrap: {
    width: '100%',
    height: 180,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageWrapPressed: {
    opacity: 0.85,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  tapToZoomHint: {
    position: 'absolute',
    bottom: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tapToZoomText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  fileDetailsRow: {
    marginTop: 10,
    marginBottom: 8,
    alignItems: 'center',
  },
  fileNameText: {
    fontSize: 13,
    color: FunctionalColors.textSecondary,
    fontWeight: '500',
  },
  emptyContainer: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: Palette.secondary,
    borderRadius: 16,
    backgroundColor: '#F0F6FE',
    padding: 20,
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.secondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: FunctionalColors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
    maxWidth: 340,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  button: {
    minHeight: 44,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: Palette.secondary,
  },
  buttonSecondary: {
    backgroundColor: Palette.blueTint,
  },
  buttonDanger: {
    backgroundColor: '#FEE2E2',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  buttonTextPrimary: {
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    color: Palette.secondary,
  },
  buttonTextDanger: {
    color: FunctionalColors.danger,
  },
  busyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 10,
  },
  busyText: {
    fontSize: 13,
    color: Palette.secondary,
    fontWeight: '500',
  },
  errorContainer: {
    marginTop: 8,
    alignItems: 'center',
    gap: 6,
  },
  errorText: {
    fontSize: 13,
    color: FunctionalColors.danger,
    textAlign: 'center',
  },
  settingsBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: Palette.blueTint,
    borderRadius: 6,
  },
  settingsBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.secondary,
  },
  pressed: {
    opacity: 0.7,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: FunctionalColors.textPrimary,
  },
  modalSub: {
    fontSize: 13,
    color: FunctionalColors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#64748B',
  },
  modalImageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#0F172A',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalFooter: {
    marginTop: 16,
  },
  modalConfirmBtn: {
    backgroundColor: Palette.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
