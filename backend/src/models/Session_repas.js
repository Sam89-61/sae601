const {pool} = require('../config/database');
class SessionRepas {
    static async create(sessionData, client) {
        const dbClient = client || await pool.connect();
        try {
            const {
                nom,
                type_repas,
                date_repas,
                heure_repas,
                id_programme_a,
                notes,
                created_by_user_id = null,
                is_generated = true,
                is_public = false,
                source_session_id = null
            } = sessionData;
            const query = `
                INSERT INTO session_repas (
                    nom, type_repas, date_repas, heure_repas, id_programme_a, notes,
                    created_by_user_id, is_generated, is_public, source_session_id
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *;
            `;
            const values = [
                nom, type_repas, date_repas, heure_repas, id_programme_a, notes,
                created_by_user_id, is_generated, is_public, source_session_id
            ];
            const result = await dbClient.query(query, values);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
    static async findById(id_session_repas, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = 'SELECT * FROM session_repas WHERE id_session_repas = $1';
            const result = await dbClient.query(query, [id_session_repas]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
    static async update(id_session_repas, sessionData, client) {
        const dbClient = client || await pool.connect();
        try {
            const { nom, type_repas, date_repas, heure_repas, id_programme_a,notes } = sessionData;
            const query = `
                UPDATE session_repas
                SET nom = $1, type_repas = $2, date_repas = $3, heure_repas = $4, id_programme_a = $5, notes = $6
                WHERE id_session_repas = $7
                RETURNING *;
            `;
            const values = [nom, type_repas, date_repas, heure_repas, id_programme_a, notes, id_session_repas];
            const result = await dbClient.query(query, values);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
    static async delete(id_session_repas, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                DELETE FROM session_repas
                WHERE id_session_repas = $1
                RETURNING *;
            `;
            const result = await dbClient.query(query, [id_session_repas]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async findByProgrammeAlimentaireId(id_programme_a, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = 'SELECT * FROM session_repas WHERE id_programme_a = $1';
            const result = await dbClient.query(query, [id_programme_a]);
            return result.rows;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async findAll(client) {
        const dbClient = client || await pool.connect();
        try {
            const query = 'SELECT * FROM session_repas';
            const result = await dbClient.query(query);
            return result.rows;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async deleteFutureSessions(id_programme_a, fromDate, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                DELETE FROM session_repas
                WHERE id_programme_a = $1 AND date_repas >= $2
            `;
            await dbClient.query(query, [id_programme_a, fromDate]);
        } finally {
             if (!client) {
                dbClient.release();
            }
        }
    }

    // ============================================
    // MÉTHODES POUR SÉANCES REPAS CUSTOM COMMUNAUTAIRES
    // ============================================

    static async getCommunitySessions(filters = {}, limit = 20, offset = 0, client) {
        const dbClient = client || await pool.connect();
        try {
            const { search } = filters;
            let whereClause = 'WHERE sr.is_public = true AND sr.is_generated = false';
            const params = [];
            let paramIndex = 1;

            if (search) {
                whereClause += ` AND (sr.nom ILIKE $${paramIndex} OR sr.notes ILIKE $${paramIndex})`;
                params.push(`%${search}%`);
                paramIndex++;
            }

            params.push(limit, offset);

            const query = `
                SELECT sr.*,
                       u.pseudo as creator_pseudo,
                       u.langue as creator_langue,
                       (SELECT COUNT(*) FROM session_repas_likes WHERE id_session_repas = sr.id_session_repas) as like_count
                FROM session_repas sr
                JOIN utilisateurs u ON sr.created_by_user_id = u.id_utilisateur
                ${whereClause}
                ORDER BY sr.date_creation DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const result = await dbClient.query(query, params);
            return result.rows;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async incrementUsageCount(id_session_repas, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                UPDATE session_repas
                SET nb_utilisations = nb_utilisations + 1
                WHERE id_session_repas = $1
                RETURNING *
            `;
            const result = await dbClient.query(query, [id_session_repas]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async updateLikeCount(id_session_repas, delta, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                UPDATE session_repas
                SET nb_likes = nb_likes + $1
                WHERE id_session_repas = $2
                RETURNING *
            `;
            const result = await dbClient.query(query, [delta, id_session_repas]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async isOwnedByUser(id_session_repas, id_utilisateur, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                SELECT 1 FROM session_repas
                WHERE id_session_repas = $1 AND created_by_user_id = $2
            `;
            const result = await dbClient.query(query, [id_session_repas, id_utilisateur]);
            return result.rows.length > 0;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async getUserSessions(id_utilisateur, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                SELECT sr.*,
                       'repas' as session_type,
                       (SELECT COUNT(*) FROM session_repas_likes WHERE id_session_repas = sr.id_session_repas) as like_count,
                       u_orig.pseudo as original_creator_pseudo
                FROM session_repas sr
                LEFT JOIN session_repas sr_orig ON sr.source_session_id = sr_orig.id_session_repas
                LEFT JOIN utilisateurs u_orig ON sr_orig.created_by_user_id = u_orig.id_utilisateur
                WHERE sr.created_by_user_id = $1 AND sr.is_generated = false
                ORDER BY sr.date_creation DESC
            `;
            const result = await dbClient.query(query, [id_utilisateur]);
            return result.rows;
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async updateBasicInfo(id, data, client) {
        const dbClient = client || await pool.connect();
        try {
            const { nom, notes, is_public } = data;
            const query = `
                UPDATE session_repas
                SET nom = COALESCE($1, nom), 
                    notes = COALESCE($2, notes), 
                    is_public = COALESCE($3, is_public)
                WHERE id_session_repas = $4
                RETURNING *
            `;
            const result = await dbClient.query(query, [nom, notes, is_public, id]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }

    static async findDetailsById(id, client) {
        const dbClient = client || await pool.connect();
        try {
            const query = `
                SELECT sr.*, sr.notes as description, u.pseudo as creator_pseudo
                FROM session_repas sr
                LEFT JOIN utilisateurs u ON sr.created_by_user_id = u.id_utilisateur
                WHERE sr.id_session_repas = $1
            `;
            const result = await dbClient.query(query, [id]);
            return result.rows[0];
        } finally {
            if (!client) {
                dbClient.release();
            }
        }
    }
}


module.exports = SessionRepas;

