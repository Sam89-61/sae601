const { pool } = require('../config/database');

class Notification {
    /**
     * Créer une notification
     */
    static async create(data, client) {
        const { id_destinataire, id_emetteur, type, contenu } = data;
        const query = `
            INSERT INTO notifications (id_destinataire, id_emetteur, type, contenu)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await client.query(query, [id_destinataire, id_emetteur, type, contenu]);
        return result.rows[0];
    }

    /**
     * Récupérer les notifications d'un utilisateur
     */
    static async getByUserId(userId, client) {
        const query = `
            SELECT n.*, u.pseudo as emetteur_pseudo
            FROM notifications n
            LEFT JOIN utilisateurs u ON n.id_emetteur = u.id_utilisateur
            WHERE n.id_destinataire = $1
            ORDER BY n.date_creation DESC;
        `;
        const result = await client.query(query, [userId]);
        return result.rows;
    }

    /**
     * Marquer une notification comme lue
     */
    static async markAsRead(notificationId, client) {
        const query = `
            UPDATE notifications
            SET lu = true
            WHERE id_notification = $1
            RETURNING *;
        `;
        const result = await client.query(query, [notificationId]);
        return result.rows[0];
    }

    /**
     * Marquer toutes les notifications d'un utilisateur comme lues
     */
    static async markAllAsReadByUserId(userId, client) {
        const query = `UPDATE notifications SET lu = true WHERE id_destinataire = $1 AND lu = false`;
        await client.query(query, [userId]);
    }

    /**
     * Supprimer une notification
     */
    static async delete(notificationId, client) {
        const query = `
            DELETE FROM notifications
            WHERE id_notification = $1
            RETURNING *;
        `;
        const result = await client.query(query, [notificationId]);
        return result.rows[0];
    }
}

module.exports = Notification;
