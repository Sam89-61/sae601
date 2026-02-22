// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClipboardList, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

const ConsentPopup = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const cguAccepted = useAuthStore((state) => state.cguAccepted);
  const setCguAccepted = useAuthStore((state) => state.setCguAccepted);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà accepté
    if (!cguAccepted) {
      setShow(true);
    }
  }, [cguAccepted]);

  const handleAccept = async () => {
    setLoading(true);

    try {
        const response = await fetch('/api/auth/accept-cgu', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            setCguAccepted(true);
            setShow(false);
        } else {
            console.error(t('consent.acceptErrorLog'));
            alert(t('consent.acceptError'));
        }
    } catch (error) {
        console.error("Erreur réseau:", error);
          alert(t('consent.serverError'));
    } finally {
        setLoading(false);
    }
  };

  const handleDecline = () => {
        alert(t('consent.declineMessage'));
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm p-4 md:items-center animate-in fade-in duration-300">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-gray-200 animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-0 md:zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            {t('consent.title')}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 space-y-4">
          <p className="text-gray-600 leading-relaxed">
            {t('consent.intro')}
          </p>

          <div className="space-y-3">
            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-indigo-900 mb-1">
                <ClipboardList className="w-5 h-5" /> Règles RGPD
              </h3>
              <p className="text-sm text-gray-600 ml-7">
                {t('consent.rgpdBody')}
              </p>
            </div>

            <div className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
              <h3 className="flex items-center gap-2 font-semibold text-orange-900 mb-1">
                <AlertTriangle className="w-5 h-5" /> Conditions d'utilisation
              </h3>
              <p className="text-sm text-gray-600 ml-7">
                {t('consent.termsBody')}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 border-t border-gray-100">
          <button
            onClick={handleAccept}
            disabled={loading}
            className="flex-1 inline-flex justify-center items-center rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-colors disabled:opacity-50"
          >
            {loading ? t('consent.acceptLoading') : t('consent.accept')}
          </button>
          
          <button
             onClick={() => navigate('/mentions-legales')}
             className="sm:w-auto inline-flex justify-center items-center rounded-xl bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors"
          >
            {t('consent.readMore')}
          </button>

          <button
            onClick={handleDecline}
            disabled={loading}
            className="sm:w-auto inline-flex justify-center items-center rounded-xl bg-white px-4 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-colors"
          >
            {t('consent.decline')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentPopup;