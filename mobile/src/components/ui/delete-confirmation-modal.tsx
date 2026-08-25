import React from 'react';
import { View, Text, Pressable, Modal, StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { ActionModal } from './action-modal';
import { FunctionalColors } from '@/constants/theme';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
}

export function DeleteConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  subtitle = 'This action cannot be undone',
}: DeleteConfirmationModalProps) {
  return (
    <ActionModal
      visible={visible}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
      subtitle={subtitle}
      icon={<Trash2 color={FunctionalColors.danger} size={32} />}
      iconContainerStyle={styles.iconContainer}
      confirmText="Delete"
      confirmButtonStyle={styles.confirmButton}
    />
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    backgroundColor: '#FDEAEA', // bg-danger/10 equivalent roughly
  },
  confirmButton: {
    backgroundColor: FunctionalColors.danger,
  },
});
