// @ts-nocheck
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import WaweEffect from './WaveEffect';
import LanguageSelect from './LanguageSelect';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';
import { apiFetch, apiUrl } from '../utils/api';
import { storeToken } from '../utils/auth';
import { Button, Input, Alert, Card } from './shared';
function Form_Co() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const login = useAuthStore((state) => state.login);
    const lang = useSettingsStore((state) => state.lang);

    const [formData, setFormData] = useState({
        email: '',
        mot_de_passe: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
        setError('');
    };

    const updateLanguagePreference = async (preferredLang) => {
        if (!preferredLang) return;

        try {
            await fetch('/api/auth/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Cookie envoyé automatiquement
                body: JSON.stringify({ langue: preferredLang })
            });
        } catch (error) {
            console.warn('Language update failed:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await apiFetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    mot_de_passe: formData.mot_de_passe
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Stocker le token JWT pour les clients mobiles (Capacitor)
                storeToken(data.token);

                if (data.user) {
                    // Utiliser Zustand au lieu de localStorage
                    login(data.user);

                    const serverLang = data.user?.langue;
                    const preferredLang = lang || i18n.language || serverLang || 'fr';

                    if (preferredLang && preferredLang !== serverLang) {
                        await updateLanguagePreference(preferredLang);
                    }

                    if (!lang && serverLang && serverLang !== i18n.language) {
                        await i18n.changeLanguage(serverLang);
                    }

                    navigate('/');
                } else {
                    setError(t('auth.login.userDataMissing'));
                }
            } else {
                setError(data.message || t('auth.login.defaultError'));
            }
        } catch (error) {
            console.error('Erreur:', error);
            setError(t('auth.login.serverError'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center bg-background min-h-screen">
            <div className="w-full max-w-md pt-7 z-10 bg-white rounded-3xl shadow-xl shadow-sport/5 border border-gray-100 p-2 m-4">
                <div className='flex justify-center py-4'>
                    <img src="/media/logo.svg" alt="Logo" className="h-24 w-24 object-cover" />
                </div>
                <div className="px-8 mb-4">
                    <LanguageSelect />
                </div>
                <form className="px-8 pb-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">{t('auth.login.title')}</h2>
                        <p className="text-gray-500 font-medium">{t('auth.login.subtitle')}</p>
                    </div>

                    {error && (
                        <Alert variant="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    <div className="space-y-4">
                        <Input
                            label={t('auth.login.emailLabel')}
                            type="text"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder={t('auth.login.emailPlaceholder')}
                            required
                            disabled={loading}
                        />

                        <Input
                            label={t('auth.login.passwordLabel')}
                            type="password"
                            id="mot_de_passe"
                            name="mot_de_passe"
                            value={formData.mot_de_passe}
                            onChange={handleChange}
                            placeholder={t('auth.login.passwordPlaceholder')}
                            required
                            disabled={loading}
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="sport"
                        fullWidth
                        loading={loading}
                    >
                        {loading ? t('auth.login.submitting') : t('auth.login.submit')}
                    </Button>

                    <div className="text-center pt-4 border-t border-gray-100 space-y-2">
                        <p className="text-sm font-medium text-gray-500">
                            {t('auth.login.noAccount')}{' '}
                            <a
                                href="/inscription"
                                className="font-bold text-sport hover:underline underline-offset-4 decoration-2"
                            >
                                {t('auth.login.signup')}
                            </a>
                        </p>
                        <a
                            href="/mot-de-passe-oublie"
                            className="text-sm font-bold text-sport hover:text-sport-secondary transition-colors"
                        >
                            {t('auth.login.forgot')}
                        </a>
                    </div>
                </form>
                
            </div>
            <WaweEffect />
        </main>
          
    );
}

export default Form_Co;