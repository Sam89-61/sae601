const { pool } = require('../config/database');

class HistoriquePoids {
    static async create(data, client) {
        const { poids, id_utilisateur } = data;
        const query = `
            INSERT INTO historique_poids (poids, id_utilisateur)
            VALUES ($1, $2)
            RETURNING *;
        `;
        const result = await client.query(query, [poids, id_utilisateur]);
        return result.rows[0];
    }

    static async findByUserId(id_utilisateur, client) {
        const query = `
            SELECT * FROM historique_poids 
            WHERE id_utilisateur = $1 
            ORDER BY date_mesure ASC;
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }

    static async getLatest(id_utilisateur, client) {
        const query = `
            SELECT * FROM historique_poids 
            WHERE id_utilisateur = $1 
            ORDER BY date_mesure DESC 
            LIMIT 1;
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows[0];
    }

    static async delete(id_poids, id_utilisateur, client) {
        const query = 'DELETE FROM historique_poids WHERE id_poids = $1 AND id_utilisateur = $2 RETURNING *';
        const result = await client.query(query, [id_poids, id_utilisateur]);
        return result.rows[0];
    }
}

module.exports = HistoriquePoids;
