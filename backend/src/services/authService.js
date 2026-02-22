const User = require('../models/User');
const jwt = require('jsonwebtoken');

class AuthService {
    /**
     * Gère l'inscription d'un nouvel utilisateur
     */
    async register(userData, client) {
        const { email, pseudo } = userData;

        const existingEmail = await User.findByEmail(email, client);
        if (existingEmail) {
            const error = new Error('Cet email est déjà utilisé');
            error.status = 400;
            throw error;
        }

        const existingPseudo = await User.findByEmail(pseudo, client);
        if (existingPseudo) {
            const error = new Error('Ce pseudo est déjà utilisé');
            error.status = 400;
            throw error;
        }

        const newUser = await User.create({ ...userData, role: 'utilisateur' }, client);
        const token = this.generateToken(newUser);

        return { user: newUser, token };
    }

    /**
     * Gère la connexion
     */
    async login({ email, mot_de_passe }, client) {
        const user = await User.findByEmail(email, client);
        if (!user) {
            const error = new Error('Email ou mot de passe incorrect');
            error.status = 400;
            throw error;
        }

        const isPasswordValid = await User.verifyPassword(mot_de_passe, user.mot_de_passe);
        if (!isPasswordValid) {
            const error = new Error('Email ou mot de passe incorrect');
            error.status = 400;
            throw error;
        }

        const token = this.generateToken(user);
        return { user, token };
    }

    /**
     * Génère un jeton JWT
     */
    generateToken(user) {
        if (!process.env.JWT_SECRET) {
            throw new Error('JWT_SECRET non défini');
        }
        return jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
    }
}

module.exports = new AuthService();
