

let badgeCallbackHandler = null;

export function setupGamificationInterceptor(onBadgesDetected) {
    badgeCallbackHandler = onBadgesDetected;
}


const originalFetch = window.fetch;

// VITE_API_URL = "http://192.168.x.x:5001/api" (défini dans .env.android, absent en dev web)
const API_BASE = import.meta.env.VITE_API_URL || '';
const isMobile = !!API_BASE;

/**
 * Résout une URL fetch :
 * - En mobile (Capacitor) : transforme "/api/foo" → "http://192.168.x.x:5001/api/foo"
 * - En web dev : laisse "/api/foo" tel quel (proxy Vite)
 */
function resolveUrl(url) {
    if (!isMobile) return url;
    const urlString = typeof url === 'string' ? url : url.toString();
    if (urlString.startsWith('/api/') || urlString === '/api') {
        // API_BASE = "http://IP:5001/api", on retire le /api du début du path pour éviter doublon
        return `${API_BASE}${urlString.slice(4)}`;
    }
    return url;
}

window.fetch = async function(...args) {
    let [url, options = {}] = args;

    // Réécriture de l'URL pour les builds mobiles
    url = resolveUrl(url);

    const urlString = typeof url === 'string' ? url : url.toString();
    const isInternalRequest = urlString.startsWith('/') ||
                               urlString.includes('localhost') ||
                               (API_BASE && urlString.startsWith(API_BASE));

    if (!options.credentials) {
        if (!isMobile && isInternalRequest) {
            // Web : utiliser les cookies
            options.credentials = 'include';
        }
    }

    if (isMobile && isInternalRequest) {
        // Mobile : ajouter le token Bearer automatiquement sur tous les appels /api
        const token = localStorage.getItem('token');
        if (token) {
            options.headers = {
                ...(options.headers || {}),
                'Authorization': `Bearer ${token}`
            };
        }
    }

    const response = await originalFetch(url, options);
    const clonedResponse = response.clone();
    
    const contentType = clonedResponse.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        try {
            const data = await clonedResponse.json();

            // Détecter automatiquement les badges
            if (data.badges_debloques && Array.isArray(data.badges_debloques) && data.badges_debloques.length > 0) {
                if (badgeCallbackHandler) {
                    badgeCallbackHandler(data.badges_debloques);
                }
            }
        } catch (e) {
            console.error('❌ [Intercepteur Global] Erreur en traitant la réponse JSON:', e);
        }
    }
    
    return response;
};

export default {
    setupGamificationInterceptor
};
