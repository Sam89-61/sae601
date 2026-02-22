const express = require('express');
const router = express.Router();
const EvolutionController = require('../controllers/evolutionController');
const evolutionController = new EvolutionController();
const { authenticateToken } = require('../middleware/auth');
const { evolutionValidators, idValidator, idExoValidator } = require('../middleware/validators');

router.use(authenticateToken); // Toutes les routes d'évolution nécessitent une authentification

router.get('/stats', evolutionController.getStats);
router.get('/activity-calendar', evolutionController.getActivityCalendar);
router.post('/poids', evolutionValidators.addPoids, evolutionController.addPoids);
router.post('/record', evolutionValidators.addRecord, evolutionController.addRecord);
router.delete('/record/:id', evolutionValidators.deleteRecord, evolutionController.deleteRecord);
router.get('/record/:idExo', idExoValidator, evolutionController.getRecordProgression);

module.exports = router;
