import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Palette } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * KindLink Brand Logo Icon — Blue squircle with a solid white heart
 */
export function KindLinkLogo({ size = 80 }: { size?: number }) {
  const heartSize = Math.round(size * 0.45);
  return (
    <View
      style={[
        styles.logoSquircle,
        {
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.26),
        },
      ]}>
      <Svg width={heartSize} height={heartSize} viewBox="0 0 24 24" fill={Palette.primary}>
        <Path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
      </Svg>
    </View>
  );
}

/**
 * Step 1 Illustration Icon — Helpers / Volunteers (matches the mockup's two-person helper icon)
 */
export function HelpersIllustration({ size = 84, color = Palette.secondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Primary Person Head */}
      <Circle
        cx="28"
        cy="20"
        r="7.5"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Primary Person Shoulders */}
      <Path
        d="M15 45C15 36 21 33 28 33C35 33 41 36 41 45"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Companion Head Arc */}
      <Path
        d="M41 15.5C44.5 16.2 47 19 47 22.5C47 24.5 46 26.2 44.5 27.2"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Companion Shoulder Arc */}
      <Path
        d="M45 35C48 37 50.5 40.5 50.5 45"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Step 2 Illustration Icon — Calendar (matches mockup's calendar body with top loops and line)
 */
export function CalendarIllustration({ size = 84, color = Palette.secondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Calendar Outer Rounded Box */}
      <Rect
        x="13"
        y="17"
        width="38"
        height="35"
        rx="7"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Top Horizontal Divider */}
      <Path
        d="M13 28H51"
        stroke={color}
        strokeWidth="4"
        strokeLinecap="round"
      />
      {/* Left Hanging Ring */}
      <Path
        d="M23 11V17"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
      {/* Right Hanging Ring */}
      <Path
        d="M41 11V17"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Step 3 Illustration Icon — Shield (matches mockup's clean curved security shield)
 */
export function ShieldIllustration({ size = 84, color = Palette.secondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      {/* Shield Outline Body */}
      <Path
        d="M32 13L17 19.5V31.5C17 43 23.5 51 32 54.5C40.5 51 47 43 47 31.5V19.5L32 13Z"
        stroke={color}
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Role 1 Icon: Elderly member (Heart badge)
 */
export function RoleElderlyIcon({ size = 22, color = Palette.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Role 2 Icon: Volunteer (People/Helper badge)
 */
export function RoleVolunteerIcon({ size = 22, color = Palette.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="9"
        cy="7"
        r="3.5"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Path
        d="M3 19C3 15.5 5.8 13 9 13C12.2 13 15 15.5 15 19"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <Path
        d="M15.5 4.5C16.8 5 17.8 6.2 17.8 7.8C17.8 9.2 17 10.3 15.8 10.8"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M17.5 15C19 15.8 20.2 17.2 20.5 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Role 3 Icon: Admin (Shield badge)
 */
export function RoleAdminIcon({ size = 22, color = Palette.primary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.5C12 21.5 19.5 18 19.5 11.5V5.5L12 2.5L4.5 5.5V11.5C4.5 18 12 21.5 12 21.5Z"
        stroke={color}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Document upload icon (used in Volunteer Signup ID document box)
 */
export function DocumentUploadIcon({ size = 32, color = Palette.secondary }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2V8H20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 13H16"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M8 17H13"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

const styles = StyleSheet.create({
  logoSquircle: {
    backgroundColor: Palette.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Palette.secondary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
});
