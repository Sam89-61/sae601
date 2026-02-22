const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../middleware/auth');
const { sessionValidators } = require('../middleware/validators');
const sessionController = new SessionController();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Sessions Custom
 *   description: Gestion des séances custom communautaires
 */

// ============================================
// CRÉATION DE SÉANCES CUSTOM
// ============================================

/**
 * @swagger
 * /api/sessions/custom/sport/create:
 *   post:
 *     summary: Créer une séance sportive custom
 *     tags: [Sessions Custom]
 */
router.post('/custom/sport/create', sessionValidators.createCustomSport, (req, res, next) => sessionController.createCustomSportif(req, res));

/**
 * @swagger
 * /api/sessions/custom/repas/create:
 *   post:
 *     summary: Créer une séance repas custom
 *     tags: [Sessions Custom]
 */
router.post('/custom/repas/create', sessionValidators.createCustomRepas, (req, res, next) => sessionController.createCustomAlimentaire(req, res));

// ============================================
// RÉCUPÉRATION DES SÉANCES
// ============================================

/**
 * @swagger
 * /api/sessions/community:
 *   get:
 *     summary: Récupérer les séances publiques de la communauté
 *     tags: [Sessions Custom]
 */
router.get('/community', (req, res, next) => sessionController.getCommunitySessions(req, res));

/**
 * @swagger
 * /api/sessions/my-sessions:
 *   get:
 *     summary: Récupérer mes séances custom
 *     tags: [Sessions Custom]
 */
router.get('/my-sessions', (req, res, next) => sessionController.getMySessions(req, res));

// ============================================
// ACTIONS SUR LES SÉANCES
// ============================================

/**
 * @swagger
 * /api/sessions/{type}/{id}/copy:
 *   post:
 *     summary: Copier une séance
 *     tags: [Sessions Custom]
 */
router.post('/:type/:id/copy', sessionValidators.typeAndId, (req, res, next) => sessionController.copySession(req, res));

/**
 * @swagger
 * /api/sessions/{type}/{id}/like:
 *   post:
 *     summary: Like/Unlike une séance
 *     tags: [Sessions Custom]
 */
router.post('/:type/:id/like', sessionValidators.typeAndId, (req, res, next) => sessionController.toggleLike(req, res));

/**
 * @swagger
 * /api/sessions/{type}/{id}:
 *   get:
 *     summary: Récupérer les détails d'une séance custom
 *     tags: [Sessions Custom]
 */
router.get('/:type/:id', sessionValidators.typeAndId, (req, res, next) => sessionController.getSessionDetails(req, res));

/**
 * @swagger
 * /api/sessions/{type}/{id}:
 *   delete:
 *     summary: Supprimer une séance custom
 *     tags: [Sessions Custom]
 */
router.delete('/:type/:id', sessionValidators.typeAndId, (req, res, next) => sessionController.deleteSession(req, res));

/**
 * @swagger
 * /api/sessions/{type}/{id}:
 *   put:
 *     summary: Mettre à jour une séance custom
 *     tags: [Sessions Custom]
 */
router.put('/:type/:id', sessionValidators.updateSession, (req, res, next) => sessionController.updateSession(req, res));

module.exports = router;
