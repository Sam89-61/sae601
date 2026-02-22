import { useState, useEffect, useRef, useCallback } from 'react';
import { useGamification } from '../context/GamificationContext';

/**
 * Hook pour effectuer des requêtes fetch avec gestion automatique de l'état et gamification
 *
 * @param {string} url - L'URL de la requête
 * @param {Object} options - Options de configuration
 * @param {string} options.method - Méthode HTTP (GET, POST, PUT, DELETE)
 * @param {Object} options.headers - Headers personnalisés
 * @param {Object|string} options.body - Corps de la requête
 * @param {boolean} options.skip - Si true, la requête n'est pas exécutée
 * @param {Array} dependencies - Dépendances pour re-déclencher la requête
 *
 * @returns {Object} { data, loading, error, refetch }
 *
 * @example
 * const { data, loading, error } = useFetch('/api/programme/mon-programme');
 *
 * @example
 * const { data, loading, error, refetch } = useFetch('/api/auth/login', {
 *   method: 'POST',
 *   body: { email, password }
 * });
 */
export function useFetch(url, options = {}, dependencies = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { triggerBadgePopup } = useGamification();

    const isMountedRef = useRef(true);
    const abortControllerRef = useRef(null);

    const fetchData = async () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        if (options.skip) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const fetchOptions = {
                method: options.method || 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'include',
                signal: abortControllerRef.current.signal,
            };

            if (options.body && fetchOptions.method !== 'GET' && fetchOptions.method !== 'HEAD') {
                fetchOptions.body = typeof options.body === 'string'
                    ? options.body
                    : JSON.stringify(options.body);
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
            }

            const jsonData = await response.json();

            // Gamification: détecter les badges débloqués
            if (jsonData.badges_debloques && Array.isArray(jsonData.badges_debloques) && jsonData.badges_debloques.length > 0) {
                triggerBadgePopup(jsonData.badges_debloques);
            }

            if (isMountedRef.current) {
                setData(jsonData);
                setError(null);
            }
        } catch (err) {
            if (err.name === 'AbortError') {
                return;
            }

            if (isMountedRef.current) {
                setError(err.message || 'Une erreur est survenue');
                setData(null);
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        isMountedRef.current = true;
        fetchData();

        return () => {
            isMountedRef.current = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [url, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

    const refetch = () => {
        fetchData();
    };

    return { data, loading, error, refetch };
}

/**
 * Hook pour les mutations (POST/PUT/DELETE) qui ne s'exécutent pas automatiquement
 *
 * @returns {Object} { execute, data, loading, error }
 *
 * @example
 * const { execute, loading, error } = useMutation();
 *
 * const handleSubmit = async () => {
 *   const result = await execute('/api/auth/login', {
 *     method: 'POST',
 *     body: { email, password }
 *   });
 * };
 */
export function useMutation() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { triggerBadgePopup } = useGamification();

    const execute = async (url, options = {}) => {
        try {
            setLoading(true);
            setError(null);

            const fetchOptions = {
                method: options.method || 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
                credentials: 'include',
            };

            if (options.body) {
                fetchOptions.body = typeof options.body === 'string'
                    ? options.body
                    : JSON.stringify(options.body);
            }

            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
            }

            const jsonData = await response.json();

            // Gamification: détecter les badges débloqués
            if (jsonData.badges_debloques && Array.isArray(jsonData.badges_debloques) && jsonData.badges_debloques.length > 0) {
                triggerBadgePopup(jsonData.badges_debloques);
            }

            setData(jsonData);
            setError(null);
            return jsonData;
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
            setData(null);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { execute, data, loading, error };
}
