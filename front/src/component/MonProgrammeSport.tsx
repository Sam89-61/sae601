// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import { translateDynamicText } from '../utils/translationUtils';
import { useMonProgrammeSport } from '@/features/programme';
import { LoadingSpinner, Alert } from './shared';

const MonProgramme: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: programmeData, isLoading: loading, error } = useMonProgrammeSport();

    const isToday = (dateString: string): boolean => {
        const date = new Date(dateString);
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    const isFuture = (dateString: string): boolean => {
        const date = new Date(dateString);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // On reset l'heure pour comparer juste les jours
        return date >= today;
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport"></div>
        </div>
    );

    if (error) {
        return (
            <div className="flex flex-col min-h-screen bg-background">
                <Header />
                <div className="px-4 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                    >
                        {t('common.back')}
                    </button>
                </div>
                <div className="flex-grow flex items-center justify-center p-4">
                    <div className="text-center p-8 bg-white rounded-xl shadow-sm max-w-md w-full border border-gray-100">
                        <h2 className="text-2xl font-bold text-text-main mb-2">{t('training.errorTitle')}</h2>
                        <p className="text-gray-600 mb-6">{error.toString()}</p>
                        <button
                            className="bg-sport text-white px-6 py-2 rounded-lg hover:brightness-110 transition-colors w-full font-bold"
                            onClick={() => navigate('/')}
                        >
                            {t('training.backHome')}
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const programme = (programmeData as any)?.programme || (programmeData as any)?.programmeSportif;
    const sessions = (programmeData as any)?.sessions || (programmeData as any)?.sessionsSport || [];

    const todaySession = sessions.find((s: any) => isToday(s.date_session));
    const upcomingSessions = sessions.filter((s: any) => isFuture(s.date_session) && !isToday(s.date_session));

    return (
        <div className="flex flex-col min-h-screen bg-background text-text-main">
            <Header />
            <main className="flex-grow w-full max-w-3xl mx-auto px-4 py-6 pb-24">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                >
                    {t('common.back')}
                </button>

                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-sport mb-2 leading-tight">
                        {translateDynamicText(programme?.nom || programme?.nom_programme, t)}
                    </h1>
                    <p className="text-gray-500 italic text-sm md:text-base">
                        {translateDynamicText(programme?.description, t)}
                    </p>
                </div>

                <h2 className="text-xl font-semibold text-text-main border-b-2 border-gray-200 pb-2 mb-6 mt-8">
                    {t('training.todayTitle')}
                </h2>

                {todaySession ? (
                    <div className={`
                        relative overflow-hidden rounded-2xl p-6 mb-8 transition-all duration-300
                        flex flex-col md:flex-row md:items-center md:justify-between
                        ${todaySession.finish
                            ? 'bg-white border border-gray-200 shadow-sm opacity-75'
                            : 'bg-sport/5 border-2 border-sport shadow-md transform hover:scale-[1.01]'
                        }
                    `}>
                        <div className="flex-1 mb-4 md:mb-0">
                            <span className="inline-block text-xs font-bold tracking-wider text-sport uppercase mb-1">
                                {t('training.todayTag')}
                            </span>
                            <h3 className="text-xl font-bold text-text-main mb-1">
                                {translateDynamicText(todaySession.nom, t)}
                            </h3>
                            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                                {translateDynamicText(todaySession.description, t)}
                            </p>
                            <div className="flex items-center text-gray-500 text-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                {todaySession.duree_minutes} {t('training.unit')}
                            </div>
                        </div>

                        <div className="md:ml-6 flex-shrink-0 w-full md:w-auto">
                            {todaySession.finish ? (
                                <div className="bg-success/10 text-success px-4 py-2 rounded-lg text-center font-medium border border-success/20 w-full">
                                    {t('training.finishedTag')}
                                </div>
                            ) : (
                                <button
                                    className="w-full md:w-auto bg-sport text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 active:scale-95 transition-all shadow-sm"
                                    onClick={() => navigate(`/session/${todaySession.id_session_sport}`)}
                                    disabled={todaySession.finish}
                                >
                                    {t('training.startSession')}
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl p-8 text-center border border-gray-100 shadow-sm mb-8">
                        <p className="text-gray-400 font-medium">{t('training.restDay')}</p>
                    </div>
                )}

                <h2 className="text-xl font-semibold text-text-main border-b-2 border-gray-200 pb-2 mb-6 mt-10">
                    {t('training.upcomingTitle')}
                </h2>

                <div className="space-y-4">
                    {upcomingSessions.length > 0 ? (
                        upcomingSessions.map((session: any) => (
                            <div key={session.id_session_sport} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between">
                                <div className="mb-2 md:mb-0">
                                    <span className="block text-sport font-semibold text-sm mb-1 capitalize">
                                        {new Date(session.date_session).toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                                    </span>
                                    <h3 className="text-lg font-bold text-text-main">{translateDynamicText(session.nom, t)}</h3>
                                    <p className="text-gray-500 text-sm mt-1">{translateDynamicText(session.description, t)}</p>
                                    {session.duree_minutes > 0 && (
                                        <div className="flex items-center text-gray-400 text-sm mt-1">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            ~{session.duree_minutes} {t('training.unit')}
                                        </div>
                                    )}
                                </div>

                            </div>
                        ))
                    ) : (
                        <div className="text-center py-10 bg-white border border-gray-100 shadow-sm rounded-xl">
                            <p className="text-gray-400">{t('training.allFinished')}</p>
                        </div>
                    )}
                </div>

            </main>
            <Footer />
        </div>
    );
};

export default MonProgramme;
