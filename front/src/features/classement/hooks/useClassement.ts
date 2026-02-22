import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { Challenge, LeaderboardData, SubmitScoreParams, SubmitScoreResponse } from '../types';


export function useChallenges() {
  return useQuery({
    queryKey: ['challenges'],
    queryFn: async () => {
      return apiClient.get<Challenge[]>('/classement/all');
    },
    staleTime: 10 * 60 * 1000, 
  });
}

/**
 * Hook pour récupérer le leaderboard d'un challenge spécifique
 */
export function useLeaderboard(challengeId?: number, userId?: number) {
  return useQuery({
    queryKey: ['leaderboard', challengeId, userId],
    queryFn: async () => {
      if (!challengeId || !userId) return null;
      return apiClient.get<LeaderboardData>(
        `/classement/${challengeId}/leaderboard?userId=${userId}`
      );
    },
    enabled: !!challengeId && !!userId, // Ne lance la requête que si les deux sont définis
    refetchInterval: 30 * 1000, // Refresh toutes les 30s pour voir les nouveaux scores
    staleTime: 15 * 1000,
  });
}

/**
 * Hook pour soumettre un score à un challenge
 */
export function useSubmitScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: SubmitScoreParams) => {
      return apiClient.post<SubmitScoreResponse>('/classement/soumettre', params);
    },
    onSuccess: (_, variables) => {
      // Invalide le leaderboard pour refetch automatiquement
      queryClient.invalidateQueries({
        queryKey: ['leaderboard', variables.id_classement],
      });
    },
  });
}
