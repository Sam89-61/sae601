const {pool} = require('../config/database');
class SessionSport {

    static async create(sessionData,client) {
        const {
            nom,
            description,
            date_session,
            heure_session,
            duree_minutes,
            id_programme_sportif,
            id_utilisateur,
            type_session,
            created_by_user_id = null,
            is_generated = true,
            is_public = false,
            source_session_id = null
        } = sessionData;
        const query = `
       INSERT INTO session_sport (
           nom, description, date_session, heure_session, duree_minutes,
           id_programme_sportif, id_utilisateur, type_session,
           created_by_user_id, is_generated, is_public, source_session_id
       )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *
        `;
        const values = [
            nom, description, date_session, heure_session, duree_minutes,
            id_programme_sportif || null, id_utilisateur, type_session || 'personnalisee',
            created_by_user_id, is_generated, is_public, source_session_id
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_session_sport, client) {
        const query = 'SELECT * FROM session_sport WHERE id_session_sport = $1';
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }

    static async update(id_session_sport, sessionData, client) {
        const { nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif, id_utilisateur, type_session } = sessionData;
        const query = `
         UPDATE session_sport
            SET nom = $1, description = $2, date_session = $3, heure_session = $4, duree_minutes = $5,finish = $6, id_programme_sportif = $7, id_utilisateur = $8, type_session = $9
            WHERE id_session_sport = $10 
            RETURNING *;
        `;
        const values = [
            nom, description, date_session, heure_session, duree_minutes,finish, id_programme_sportif, id_utilisateur, type_session, id_session_sport
        ];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_session_sport, client) {
        const query = `
            DELETE FROM session_sport
            WHERE id_session_sport = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }
    static async findByProgrammeSportifId(id_programme_sportif, client) {
        const query = 'SELECT * FROM session_sport WHERE id_programme_sportif = $1 ORDER BY date_session ASC';
        const result = await client.query(query, [id_programme_sportif]);
        return result.rows;
    }

    static async findByUserId(id_utilisateur, client) {
        const query = 'SELECT * FROM session_sport WHERE id_utilisateur = $1 ORDER BY date_session ASC';
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }
    static async findAll(client) {
        const query = 'SELECT * FROM session_sport';
        const result = await client.query(query);
        return result.rows;
    }

    static async markAsRealized(id_session_sport, client) {
        const query = `
            UPDATE session_sport
            SET finish = true, date_realise = CURRENT_TIMESTAMP
            WHERE id_session_sport = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }

    static async deleteFutureSessions(id_programme_sportif, fromDate, client) {
        const query = `
            DELETE FROM session_sport
            WHERE id_programme_sportif = $1 AND date_session >= $2
        `;
        await client.query(query, [id_programme_sportif, fromDate]);
    }

    // ============================================
    // MÉTHODES POUR SÉANCES CUSTOM COMMUNAUTAIRES
    // ============================================

    static async getCommunitySessions(filters = {}, limit = 20, offset = 0, client) {
        const { search } = filters;
        let whereClause = 'WHERE ss.is_public = true AND ss.is_generated = false';
        const params = [];
        let paramIndex = 1;

        if (search) {
            whereClause += ` AND (ss.nom ILIKE $${paramIndex} OR ss.description ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        params.push(limit, offset);

        const query = `
            SELECT ss.*,
                   u.pseudo as creator_pseudo,
                   u.langue as creator_langue,
                   (SELECT COUNT(*) FROM session_sport_likes WHERE id_session_sport = ss.id_session_sport) as like_count
            FROM session_sport ss
            JOIN utilisateurs u ON ss.created_by_user_id = u.id_utilisateur
            ${whereClause}
            ORDER BY ss.date_creation DESC
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const result = await client.query(query, params);
        return result.rows;
    }

    static async incrementUsageCount(id_session_sport, client) {
        const query = `
            UPDATE session_sport
            SET nb_utilisations = nb_utilisations + 1
            WHERE id_session_sport = $1
            RETURNING *
        `;
        const result = await client.query(query, [id_session_sport]);
        return result.rows[0];
    }

    static async updateLikeCount(id_session_sport, delta, client) {
        const query = `
            UPDATE session_sport
            SET nb_likes = nb_likes + $1
            WHERE id_session_sport = $2
            RETURNING *
        `;
        const result = await client.query(query, [delta, id_session_sport]);
        return result.rows[0];
    }

    static async isOwnedByUser(id_session_sport, id_utilisateur, client) {
        const query = `
            SELECT 1 FROM session_sport
            WHERE id_session_sport = $1 AND created_by_user_id = $2
        `;
        const result = await client.query(query, [id_session_sport, id_utilisateur]);
        return result.rows.length > 0;
    }

    static async countByType(id_utilisateur, client) {
        const query = `
            SELECT 
                COUNT(*) FILTER (WHERE type_session = 'personnalisee' AND finish = true) as count_perso,
                COUNT(*) FILTER (WHERE type_session = 'libre' AND finish = true) as count_libre
            FROM session_sport
            WHERE id_utilisateur = $1
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows[0];
    }

    static async getActivityCalendar(id_utilisateur, client) {
        const query = `
            SELECT date_session::date as date, COUNT(*) as count
            FROM session_sport
            WHERE id_utilisateur = $1 AND finish = true
              AND date_session >= CURRENT_DATE - INTERVAL '365 days'
            GROUP BY date_session::date
            ORDER BY date_session::date ASC
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }

    static async getTotalActiveDays(id_utilisateur, client) {
        const query = `
            SELECT COUNT(DISTINCT date_session::date) as total
            FROM session_sport
            WHERE id_utilisateur = $1 AND finish = true
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows[0].total;
    }

    static async getUserSessions(id_utilisateur, client) {
        const query = `
            SELECT ss.*,
                   'sport' as session_type,
                   (SELECT COUNT(*) FROM session_sport_likes WHERE id_session_sport = ss.id_session_sport) as like_count,
                   u_orig.pseudo as original_creator_pseudo
            FROM session_sport ss
            LEFT JOIN session_sport ss_orig ON ss.source_session_id = ss_orig.id_session_sport
            LEFT JOIN utilisateurs u_orig ON ss_orig.created_by_user_id = u_orig.id_utilisateur
            WHERE ss.created_by_user_id = $1 AND ss.is_generated = false
            ORDER BY ss.date_creation DESC
        `;
        const result = await client.query(query, [id_utilisateur]);
        return result.rows;
    }

    static async updateBasicInfo(id, data, client) {
        const { nom, description, is_public } = data;
        const query = `
            UPDATE session_sport
            SET nom = COALESCE($1, nom), 
                description = COALESCE($2, description), 
                is_public = COALESCE($3, is_public)
            WHERE id_session_sport = $4
            RETURNING *
        `;
        const result = await client.query(query, [nom, description, is_public, id]);
        return result.rows[0];
    }

    static async findDetailsById(id, client) {
        const query = `
            SELECT ss.*, u.pseudo as creator_pseudo
            FROM session_sport ss
            LEFT JOIN utilisateurs u ON ss.created_by_user_id = u.id_utilisateur
            WHERE ss.id_session_sport = $1
        `;
        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    static async getLastCompletion(filters, client) {
        const { nom, source_session_id, id_utilisateur, type_session } = filters;
        let whereClause = 'WHERE finish = true';
        const params = [];
        let index = 1;

        if (nom) {
            whereClause += ` AND nom = $${index}`;
            params.push(nom);
            index++;
        }
        if (source_session_id) {
            whereClause += ` AND source_session_id = $${index}`;
            params.push(source_session_id);
            index++;
        }
        if (id_utilisateur) {
            whereClause += ` AND id_utilisateur = $${index}`;
            params.push(id_utilisateur);
            index++;
        }
        if (type_session) {
            whereClause += ` AND type_session = $${index}`;
            params.push(type_session);
            index++;
        }

        const query = `
            SELECT date_realise
            FROM session_sport
            ${whereClause}
            ORDER BY date_realise DESC
            LIMIT 1
        `;
        const result = await client.query(query, params);
        return result.rows[0];
    }
}



module.exports = SessionSport;

