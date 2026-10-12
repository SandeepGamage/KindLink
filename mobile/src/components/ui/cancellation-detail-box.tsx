import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export interface CancellationDetailBoxProps {
  reason?: string | null;
  note?: string | null;
  label?: string;
  defaultReason?: string;
  iconSize?: number;
  style?: StyleProp<ViewStyle>;
}

export function CancellationDetailBox({
  reason,
  note,
  label = 'Reason:',
  defaultReason = 'Not specified',
  iconSize = 14,
  style,
}: CancellationDetailBoxProps) {
  const displayReason = reason || defaultReason;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Ionicons name="information-circle" size={iconSize} color="#DC2626" />
        <Text style={styles.reasonTitle}>
          {label} {displayReason}
        </Text>
      </View>
      {note ? (
        <Text style={styles.noteText}>
          "{note}"
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FEE2E2',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    marginBottom: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reasonTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#DC2626',
    flex: 1,
  },
  noteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#991B1B',
    marginTop: 4,
    paddingLeft: 20,
  },
});
