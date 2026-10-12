import React from 'react';
import {
  Text as RNText,
  type TextProps as RNTextProps,
  type TextStyle,
  StyleSheet,
} from 'react-native';
import { useFontSize } from '@/context/font-size-context';

export interface AppTextProps extends RNTextProps {
  allowScaling?: boolean;
}

/**
 * Universal auto-scaling Text component for the KindLink application.
 * When an elderly user selects a larger font scale (Large +20% or Extra Large +35%),
 * this component automatically scales both fontSize and lineHeight proportionally,
 * ensuring complete visual accessibility while preserving formatting and colors.
 */
export function AppText({ style, allowScaling = true, ...props }: AppTextProps) {
  const { fontScale, scaleFont, scaleLineHeight } = useFontSize();

  if (!allowScaling || fontScale === 1.0) {
    return <RNText style={style} {...props} />;
  }

  const flattened = StyleSheet.flatten<TextStyle>(style);
  if (!flattened) {
    return <RNText style={style} {...props} />;
  }

  const scaledStyle: TextStyle = { ...flattened };

  if (typeof flattened.fontSize === 'number') {
    scaledStyle.fontSize = scaleFont(flattened.fontSize);
  }

  if (typeof flattened.lineHeight === 'number') {
    scaledStyle.lineHeight = scaleLineHeight(flattened.lineHeight);
  }

  return <RNText style={scaledStyle} {...props} />;
}

export const Text = AppText;
export default AppText;
