import React from 'react';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { FunctionalColors } from '@/constants/theme';

export interface NavIconProps {
  size?: number;
  color?: string;
  focused?: boolean;
  strokeWidth?: number;
}

// ---------------------------------------------------------------------------
// CLIENT NAVIGATION ICONS (Volunteer & Elderly)
// ---------------------------------------------------------------------------

/**
 * Home Icon — Clean modern house with filled and outline states
 */
export function HomeIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14H9V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
          fill={color}
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 10.5L12 3L21 10.5V20C21 20.5523 20.5523 21 20 21H15V14.5C15 14.2239 14.7761 14 14.5 14H9.5C9.22386 14 9 14.2239 9 14.5V21H4C3.44772 21 3 20.5523 3 20V10.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Requests Icon — Clipboard / Task list with checkmark
 */
export function RequestsIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="16" height="17" rx="3" fill={color} opacity={0.15} />
        <Rect x="4" y="4" width="16" height="17" rx="3" stroke={color} strokeWidth="2" />
        <Path d="M9 2H15V4.5C15 4.77614 14.7761 5 14.5 5H9.5C9.22386 5 9 4.77614 9 4.5V2Z" fill={color} stroke={color} strokeWidth="1.5" />
        <Path d="M8 11.5L10.5 14L16 8.5" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="4" y="4" width="16" height="17" rx="3" stroke={color} strokeWidth="2" />
      <Path d="M9 2H15V4.5C15 4.77614 14.7761 5 14.5 5H9.5C9.22386 5 9 4.77614 9 4.5V2Z" stroke={color} strokeWidth="1.8" />
      <Path d="M8 11.5L10.5 14L16 8.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

/**
 * Messages Icon — Chat bubble with smooth rounded corners & speech tail
 */
export function MessagesIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M20 12C20 16.4183 16.4183 20 12 20C10.4284 20 8.95663 19.5469 7.71261 18.7629L3.5 20.5L5.23714 16.2874C4.45307 15.0434 4 13.5716 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
          fill={color}
        />
        <Circle cx="8.5" cy="12" r="1.25" fill="#FFFFFF" />
        <Circle cx="12" cy="12" r="1.25" fill="#FFFFFF" />
        <Circle cx="15.5" cy="12" r="1.25" fill="#FFFFFF" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 12C20 16.4183 16.4183 20 12 20C10.4284 20 8.95663 19.5469 7.71261 18.7629L3.5 20.5L5.23714 16.2874C4.45307 15.0434 4 13.5716 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx="8.5" cy="12" r="1" fill={color} />
      <Circle cx="12" cy="12" r="1" fill={color} />
      <Circle cx="15.5" cy="12" r="1" fill={color} />
    </Svg>
  );
}

/**
 * Notifications Icon — Bell with clapper
 */
export function NotificationsIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22C13.6569 22 15 20.6569 15 19H9C9 20.6569 10.3431 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
          fill={color}
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 19C10 20.1046 10.8954 21 12 21C13.1046 21 14 20.1046 14 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Profile Icon — User avatar outline and filled
 */
export function ProfileIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="7" r="4.5" fill={color} />
        <Path
          d="M4 20.5C4 16.5 7.5 14 12 14C16.5 14 20 16.5 20 20.5"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="7" r="4.5" stroke={color} strokeWidth="2" />
      <Path
        d="M4 20.5C4 16.9 7.5 14.5 12 14.5C16.5 14.5 20 16.9 20 20.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// ADMIN NAVIGATION ICONS
// ---------------------------------------------------------------------------

/**
 * Overview / Dashboard Icon — 4 squares grid
 */
export function OverviewIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="3" width="8" height="8" rx="2" fill={color} />
        <Rect x="13" y="3" width="8" height="8" rx="2" fill={color} />
        <Rect x="3" y="13" width="8" height="8" rx="2" fill={color} />
        <Rect x="13" y="13" width="8" height="8" rx="2" fill={color} opacity={0.6} />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="13" y="3" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="3" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
      <Rect x="13" y="13" width="8" height="8" rx="2" stroke={color} strokeWidth="2" />
    </Svg>
  );
}

/**
 * Approvals Icon — Shield badge with verification checkmark
 */
export function ApprovalsIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 21.5C12 21.5 19.5 18 19.5 11.5V5.5L12 2.5L4.5 5.5V11.5C4.5 18 12 21.5 12 21.5Z"
          fill={color}
        />
        <Path
          d="M8.5 11.5L11 14L15.5 9"
          stroke="#FFFFFF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 21.5C12 21.5 19.5 18 19.5 11.5V5.5L12 2.5L4.5 5.5V11.5C4.5 18 12 21.5 12 21.5Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M8.5 11.5L11 14L15.5 9"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

/**
 * Users Icon — Multi-user group silhouette
 */
export function UsersIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="9" cy="8" r="4" fill={color} />
        <Path
          d="M2 20C2 16.5 5 14.5 9 14.5C13 14.5 16 16.5 16 20"
          stroke={color}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Path
          d="M16 6.5C17.38 6.5 18.5 7.62 18.5 9C18.5 10.38 17.38 11.5 16 11.5"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
        <Path
          d="M18.5 15C20.5 15.5 22 17 22 19"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="9" cy="8" r="4" stroke={color} strokeWidth="2" />
      <Path
        d="M2 20C2 16.8 5 14.5 9 14.5C13 14.5 16 16.8 16 20"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M16 6.5C17.38 6.5 18.5 7.62 18.5 9C18.5 10.38 17.38 11.5 16 11.5"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Path
        d="M18.5 15C20.5 15.5 22 17 22 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </Svg>
  );
}

/**
 * Alerts / System Logs Icon — Bell pulse or alert signal
 */
export function AlertsIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path
          d="M12 22C13.6569 22 15 20.6569 15 19H9C9 20.6569 10.3431 22 12 22ZM18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
          fill={color}
        />
        <Circle cx="18.5" cy="5.5" r="3.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M18 16V11C18 7.93 16.36 5.36 13.5 4.68V4C13.5 3.17 12.83 2.5 12 2.5C11.17 2.5 10.5 3.17 10.5 4V4.68C7.63 5.36 6 7.92 6 11V16L4 18V19H20V18L18 16Z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M10 19C10 20.1046 10.8954 21 12 21C13.1046 21 14 20.1046 14 19"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="18.5" cy="5.5" r="3" fill="#EF4444" />
    </Svg>
  );
}

/**
 * Settings Icon — Gear cog
 */
export function SettingsIcon({ size = 24, color = FunctionalColors.textSecondary, focused = false }: NavIconProps) {
  if (focused) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="3" fill={color} />
        <Path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          fill={color}
          opacity={0.3}
        />
        <Path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
      <Path
        d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
