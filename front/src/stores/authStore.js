import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store d'authentification
 * Gère les informations utilisateur et remplace localStorage pour l'auth
 */
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      userPseudo: null,
      cguAccepted: false,

      setUser: (user) => set({
        user,
        userPseudo: user?.pseudo || null,
      }),

      setUserPseudo: (pseudo) => set({ userPseudo: pseudo }),

      setCguAccepted: (accepted) => set({ cguAccepted: accepted }),

      updateUserInfo: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
        userPseudo: userData.pseudo || state.userPseudo,
      })),

      login: (userData) => set({
        user: userData,
        userPseudo: userData.pseudo,
        cguAccepted: userData.accepte_cgu || false,
      }),

      logout: () => set({
        user: null,
        userPseudo: null,
        cguAccepted: false,
      }),

      isAuthenticated: () => !!get().user,
      getUserPseudo: () => get().userPseudo || 'Utilisateur',
      hasCguAccepted: () => get().cguAccepted,
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        userPseudo: state.userPseudo,
        cguAccepted: state.cguAccepted,
      }),
    }
  )
);
