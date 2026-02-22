import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type {
  SocialData,
  Message,
  SearchUserResult,
  SendMessageParams,
  SendFriendRequestParams,
  AcceptFriendRequestParams,
} from '../types';

/**
 * Hook pour récupérer les données sociales (amis, demandes, notifications)
 */
export function useSocialData() {
  return useQuery({
    queryKey: ['social', 'data'],
    queryFn: async () => {
      return apiClient.get<SocialData>('/social/data');
    },
    refetchInterval: 30 * 1000, // Refresh toutes les 30s pour voir les nouvelles demandes/notifs
    staleTime: 15 * 1000,
  });
}

/**
 * Hook pour rechercher des utilisateurs
 */
export function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ['users', 'search', query],
    queryFn: async () => {
      return apiClient.get<SearchUserResult[]>(`/social/search?query=${encodeURIComponent(query)}`);
    },
    enabled: query.length >= 2, // Ne recherche que si au moins 2 caractères
    staleTime: 60 * 1000,
  });
}

/**
 * Hook pour récupérer une conversation avec un ami
 */
export function useConversation(friendId?: number) {
  return useQuery({
    queryKey: ['messages', 'conversation', friendId],
    queryFn: async () => {
      if (!friendId) return [];
      return apiClient.get<Message[]>(`/messages/conversation/${friendId}`);
    },
    enabled: !!friendId,
    refetchInterval: 5 * 1000, // Refresh toutes les 5s pour le chat en temps réel
    staleTime: 2 * 1000,
  });
}

/**
 * Hook pour envoyer un message
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id_receveur, contenu }: SendMessageParams) => {
      return apiClient.post<Message>('/messages/send', { id_receveur, contenu });
    },
    onSuccess: (_, variables) => {
      // Invalide la conversation pour refetch
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation', variables.id_receveur] });
      queryClient.invalidateQueries({ queryKey: ['social', 'data'] });
    },
  });
}

/**
 * Hook pour envoyer une demande d'ami
 */
export function useSendFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      return apiClient.post('/social/request', { id_receveur: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'data'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
  });
}

/**
 * Hook pour accepter une demande d'ami
 */
export function useAcceptFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      return apiClient.post('/social/accept', { id_demandeur: userId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'data'] });
      queryClient.invalidateQueries({ queryKey: ['users', 'search'] });
    },
  });
}

/**
 * Hook pour refuser/supprimer un ami
 */
export function useRemoveFriend() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      return apiClient.delete(`/social/friend/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['social', 'data'] });
    },
  });
}
