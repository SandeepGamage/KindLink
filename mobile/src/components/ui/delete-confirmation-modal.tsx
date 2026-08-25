import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { ActionModal } from './action-modal';

const COLORS = {
  Danger: '#EF5350',
};

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
      icon={<Trash2 color={COLORS.Danger} size={32} />}
      iconContainerClassName="bg-danger/10"
      confirmText="Delete"
      confirmButtonClassName="bg-danger"
    />
  );
}
