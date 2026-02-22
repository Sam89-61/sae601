const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function migrate() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(`
      ALTER TABLE utilisateurs
        ADD COLUMN IF NOT EXISTS reset_token VARCHAR(128),
        ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_utilisateurs_reset_token
        ON utilisateurs(reset_token) WHERE reset_token IS NOT NULL;
    `);

    await client.query('COMMIT');
    console.log('✅ Migration reset_token effectuée avec succès');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('❌ Erreur lors de la migration:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

migrate()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
