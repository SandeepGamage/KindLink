import { useState, useCallback, useEffect } from 'react';
import { appointmentService } from '@/services/appointmentService';
import { AssistanceRequest, CreateRequestInput } from '@/types/appointment';

export function useAppointments(statusFilter?: string) {
  const [requests, setRequests] = useState<AssistanceRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await appointmentService.getAppointments(statusFilter);
      setRequests(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const createRequest = async (input: CreateRequestInput): Promise<AssistanceRequest | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const created = await appointmentService.createAppointment(input);
      await fetchRequests();
      return created;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const acceptRequest = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await appointmentService.acceptAppointment(id);
      await fetchRequests();
      return !!result;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateRequest = async (id: string, input: Partial<CreateRequestInput>): Promise<AssistanceRequest | null> => {
    setSubmitting(true);
    setError(null);
    try {
      const updated = await appointmentService.updateAppointment(id, input);
      await fetchRequests();
      return updated;
    } catch (err) {
      setError((err as Error).message);
      return null;
    } finally {
      setSubmitting(false);
    }
  };

  const deleteRequest = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await appointmentService.deleteAppointment(id);
      await fetchRequests();
      return success;
    } catch (err) {
      setError((err as Error).message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getAppointmentById = useCallback(async (id: string): Promise<AssistanceRequest | null> => {
    return await appointmentService.getAppointmentById(id);
  }, []);

  return {
    requests,
    loading,
    submitting,
    error,
    refreshRequests: fetchRequests,
    createRequest,
    updateRequest,
    acceptRequest,
    deleteRequest,
    getAppointmentById,
  };
}
