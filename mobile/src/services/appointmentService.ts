import { ApiClient } from './apiClient';
import { AssistanceRequest, CreateRequestInput } from '@/types/appointment';

// In-memory request store for offline execution fallback
let localStore: AssistanceRequest[] = [];

export const appointmentService = {
  /**
   * Fetch assistance requests with optional status filter
   */
  async getAppointments(statusFilter?: string): Promise<AssistanceRequest[]> {
    const endpoint = statusFilter ? `/appointments?status=${statusFilter}` : '/appointments';
    const remoteData = await ApiClient.get<AssistanceRequest[]>(endpoint);

    if (remoteData && Array.isArray(remoteData)) {
      return remoteData;
    }

    // Local fallback logic
    return statusFilter
      ? localStore.filter(req => req.status === statusFilter)
      : localStore;
  },

  /**
   * Create a new assistance request
   */
  async createAppointment(input: CreateRequestInput): Promise<AssistanceRequest> {
    const remoteData = await ApiClient.post<AssistanceRequest>('/appointments', input);

    if (remoteData) {
      localStore = [remoteData, ...localStore];
      return remoteData;
    }

    // Fallback item creation
    const newItem: AssistanceRequest = {
      _id: `req-${Date.now()}`,
      taskType: input.taskType,
      title: input.title || `${input.taskType} Assistance`,
      description: input.description,
      date: new Date().toISOString(),
      preferredTime: input.preferredTime || 'As soon as possible',
      location: input.location || 'Home',
      urgency: input.urgency || 'Normal',
      status: 'pending',
      requester: { name: 'Elderly Resident (You)' },
      provider: null,
      createdAt: new Date().toISOString(),
    };

    localStore = [newItem, ...localStore];
    return newItem;
  },

  /**
   * Accept an open request (Volunteer Matching)
   */
  async acceptAppointment(id: string): Promise<AssistanceRequest | null> {
    const remoteData = await ApiClient.put<AssistanceRequest>(`/appointments/${id}/accept`);

    if (remoteData) {
      localStore = localStore.map(req => (req._id === id ? remoteData : req));
      return remoteData;
    }

    // Local fallback update
    const target = localStore.find(req => req._id === id);
    if (target) {
      target.status = 'accepted';
      target.provider = { name: 'Volunteer (You)' };
    }
    return target || null;
  },

  /**
   * Delete an assistance request
   */
  async deleteAppointment(id: string): Promise<boolean> {
    await ApiClient.delete(`/appointments/${id}`);
    localStore = localStore.filter(req => req._id !== id);
    return true;
  },
};
