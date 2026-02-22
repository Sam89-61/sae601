const express = require('express');
const router = express.Router();
const ProgrammeController = require('../controllers/programmeController');
const { authenticateToken } = require('../middleware/auth');
const { programmeValidator, idValidator } = require('../middleware/validators');
const programmeController = new ProgrammeController();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Programmes
 *   description: Gestion des programmes
 */

// --- ROUTES STATIQUES & CRÉATION ---

/**
 * @swagger
 * /api/programme/create:
 *   post:
 *     summary: Créer un nouveau programme
 *     tags: [Programmes]
 */
router.post('/create', programmeValidator.create, (req, res, next) => programmeController.createProgramme(req, res));

/**
 * @swagger
 * /api/programme/alimentaire/create:
 *   post:
 *     summary: Créer un nouveau programme alimentaire
 *     tags: [Programmes]
 */
router.post('/alimentaire/create', programmeValidator.createAlim, (req, res, next) => programmeController.createProgrammeAlimentaire(req, res));

/**
 * @swagger
 * /api/programme/sportif/create:
 *   post:
 *     summary: Créer un nouveau programme sportif
 *     tags: [Programmes]
 */
router.post('/sportif/create', programmeValidator.createSport, (req, res, next) => programmeController.createProgrammeSportif(req, res));

/**
 * @swagger
 * /api/programme/mon-programme:
 *   get:
 *     summary: Récupérer le programme complet de l'utilisateur connecté (Programme + Sport + Sessions)
 *     tags: [Programmes]
 */
router.get('/mon-programme', (req, res, next) => programmeController.getMyProgramme(req, res));

// --- ROUTES GÉNÉRATION ---

/**
 * @swagger
 * /api/programme/generate/{id_profil}:
 *   post:
 *     summary: Générer un programme complet automatiquement
 *     tags: [Programmes]
 */
router.post('/generate/:id_profil', programmeValidator.generate, (req, res, next) => programmeController.generateAuto(req, res));

router.post('/adapt/:id_profil', programmeValidator.adapt, (req, res, next) => programmeController.adaptProgramme(req, res));


// --- ROUTES SPÉCIFIQUES (ALIMENTAIRE) ---

/**
 * @swagger
 * /api/programme/alimentaire/update/{id}:
 *   put:
 *     summary: Mettre à jour un programme alimentaire
 *     tags: [Programmes]
 */
router.put('/alimentaire/update/:id', programmeValidator.updateAlim, (req, res, next) => programmeController.updateProgrammeAlimentaire(req, res));

/**
 * @swagger
 * /api/programme/alimentaire/delete/{id}:
 *   delete:
 *     summary: Supprimer un programme alimentaire
 *     tags: [Programmes]
 */
router.delete('/alimentaire/delete/:id', idValidator, (req, res, next) => programmeController.deleteProgrammeAlimentaire(req, res));

/**
 * @swagger
 * /api/programme/alimentaire/{id}:
 *   get:
 *     summary: Récupérer un programme alimentaire par son ID
 *     tags: [Programmes]
 */
router.get('/alimentaire/:id', idValidator, (req, res, next) => programmeController.getProgrammeAlimentaireById(req, res));


// --- ROUTES SPÉCIFIQUES (SPORTIF) ---

/**
 * @swagger
 * /api/programme/sportif/update/{id}:
 *   put:
 *     summary: Mettre à jour un programme sportif
 *     tags: [Programmes]
 */
router.put('/sportif/update/:id', programmeValidator.updateSport, (req, res, next) => programmeController.updateProgrammeSportif(req, res));

/**
 * @swagger
 * /api/programme/sportif/delete/{id}:
 *   delete:
 *     summary: Supprimer un programme sportif
 *     tags: [Programmes]
 */
router.delete('/sportif/delete/:id', idValidator, (req, res, next) => programmeController.deleteProgrammeSportif(req, res));

/**
 * @swagger
 * /api/programme/sportif/{id}:
 *   get:
 *     summary: Récupérer un programme sportif par son ID
 *     tags: [Programmes]
 */
router.get('/sportif/:id', idValidator, (req, res, next) => programmeController.getProgrammeSportifById(req, res));


// --- ROUTES GÉNÉRIQUES (PROGRAMME) - À LA FIN ---

/**
 * @swagger
 * /api/programme/update/{id}:
 *   put:
 *     summary: Mettre à jour un programme
 *     tags: [Programmes]
 */
router.put('/update/:id', programmeValidator.update, (req, res, next) => programmeController.updateProgramme(req, res));

/**
 * @swagger
 * /api/programme/delete/{id}:
 *   delete:
 *     summary: Supprimer un programme
 *     tags: [Programmes]
 */
router.delete('/delete/:id', idValidator, (req, res, next) => programmeController.deleteProgramme(req, res));

/**
 * @swagger
 * /api/programme/{id}:
 *   get:
 *     summary: Récupérer un programme par son ID
 *     tags: [Programmes]
 */
router.get('/:id', idValidator, (req, res, next) => programmeController.getProgrammeById(req, res));

module.exports = router;

