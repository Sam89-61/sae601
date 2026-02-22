// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import { translateDynamicText } from '../utils/translationUtils';
import { useMonProgrammeSport } from '@/features/programme';
import { LoadingSpinner } from './shared';

const ProgrammeAlimentaire: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { data: programmeData, isLoading: loading, error: fetchError } = useMonProgrammeSport();

    // États locaux (UI uniquement)
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [detailsRepas, setDetailsRepas] = useState<any>({});
    const [openRecipes, setOpenRecipes] = useState<any>({});
    const [repasDuJour, setRepasDuJour] = useState<any[]>([]);

    // Extraire les données du programme
    const programme = (programmeData as any)?.programme;
    const allSessions = (programmeData as any)?.sessionRepas || [];
    const error = fetchError ? ((fetchError as any).message || t('diet.loadError')) : null;

    const getDefaultImage = (type: string) => {
        if (type === 'Entree') return '/media/Entrées/Entre1.png';
        if (type === 'Dessert') return '/media/Desserts/Dessert1.png';
        return '/media/Plats/Plat1.png';
    };

    const toggleRecipe = (itemId) => {
        setOpenRecipes(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const changeDate = (days) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + days);
        setSelectedDate(newDate);
    };

    // Formater la date pour l'affichage
    const formatDate = (date) => {
        return date.toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    // Effet pour filtrer les repas quand la date ou les sessions changent
    useEffect(() => {
        if (allSessions.length > 0) {
            const dateString = selectedDate.toISOString().split('T')[0];

            const mealsForDate = allSessions.filter(session => {
                if (!session.date_repas) return false;
                const sessionDate = session.date_repas.split('T')[0];
                return sessionDate === dateString;
            });

            mealsForDate.sort((a, b) => {
                if (a.heure_repas && b.heure_repas) {
                    return a.heure_repas.localeCompare(b.heure_repas);
                }
                return 0;
            });

            setRepasDuJour(mealsForDate);

            mealsForDate.forEach(session => {
                if (!detailsRepas[session.id_session_repas]) {
                    fetchDetailsSession(session.id_session_repas);
                }
            });
        } else {
            setRepasDuJour([]);
        }
    }, [selectedDate, allSessions]);

    const fetchDetailsSession = async (sessionId) => {
        try {
            const response = await fetch(`/api/sessionRepas/plat/${sessionId}`, {
            });
            
            if (response.ok) {
                const plats = await response.json();
                setDetailsRepas(prev => ({
                    ...prev,
                    [sessionId]: plats
                }));
            }
        } catch (err) {
            console.error("Erreur chargement plats:", err);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-background text-nutrition font-medium">
            {t('diet.loading')}
        </div>
    );

    // Si pas de programme ou erreur
    if (error || !programme) {
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
                <main className="flex-grow flex items-center justify-center p-6">
                    <div className="bg-error/10 text-error p-6 rounded-2xl shadow-sm max-w-md w-full text-center border border-error/20">
                        <p className="font-medium">
                            {error ? error : t('diet.noProgramError')}
                        </p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <Header />

            <main className="flex-grow w-full max-w-3xl mx-auto p-4 sm:p-6 space-y-6 " style={{ minHeight: '83vh' }}>
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold transition-colors"
                >
                    {t('common.back')}
                </button>

                <header className="bg-nutrition rounded-3xl p-6 text-white shadow-lg shadow-nutrition/20 relative overflow-hidden">
                    <div className="relative z-10">
                        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                            {translateDynamicText(programme.nom, t) || t('diet.defaultProgramName')}
                        </h1>

                    </div>
                </header>

                <div className="flex items-center justify-between bg-white p-2 rounded-full shadow-sm border border-gray-100">
                    <button
                        onClick={() => changeDate(-1)}
                        className="p-3 w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-nutrition transition-colors active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                        </svg>
                    </button>

                    <h2 className="text-lg font-bold text-text-main capitalize">
                        {formatDate(selectedDate)}
                    </h2>

                    <button
                        onClick={() => changeDate(1)}
                        className="p-3 w-12 h-12 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-nutrition transition-colors active:scale-95"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                        </svg>
                    </button>
                </div>

                <section className="space-y-6">
                    {repasDuJour.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-white rounded-3xl border border-dashed border-gray-200">
                            <p className="text-gray-500 font-medium">{t('diet.noMeal')}</p>
                            <p className="text-sm text-gray-400 mt-1">{t('diet.hydrationReminder')}</p>
                        </div>
                    ) : (
                        repasDuJour.map(session => (
                            <div key={session.id_session_repas} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 duration-300">
                                <div className="bg-gray-50/80 px-5 py-4 flex justify-between items-center border-b border-gray-100">
                                    <h3 className="font-bold text-lg text-text-main flex items-center gap-2">
                                        <span className="w-2 h-6 bg-nutrition rounded-full block"></span>
                                        {translateDynamicText(session.nom, t)}
                                    </h3>
                                    <span className="text-sm font-semibold text-gray-400 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                                        {session.heure_repas?.substring(0, 5)}
                                    </span>
                                </div>

                                <div className="p-5">
                                    {detailsRepas[session.id_session_repas] ? (
                                        detailsRepas[session.id_session_repas].length > 0 ? (
                                            <div className="space-y-4">
                                                {detailsRepas[session.id_session_repas].map((item, index) => {
                                                    const uniqueId = `${session.id_session_repas}-${index}`;
                                                    return (
                                                        <div key={index} className="flex flex-col gap-2 border-b border-gray-50 last:border-0 pb-4 last:pb-0">
                                                            <div className="flex gap-4 items-start group">
                                                                <img
                                                                    src={getDefaultImage(item.type_element)}
                                                                    alt="Plat"
                                                                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover bg-gray-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                                                                    onError={(e) => { e.target.onerror = null; e.target.src = '/media/bouffe.png' }}
                                                                />
                                                                <div className="flex-1 min-w-0 pt-1">
                                                                    <div className="flex justify-between items-start mb-1">
                                                                        <h4 className="font-bold text-text-main text-base leading-tight truncate pr-2">
                                                                            {item.nom_element || t('diet.no_named_dish')}
                                                                        </h4>
                                                                        {item.calories && (
                                                                            <span className="text-xs font-bold text-nutrition bg-nutrition/10 px-2 py-0.5 rounded-md whitespace-nowrap">
                                                                                {item.calories} {t('diet.kcal')}
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    <p className="text-sm text-gray-500 mb-2">
                                                                        {t('diet.portion')} : <span className="font-medium text-text-main">{item.quantite}x {item.portion_gramme ? `(${item.portion_gramme}g)` : ''}</span>
                                                                    </p>

                                                                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-xs text-gray-500 font-medium items-center mb-2">
                                                                        {item.glucide > 0 && <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded">Glu: {item.glucide}g</span>}
                                                                        {item.proteine > 0 && <span className="bg-success/10 text-success px-2 py-0.5 rounded">Prot: {item.proteine}g</span>}
                                                                        {item.lipide > 0 && <span className="bg-yellow-50 text-yellow-600 px-2 py-0.5 rounded">Lip: {item.lipide}g</span>}
                                                                        
                                                                        {(item.recette || (item.ingredients && item.ingredients.length > 0)) && (
                                                                            <button
                                                                                onClick={() => toggleRecipe(uniqueId)}
                                                                                className="ml-auto flex items-center gap-1 text-nutrition hover:brightness-110 hover:bg-nutrition/10 px-2 py-1 rounded-full transition-colors text-xs font-bold border border-nutrition/20"
                                                                            >
                                                                                {t('diet.details')} {openRecipes[uniqueId] ? '▲' : '▼'}
                                                                            </button>
                                                                        )}
                                                                    </div>

                                                                    {item.notes && (
                                                                        <p className="mt-2 text-xs text-gray-400 italic border-l-2 border-gray-200 pl-2">
                                                                            {item.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {openRecipes[uniqueId] && (
                                                                <div className="mt-2 mx-2 bg-nutrition/5 p-4 rounded-xl border border-nutrition/10 text-sm text-text-main animate-fadeIn space-y-3">
                                                                    {item.ingredients && item.ingredients.length > 0 && (
                                                                        <div>
                                                                            <h5 className="font-bold text-nutrition mb-1 text-xs uppercase tracking-wide">{t('diet.ingredients')}</h5>
                                                                            <ul className="list-disc list-inside grid grid-cols-2 gap-x-2">
                                                                                {item.ingredients.map((ing, i) => (
                                                                                    <li key={i} className="text-gray-600">{ing}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {item.recette && (
                                                                        <div>
                                                                            <h5 className="font-bold text-nutrition mb-1 text-xs uppercase tracking-wide">{t('diet.preparation')}</h5>
                                                                            <p className="leading-relaxed whitespace-pre-line text-gray-600">{item.recette}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-gray-400 text-center italic text-sm">{t('diet.noFood')}</p>
                                        )
                                    ) : (
                                        <div className="animate-pulse space-y-4">
                                            <div className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {session.notes && (
                                        <div className="mt-4 bg-yellow-50 text-yellow-700 text-sm p-3 rounded-xl flex items-start gap-2">
                                            <ClipboardList className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>{session.notes}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </section>

            </main>
            <Footer />
        </div>
    );
};

export default ProgrammeAlimentaire;
