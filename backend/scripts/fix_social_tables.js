const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fixSocialTables() {
  const client = await pool.connect();
  try {
    console.log('Correction des tables notifications et messages...');
    
    // Notifications
    await client.query(`CREATE SEQUENCE IF NOT EXISTS notifications_id_notification_seq;`);
    await client.query(`
      ALTER TABLE public.notifications 
      ALTER COLUMN id_notification SET DEFAULT nextval('notifications_id_notification_seq'::regclass);
    `);
    await client.query(`
      SELECT setval('notifications_id_notification_seq', COALESCE((SELECT MAX(id_notification) FROM notifications), 0) + 1);
    `);

    // Messages
    await client.query(`CREATE SEQUENCE IF NOT EXISTS messages_id_message_seq;`);
    await client.query(`
      ALTER TABLE public.messages 
      ALTER COLUMN id_message SET DEFAULT nextval('messages_id_message_seq'::regclass);
    `);
    await client.query(`
      SELECT setval('messages_id_message_seq', COALESCE((SELECT MAX(id_message) FROM messages), 0) + 1);
    `);

    console.log('✅ Tables sociales corrigées avec succès.');
  } catch (err) {
    console.error('❌ Erreur lors de la correction:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

fixSocialTables();
