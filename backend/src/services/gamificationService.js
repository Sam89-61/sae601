const Mascotte = require('../models/Mascotte');
const Badge = require('../models/Badge');
const UtilisateurBadge = require('../models/UtilisateurBadge');

class GamificationService {
    static XP_PER_LEVEL = 100;

    /**
     * Ajoute de l'XP à la mascotte d'un utilisateur et gère la montée de niveau.
     */
    static async awardXP(id_utilisateur, amount, client) {
        const mascottes = await Mascotte.findByUserId(id_utilisateur, client);
        if (!mascottes || mascottes.length === 0) return null;

        const mascotte = mascottes[0];
        let newExperience = mascotte.experience + amount;
        let newNiveau = mascotte.niveau;

        while (newExperience >= newNiveau * this.XP_PER_LEVEL) {
            newNiveau++;
        }

        return await Mascotte.update(mascotte.id_mascotte, {
            experience: newExperience,
            niveau: newNiveau,
            apparence: mascotte.apparence,
            id_utilisateur: id_utilisateur
        }, client);
    }

    /**
     * Définition des règles d'attribution des badges.
     * Facilite l'ajout de nouveaux badges (OCP).
     */
    static BADGE_RULES = [
        {
            id: 'premier_pas',
            contextType: 'session_completed',
            check: async () => true // Premier badge toujours attribué à la première session
        },
        {
            id: 'guerrier_lundi',
            contextType: 'session_completed',
            check: async () => new Date().getDay() === 1
        },
        {
            id: 'serie_7_jours',
            contextType: 'session_completed',
            check: async (userId, context, client, service) => {
                return context.type_session === 'personnalisee' && await service.checkStreak(userId, 7, client);
            }
        },
        {
            id: 'participation',
            contextType: 'participation',
            check: async () => true
        }
    ];

    /**
     * Vérifie et attribue les badges en fonction du contexte.
     */
    static async checkAndAwardBadges(id_utilisateur, context, client) {
        const awardedBadges = [];

        // Filtrer les règles applicables au contexte actuel
        const applicableRules = this.BADGE_RULES.filter(rule => rule.contextType === context.type);

        for (const rule of applicableRules) {
            const hasBadge = await UtilisateurBadge.checkExists(id_utilisateur, rule.id, client);
            if (!hasBadge) {
                const isEligible = await rule.check(id_utilisateur, context, client, this);
                if (isEligible) {
                    await this.awardBadge(id_utilisateur, rule.id, client);
                    awardedBadges.push(rule.id);
                }
            }
        }

        return awardedBadges;
    }

    static async awardBadge(id_utilisateur, condition_type, client) {
        const badge = await Badge.findByConditionType(condition_type, client);
        if (!badge) {
            console.error(`[BADGE] Badge "${condition_type}" introuvable dans la table badges`);
            return;
        }

        await UtilisateurBadge.create(id_utilisateur, badge.id_badge, client);
    }

    static async checkStreak(id_utilisateur, days, client) {
        const query = `
            SELECT COUNT(DISTINCT date_session) as distinct_days
            FROM session_sport
            WHERE id_utilisateur = $1 
              AND finish = true 
              AND type_session = 'personnalisee'
              AND date_session > CURRENT_DATE - INTERVAL '1 day' * $2
        `;
        const res = await client.query(query, [id_utilisateur, days]);
        return parseInt(res.rows[0].distinct_days) >= days;
    }

    static async getUserBadges(id_utilisateur, client) {
        return await UtilisateurBadge.findByUserId(id_utilisateur, client);
    }
}

module.exports = GamificationService;