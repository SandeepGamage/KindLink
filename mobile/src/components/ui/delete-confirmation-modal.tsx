import React from 'react';
import { StyleSheet } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { ActionModal } from './action-modal';
import { MonoIcon } from '@/components/admin/icon-circle';
import { FunctionalColors } from '@/constants/theme';

interface DeleteConfirmationModalProps {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  title?: string;
  subtitle?: string;
  /** Admin icon treatment — black icon on a white, grey-bordered circle. */
  monochromeIcon?: boolean;
  /** True while the delete request is in flight; see ActionModal. */
  loading?: boolean;
}

export function DeleteConfirmationModal({
  visible,
  onCancel,
  onConfirm,
  title = 'Are you sure?',
  subtitle = 'This action cannot be undone',
  monochromeIcon,
  loading,
}: DeleteConfirmationModalProps) {
  return (
    <ActionModal
      visible={visible}
      onCancel={onCancel}
      onConfirm={onConfirm}
      title={title}
      subtitle={subtitle}
      icon={
        <Trash2 color={monochromeIcon ? MonoIcon.color : FunctionalColors.danger} size={32} />
      }
      iconContainerStyle={monochromeIcon ? MonoIcon.circle : styles.iconContainer}
      confirmText="Delete"
      confirmButtonStyle={styles.confirmButton}
      loading={loading}
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
