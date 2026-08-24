import React from 'react';
import Svg, { Path, Polygon, Circle } from 'react-native-svg';
import { Palette } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  fill?: string;
  strokeWidth?: number;
}

interface StarProps extends IconProps {
  filled?: boolean;
}

/**
 * Star Icon for 1-5 Rating Selection
 */
export function StarRatingIcon({
  size = 28,
  filled = false,
  color = '#F59E0B',
  fill,
  strokeWidth = 1.5,
}: StarProps) {
  const fillColor = fill || (filled ? color : 'none');
  const strokeColor = filled ? color : '#94A3B8';

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Polygon
        points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Back Chevron Icon for Navigation
 */
export function BackArrowIcon({
  size = 24,
  color = Palette.secondary,
  strokeWidth = 2.2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 19L8 12L15 5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Sparkles Icon for high ratings
 */
export function SparklesRatingIcon({
  size = 20,
  color = '#F59E0B',
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2L13.8 7.2L19 9L13.8 10.8L12 16L10.2 10.8L5 9L10.2 7.2L12 2Z"
        fill={color}
      />
      <Path
        d="M19 15L19.9 17.1L22 18L19.9 18.9L19 21L18.1 18.9L16 18L18.1 17.1L19 15Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Review Feedback Message Icon
 */
export function MessageReviewIcon({
  size = 20,
  color = Palette.secondary,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Heart & Hands Appreciation Icon
 */
export function HeartAppreciationIcon({
  size = 22,
  color = Palette.accent,
  strokeWidth = 2,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Verified Check Badge Icon for Success State
 */
export function SuccessBadgeIcon({
  size = 56,
  color = '#10B981',
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" fill={color} opacity={0.15} />
      <Circle cx="12" cy="12" r="8" fill={color} />
      <Path
        d="M8.5 12.5L10.8 14.8L15.5 9.5"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
