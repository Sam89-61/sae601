const crypto = require('crypto');

const errorHandler = (err, req, res, next) => {
    // Générer un ID unique pour tracer l'erreur dans les logs
    const errorId = crypto.randomBytes(8).toString('hex');

    // Logger l'erreur complète côté serveur avec l'errorId
    console.error(`[ERROR ${errorId}] ${err.stack}`);
    if (err.details) {
        console.error(`[ERROR ${errorId}] Details:`, err.details);
    }

    const status = err.status || 500;

    // Ne jamais exposer les détails techniques au client
    // Envoyer seulement un message générique et l'errorId pour traçabilité
    const message = status === 500
        ? 'Une erreur interne est survenue.'
        : err.message;

    res.status(status).json({
        message,
        errorId // Le client peut communiquer cet ID au support pour investigation
    });
};

module.exports = errorHandler;