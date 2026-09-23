import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiClient } from './apiClient';
import { AssistanceRequest, CreateRequestInput, Volunteer } from '@/types/appointment';

const STORAGE_KEY = '@kindlink_appointments_v1';

// In-memory request store initialized from persistent disk storage
let localStore: AssistanceRequest[] = [];
let isInitialized = false;

const loadFromDisk = async (): Promise<AssistanceRequest[]> => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      localStore = JSON.parse(raw);
    }
  } catch (err) {
    console.log('[AppointmentService] Load disk error:', err);
  }
  isInitialized = true;
  return localStore;
};

const saveToDisk = async (data: AssistanceRequest[]) => {
  try {
    localStore = data;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.log('[AppointmentService] Save disk error:', err);
  }
};

export const appointmentService = {
  /**
   * Fetch active volunteer profiles with optional date, time, and location query criteria
   */
  async getVolunteers(criteria?: { date?: string; time?: string; location?: string }): Promise<Volunteer[]> {
    try {
      const params = new URLSearchParams();
      if (criteria?.date) params.append('date', criteria.date);
      if (criteria?.time) params.append('time', criteria.time);
      if (criteria?.location) params.append('location', criteria.location);
      const queryString = params.toString() ? `?${params.toString()}` : '';

      const remote = await ApiClient.get<Volunteer[]>(`/appointments/volunteers${queryString}`);
      if (remote && Array.isArray(remote)) {
        return remote;
      }
      return [];
    } catch (err) {
      console.log('[AppointmentService] Failed to load remote volunteers:', err);
      throw err;
    }
  },

  /**
   * Fetch assistance requests with optional status filter
   */
  async getAppointments(statusFilter?: string): Promise<AssistanceRequest[]> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const endpoint = statusFilter ? `/appointments?status=${statusFilter}` : '/appointments';
    const remoteData = await ApiClient.get<AssistanceRequest[]>(endpoint);

    if (remoteData && Array.isArray(remoteData)) {
      // Merge remote items with any local items
      const remoteIds = new Set(remoteData.map(r => r._id));
      const unsavedLocal = localStore.filter(r => r._id.startsWith('req-') && !remoteIds.has(r._id));
      const merged = [...remoteData, ...unsavedLocal];
      await saveToDisk(merged);
      return statusFilter
        ? merged.filter(req => req.status === statusFilter)
        : merged;
    }

    // Local disk fallback logic
    return statusFilter
      ? localStore.filter(req => req.status === statusFilter)
      : localStore;
  },

  /**
   * Create a new assistance request
   */
  async createAppointment(input: CreateRequestInput): Promise<AssistanceRequest> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const remoteData = await ApiClient.post<AssistanceRequest>('/appointments', input);

    if (remoteData) {
      const updated = [remoteData, ...localStore.filter(r => r._id !== remoteData._id)];
      await saveToDisk(updated);
      return remoteData;
    }

    // Fallback item creation saved persistently to disk
    const newItem: AssistanceRequest = {
      _id: `req-${Date.now()}`,
      taskType: input.taskType,
      title: input.title || `${input.taskType} Assistance`,
      description: input.description,
      date: input.date || new Date().toISOString(),
      preferredTime: input.preferredTime || 'As soon as possible',
      location: input.location || 'Home',
      contactNumber: input.contactNumber || '',
      urgency: input.urgency || 'Normal',
      status: 'pending',
      requester: { name: 'Elderly Resident (You)' },
      provider: input.provider ? { _id: input.provider, name: 'Assigned Volunteer' } : null,
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...localStore];
    await saveToDisk(updated);
    return newItem;
  },

  /**
   * Accept an open request (Volunteer Matching)
   */
  async acceptAppointment(id: string): Promise<AssistanceRequest | null> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const remoteData = await ApiClient.put<AssistanceRequest>(`/appointments/${id}/accept`);

    if (remoteData) {
      const updated = localStore.map(req => (req._id === id ? remoteData : req));
      await saveToDisk(updated);
      return remoteData;
    }

    // Local disk fallback update
    const target = localStore.find(req => req._id === id);
    if (target) {
      target.status = 'accepted';
      target.provider = { name: 'Volunteer (You)' };
      await saveToDisk([...localStore]);
    }
    return target || null;
  },

  /**
   * Get a single appointment by ID
   */
  async getAppointmentById(id: string): Promise<AssistanceRequest | null> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const remoteData = await ApiClient.get<AssistanceRequest>(`/appointments/${id}`);
    if (remoteData) return remoteData;
    return localStore.find(req => req._id === id) || null;
  },

  /**
   * Update an existing assistance request
   */
  async updateAppointment(id: string, input: Partial<CreateRequestInput>): Promise<AssistanceRequest | null> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const remoteData = await ApiClient.put<AssistanceRequest>(`/appointments/${id}`, input);

    if (remoteData) {
      const updated = localStore.map(req => (req._id === id ? { ...req, ...remoteData } : req));
      await saveToDisk(updated);
      return remoteData;
    }

    // Local disk fallback update
    let updatedItem: AssistanceRequest | null = null;
    const updated: AssistanceRequest[] = localStore.map(req => {
      if (req._id === id) {
        const item: AssistanceRequest = {
          ...req,
          title: input.title !== undefined ? input.title : req.title,
          taskType: input.taskType || req.taskType,
          description: input.description !== undefined ? input.description : req.description,
          date: input.date !== undefined ? input.date : req.date,
          preferredTime: input.preferredTime !== undefined ? input.preferredTime : req.preferredTime,
          location: input.location !== undefined ? input.location : req.location,
          contactNumber: input.contactNumber !== undefined ? input.contactNumber : req.contactNumber,
          urgency: input.urgency || req.urgency,
          provider: input.provider !== undefined ? (input.provider ? { _id: input.provider, name: 'Assigned Volunteer' } : null) : req.provider,
        };
        updatedItem = item;
        return item;
      }
      return req;
    });

    await saveToDisk(updated);
    return updatedItem;
  },

  /**
   * Cancel an assistance request with structured reason prompts
   */
  async cancelAppointment(id: string, input: { reason: string; note?: string }): Promise<AssistanceRequest | null> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    try {
      const remoteData = await ApiClient.put<AssistanceRequest>(`/appointments/${id}/cancel`, input);

      if (remoteData) {
        const updated = localStore.map(req => (req._id === id ? { ...req, ...remoteData } : req));
        await saveToDisk(updated);
        return remoteData;
      }
    } catch (error) {
      // Propagate server rejections (e.g. 400 Bad Request on completed appointments)
      throw error;
    }

    // Local disk fallback update
    let cancelledItem: AssistanceRequest | null = null;
    const updated = localStore.map(req => {
      if (req._id === id) {
        if (req.status === 'cancelled' || req.status === 'completed') {
          cancelledItem = req;
          return req;
        }
        cancelledItem = {
          ...req,
          status: 'cancelled',
          cancellationReason: input.reason,
          cancellationNote: input.note || '',
          cancelledAt: new Date().toISOString(),
        };
        return cancelledItem;
      }
      return req;
    });

    await saveToDisk(updated);
    return cancelledItem;
  },

  /**
   * Delete an assistance request
   */
  async deleteAppointment(id: string): Promise<boolean> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    await ApiClient.delete(`/appointments/${id}`);
    const updated = localStore.filter(req => req._id !== id);
    await saveToDisk(updated);
    return true;
  },

  /**
   * Verify 4-digit arrival safety PIN (Volunteer in-person check-in)
   */
  async verifyArrivalPin(id: string, pin: string): Promise<AssistanceRequest> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const remoteData = await ApiClient.put<AssistanceRequest>(`/appointments/${id}/verify-pin`, { pin });
    if (remoteData) {
      const updated = localStore.map(req => (req._id === id ? remoteData : req));
      await saveToDisk(updated);
      return remoteData;
    }

    // Local disk fallback
    const target = localStore.find(req => req._id === id);
    if (target) {
      target.isPinVerified = true;
      target.verifiedAt = new Date().toISOString();
      target.status = 'in_progress';
      await saveToDisk([...localStore]);
      return target;
    }
    throw new Error('Appointment not found');
  },

  /**
   * Complete an assistance request / task
   */
  async completeAppointment(id: string): Promise<AssistanceRequest> {
    if (!isInitialized) {
      await loadFromDisk();
    }

    const remoteData = await ApiClient.put<AssistanceRequest>(`/appointments/${id}/complete`);
    if (remoteData) {
      const updated = localStore.map(req => (req._id === id ? remoteData : req));
      await saveToDisk(updated);
      return remoteData;
    }

    // Local disk fallback
    const target = localStore.find(req => req._id === id);
    if (target) {
      target.status = 'completed';
      await saveToDisk([...localStore]);
      return target;
    }
    throw new Error('Appointment not found');
  },
};
