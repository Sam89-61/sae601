const  SessionRepasController = require('../controllers/sessionRepasController');
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { sessionRepasValidator, idValidator } = require('../middleware/validators');
const sessionRepasController = new SessionRepasController();
router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: SessionRepas
 *   description: Gestion des sessions de repas
 */

/**
 * @swagger
 * /api/sessionRepas/create:
 *   post:
 *     summary: Créer une nouvelle session de repas
 *     tags: [SessionRepas]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id_programme_alimentaire
 *               - nom
 *               - type_repas
 *             properties:
 *               id_programme_alimentaire:
 *                 type: integer
 *               nom:
 *                 type: string
 *               type_repas:
 *                 type: string
 *               date_repas:
 *                 type: string
 *                 format: date
 *               heure_repas:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session de repas créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', sessionRepasValidator.create, (req, res, next) => sessionRepasController.create(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/update/{id}:
 *   put:
 *     summary: Mettre à jour une session de repas
 *     tags: [SessionRepas]
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
 *               type_repas:
 *                 type: string
 *               date_repas:
 *                 type: string
 *                 format: date
 *               heure_repas:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Session de repas mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Session de repas non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', sessionRepasValidator.update, (req, res, next) => sessionRepasController.update(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/delete/{id}:
 *   delete:
 *     summary: Supprimer une session de repas
 *     tags: [SessionRepas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session de repas supprimée avec succès
 *       404:
 *         description: Session de repas non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', sessionRepasValidator.delete, (req, res, next) => sessionRepasController.delete(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/programmeAlimentaire/{id}:
 *   get:
 *     summary: Récupérer les sessions de repas d'un programme alimentaire
 *     tags: [SessionRepas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des sessions de repas
 *       404:
 *         description: Programme alimentaire non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.get('/programmeAlimentaire/:id', idValidator, (req, res, next) => sessionRepasController.getByIdProgrammeAli(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/plat/add/{id}:
 *   post:
 *     summary: Ajouter un plat à une session de repas
 *     tags: [SessionRepas]
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
 *               - type_element
 *               - id_element
 *               - ordre
 *               - quantite
 *             properties:
 *               type_element:
 *                 type: string
 *                 enum: [entree, plat, dessert]
 *               id_element:
 *                 type: integer
 *               ordre:
 *                 type: integer
 *               quantite:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Plat ajouté avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/plat/add/:id', sessionRepasValidator.addPlat, (req, res, next) => sessionRepasController.addPlatToSession(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/plat/update/{id}:
 *   put:
 *     summary: Mettre à jour un plat dans une session de repas
 *     tags: [SessionRepas]
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
 *               id_session_repas:
 *                 type: integer
 *               type_element:
 *                 type: string
 *                 enum: [entree, plat, dessert]
 *               id_element:
 *                 type: integer
 *               ordre:
 *                 type: integer
 *               quantite:
 *                 type: number
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Plat mis à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Plat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.put('/plat/update/:id', sessionRepasValidator.updatePlat, (req, res, next) => sessionRepasController.updateSessionRepasPlat(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/plat/delete/{id}:
 *   delete:
 *     summary: Supprimer un plat d'une session de repas
 *     tags: [SessionRepas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Plat supprimé avec succès
 *       404:
 *         description: Plat non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.delete('/plat/delete/:id', sessionRepasValidator.deletePlat, (req, res, next) => sessionRepasController.deleteSessionRepasPlat(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/plat/{id}:
 *   get:
 *     summary: Récupérer les plats d'une session de repas
 *     tags: [SessionRepas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des plats
 *       404:
 *         description: Session de repas non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/plat/:id', idValidator, (req, res, next) => sessionRepasController.getPlatsBySessionRepasId(req, res, next));

/**
 * @swagger
 * /api/sessionRepas/details/:id:
 *   get:
 *     summary: Récupérer les détails complets d'une session de repas (méta + plats)
 *     tags: [SessionRepas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Session et liste détaillée des plats
 */
router.get('/details/:id', idValidator, (req, res, next) => sessionRepasController.getSessionDetails(req, res, next));

module.exports = router;