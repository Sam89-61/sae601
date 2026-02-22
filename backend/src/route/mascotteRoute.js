const express = require('express');
const router = express.Router();
const MascotteController = require('../controllers/mascotteController');
const { authenticateToken } = require('../middleware/auth');
const { mascotteValidators, idValidator, userIdValidator } = require('../middleware/validators');

const mascotteController = new MascotteController();

router.use(authenticateToken);

/**
 * @swagger
 * tags:
 *   name: Mascotte
 *   description: Gestion de la mascotte de l'utilisateur
 */

/**
 * @swagger
 * /api/mascotte/create:
 *   post:
 *     summary: Créer une nouvelle mascotte
 *     tags: [Mascotte]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nom
 *               - id_utilisateur
 *             properties:
 *               nom:
 *                 type: string
 *               id_utilisateur:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Mascotte créée avec succès
 *       400:
 *         description: Erreur de validation
 *       500:
 *         description: Erreur serveur
 */
router.post('/create', mascotteValidators.create, (req, res, next) => mascotteController.createMascotte(req, res));

/**
 * @swagger
 * /api/mascotte/update/{id}:
 *   put:
 *     summary: Mettre à jour une mascotte
 *     tags: [Mascotte]
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
 *         description: Mascotte mise à jour avec succès
 *       400:
 *         description: Erreur de validation
 *       404:
 *         description: Mascotte non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.put('/update/:id', mascotteValidators.create, (req, res, next) => mascotteController.updateMascotte(req, res));

/**
 * @swagger
 * /api/mascotte/delete/{id}:
 *   delete:
 *     summary: Supprimer une mascotte
 *     tags: [Mascotte]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mascotte supprimée avec succès
 *       404:
 *         description: Mascotte non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.delete('/delete/:id', idValidator, (req, res, next) => mascotteController.deleteMascotte(req, res));

/**
 * @swagger
 * /api/mascotte/getByUser/{id_utilisateur}:
 *   get:
 *     summary: Récupérer la mascotte d'un utilisateur
 *     tags: [Mascotte]
 *     parameters:
 *       - in: path
 *         name: id_utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Mascotte de l'utilisateur
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 nom:
 *                   type: string
 *                 niveau:
 *                   type: integer
 *                 experience:
 *                   type: integer
 *                 id_utilisateur:
 *                   type: integer
 *       404:
 *         description: Mascotte non trouvée
 *       500:
 *         description: Erreur serveur
 */
router.get('/getByUser/:id_utilisateur', userIdValidator, (req, res, next) => mascotteController.getMascotteByUserId(req, res));

/**
 * @swagger
 * /api/mascotte/badges/{id_utilisateur}:
 *   get:
 *     summary: Récupérer les badges d'un utilisateur
 *     tags: [Mascotte]
 *     parameters:
 *       - in: path
 *         name: id_utilisateur
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Liste des badges de l'utilisateur
 *       500:
 *         description: Erreur serveur
 */
router.get('/badges/:id_utilisateur', userIdValidator, (req, res, next) => mascotteController.getUserBadges(req, res));

module.exports = router;

