import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import fr from './locales/fr/translation.json';
import en from './locales/en/translation.json';
import { useSettingsStore } from './stores/settingsStore';

// Accès direct au store (sans hook, car on est hors composant React)
const savedLang = useSettingsStore.getState().lang;
const browserLang = typeof navigator !== 'undefined' && navigator.language && navigator.language.startsWith('en')
  ? 'en'
  : 'fr';
const defaultLang = savedLang || browserLang;

i18n
  .use(initReactI18next)
  .init({
    resources: {
      fr: { translation: fr },
      en: { translation: en }
    },
    lng: defaultLang,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false }
  });

if (!savedLang) {
  try {
    useSettingsStore.setState({ lang: defaultLang });
  } catch (error) {
    console.warn('Unable to persist initial language preference:', error);
  }
}

i18n.on('languageChanged', (lng) => {
  try {
    useSettingsStore.setState({ lang: lng });
  } catch (error) {
    console.warn('Unable to persist language preference:', error);
  }
});

export default i18n;
