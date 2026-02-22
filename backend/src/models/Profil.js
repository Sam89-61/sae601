class Profil {

    static async create(profilData, dbClient) {
        const {
            age, taille, poids, niveau, frequence, sexe, jour_disponible,
            heure_disponible,
            id_equipement, id_utilisateur, objectif_id,
            id_information_sante, regime_id
        } = profilData;

        const query = `
            INSERT INTO profil (
                 age, taille, poids, niveau, frequence,sexe,jour_disponible,
      heure_disponible,
                id_equipement, id_utilisateur, objectif_id,
                id_information_sante, regime_id
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING *
        `;

        const values = [
            age, taille, poids, niveau, frequence, sexe, jour_disponible,
            heure_disponible,
            id_equipement, id_utilisateur, objectif_id,
            id_information_sante, regime_id
        ];

        const result = await dbClient.query(query, values);
        return result.rows[0];
    }

    static async update(id_profil, profilData, dbClient) {
        const {
            age, taille, poids, niveau, frequence, sexe, jour_disponible, heure_disponible, id_equipement, objectif_id,
            id_information_sante, regime_id
        } = profilData;
        const query = `
            UPDATE profil 
            SET age = $1, taille = $2, poids = $3, niveau = $4, frequence = $5, sexe = $6, jour_disponible = $7,
            heure_disponible = $8, id_equipement = $9, objectif_id = $10, id_information_sante = $11, regime_id = $12
            WHERE id_profil = $13
            RETURNING *
        `;
        const values = [
            age, taille, poids, niveau, frequence, sexe, jour_disponible, heure_disponible,
            id_equipement, objectif_id,
            id_information_sante, regime_id,
            id_profil
        ];
        const result = await dbClient.query(query, values);
        return result.rows[0];
    }


    static async findById(id_profil, dbClient) {
        const query = 'SELECT * FROM profil WHERE id_profil = $1';
        const result = await dbClient.query(query, [id_profil]);
        return result.rows[0];
    }

    static async findByUserId(id_utilisateur, dbClient) {
        const query = 'SELECT * FROM profil WHERE id_utilisateur = $1';
        const result = await dbClient.query(query, [id_utilisateur]);
        return result.rows;
    }
    static async findEquipementId(id_profil, dbClient) {
        const query = 'SELECT id_equipement FROM profil WHERE id_profil = $1';
        const result = await dbClient.query(query, [id_profil]);
        return result.rows[0];
    }
    static async findObjectifId(id_profil, dbClient) {
        const query = 'SELECT objectif_id FROM profil WHERE id_profil = $1';
        const result = await dbClient.query(query, [id_profil]);
        return result.rows[0];
    }
    static async findRegimeId(id_profil, dbClient) {
        const query = 'SELECT regime_id FROM profil WHERE id_profil = $1';
        const result = await dbClient.query(query, [id_profil]);
        return result.rows[0];
    }

    static async isOwnedByUser(id_profil, id_utilisateur, client) {
        const query = 'SELECT 1 FROM profil WHERE id_profil = $1 AND id_utilisateur = $2';
        const result = await client.query(query, [id_profil, id_utilisateur]);
        return result.rows.length > 0;
    }
    static async findInfoSanteId(id_profil, dbClient) {
        const query = 'SELECT id_information_sante FROM profil WHERE id_profil = $1';
        const result = await dbClient.query(query, [id_profil]);
        return result.rows[0];
    }



    static async delete(id_profil, dbClient) {
        const query = 'DELETE FROM profil WHERE id_profil = $1 RETURNING *';
        const result = await dbClient.query(query, [id_profil]);
        return result.rows[0];
    }

    static async updateWeight(userId, poids, dbClient) {
        const query = 'UPDATE profil SET poids = $1 WHERE id_utilisateur = $2';
        await dbClient.query(query, [poids, userId]);
    }

}

module.exports = Profil;