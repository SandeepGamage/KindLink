import {
  Car,
  Footprints,
  HeartHandshake,
  HelpCircle,
  Home,
  Monitor,
  PawPrint,
  Receipt,
  ShoppingBag,
  Sprout,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react-native';

import { FunctionalColors, Palette } from '@/constants/theme';
import { TaskType, UrgencyLevel } from '@/types/appointment';

/** Shared category/urgency presentation for assistance request screens */
export const CATEGORY_CHIPS: Array<'All' | TaskType> = [
  'All',
  'Grocery Shopping',
  'Medical Transport',
  'Companionship',
  'Housekeeping & Repairs',
  'Tech Support',
  'Meal Preparation',
  'Pet Care',
  'Gardening & Yard',
  'Bill Payment & Errands',
  'Mobility & Walking',
  'Other',
];

export const URGENCY_CHIPS: Array<'All' | UrgencyLevel> = ['All', 'Urgent', 'Normal', 'Low'];

export const CATEGORY_META: Record<TaskType, { icon: LucideIcon; bg: string; color: string }> = {
  'Grocery Shopping': { icon: ShoppingBag, bg: FunctionalColors.successBg, color: FunctionalColors.successText },
  'Medical Transport': { icon: Car, bg: Palette.blueTint, color: Palette.secondary },
  'Companionship': { icon: HeartHandshake, bg: Palette.blueTint, color: Palette.secondary },
  'Housekeeping & Repairs': { icon: Home, bg: FunctionalColors.warningBg, color: FunctionalColors.warningText },
  'Tech Support': { icon: Monitor, bg: FunctionalColors.infoBg, color: FunctionalColors.infoText },
  'Meal Preparation': { icon: UtensilsCrossed, bg: FunctionalColors.successBg, color: FunctionalColors.successText },
  'Pet Care': { icon: PawPrint, bg: Palette.blueTint, color: Palette.secondary },
  'Gardening & Yard': { icon: Sprout, bg: FunctionalColors.successBg, color: FunctionalColors.successText },
  'Bill Payment & Errands': { icon: Receipt, bg: FunctionalColors.warningBg, color: FunctionalColors.warningText },
  'Mobility & Walking': { icon: Footprints, bg: FunctionalColors.infoBg, color: FunctionalColors.infoText },
  'Other': { icon: HelpCircle, bg: FunctionalColors.accentLight, color: FunctionalColors.accentDark },
};

export const URGENCY_META: Record<UrgencyLevel, { bg: string; color: string }> = {
  Urgent: { bg: FunctionalColors.dangerBg, color: FunctionalColors.dangerText },
  Normal: { bg: FunctionalColors.warningBg, color: FunctionalColors.warningText },
  Low: { bg: FunctionalColors.infoBg, color: FunctionalColors.infoText },
};

export function formatRequestWhen(date: string, preferredTime: string): string {
  const datePart = new Date(date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
  return `${datePart} · ${preferredTime}`;
}
