class SessionRepasLike {
    static async create(id_session_repas, id_utilisateur, client) {
        const query = `
            INSERT INTO session_repas_likes (id_session_repas, id_utilisateur)
            VALUES ($1, $2)
            ON CONFLICT (id_session_repas, id_utilisateur) DO NOTHING
            RETURNING *;
        `;
        const values = [id_session_repas, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async delete(id_session_repas, id_utilisateur, client) {
        const query = `
            DELETE FROM session_repas_likes
            WHERE id_session_repas = $1 AND id_utilisateur = $2
            RETURNING *;
        `;
        const values = [id_session_repas, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async exists(id_session_repas, id_utilisateur, client) {
        const query = `
            SELECT 1 FROM session_repas_likes
            WHERE id_session_repas = $1 AND id_utilisateur = $2
        `;
        const values = [id_session_repas, id_utilisateur];
        const result = await client.query(query, values);
        return result.rows.length > 0;
    }

    static async countBySession(id_session_repas, client) {
        const query = `
            SELECT COUNT(*) as count
            FROM session_repas_likes
            WHERE id_session_repas = $1
        `;
        const result = await client.query(query, [id_session_repas]);
        return parseInt(result.rows[0].count);
    }

    static async getLikedByUserId(id_utilisateur, client) {
        const query = `
            SELECT srl.*, sr.nom, sr.type_repas, sr.is_public
            FROM session_repas_likes srl
            JOIN session_repas sr ON srl.id_session_repas = sr.id_session_repas
            WHERE srl.id_utilisateur = $1
            ORDER BY srl.date_creation DESC
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }
}

module.exports = SessionRepasLike;
