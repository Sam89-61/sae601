import { QueryClient } from '@tanstack/react-query';

/**
 * Configuration du QueryClient pour React Query
 *
 * Options optimisées pour une app mobile (Capacitor)
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache les données pendant 5 minutes par défaut
      staleTime: 5 * 60 * 1000,

      // Garde les données en cache pendant 10 minutes
      gcTime: 10 * 60 * 1000,

      // Retry automatique en cas d'erreur (utile pour connexion mobile instable)
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch quand l'utilisateur revient sur l'onglet/app
      refetchOnWindowFocus: true,

      // Refetch quand la connexion revient (important sur mobile)
      refetchOnReconnect: true,

      // Ne pas refetch au mount si les données sont fraîches
      refetchOnMount: true,
    },
    mutations: {
      // Retry les mutations échouées
      retry: 1,
    },
  },
});
