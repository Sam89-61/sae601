const { pool } = require('../config/database');

class Badge {
    static async findAll(client) {
        const query = 'SELECT * FROM badges ORDER BY id_badge ASC';
        const res = await (client || pool).query(query);
        return res.rows;
    }

    static async findByConditionType(conditionType, client) {
        const query = 'SELECT * FROM badges WHERE condition_type = $1';
        const res = await (client || pool).query(query, [conditionType]);
        return res.rows[0];
    }

    static async findById(id, client) {
        const query = 'SELECT * FROM badges WHERE id_badge = $1';
        const res = await (client || pool).query(query, [id]);
        return res.rows[0];
    }
}

module.exports = Badge;
