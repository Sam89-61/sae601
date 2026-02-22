import { apiFetch } from './api';

/**
 * Stocker le token JWT reçu du backend (utilisé par les clients mobiles).
 * Sur le web, le token est dans le cookie httpOnly, pas besoin de le stocker.
 * @param {string|null} token
 */
const isMobile = !!import.meta.env.VITE_API_URL;

export const storeToken = (token) => {
    if (token && isMobile) {
        localStorage.setItem('token', token);
    }
};

/**
 * Vérifier si l'utilisateur est authentifié
 * Fait une requête au backend qui vérifie le cookie httpOnly (web) ou le token Bearer (mobile)
 * @returns {Promise<boolean>}
 */
export const isAuthenticated = async () => {
    try {
        const response = await apiFetch('/api/auth/verify', { method: 'GET' });
        return response.ok;
    } catch (error) {
        console.error("Erreur vérification auth:", error);
        return false;
    }
};

/**
 * Déconnexion de l'utilisateur
 * Supprime le cookie côté serveur et nettoie localStorage
 */
export const logout = async () => {
    try {
        await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
        console.error("Erreur logout:", error);
    } finally {
        localStorage.removeItem('userPseudo');
        localStorage.removeItem('cgu_accepted');
        localStorage.removeItem('token');
        window.location.href = '/login';
    }
};

/**
 * Récupérer les informations utilisateur depuis l'API
 * @returns {Promise<object|null>}
 */
export const getUserInfo = async () => {
    try {
        const response = await apiFetch('/api/auth/me', { method: 'GET' });
        if (response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Erreur récupération user info:", error);
        return null;
    }
};

/**
 * Récupérer l'ID utilisateur
 * @returns {Promise<number|null>}
 */
export const getUserId = async () => {
    const info = await getUserInfo();
    return info?.user?.id || null;
};
