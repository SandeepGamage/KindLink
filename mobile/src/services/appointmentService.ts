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
   * Fetch all active volunteers available for assistance
   */
  async getVolunteers(): Promise<Volunteer[]> {
    try {
      const remote = await ApiClient.get<Volunteer[]>('/appointments/volunteers');
      if (remote && Array.isArray(remote) && remote.length > 0) {
        return remote;
      }
    } catch (err) {
      console.log('[AppointmentService] Failed to load remote volunteers:', err);
    }

    // Default fallback volunteers if offline or backend DB has no volunteers yet
    return [
      {
        _id: 'vol-1',
        name: 'Sarah Fernando',
        email: 'sarah.f@kindlink.org',
        mobile: '+94 77 123 4567',
        address: 'Colombo 07, Cinnamon Gardens',
        profileImage: '',
        bio: 'Certified First Aider & compassionate companion with 3+ years elderly care experience.',
        availability: ['Mon - Fri Mornings', 'Weekends'],
        rating: 4.9,
      },
      {
        _id: 'vol-2',
        name: 'Kasun Jayawardena',
        email: 'kasun.j@kindlink.org',
        mobile: '+94 71 987 6543',
        address: 'Nugegoda, Western Province',
        profileImage: '',
        bio: 'Tech enthusiast & safe driver ready to assist with transport and tech support.',
        availability: ['Weekdays After 2 PM', 'Full Day Saturdays'],
        rating: 4.8,
      },
      {
        _id: 'vol-3',
        name: 'Dilini Perera',
        email: 'dilini.p@kindlink.org',
        mobile: '+94 76 555 8921',
        address: 'Dehiwala - Mount Lavinia',
        profileImage: '',
        bio: 'Passionate about meal prep, gardening, and daily errands for seniors.',
        availability: ['Everyday 8 AM - 6 PM'],
        rating: 5.0,
      },
      {
        _id: 'vol-4',
        name: 'Amila Bandara',
        email: 'amila.b@kindlink.org',
        mobile: '+94 70 444 1122',
        address: 'Rajagiriya, Kotte',
        profileImage: '',
        bio: 'Friendly companion for walking, grocery shopping, and reading assistance.',
        availability: ['Mon, Wed, Fri Mornings'],
        rating: 4.9,
      }
    ];
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
};
