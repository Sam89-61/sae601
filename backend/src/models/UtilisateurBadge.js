const { pool } = require('../config/database');

class UtilisateurBadge {
    static async create(id_utilisateur, id_badge, client) {
        const query = `
            INSERT INTO utilisateur_badges (id_utilisateur, id_badge, date_obtention)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (id_utilisateur, id_badge) DO NOTHING
            RETURNING *;
        `;
        const res = await (client || pool).query(query, [id_utilisateur, id_badge]);
        return res.rows[0];
    }

    static async findByUserId(id_utilisateur, client) {
        const query = `
            SELECT b.*, ub.date_obtention
            FROM badges b
            JOIN utilisateur_badges ub ON b.id_badge = ub.id_badge
            WHERE ub.id_utilisateur = $1
            ORDER BY ub.date_obtention DESC;
        `;
        const res = await (client || pool).query(query, [id_utilisateur]);
        return res.rows;
    }

    static async checkExists(id_utilisateur, condition_type, client) {
        const query = `
            SELECT 1 FROM utilisateur_badges ub
            JOIN badges b ON ub.id_badge = b.id_badge
            WHERE ub.id_utilisateur = $1 AND b.condition_type = $2;
        `;
        const res = await (client || pool).query(query, [id_utilisateur, condition_type]);
        return res.rows.length > 0;
    }
}

module.exports = UtilisateurBadge;
