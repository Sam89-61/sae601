import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { ProgrammeSportResponse, ProgrammeAlimentaireResponse, GenererProgrammeResponse } from '../types';

/**
 * Hook pour récupérer le programme sport de l'utilisateur
 */
export function useMonProgrammeSport() {
  return useQuery({
    queryKey: ['programme', 'sport'],
    queryFn: async () => {
      return apiClient.get<ProgrammeSportResponse>('/programme/mon-programme');
    },
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });
}

/**
 * Hook pour récupérer le programme alimentaire
 */
export function useMonProgrammeAlimentaire() {
  return useQuery({
    queryKey: ['programme', 'alimentaire'],
    queryFn: async () => {
      return apiClient.get<ProgrammeAlimentaireResponse>('/programme/mon-programme-alimentaire');
    },
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook pour générer un nouveau programme
 */
export function useGenererProgramme() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      return apiClient.post<GenererProgrammeResponse>('/programme/generer');
    },
    onSuccess: () => {
      // Invalide le cache pour recharger les programmes
      queryClient.invalidateQueries({ queryKey: ['programme'] });
    },
  });
}
