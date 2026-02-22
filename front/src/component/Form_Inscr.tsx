// @ts-nocheck
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import WaveEffect from './WaveEffect';
import LanguageSelect from './LanguageSelect';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../utils/api';
import { storeToken } from '../utils/auth';

function Form_Inscr({ onRegisterSuccess }) {
    const { t } = useTranslation();
    const login = useAuthStore((state) => state.login);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.register.passwordMismatch'));
            return;
        }

        setLoading(true);
        try {
            const response = await apiFetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pseudo: formData.name,
                    email: formData.email,
                    mot_de_passe: formData.password,
                    role: 'utilisateur',
                    langue: i18n.language || 'fr'
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.errors && Array.isArray(data.errors)) {
                    const errorMessages = data.errors.map(err => err.msg).join(', ');
                    throw new Error(errorMessages);
                }
                throw new Error(data.message || 'Erreur lors de l\'inscription');
            }

            // Stocker le token JWT pour les clients mobiles (Capacitor)
            storeToken(data.token);
            if (data.user) {
                login(data.user);
            }

            if (onRegisterSuccess) {
                // Si besoin, on peut toujours passer l'ID au parent pour l'affichage immédiat, 
                // mais pour la persistence, on compte sur le token.
                onRegisterSuccess(data.user.id);
            } else {
                alert(t('auth.register.success'));
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center bg-background min-h-screen">
            <div className="w-full max-w-md z-10 bg-white rounded-3xl shadow-xl shadow-sport/5 p-2 m-4 border border-gray-100">
                <div className='flex justify-center py-4'>
                    <img src="/media/logo.svg" alt="Logo" className="h-20 w-20 object-cover" />
                </div>
                <div className="px-8 mb-4">
                    <LanguageSelect />
                </div>
                <form
                    className="px-8 pb-8 space-y-6"
                    onSubmit={handleSubmit}
                >
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">{t('auth.register.title')}</h2>
                        <p className="text-gray-500 font-medium">{t('auth.register.subtitle')}</p>
                    </div>

                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-xl text-sm flex items-start animate-shake">
                            <svg className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="font-bold">{error}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label
                                htmlFor="name"
                                className="block text-sm font-bold text-gray-700 ml-1"
                            >
                                {t('auth.register.nameLabel')}
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-sport focus:bg-white focus:ring-4 focus:ring-sport/10 transition duration-200 outline-none font-medium text-text-main"
                                placeholder={t('auth.register.namePlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="email"
                                className="block text-sm font-bold text-gray-700 ml-1"
                            >
                                {t('auth.register.emailLabel')}
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-sport focus:bg-white focus:ring-4 focus:ring-sport/10 transition duration-200 outline-none font-medium text-text-main"
                                placeholder={t('auth.register.emailPlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="password"
                                className="block text-sm font-bold text-gray-700 ml-1"
                            >
                                {t('auth.register.passwordLabel')}
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-sport focus:bg-white focus:ring-4 focus:ring-sport/10 transition duration-200 outline-none font-medium text-text-main"
                                placeholder={t('auth.register.passwordPlaceholder')}
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label
                                htmlFor="confirmPassword"
                                className="block text-sm font-bold text-gray-700 ml-1"
                            >
                                {t('auth.register.confirmPasswordLabel')}
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-sport focus:bg-white focus:ring-4 focus:ring-sport/10 transition duration-200 outline-none font-medium text-text-main"
                                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-sport hover:brightness-110 text-white font-bold py-4 rounded-2xl shadow-lg shadow-sport/20 focus:outline-none focus:ring-4 focus:ring-sport/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                {t('auth.register.submitting')}
                            </span>
                        ) : (
                            t('auth.register.submit')
                        )}
                    </button>

                    <div className="text-center pt-4 border-t border-gray-100">
                        <p className="text-sm font-medium text-gray-500">
                            {t('auth.register.alreadyAccount')}{' '}
                            <a
                                href="/login"
                                className="font-bold text-sport hover:underline underline-offset-4 decoration-2"
                            >
                                {t('auth.register.login')}
                            </a>
                        </p>
                    </div>
                </form>
            
            </div>
            <WaveEffect />
        </main>
    );
}

export default Form_Inscr;