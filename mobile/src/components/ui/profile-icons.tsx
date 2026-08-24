import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { Palette } from '@/constants/theme';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

/**
 * Edit Pencil Icon
 */
export function PencilEditIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 4H4C3.44772 4 3 4.44772 3 5V20C3 20.5523 3.44772 21 4 21H19C19.5523 21 20 20.5523 20 20V13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18.5 2.50001C19.3284 1.67158 20.6716 1.67158 21.5 2.50001C22.3284 3.32844 22.3284 4.67157 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Security Padlock Icon (for non-editable email)
 */
export function LockBadgeIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="5"
        y="11"
        width="14"
        height="10"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8 11V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="12" cy="16" r="1.5" fill={color} />
    </Svg>
  );
}

/**
 * Care / Health Notes Document Icon
 */
export function CareHeartNotesIcon({ size = 22, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M14 2V8H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Heart inside document */}
      <Path
        d="M12 17.5L11.275 16.84C8.7 14.507 7 12.967 7 11.08C7 9.54 8.21 8.33 9.75 8.33C10.62 8.33 11.455 8.735 12 9.37C12.545 8.735 13.38 8.33 14.25 8.33C15.79 8.33 17 9.54 17 11.08C17 12.967 15.3 14.507 12.725 16.84L12 17.5Z"
        fill={color}
      />
    </Svg>
  );
}

/**
 * Emergency Phone Icon
 */
export function EmergencyPhoneIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 16.92V19.92C22.0011 20.1986 21.9441 20.4742 21.8325 20.7294C21.7209 20.9846 21.5573 21.2137 21.3521 21.4019C21.1468 21.5902 20.9046 21.7334 20.6407 21.8224C20.3769 21.9114 20.0974 21.9442 19.82 21.9189C16.7428 21.5841 13.787 20.5327 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.19 12.85C3.49997 10.2412 2.44824 7.27099 2.12 4.18C2.09503 3.90353 2.12747 3.62489 2.21527 3.36173C2.30307 3.09857 2.44426 2.85679 2.62998 2.65176C2.8157 2.44673 3.04183 2.28308 3.29392 2.17122C3.54602 2.05937 3.81845 2.00179 4.09 2.002H7.09C7.57383 1.99763 8.04353 2.16912 8.4116 2.48421C8.77967 2.7993 9.0221 3.23724 9.09 3.72C9.21703 4.68007 9.45208 5.62273 9.79 6.53C9.923 6.88374 9.9535 7.26909 9.878 7.64161C9.80249 8.01413 9.62417 8.35794 9.363 8.633L8.09 9.91C9.51355 12.4136 11.5864 14.4865 14.09 15.91L15.37 14.63C15.6449 14.3687 15.9886 14.1902 16.361 14.1146C16.7334 14.0389 17.1186 14.0693 17.472 14.202C18.3792 14.5399 19.3218 14.775 20.282 14.902C20.7699 14.9705 21.2124 15.2166 21.5284 15.5901C21.8444 15.9635 22.0135 16.4398 22.002 16.92H22Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Home Address Pin Icon
 */
export function HomePinIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="10"
        r="3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Person / User Outline Icon
 */
export function UserProfileIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="7"
        r="4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Camera Icon (for profile picture preview)
 */
export function CameraIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="12"
        cy="13"
        r="4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Clean Arrow / Chevron Right
 */
export function ChevronRightIcon({ size = 18, color = Palette.secondary, strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Green / Brand Checkmark Circle
 */
export function CheckCircleIcon({ size = 20, color = '#10B981', strokeWidth = 2.5 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth={strokeWidth} />
      <Path
        d="M8 12.5L10.5 15L16 9"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Mail / Email Outline Icon
 */
export function MailOutlineIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M3 7L12 13L21 7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Calendar / Birthday Icon for Age
 */
export function CalendarBirthdayIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="4"
        width="18"
        height="18"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path d="M16 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M8 2V6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M3 10H21" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </Svg>
  );
}

/**
 * Verified Shield Check Icon
 */
export function ShieldCheckIcon({ size = 20, color = Palette.secondary, strokeWidth = 2 }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M9 12l2 2 4-4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

