const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function forceSync() {
  const client = await pool.connect();
  try {
    const tables = [
      { t: 'notifications', id: 'id_notification', s: 'notifications_id_notification_seq' },
      { t: 'amis', id: 'id_relation', s: 'amis_id_relation_seq' },
      { t: 'messages', id: 'id_message', s: 'messages_id_message_seq' }
    ];

    for (const item of tables) {
      const maxRes = await client.query(`SELECT MAX(${item.id}) FROM ${item.t}`);
      const maxId = maxRes.rows[0].max || 0;
      // On règle la séquence au MAX + 1 pour être absolument sûr
      await client.query(`SELECT setval('${item.s}', ${maxId + 10}, true)`);
      console.log(`Table ${item.t}: Max ID = ${maxId}, Séquence réglée à ${maxId + 10}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

forceSync();
