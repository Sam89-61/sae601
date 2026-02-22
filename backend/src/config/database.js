const { Pool } = require('pg');
require('dotenv').config();

// Créer un pool de connexions au lieu d'un client unique
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Configuration optionnelle du pool
    max: 20, // Nombre maximum de connexions dans le pool (défaut: 10)
    idleTimeoutMillis: 30000, // Temps avant de fermer une connexion inactive
    connectionTimeoutMillis: 5000, // Temps maximum pour établir une connexion (augmenté de 2s à 5s)
    query_timeout: 10000, // Timeout pour les requêtes (10 secondes)
});

// Tester la connexion au démarrage
pool.connect()
    .then(client => {
        client.release();
    })
    .catch(err => console.error('❌ Erreur de connexion à la DB:', err));

pool.on('error', (err) => {
    console.error('❌ Erreur inattendue du pool PostgreSQL:', err);
});

module.exports = { pool };