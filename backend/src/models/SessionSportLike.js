class SessionSportLike {
    static async create(id_session_sport, id_utilisateur, client) {
        const query = `
            INSERT INTO session_sport_likes (id_session_sport, id_utilisateur)
            VALUES ($1, $2)
            ON CONFLICT (id_session_sport, id_utilisateur) DO NOTHING
            RETURNING *;
        `;
        const values = [id_session_sport, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async delete(id_session_sport, id_utilisateur, client) {
        const query = `
            DELETE FROM session_sport_likes
            WHERE id_session_sport = $1 AND id_utilisateur = $2
            RETURNING *;
        `;
        const values = [id_session_sport, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async exists(id_session_sport, id_utilisateur, client) {
        const query = `
            SELECT 1 FROM session_sport_likes
            WHERE id_session_sport = $1 AND id_utilisateur = $2
        `;
        const values = [id_session_sport, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows.length > 0;
    }

    static async countBySession(id_session_sport, client) {
        const query = `
            SELECT COUNT(*) as count
            FROM session_sport_likes
            WHERE id_session_sport = $1
        `;
        const result = await client.query(query, [id_session_sport]);
        return parseInt(result.rows[0].count);
    }

    static async getLikedByUserId(id_utilisateur, client) {
        const query = `
            SELECT ssl.*, ss.nom, ss.description, ss.is_public
            FROM session_sport_likes ssl
            JOIN session_sport ss ON ssl.id_session_sport = ss.id_session_sport
            WHERE ssl.id_utilisateur = $1
            ORDER BY ssl.date_creation DESC
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }
}

module.exports = SessionSportLike;
