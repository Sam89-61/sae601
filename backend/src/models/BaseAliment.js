const { pool } = require('../config/database');

class BaseAliment {
    static tableName = '';
    static primaryKey = '';

    static async create(data, client) {
        const { nom, description, recette, ingredients, portion_gramme, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif, moment_repas } = data;
        const query = `
            INSERT INTO ${this.tableName} (nom, description, recette, ingredients, portion_gramme, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif, moment_repas)
            VALUES ($1, $2, $3, $4::json, $5, $6, $7, $8, $9, $10::json, $11, $12, $13::jsonb)
            RETURNING *;
        `;
        const values = [nom, description, recette, JSON.stringify(ingredients || []), portion_gramme, calorie, proteine, glucide, lipide, JSON.stringify(restrictions_alimentaires || []), regime_alimentaire, objectif, JSON.stringify(moment_repas || [])];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async findById(id, client) {
        const query = `SELECT * FROM ${this.tableName} WHERE ${this.primaryKey} = $1`;
        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    static async update(id, data, client) {
        const { nom, description, recette, ingredients, portion_gramme, calorie, proteine, glucide, lipide, restrictions_alimentaires, regime_alimentaire, objectif, moment_repas } = data;
        const query = `
            UPDATE ${this.tableName} 
            SET nom = $1, description = $2, recette = $3, ingredients = $4::json, portion_gramme = $5, calorie = $6, proteine = $7, glucide = $8, lipide = $9, 
                restrictions_alimentaires = $10::json, regime_alimentaire = $11, objectif = $12, moment_repas = $13::jsonb
            WHERE ${this.primaryKey} = $14
            RETURNING *;
        `;
        const values = [nom, description, recette, JSON.stringify(ingredients || []), portion_gramme, calorie, proteine, glucide, lipide, JSON.stringify(restrictions_alimentaires), regime_alimentaire, objectif, JSON.stringify(moment_repas), id];
        const result = await client.query(query, values);
        return result.rows[0];
    }

    static async delete(id, client) {
        const query = `DELETE FROM ${this.tableName} WHERE ${this.primaryKey} = $1 RETURNING *;`;
        const result = await client.query(query, [id]);
        return result.rows[0];
    }

    static async findAll(client) {
        const query = `SELECT * FROM ${this.tableName}`;
        const result = await client.query(query);
        return result.rows;
    }

    static async findCompatible(caloriesMax, alimentsInterdits = [], momentRepas = null, client) {
        let query = `SELECT * FROM ${this.tableName} WHERE calorie <= $1`;
        const values = [caloriesMax];

        if (alimentsInterdits && alimentsInterdits.length > 0) {
            query += ` 
                AND (
                    restrictions_alimentaires IS NULL 
                    OR NOT EXISTS (
                        SELECT 1 FROM jsonb_array_elements_text(restrictions_alimentaires::jsonb) AS restriction
                        WHERE restriction = ANY($${values.length + 1}::text[])
                    )
                )
            `;
            values.push(alimentsInterdits);
        }

        if (momentRepas) {
            query += ` AND (moment_repas IS NULL OR moment_repas::jsonb @> $${values.length + 1}::jsonb)`;
            values.push(JSON.stringify([momentRepas]));
        }

        query += ` ORDER BY RANDOM() LIMIT 1`;
        const result = await client.query(query, values);
        return result.rows[0] || null;
    }
}

module.exports = BaseAliment;
