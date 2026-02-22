const { pool } = require('../config/database');

class Evenement {

    static async create(evenementData, userId, client) { 
        const { nom, description, date, lieu, heure, duree, categorie } = evenementData;
        const query = `
            INSERT INTO evenement (nom, description, date, lieu, heure, duree, organisateur_id, categorie)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        const values = [nom, description, date, lieu, heure, duree, userId, categorie];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    
    static async findById(id, client) {
        const query = `
            SELECT e.*, u.pseudo as organisateur_nom 
            FROM evenement e
            LEFT JOIN utilisateurs u ON e.organisateur_id = u.id_utilisateur
            WHERE e.id_evenement = $1
        `;
        const values = [id];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async update(id, evenementData, client) {
        const { nom, description, date, lieu, heure, duree, categorie } = evenementData;
        const query = `
            UPDATE evenement 
            SET nom = $1, description = $2, date = $3, lieu = $4, heure = $5, duree = $6, categorie = $7
            WHERE id_evenement = $8
            RETURNING *;
        `;
        const values = [nom, description, date, lieu, heure, duree, categorie, id];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id, client) {
        const query = `
            DELETE FROM evenement
            WHERE id_evenement = $1
            RETURNING *;
        `;
        const values = [id];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = `
            SELECT e.*, u.pseudo as organisateur_nom 
            FROM evenement e
            LEFT JOIN utilisateurs u ON e.organisateur_id = u.id_utilisateur
            ORDER BY e.date ASC
        `;
        const result = await client.query(query);
        return result.rows;
    }

    static async findCreatedByUser(userId, client) {
        const query = `
            SELECT e.*, 'created' as relation_type, u.pseudo as organisateur_nom
            FROM evenement e
            LEFT JOIN utilisateurs u ON e.organisateur_id = u.id_utilisateur
            WHERE e.organisateur_id = $1
            ORDER BY e.date DESC
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
    }

    static async findJoinedByUser(userId, client) {
        const query = `
            SELECT e.*, 'joined' as relation_type, p.statut, u.pseudo as organisateur_nom
            FROM evenement e
            JOIN participation p ON e.id_evenement = p.id_evenement
            LEFT JOIN utilisateurs u ON e.organisateur_id = u.id_utilisateur
            WHERE p.id_utilisateur = $1
            AND e.organisateur_id != $1
            AND p.statut IN ('confirme', 'INSCRIT')
            ORDER BY e.date DESC
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
    }
}

module.exports = Evenement;