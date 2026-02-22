const express = require('express');
const router = express.Router();
const modeleSeanceController = require('../controllers/modeleSeanceController');
const { authenticateToken } = require('../middleware/auth');
const { modeleSeanceValidators, idValidator } = require('../middleware/validators');

// Protection globale : Toutes les routes nécessitent une authentification
router.use(authenticateToken);

// Routes pour les modèles de séance
router.get('/', modeleSeanceController.getAllModeles);
router.get('/:id', idValidator, modeleSeanceController.getModeleById);
router.get('/:id/exos', idValidator, modeleSeanceController.getModeleExos);
router.post('/', modeleSeanceValidators.create, modeleSeanceController.createModele);
router.post('/exo', modeleSeanceValidators.addExo, modeleSeanceController.addExoToModele);

module.exports = router;
