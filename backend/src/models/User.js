const bcrypt = require('bcryptjs');

class User {
    static async create(userData, client) {
        const { email, mot_de_passe, pseudo, role, langue } = userData;
        const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
        const query = `
            INSERT INTO utilisateurs (email, password, pseudo, role, accepte_cgu, langue)
            VALUES ($1, $2, $3, $4, false, $5) RETURNING id_utilisateur as id, email, pseudo, role, date_inscription, accepte_cgu, langue;
        `;
        const values = [email, hashedPassword, pseudo, role, langue || 'fr'];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async findByEmail(identifier, client) {
        // Recherche par email OU pseudo
        const query = `SELECT id_utilisateur as id, email, password as mot_de_passe, pseudo, role, date_inscription, accepte_cgu, langue FROM utilisateurs WHERE email = $1 OR pseudo = $1`;
        const values = [identifier];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async findById(id, client) {
        const query = `SELECT id_utilisateur as id, email, pseudo, role, date_inscription, accepte_cgu, langue, profil_public FROM utilisateurs WHERE id_utilisateur = $1`;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async findAllAdmin(client) {
        const query = `
            SELECT id_utilisateur as id, pseudo, email, role, date_inscription 
            FROM utilisateurs 
            ORDER BY date_inscription DESC
        `;
        const res = await client.query(query);
        return res.rows;
    }

    static async update(id, userData, client) {
        const { email, mot_de_passe, pseudo, accepte_cgu, langue, profil_public } = userData;
        
        let query = 'UPDATE utilisateurs SET ';
        const values = [];
        let index = 1;

        if (email) {
            query += `email = $${index}, `;
            values.push(email);
            index++;
        }
        if (pseudo) {
            query += `pseudo = $${index}, `;
            values.push(pseudo);
            index++;
        }
        if (mot_de_passe) {
            const hashedPassword = await bcrypt.hash(mot_de_passe, 10);
            query += `password = $${index}, `;
            values.push(hashedPassword);
            index++;
        }
        if (accepte_cgu !== undefined) {
            query += `accepte_cgu = $${index}, `;
            values.push(accepte_cgu);
            index++;
        }
        if (langue !== undefined) {
            query += `langue = $${index}, `;
            values.push(langue);
            index++;
        }
        if (profil_public !== undefined) {
            query += `profil_public = $${index}, `;
            values.push(profil_public);
            index++;
        }

        // Remove trailing comma and space
        query = query.slice(0, -2);

        query += ` WHERE id_utilisateur = $${index} RETURNING id_utilisateur as id, email, pseudo, role, date_inscription, accepte_cgu, langue, profil_public`;
        values.push(id);

        const res = await client.query(query, values);
        return res.rows[0];
    }
    static async delete(id, client) {
        const query = `
            DELETE FROM utilisateurs
            WHERE id_utilisateur = $1
            RETURNING id_utilisateur as id, email, pseudo, role, date_inscription;
        `;
        const values = [id];
        const res = await client.query(query, values);
        return res.rows[0];
    }

    static async deleteAllRelatedData(userId, client) {
        // Supprimer la Mascotte
        await client.query('DELETE FROM mascotte WHERE id_utilisateur = $1', [userId]);
        
        // Supprimer les Records (Historique)
        await client.query('DELETE FROM record WHERE id_utilisateur = $1', [userId]);
        
        // Supprimer les Participations aux événements
        await client.query('DELETE FROM participation WHERE id_utilisateur = $1', [userId]);
        
        // Supprimer les scores de classement
        await client.query('DELETE FROM classement_user WHERE id_utilisateur = $1', [userId]);

        // Supprimer le Profil (Déclenche la suppression en cascade des programmes si configuré en DB)
        await client.query('DELETE FROM profil WHERE id_utilisateur = $1', [userId]);
    }

    static async findByEmailForReset(email, client) {
        const query = `
            SELECT id_utilisateur as id, email, reset_token, reset_token_expires, langue
            FROM utilisateurs WHERE email = $1
        `;
        const res = await client.query(query, [email]);
        return res.rows[0];
    }

    static async setResetToken(email, hashedToken, expires, client) {
        const query = `
            UPDATE utilisateurs
            SET reset_token = $1, reset_token_expires = $2
            WHERE email = $3
        `;
        await client.query(query, [hashedToken, expires, email]);
    }

    static async clearResetToken(id, newHashedPassword, client) {
        const query = `
            UPDATE utilisateurs
            SET password = $1, reset_token = NULL, reset_token_expires = NULL
            WHERE id_utilisateur = $2
        `;
        await client.query(query, [newHashedPassword, id]);
    }

    static async searchByPseudo(query, excludeUserId, client) {
        const sql = `
            SELECT id_utilisateur as id, pseudo 
            FROM utilisateurs 
            WHERE pseudo ILIKE $1 AND id_utilisateur <> $2
            LIMIT 10
        `;
        const result = await client.query(sql, [`%${query}%`, excludeUserId]);
        return result.rows;
    }
}

module.exports = User;