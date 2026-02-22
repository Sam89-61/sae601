import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  EvolutionStats,
  ExoProgression,
  Exercice,
  AddPoidsResponse,
  AddRecordParams,
  AddRecordResponse,
  DeleteRecordResponse,
} from '../types';


export function useEvolutionStats() {
  return useQuery({
    queryKey: ['evolution', 'stats'],
    queryFn: async () => {
      return apiClient.get<EvolutionStats>('/evolution/stats');
    },
    staleTime: 2 * 60 * 1000, 
  });
}


export function useExoProgression(exoId?: number | string) {
  return useQuery({
    queryKey: ['evolution', 'record', exoId],
    queryFn: async () => {
      if (!exoId) return [];
      return apiClient.get<ExoProgression[]>(`/evolution/record/${exoId}`);
    },
    enabled: !!exoId, 
    staleTime: 2 * 60 * 1000,
  });
}


export function useExercices() {
  return useQuery({
    queryKey: ['exercices'],
    queryFn: async () => {
      return apiClient.get<Exercice[]>('/exos/getAll');
    },
    staleTime: 10 * 60 * 1000, 
  });
}


export function useAddPoids() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (poids: number | string) => {
      return apiClient.post<AddPoidsResponse>('/evolution/poids', {
        poids: parseFloat(poids.toString()),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution', 'stats'] });
    },
  });
}

export function useAddRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordData: AddRecordParams) => {
      return apiClient.post<AddRecordResponse>('/evolution/record', recordData);
    },
    onSuccess: (_, variables) => {
      // Invalide les stats ET la progression de l'exercice concerné
      queryClient.invalidateQueries({ queryKey: ['evolution', 'stats'] });
      queryClient.invalidateQueries({ queryKey: ['evolution', 'record', variables.id_exo] });
    },
  });
}


export function useDeleteRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: number) => {
      return apiClient.delete<DeleteRecordResponse>(`/evolution/record/${recordId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evolution'] });
    },
  });
}
