const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { authValidators } = require('../middleware/validators');

const authController = new AuthController();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - pseudo
 *               - email
 *               - mot_de_passe
 *             properties:
 *               pseudo:
 *                 type: string
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [utilisateur, admin]
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Erreur de validation ou email déjà existant
 *       500:
 *         description: Erreur serveur
 */
router.post('/register', authValidators.register, (req, res, next) => authController.register(req, res, next));
/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - mot_de_passe
 *             properties:
 *               email:
 *                 type: string
 *               mot_de_passe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Jeton JWT pour l'authentification
 *       400:
 *         description: Erreur de validation ou utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */
router.post('/login', authValidators.login, (req, res, next) => authController.login(req, res, next));

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Email envoyé (même si le compte n'existe pas)
 */
router.post('/forgot-password', authValidators.forgotPassword, (req, res, next) => authController.forgotPassword(req, res, next));

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialisation du mot de passe avec token
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *               - nouveau_mot_de_passe
 *             properties:
 *               email:
 *                 type: string
 *               token:
 *                 type: string
 *               nouveau_mot_de_passe:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 */
router.post('/reset-password', authValidators.resetPassword, (req, res, next) => authController.resetPassword(req, res, next));

/**
 * @swagger
 * /api/auth/update:
 *   put:
 *     summary: Mise à jour du profil utilisateur (Pseudo, Email, Mot de passe)
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               pseudo:
 *                 type: string
 *               email:
 *                 type: string
 *               currentPassword:
 *                 type: string
 *                 description: Requis si modification du mot de passe
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *       400:
 *         description: Erreur de validation
 *       401:
 *         description: Non authentifié
 */
router.put('/update', authenticateToken, authValidators.updateUser, (req, res, next) => authController.updateUser(req, res, next));

/**
 * @swagger
 * /api/auth/delete:
 *   delete:
 *     summary: Suppression du compte utilisateur
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Compte supprimé avec succès
 *       401:
 *         description: Non authentifié
 */
router.delete('/delete', authenticateToken, (req, res, next) => authController.deleteUser(req, res, next));

router.put('/accept-cgu', authenticateToken, (req, res, next) => authController.acceptCgu(req, res, next));

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion de l'utilisateur
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.post('/logout', (req, res) => authController.logout(req, res));

/**
 * @swagger
 * /api/auth/verify:
 *   get:
 *     summary: Vérifier si l'utilisateur est authentifié
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur authentifié
 *       401:
 *         description: Non authentifié
 */
router.get('/verify', authenticateToken, (req, res) => authController.verify(req, res));

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Récupérer les informations de l'utilisateur connecté
 *     tags: [Authentification]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Informations utilisateur
 *       401:
 *         description: Non authentifié
 */
router.get('/me', authenticateToken, (req, res, next) => authController.me(req, res, next));

module.exports = router;