import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Store des paramètres utilisateur
 * Gère les préférences comme la langue
 */
export const useSettingsStore = create(
  persist(
    (set, get) => ({
      lang: 'fr',
      setLang: (lang) => set({ lang }),
      getLang: () => get().lang,
    }),
    {
      name: 'settings-storage',
    }
  )
);
