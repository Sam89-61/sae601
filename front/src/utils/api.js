/**
 * Helper centralisé pour les appels API.
 *
 * - En dev web (Vite proxy) : les URLs relatives /api/... suffisent
 * - En build Capacitor (mobile) : VITE_API_URL contient l'URL complète du backend
 *   et le token JWT est lu depuis le localStorage puis envoyé en Authorization: Bearer
 */

const API_BASE = import.meta.env.VITE_API_URL || '';
const isMobile = !!import.meta.env.VITE_API_URL;

/**
 * Retourne l'URL complète d'un endpoint API.
 * @param {string} path - Chemin relatif, ex: "/api/auth/login"
 */
export function apiUrl(path) {
    if (isMobile) {
        // En mobile, VITE_API_URL = "http://192.168.1.42:5001/api"
        // path = "/api/auth/login" → on enlève le préfixe /api pour éviter le doublon
        const cleanPath = path.startsWith('/api') ? path.slice(4) : path;
        return `${API_BASE}${cleanPath}`;
    }
    return path; // Proxy Vite gère /api/* en dev
}

/**
 * Retourne l'URL de base du socket (sans /api).
 * Utilisé pour socket.io-client.
 */
export function socketUrl() {
    return import.meta.env.VITE_SOCKET_URL || '';
}

/**
 * fetch() enrichi qui :
 * - Résout l'URL (relative ou absolue selon l'environnement)
 * - Ajoute automatiquement Authorization: Bearer si un token est en localStorage
 * - Garde credentials: 'include' pour le web (cookies)
 *
 * @param {string} path - Chemin API, ex: "/api/profil"
 * @param {RequestInit} options - Options fetch standard
 */
export async function apiFetch(path, options = {}) {
    const url = apiUrl(path);
    const headers = { ...(options.headers || {}) };

    if (isMobile) {
        // Mode mobile : lire le token JWT dans le localStorage
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    } else {
        // Mode web : cookies gérés automatiquement via credentials: include
        if (!options.credentials) {
            options.credentials = 'include';
        }
    }

    return fetch(url, { ...options, headers });
}
