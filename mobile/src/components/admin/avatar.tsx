import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Palette, FunctionalColors } from '@/constants/theme';
import { resolveMediaUrl } from '@/services/api-config';

/** Up to two uppercase initials from a full name. */
export function getInitials(name?: string | null): string {
  if (!name) return 'A';
  return name
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

interface AvatarProps {
  name?: string | null;
  /** Diameter in px. Text scales with it. */
  size?: number;
  /** Muted styling for deactivated users. */
  dimmed?: boolean;
  /**
   * Photo to show instead of initials. Falls back to initials if it fails to
   * load. Accepts the raw stored value — a server path like
   * `/uploads/avatars/x.jpg` is resolved to a full URL here, so call sites can
   * pass `user.profileImage` straight through.
   */
  uri?: string | null;
  style?: StyleProp<ViewStyle>;
}

export function Avatar({ name, size = 44, dimmed, uri, style }: AvatarProps) {
  const [failed, setFailed] = useState(false);
  const resolvedUri = resolveMediaUrl(uri);

  // A newly picked photo must get its own chance to load, even if the previous one broke.
  useEffect(() => {
    setFailed(false);
  }, [resolvedUri]);

  const showImage = !!resolvedUri && !failed;

  return (
    <View
      style={[
        styles.container,
        { width: size, height: size, borderRadius: size / 2 },
        dimmed && styles.dimmed,
        style,
      ]}
    >
      {showImage ? (
        <Image
          source={{ uri: resolvedUri }}
          style={{ width: size, height: size, borderRadius: size / 2 }}
          contentFit="cover"
          onError={() => setFailed(true)}
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text style={[styles.text, { fontSize: size * 0.36 }, dimmed && styles.textDimmed]}>
          {getInitials(name)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Palette.blueTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dimmed: {
    backgroundColor: Palette.border,
  },
  text: {
    color: Palette.secondary,
    fontWeight: 'bold',
  },
  textDimmed: {
    color: FunctionalColors.textMuted,
  },
});
