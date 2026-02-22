const { pool } = require('../config/database');

class Message {
    static async create(data, client) {
        const { id_emetteur, id_receveur, contenu } = data;
        const query = `
            INSERT INTO messages (id_emetteur, id_receveur, contenu)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const result = await client.query(query, [id_emetteur, id_receveur, contenu]);
        return result.rows[0];
    }

    static async getConversation(id1, id2, client) {
        const query = `
            SELECT * FROM messages
            WHERE (id_emetteur = $1 AND id_receveur = $2)
               OR (id_emetteur = $2 AND id_receveur = $1)
            ORDER BY date_envoi ASC;
        `;
        const result = await client.query(query, [id1, id2]);
        return result.rows;
    }

    static async markAsRead(id_receveur, id_emetteur, client) {
        const query = `
            UPDATE messages
            SET lu = true
            WHERE id_receveur = $1 AND id_emetteur = $2 AND lu = false
            RETURNING *;
        `;
        const result = await client.query(query, [id_receveur, id_emetteur]);
        return result.rows;
    }

    static async getUnreadCount(id_receveur, id_emetteur, client) {
        const query = `
            SELECT COUNT(*) as count
            FROM messages
            WHERE id_receveur = $1 AND id_emetteur = $2 AND lu = false;
        `;
        const result = await client.query(query, [id_receveur, id_emetteur]);
        return parseInt(result.rows[0].count);
    }
}

module.exports = Message;
