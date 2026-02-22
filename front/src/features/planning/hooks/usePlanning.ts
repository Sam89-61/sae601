import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Event, CreateEventParams } from '../types';

interface EventsResponse {
  evenements: Event[];
}

/**
 * Hook pour récupérer tous les événements
 */
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: async () => {
      return apiClient.get<EventsResponse>('/evenement/getAll');
    },
    refetchInterval: 60 * 1000, // Refresh toutes les 60s
    staleTime: 30 * 1000,
  });
}

/**
 * Hook pour créer un événement
 */
export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventData: CreateEventParams) => {
      return apiClient.post<Event>('/evenement/create', eventData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

/**
 * Hook pour supprimer un événement
 */
export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (eventId: number) => {
      return apiClient.delete(`/evenement/delete/${eventId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}
