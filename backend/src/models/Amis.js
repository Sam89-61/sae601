const { pool } = require('../config/database');

class Amis {
    
    static async sendRequest(id_demandeur, id_receveur, client) {
        const query = `
            INSERT INTO amis (id_demandeur, id_receveur, statut)
            VALUES ($1, $2, 'en_attente')
            ON CONFLICT (id_demandeur, id_receveur) DO NOTHING
            RETURNING *;
        `;
        const result = await client.query(query, [id_demandeur, id_receveur]);
        return result.rows[0];
    }

  
    static async acceptRequest(id_demandeur, id_receveur, client) {
        const query = `
            UPDATE amis
            SET statut = 'accepte', date_acceptation = CURRENT_TIMESTAMP
            WHERE id_demandeur = $1 AND id_receveur = $2
            RETURNING *;
        `;
        const result = await client.query(query, [id_demandeur, id_receveur]);
        return result.rows[0];
    }

   
    static async removeRelation(id1, id2, client) {
        const query = `
            DELETE FROM amis
            WHERE (id_demandeur = $1 AND id_receveur = $2)
               OR (id_demandeur = $2 AND id_receveur = $1)
            RETURNING *;
        `;
        const result = await client.query(query, [id1, id2]);
        return result.rows[0];
    }

   
    static async getFriends(userId, client) {
        const query = `
            SELECT u.id_utilisateur as id, u.pseudo, u.langue, a.date_acceptation
            FROM amis a
            JOIN utilisateurs u ON (u.id_utilisateur = a.id_demandeur OR u.id_utilisateur = a.id_receveur)
            WHERE (a.id_demandeur = $1 OR a.id_receveur = $1)
              AND a.statut = 'accepte'
              AND u.id_utilisateur <> $1;
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
    }

   
    static async getPendingRequests(userId, client) {
        const query = `
            SELECT u.id_utilisateur as id, u.pseudo, a.date_creation
            FROM amis a
            JOIN utilisateurs u ON u.id_utilisateur = a.id_demandeur
            WHERE a.id_receveur = $1 AND a.statut = 'en_attente';
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
    }

    
    static async getRelationStatus(id1, id2, client) {
        const query = `
            SELECT * FROM amis
            WHERE (id_demandeur = $1 AND id_receveur = $2)
               OR (id_demandeur = $2 AND id_receveur = $1);
        `;
        const result = await client.query(query, [id1, id2]);
        return result.rows[0];
    }
}

module.exports = Amis;
