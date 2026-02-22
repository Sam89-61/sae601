/**
 * Utilitaires pour traduire les contenus dynamiques provenant de la DB
 */

/**
 * Tente de traduire un nom ou une description de programme sportif
 * @param {string} text - Le texte brut de la DB
 * @param {function} t - La fonction de traduction i18next
 * @returns {string} Le texte traduit ou original
 */
export const translateDynamicText = (text, t) => {
  if (!text) return text;

  // --- Traduction des noms de programmes ---
  if (text.includes('Entrainement PPL')) {
    return text.replace('Entrainement PPL', t('training.programs.ppl'));
  }
  if (text.includes('Entrainement Full Body')) {
    return text.replace('Entrainement Full Body', t('training.programs.fullBody'));
  }
  if (text.includes('Entrainement Poids du Corps')) {
    return text.replace('Entrainement Poids du Corps', t('training.programs.calisthenics'));
  }
  if (text.includes('Entrainement Upper/Lower')) {
    return text.replace('Entrainement Upper/Lower', t('training.programs.upperLower'));
  }
  if (text.includes('Entrainement Split')) {
    return text.replace('Entrainement Split', t('training.programs.split'));
  }

  // --- Traduction des Programmes Complets et Objectifs ---
  if (text.includes('Programme Complet')) {
    let translated = text.replace('Programme Complet', t('training.programs.complete'));
    // Traduire l'objectif s'il est présent
    if (translated.includes('Prise de masse')) translated = translated.replace('Prise de masse', t('training.programs.objectives.gain'));
    if (translated.includes('Perte de poids')) translated = translated.replace('Perte de poids', t('training.programs.objectives.loss'));
    if (translated.includes('Endurance')) translated = translated.replace('Endurance', t('training.programs.objectives.endurance'));
    return translated;
  }

  // Traduction directe des objectifs seuls si nécessaire
  if (text === 'Prise de masse') return t('training.programs.objectives.gain');
  if (text === 'Perte de poids') return t('training.programs.objectives.loss');
  if (text === 'Endurance') return t('training.programs.objectives.endurance');

  // --- Traduction des descriptions ---
  if (text.includes('Programme axé sur le PPL')) {
    return text.replace('Programme axé sur le PPL (Push, Pull, Legs)', t('training.programs.descriptionPpl'));
  }
  if (text.includes('tous les muscles à chaque séance')) {
    return t('training.programs.descriptionFullBody');
  }
  if (text.includes('Calisthenics/Élastiques')) {
    return t('training.programs.descriptionCalisthenics');
  }
  if (text.includes('alternant haut et bas')) {
    return t('training.programs.descriptionUpperLower');
  }
  if (text.includes('split par groupe musculaire')) {
    return t('training.programs.descriptionSplit');
  }

  // --- Traduction des parties de phrases ---
  let result = text;
  
  // "pour Débutant" -> "for Beginner"
  if (result.includes('pour ')) {
    const parts = result.split('pour ');
    const level = parts[1].trim();
    // On pourrait mapper les niveaux ici si besoin
    result = parts[0] + t('training.programs.forLevel', { level: level });
  }

  // "Fréquence: 3 fois par semaine"
  if (result.includes('Fréquence:')) {
    const match = result.match(/Fréquence: (\d+)/);
    if (match) {
      result = result.replace(/Fréquence: \d+ fois par semaine\.?/, t('training.programs.frequency', { count: match[1] }));
    }
  }

  // "Focus: Pectoraux, Épaules"
  if (result.includes('Focus:')) {
    const muscles = result.replace('Focus:', '').trim();
    // Idéalement il faudrait traduire chaque muscle, mais c'est un bon début
    result = t('training.sessions.focus', { muscles });
  }

  // "Semaine 1 - Séance 2"
  if (result.includes('Semaine') && result.includes('Séance')) {
    const match = result.match(/Semaine (\d+) - Séance (\d+)/);
    if (match) {
      return `${t('training.sessions.week', { week: match[1] })} - ${t('training.sessions.session', { session: match[2] })}`;
    }
  }

  // --- Traduction de la Nutrition ---
  if (result === 'Petit déjeuner') return t('diet.meals.breakfast');
  if (result === 'Déjeuner') return t('diet.meals.lunch');
  if (result === 'Dîner') return t('diet.meals.dinner');
  if (result === 'Collation') return t('diet.meals.snack');
  
  if (result.includes('Programme de ')) {
    return result.replace('Programme de ', t('diet.programOf') + ' ');
  }

  // --- Traduction du ChatBot ---
  if (result.includes('Bonjour! 👋 Je suis BuddyCoach')) {
    return t('chatbot.welcome');
  }

  return result;
};
