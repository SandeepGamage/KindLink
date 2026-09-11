export type TaskType =
  | 'Grocery Shopping'
  | 'Medical Transport'
  | 'Companionship'
  | 'Housekeeping & Repairs'
  | 'Tech Support'
  | 'Meal Preparation'
  | 'Pet Care'
  | 'Gardening & Yard'
  | 'Bill Payment & Errands'
  | 'Mobility & Walking'
  | 'Other';

export type UrgencyLevel = 'Normal' | 'Urgent' | 'Low';

export type AppointmentStatus = 'pending' | 'accepted' | 'completed' | 'cancelled';

export const CANCELLATION_REASONS = [
  'Schedule conflict / Need to reschedule',
  'Health or medical situation changed',
  'Found alternative help / Family assisted',
  'No longer need this assistance',
  'Volunteer unavailable or unresponsive',
  'Weather or transportation issue',
  'Personal emergency',
  'Other reason',
] as const;

export type CancellationReason = (typeof CANCELLATION_REASONS)[number];

export interface CancelAppointmentInput {
  reason: CancellationReason;
  note?: string;
}

export interface AssistanceRequest {
  _id: string;
  id?: string;
  taskType: TaskType;
  title: string;
  description: string;
  date: string;
  preferredTime: string;
  location: string;
  contactNumber?: string;
  urgency: UrgencyLevel;
  status: AppointmentStatus;
  cancellationReason?: string;
  cancellationNote?: string;
  cancelledAt?: string;
  cancelledBy?: {
    _id?: string;
    name?: string;
    email?: string;
  } | string | null;
  requester?: {
    _id?: string;
    name?: string;
    email?: string;
    profileImage?: string;
  } | null;
  provider?: {
    _id?: string;
    name?: string;
    email?: string;
    profileImage?: string;
  } | null;
  assignedVolunteerName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Volunteer {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
  profileImage?: string;
  bio?: string;
  availability?: string[];
  role?: string;
  rating?: number;
}

export interface CreateRequestInput {
  taskType: TaskType;
  title: string;
  description: string;
  date?: string;
  preferredTime: string;
  location: string;
  contactNumber?: string;
  urgency: UrgencyLevel;
  provider?: string | null;
}
