import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor, Palette } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFontSize } from '@/context/font-size-context';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
  allowScaling?: boolean;
};

export function ThemedText({ style, type = 'default', themeColor, allowScaling = true, ...rest }: ThemedTextProps) {
  const theme = useTheme();
  const { fontScale, scaleFont, scaleLineHeight } = useFontSize();

  const baseStyle = [
    { color: theme[themeColor ?? 'text'] },
    type === 'default' && styles.default,
    type === 'title' && styles.title,
    type === 'small' && styles.small,
    type === 'smallBold' && styles.smallBold,
    type === 'subtitle' && styles.subtitle,
    type === 'link' && styles.link,
    type === 'linkPrimary' && styles.linkPrimary,
    type === 'code' && styles.code,
    style,
  ];

  if (!allowScaling || fontScale === 1.0) {
    return <Text style={baseStyle} {...rest} />;
  }

  const flattened = StyleSheet.flatten<TextStyle>(baseStyle);
  if (!flattened) {
    return <Text style={baseStyle} {...rest} />;
  }

  const scaledStyle: TextStyle = { ...flattened };
  if (typeof flattened.fontSize === 'number') {
    scaledStyle.fontSize = scaleFont(flattened.fontSize);
  }
  if (typeof flattened.lineHeight === 'number') {
    scaledStyle.lineHeight = scaleLineHeight(flattened.lineHeight);
  }

  return <Text style={scaledStyle} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 44,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: Palette.secondary,
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
