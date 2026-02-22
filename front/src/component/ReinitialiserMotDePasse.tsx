// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import WaweEffect from './WaveEffect';
import { Button, Input, Alert } from './shared';

function ReinitialiserMotDePasse() {
    const { t } = useTranslation();

    // Lire token et email depuis l'URL manuellement (compatible sans useSearchParams)
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token') || '';
    const email = params.get('email') || '';

    const [nouveauMotDePasse, setNouveauMotDePasse] = useState('');
    const [confirmation, setConfirmation] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    // Redirect to login after success
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => {
                window.location.href = '/login';
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [success]);

    if (!token || !email) {
        return (
            <main className="flex items-center justify-center bg-background min-h-screen">
                <div className="w-full max-w-md pt-7 z-10 bg-white rounded-3xl shadow-xl shadow-sport/5 border border-gray-100 p-2 m-4">
                    <div className='flex justify-center py-4'>
                        <img src="/media/logo.svg" alt="Logo" className="h-24 w-24 object-cover" />
                    </div>
                    <div className="px-8 pb-8 text-center space-y-4">
                        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                            {t('auth.resetPassword.invalidLink')}
                        </div>
                        <a
                            href="/mot-de-passe-oublie"
                            className="block text-sm font-bold text-sport hover:underline underline-offset-4 decoration-2"
                        >
                            {t('auth.resetPassword.requestNew')}
                        </a>
                    </div>
                </div>
                <WaweEffect />
            </main>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (nouveauMotDePasse !== confirmation) {
            setError(t('auth.resetPassword.passwordMismatch'));
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, token, nouveau_mot_de_passe: nouveauMotDePasse }),
            });

            const data = await response.json().catch(() => ({}));

            if (response.ok) {
                setSuccess(true);
            } else {
                setError(data.message || t('auth.resetPassword.defaultError'));
            }
        } catch {
            setError(t('auth.resetPassword.serverError'));
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

                <div className="px-8 pb-8 space-y-6">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-black text-text-main mb-2 tracking-tight">
                            {t('auth.resetPassword.title')}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {t('auth.resetPassword.subtitle')}
                        </p>
                    </div>

                    {error && (
                        <Alert variant="error" onClose={() => setError('')}>
                            {error}
                        </Alert>
                    )}

                    {success ? (
                        <div className="text-center space-y-4">
                            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                                {t('auth.resetPassword.successMessage')}
                            </div>
                            <p className="text-xs text-gray-400">Redirection vers la connexion...</p>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label={t('auth.resetPassword.newPasswordLabel')}
                                type="password"
                                id="nouveau_mot_de_passe"
                                name="nouveau_mot_de_passe"
                                value={nouveauMotDePasse}
                                onChange={(e) => setNouveauMotDePasse(e.target.value)}
                                placeholder="Min. 8 car., 1 maj., 1 min., 1 chiffre"
                                required
                                disabled={loading}
                            />

                            <Input
                                label={t('auth.resetPassword.confirmPasswordLabel')}
                                type="password"
                                id="confirmation"
                                name="confirmation"
                                value={confirmation}
                                onChange={(e) => setConfirmation(e.target.value)}
                                placeholder="Confirmez votre mot de passe"
                                required
                                disabled={loading}
                            />

                            <Button
                                type="submit"
                                variant="sport"
                                fullWidth
                                loading={loading}
                            >
                                {loading ? t('auth.resetPassword.submitting') : t('auth.resetPassword.submit')}
                            </Button>
                        </form>
                    )}
                </div>
            </div>
            <WaweEffect />
        </main>
    );
}

export default ReinitialiserMotDePasse;
