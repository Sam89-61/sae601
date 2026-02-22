const defaultAuthService = require('../services/authService');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { withTransaction, withClient } = require('../utils/controllerWrapper');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const emailService = require('../services/emailService');

class AuthController {
    constructor(authService = defaultAuthService) {
        this.authService = authService;
    }

    register = withTransaction(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { user, token } = await this.authService.register(req.body, client);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            token, // Pour les clients mobiles (Capacitor) qui ne lisent pas les cookies
            user: { id: user.id, pseudo: user.pseudo, email: user.email, role: user.role, accepte_cgu: user.accepte_cgu, langue: user.langue }
        });
    });

    login = withClient(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { user, token } = await this.authService.login(req.body, client);

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(200).json({
            message: 'Connexion réussie',
            token, // Pour les clients mobiles (Capacitor) qui ne lisent pas les cookies
            user: { id: user.id, email: user.email, pseudo: user.pseudo, role: user.role, accepte_cgu: user.accepte_cgu, langue: user.langue }
        });
    });

    updateUser = withTransaction(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const userId = req.user.id;
        const { pseudo, email, currentPassword, newPassword, langue, profil_public } = req.body;

        const user = await User.findById(userId, client); // We need a findById that returns password... 
        // 
        const userWithPassword = await User.findByEmail(user.email, client); 

        if (!userWithPassword) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }

        const updateData = {};

        // 1. Handle Pseudo/Email Update
        if (pseudo && pseudo !== user.pseudo) {
             // Check if pseudo taken
             const existingUser = await User.findByEmail(pseudo, client);
             if (existingUser && existingUser.id !== userId) {
                 return res.status(400).json({ message: 'Ce pseudo est déjà utilisé' });
             }
             updateData.pseudo = pseudo;
        }

        if (email && email !== user.email) {
            // Check if email taken
             const existingUser = await User.findByEmail(email, client);
             if (existingUser && existingUser.id !== userId) {
                 return res.status(400).json({ message: 'Cet email est déjà utilisé' });
             }
            updateData.email = email;
        }

        // 2. Handle Password Update
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Le mot de passe actuel est requis pour changer de mot de passe' });
            }
            const isPasswordValid = await User.verifyPassword(currentPassword, userWithPassword.mot_de_passe);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
            }
            updateData.mot_de_passe = newPassword;
        }

        if (langue) {
            updateData.langue = langue;
        }
        if (profil_public !== undefined) {
            updateData.profil_public = profil_public;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(200).json({ message: 'Aucune modification détectée', user });
        }

        const updatedUser = await User.update(userId, updateData, client);
        
        res.status(200).json({
            message: 'Profil mis à jour avec succès',
            user: updatedUser
        });
    });

    deleteUser = withTransaction(async (req, res, client) => {
        const userId = req.user.id;

        // 1. Supprimer les dépendances directes
        await User.deleteAllRelatedData(userId, client);

        // 2. Supprimer l'utilisateur
        await User.delete(userId, client);
        
        res.status(200).json({ message: 'Compte supprimé avec succès' });
    });

    acceptCgu = withTransaction(async (req, res, client) => {
        const userId = req.user.id;
        const updatedUser = await User.update(userId, { accepte_cgu: true }, client);
        res.status(200).json({
            message: 'CGU acceptées avec succès',
            user: updatedUser
        });
    });

    logout = (req, res) => {
        // Supprimer le cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Déconnexion réussie' });
    };

    verify = (req, res) => {
        // Si authenticateToken middleware a passé, l'utilisateur est authentifié
        res.status(200).json({ authenticated: true });
    };

    me = withClient(async (req, res, client) => {
        const userId = req.user.id;
        const user = await User.findById(userId, client);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        res.status(200).json({ user });
    });

    forgotPassword = withTransaction(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email } = req.body;

        // Toujours répondre 200 pour éviter l'énumération des emails
        const successMessage = 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé.';

        const user = await User.findByEmailForReset(email, client);
        if (!user) {
            return res.status(200).json({ message: successMessage });
        }

        const rawToken = crypto.randomBytes(48).toString('hex');
        const hashedToken = await bcrypt.hash(rawToken, 10);
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

        await User.setResetToken(email, hashedToken, expires, client);

        try {
            await emailService.sendPasswordResetEmail(email, rawToken, user.langue || 'fr');
        } catch (emailErr) {
            console.error('Erreur envoi email reset:', emailErr);
            // On ne révèle pas l'erreur à l'utilisateur
        }

        return res.status(200).json({ message: successMessage });
    });

    resetPassword = withTransaction(async (req, res, client) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, token, nouveau_mot_de_passe } = req.body;

        const user = await User.findByEmailForReset(email, client);
        if (!user || !user.reset_token || !user.reset_token_expires) {
            return res.status(400).json({ message: 'Lien invalide ou expiré.' });
        }

        if (new Date() > new Date(user.reset_token_expires)) {
            return res.status(400).json({ message: 'Lien expiré. Veuillez faire une nouvelle demande.' });
        }

        const isValid = await bcrypt.compare(token, user.reset_token);
        if (!isValid) {
            return res.status(400).json({ message: 'Lien invalide ou expiré.' });
        }

        const newHashedPassword = await bcrypt.hash(nouveau_mot_de_passe, 10);
        await User.clearResetToken(user.id, newHashedPassword, client);

        return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès.' });
    });

}
module.exports = AuthController;