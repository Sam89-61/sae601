const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function syncAllSequences() {
  const client = await pool.connect();
  try {
    console.log('Resynchronisation globale des séquences...');
    
    const tables = [
      { table: 'utilisateurs', id: 'id_utilisateur', seq: 'utilisateurs_id_utilisateur_seq' },
      { table: 'amis', id: 'id_relation', seq: 'amis_id_relation_seq' },
      { table: 'notifications', id: 'id_notification', seq: 'notifications_id_notification_seq' },
      { table: 'messages', id: 'id_message', seq: 'messages_id_message_seq' },
      { table: 'evenement', id: 'id_evenement', seq: 'evenement_id_evenement_seq' },
      { table: 'exos', id: 'id', seq: 'exos_id_seq' },
      { table: 'record', id: 'id_record', seq: 'record_id_record_seq' },
      { table: 'profil', id: 'id_profil', seq: 'profil_id_profil_seq' },
      { table: 'session_sport', id: 'id_session_sport', seq: 'session_sport_id_session_sport_seq' },
      { table: 'session_repas', id: 'id_session_repas', seq: 'session_repas_id_session_repas_seq' }
    ];

    for (const item of tables) {
      try {
        const res = await client.query(`SELECT MAX(${item.id}) as max_id FROM ${item.table}`);
        const maxId = res.rows[0].max_id || 0;
        
        // setval avec le max actuel. Le prochain nextval() renverra maxId + 1
        await client.query(`SELECT setval('${item.seq}', ${maxId})`);
        console.log(`✅ Séquence ${item.seq} synchronisée sur ${maxId}`);
      } catch (e) {
        console.warn(`⚠️ Impossible de synchroniser ${item.seq} (la table ou la séquence n'existe peut-être pas encore)`);
      }
    }

    console.log('🎉 Synchronisation terminée.');
  } catch (err) {
    console.error('❌ Erreur fatale:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

syncAllSequences();
