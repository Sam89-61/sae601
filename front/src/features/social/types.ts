// Types spécifiques à la feature Social
export type { Friend, FriendRequest, SocialData, Message } from '@/types';

// Types pour les paramètres de recherche
export interface SearchUsersParams {
  query: string;
}

export interface SearchUserResult {
  id: number;
  pseudo: string;
  relationStatus: 'aucun' | 'en_attente' | 'accepte';
  isSender?: boolean;
}

// Types pour les mutations
export interface SendFriendRequestParams {
  id_receveur: number;
}

export interface AcceptFriendRequestParams {
  id_demandeur: number;
}

export interface SendMessageParams {
  id_receveur: number;
  contenu: string;
}

export interface RemoveFriendParams {
  userId: number;
}
