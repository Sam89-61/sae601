const {pool} = require('../config/database');
class Programme_sportif {

    static async create(programmeData,client) {
        const { nom,description,id_programme } = programmeData;
        const query = `
            INSERT INTO programme_sportif (nom, description, id_programme)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [nom, description, id_programme];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async findById(id_programme, client) {
        const query = 'SELECT * FROM programme_sportif WHERE id_programme = $1';
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async update(id_programme_sportif, programmeData, client) {
        const { nom,description,id_programme } = programmeData;
        const query = `
            UPDATE programme_sportif set nom = $1, description = $2, id_programme = $3
            WHERE id_programme_sportif = $4
            RETURNING *;
        `;
        const values = [nom, description, id_programme, id_programme_sportif];
        const result = await client.query(query, values);
        return result.rows[0];
    }
    static async delete(id_programme_sportif, client) {
        const query = `
            DELETE FROM programme_sportif
            WHERE id_programme_sportif = $1
            RETURNING *;
        `;
        const result = await client.query(query, [id_programme_sportif]);
        return result.rows[0];
    }
    static async findByProgrammeId(id_programme, client) {
        const query = 'SELECT * FROM programme_sportif WHERE id_programme = $1';
        const result = await client.query(query, [id_programme]);
        return result.rows[0];
    }
    static async findAll(client) {
        const query = 'SELECT * FROM programme_sportif';
        const result = await client.query(query);
        return result.rows;
    }

    static async isOwnedByUser(id_programme_sportif, id_utilisateur, client) {
        const query = `
            SELECT 1 FROM programme_sportif ps
            JOIN programme p ON ps.id_programme = p.id_programme
            JOIN profil pr ON p.id_profil = pr.id_profil
            WHERE ps.id_programme_sportif = $1 AND pr.id_utilisateur = $2
        `;
        const result = await client.query(query, [id_programme_sportif, id_utilisateur]);
        return result.rows.length > 0;
    }
}


module.exports = Programme_sportif;
