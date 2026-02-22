/**
 * Utilitaire pour la synthèse vocale (Web Speech API)
 */

let lastText = '';
let speechTimeout = null;

/**
 * @param {string} text - Le texte à prononcer
 * @param {object} options - Options de configuration (langue, débit, etc.)
 */
export const speak = (text, options = {}) => {
  if (!window.speechSynthesis || !text) return;

  if (text === lastText && !options.force) return;

  // Annuler la lecture en cours si demandé (utile pour les feedbacks en temps réel)
  if (options.cancel) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  
  utterance.lang = options.lang || 'fr-FR';
  utterance.rate = options.rate || 1.0;
  utterance.pitch = options.pitch || 1.0;
  utterance.volume = options.volume || 1.0;

  lastText = text;

  // Réinitialiser le cache après un certain temps pour permettre de redire le même conseil plus tard
  if (speechTimeout) clearTimeout(speechTimeout);
  speechTimeout = setTimeout(() => {
    lastText = '';
  }, options.cooldown || 5000);

  window.speechSynthesis.speak(utterance);
};

/**
 * Arrête toute synthèse vocale en cours
 */
export const stopSpeaking = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};
