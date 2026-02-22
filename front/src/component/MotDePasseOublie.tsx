// @ts-nocheck
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import WaweEffect from './WaveEffect';
import { Button, Input, Alert } from './shared';

function MotDePasseOublie() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (response.ok) {
                setSuccess(true);
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.message || t('auth.forgotPassword.defaultError'));
            }
        } catch {
            setError(t('auth.forgotPassword.serverError'));
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
                            {t('auth.forgotPassword.title')}
                        </h2>
                        <p className="text-gray-500 font-medium">
                            {t('auth.forgotPassword.subtitle')}
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
                                {t('auth.forgotPassword.successMessage')}
                            </div>
                            <a
                                href="/login"
                                className="block text-sm font-bold text-sport hover:underline underline-offset-4 decoration-2"
                            >
                                {t('auth.forgotPassword.backToLogin')}
                            </a>
                        </div>
                    ) : (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            <Input
                                label={t('auth.forgotPassword.emailLabel')}
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t('auth.forgotPassword.emailPlaceholder')}
                                required
                                disabled={loading}
                            />

                            <Button
                                type="submit"
                                variant="sport"
                                fullWidth
                                loading={loading}
                            >
                                {loading ? t('auth.forgotPassword.submitting') : t('auth.forgotPassword.submit')}
                            </Button>

                            <div className="text-center pt-4 border-t border-gray-100">
                                <a
                                    href="/login"
                                    className="text-sm font-bold text-sport hover:underline underline-offset-4 decoration-2"
                                >
                                    {t('auth.forgotPassword.backToLogin')}
                                </a>
                            </div>
                        </form>
                    )}
                </div>
            </div>
            <WaweEffect />
        </main>
    );
}

export default MotDePasseOublie;
