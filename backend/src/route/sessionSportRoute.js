const sessionSportController = require('../controllers/sessionSportController');
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sessionSportValidator, idValidator } = require('../middleware/validators');
const SessionSportController = new sessionSportController();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: SessionSport
 *   description: Gestion des sessions de sport
 */

/**
 * @swagger
 * /api/sessionSport/create:
 *   post:
 *     summary: Créer une nouvelle session de sport
 *     tags: [SessionSport]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_programme_sportif
 *               - nom
 *             properties:
 *               id_programme_sportif:
 *                 type: integer
 *               nom:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session de sport créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', sessionSportValidator.create, (req, res, next) => SessionSportController.createSessionSport(req, res, next));

/**
 * @swagger
 * /api/sessionSport/update/{id}:
 *   put:
 *     summary: Mettre à jour une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session de sport mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Session de sport non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', sessionSportValidator.update, (req, res, next) => SessionSportController.updateSessionSport(req, res, next));

/**
 * @swagger
 * /api/sessionSport/delete/{id}:
 *   delete:
 *     summary: Supprimer une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session de sport supprimée avec succès
 *       404:
 *         description: Session de sport non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', sessionSportValidator.delete, (req, res, next) => SessionSportController.deleteSessionSport(req, res, next));

/**
 * @swagger
 * /api/sessionSport/exo/add/{id}:
 *   post:
 *     summary: Ajouter un exercice à une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_exo
 *               - series
 *               - repetitions
 *               - poids
 *             properties:
 *               id_exo:
 *                 type: integer
 *               series:
 *                 type: integer
 *               repetitions:
 *                 type: integer
 *               poids:
 *                 type: number
 *     responses:
 *       201:
 *         description: Exercice ajouté avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/exo/add/:id', sessionSportValidator.add, (req, res, next) => SessionSportController.addExosToSession(req, res, next));

/**
 * @swagger
 * /api/sessionSport/exo/update/{id}:
 *   put:
 *     summary: Mettre à jour un exercice dans une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               series:
 *                 type: integer
 *               repetitions:
 *                 type: integer
 *               poids:
 *                 type: number
 *     responses:
 *       200:
 *         description: Exercice mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/exo/update/:id', sessionSportValidator.exoUpdate, (req, res, next) => SessionSportController.updateSessionSportExo(req, res, next));

/**
 * @swagger
 * /api/sessionSport/exo/delete/{id}:
 *   delete:
 *     summary: Supprimer un exercice d'une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Exercice supprimé avec succès
 *       404:
 *         description: Exercice non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/exo/delete/:id', sessionSportValidator.exoDelete, (req, res, next) => SessionSportController.deleteSessionSportExo(req, res, next));

/**
 * @swagger
 * /api/sessionSport/exo/{id}:
 *   get:
 *     summary: Récupérer les exercices d'une session de sport
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des exercices
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   id_session_sport:
 *                     type: integer
 *                   id_exo:
 *                     type: integer
 *                   series:
 *                     type: integer
 *                   repetitions:
 *                     type: integer
 *                   poids:
 *                     type: number
 *       404:
 *         description: Session de sport non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/exo/:id', idValidator, (req, res, next) => SessionSportController.getExosBySessionSportId(req, res, next));

/**
 * @swagger
 * /api/sessionSport/details/{id}:
 *   get:
 *     summary: Récupérer les détails complets d'une session (avec exercices enrichis)
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Détails de la session récupérés
 *       404:
 *         description: Session non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/details/:id', idValidator, (req, res, next) => SessionSportController.getSessionDetails(req, res, next));

/**
 * @swagger
 * /api/sessionSport/{id}/complete:
 *   put:
 *     summary: Marquer une session comme réalisée (terminée)
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session marquée comme réalisée
 *       404:
 *         description: Session non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/:id/complete', idValidator, (req, res, next) => SessionSportController.completeSession(req, res, next));

/**
 * @swagger
 * /api/sessionSport/complete-free/{id}:
 *   put:
 *     summary: Créer et terminer une séance libre à partir d'un modèle
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Séance libre enregistrée
 *       404:
 *         description: Modèle non trouvé
 */
router.put('/complete-free/:id', idValidator, (req, res, next) => SessionSportController.completeFreeSession(req, res, next));

/**
 * @swagger
 * /api/sessionSport/last-completion/{id}:
 *   get:
 *     summary: Récupérer la dernière fois qu'un modèle de séance a été réalisé
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dernière complétion récupérée
 */
router.get('/last-completion/:id', idValidator, (req, res, next) => SessionSportController.getLastCompletionForModel(req, res, next));

/**
 * @swagger
 * /api/sessionSport/complete-community/{id}:
 *   put:
 *     summary: Créer et terminer une séance communautaire
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Séance communautaire enregistrée
 *       404:
 *         description: Session non trouvée
 */
router.put('/complete-community/:id', idValidator, (req, res, next) => SessionSportController.completeCommunitySession(req, res, next));

/**
 * @swagger
 * /api/sessionSport/community-last-completion/{id}:
 *   get:
 *     summary: Récupérer la dernière fois qu'une session communautaire a été réalisée
 *     tags: [SessionSport]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Dernière complétion récupérée
 */
router.get('/community-last-completion/:id', idValidator, (req, res, next) => SessionSportController.getLastCompletionForCommunitySession(req, res, next));

module.exports = router;