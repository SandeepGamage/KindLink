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

export interface AssistanceRequest {
  _id: string;
  id?: string;
  taskType: TaskType;
  title: string;
  description: string;
  date: string;
  preferredTime: string;
  location: string;
  urgency: UrgencyLevel;
  status: AppointmentStatus;
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
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRequestInput {
  taskType: TaskType;
  title: string;
  description: string;
  preferredTime: string;
  location: string;
  urgency: UrgencyLevel;
}
