// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserId } from '../utils/auth';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Utensils, Calendar, Heart, Copy, Globe, Lock, Trash2, Timer, User, BarChart2, Lightbulb, Inbox, Frown } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const SessionDetails = ({ type, id }) => {
    const { t } = useTranslation();

    const navigate = useNavigate();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    useEffect(() => {
        if (type && id) {
            fetchSessionDetails();
        }
    }, [type, id]);

    const fetchSessionDetails = async () => {
        try {
            const endpoint = type === 'sport'
                ? `/api/sessionSport/details/${id}`
                : `/api/sessionRepas/details/${id}`;

            const response = await fetch(endpoint);

            if (!response.ok) {
                throw new Error('Failed to fetch details');
            }

            const data = await response.json();
            if (data.session) {
                setSession(data.session);
                // On stocke les exercices/plats dans l'objet session pour simplifier le rendu
                setSession(prev => ({
                    ...prev,
                    items: data.exercices || []
                }));

                const userId = await getUserId();
                setIsOwner(data.session.created_by_user_id === userId);
            }
        } catch (err) {
            console.error('Erreur chargement séance:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm(t('session.confirm_delete'))) return;

        try {
            const response = await fetch(`/api/sessions/${type}/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                alert(t('session.success_delete'));
                navigate('/sessions/my-sessions');
            }
        } catch (err) {
            console.error('Erreur suppression:', err);
        }
    };

    const toggleVisibility = async () => {
        try {
            const response = await fetch(`/api/sessions/${type}/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    is_public: !session.is_public
                })
            });
            if (response.ok) {
                const data = await response.json();
                setSession(data.session);
            }
        } catch (err) {
            console.error('Erreur modification visibilité:', err);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-sport"></div>
                        <p className="text-gray-600 font-semibold">{t('common.loading')}</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md">
                        <Frown className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                        <h2 className="text-2xl font-bold text-text-main mb-2">{t('session.not_found_title')}</h2>
                        <p className="text-gray-600 mb-6">{t('session.not_found_desc')}</p>
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-sport hover:bg-sport-secondary text-white rounded-xl transition-all font-semibold shadow-lg"
                        >
                             {t('common.back')}
                        </button>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-text-main">
            <Header />
            
            <main className="flex-1 py-8 px-4 pb-24">
                <div className="max-w-5xl mx-auto">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-semibold mb-6 transition-colors"
                    >
                        {t('common.back')}
                    </button>

                    {/* En-tête de la séance */}
                    <div className={`${type === 'sport' ? 'bg-sport' : 'bg-nutrition'} rounded-2xl shadow-xl p-8 mb-6 text-white`}>
                        <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-4">
                                    {type === 'sport' ? (
                                        <Dumbbell className="w-12 h-12" />
                                    ) : (
                                        <Utensils className="w-12 h-12" />
                                    )}
                                    <div>
                                        <div className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-2 bg-white/30">
                                            {type === 'sport' ? t('session.sport') : t('session.repas')}
                                        </div>
                                        <h1 className="text-3xl md:text-4xl font-extrabold">
                                            {session.nom}
                                        </h1>
                                    </div>
                                </div>
                                {session.description && (
                                    <p className="text-white/90 text-lg mb-4 leading-relaxed">
                                        {session.description}
                                    </p>
                                )}
                                
                                {/* Statistiques */}
                                <div className="flex flex-wrap gap-3 text-sm">
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                        <Calendar className="w-4 h-4" />
                                        <span className="font-semibold">{new Date(session.date_creation).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                        <Heart className="w-4 h-4" />
                                        <span className="font-semibold">{session.nb_likes || 0} {t('session.likes')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg">
                                        <Copy className="w-4 h-4" />
                                        <span className="font-semibold">{session.nb_utilisations || 0} {t('session.utilisations')}</span>
                                    </div>
                                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold ${
                                        session.is_public 
                                            ? 'bg-white/30' 
                                            : 'bg-white/20'
                                    }`}>
                                        {session.is_public ? <Globe className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                        <span>{session.is_public ? t('session.public') : t('session.private')}</span>
                                    </div>
                                </div>
                            </div>

                            {isOwner && (
                                <div className="flex flex-col gap-3 w-full md:w-auto md:min-w-[200px]">
                                    <button
                                        onClick={toggleVisibility}
                                        className="px-6 py-3 bg-white text-sport hover:bg-gray-50 rounded-xl transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                                    >
                                        {session.is_public ? <Lock className="w-4 h-4" /> : <Globe className="w-4 h-4" />}
                                        <span>{session.is_public ? t('session.makePrivate') : t('session.makePublic')}</span>
                                    </button>
                                    <button
                                        onClick={handleDelete}
                                        className="px-6 py-3 bg-error hover:bg-red-600 text-white rounded-xl transition-all font-semibold shadow-lg flex items-center justify-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>{t('session.delete')}</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Contenu principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Liste des exercices/éléments - 2/3 de la largeur */}
                        <div className="lg:col-span-2">
                            <div className="bg-white rounded-2xl shadow-lg p-6">
                                <h2 className="text-2xl font-bold text-text-main mb-6 flex items-center gap-2">
                                    {type === 'sport' ? (
                                        <Dumbbell className="w-6 h-6 text-sport" />
                                    ) : (
                                        <Utensils className="w-6 h-6 text-nutrition" />
                                    )}
                                    <span>{type === 'sport' ? t('session.exerciseList') : t('session.mealComposition')}</span>
                                </h2>

                                <div className="space-y-3">
                                    {session.items && session.items.length > 0 ? (
                                        session.items.map((item, index) => (
                                            <div 
                                                key={index} 
                                                className="p-5 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-sport transition-all group"
                                            >
                                                <div className="flex justify-between items-start gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className={`flex items-center justify-center w-8 h-8 ${type === 'sport' ? 'bg-sport text-white' : 'bg-nutrition text-white'} rounded-lg font-bold text-sm`}>
                                                                {index + 1}
                                                            </span>
                                                            <h4 className="font-bold text-text-main text-lg group-hover:text-sport transition-colors">
                                                                {item.nom_exercice || item.nom_element}
                                                            </h4>
                                                        </div>
                                                        <div className="ml-11">
                                                            <p className="text-sm text-gray-600 font-medium">
                                                                {type === 'sport'
                                                                    ? `${item.series} ${t('session.sets')} × ${item.repetitions} ${t('session.reps')} • ${t('session.rest_label')}: ${item.temps_repos_secondes}s`
                                                                    : `${t('session.quantity')}: ${item.quantite} (${item.type_element})`
                                                                }
                                                            </p>
                                                            {item.notes && (
                                                                <p className={`text-xs text-gray-500 italic mt-2 pl-3 border-l-2 ${type === 'sport' ? 'border-sport' : 'border-nutrition'} flex items-start gap-2`}>
                                                                    <Lightbulb className="w-3 h-3 flex-shrink-0 mt-0.5" /> {item.notes}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    {type === 'sport' && item.img && (
                                                        <img 
                                                            src={item.img} 
                                                            alt={item.nom_exercice} 
                                                            className="w-20 h-20 rounded-xl object-cover shadow-md border-2 border-white"
                                                        />
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <Inbox className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                            <p className="font-semibold">{t('session.no_content')}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Détails supplémentaires - 1/3 de la largeur */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
                                <h2 className="text-xl font-bold text-text-main mb-6 flex items-center gap-2">
                                    <BarChart2 className="w-5 h-5" /> {t('session.stats')}
                                </h2>
                                <div className="space-y-4">
                                    {type === 'sport' ? (
                                        <>
                                            <div className="p-4 bg-sport/10 rounded-xl border-2 border-sport/20">
                                                <div className="flex items-center gap-2 text-sport mb-1">
                                                    <Timer className="w-6 h-6" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">
                                                        {t('session.duration')}
                                                    </span>
                                                </div>
                                                <p className="text-2xl font-extrabold text-text-main ml-8">
                                                    {session.duree_minutes} {t('session.minutes')}
                                                </p>
                                            </div>
                                            <div className="p-4 bg-sport/10 rounded-xl border-2 border-sport/20">
                                                <div className="flex items-center gap-2 text-sport mb-1">
                                                    <Dumbbell className="w-6 h-6" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">
                                                        {t('session.exercises')}
                                                    </span>
                                                </div>
                                                <p className="text-2xl font-extrabold text-text-main ml-8">
                                                    {t('session.exercise_count', { count: session.items?.length || 0 })}
                                                </p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="p-4 bg-nutrition/10 rounded-xl border-2 border-nutrition/20">
                                                <div className="flex items-center gap-2 text-nutrition mb-1">
                                                    <Utensils className="w-6 h-6" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">
                                                        {t('session.mealType')}
                                                    </span>
                                                </div>
                                                <p className="text-xl font-bold text-text-main ml-8 capitalize">
                                                    {t(`session.${session.type_repas?.toLowerCase()}`) !== `session.${session.type_repas?.toLowerCase()}` ? t(`session.${session.type_repas?.toLowerCase()}`) : session.type_repas?.replace('_', ' ')}
                                                </p>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Info créateur */}
                                    {session.creator_pseudo && (
                                        <div className="p-4 bg-accent/10 rounded-xl border-2 border-accent/20">
                                            <div className="flex items-center gap-2 text-accent mb-1">
                                                <User className="w-6 h-6" />
                                                <span className="text-xs font-bold uppercase tracking-wider">
                                                    {t('session.createdBy')}
                                                </span>
                                            </div>
                                            <p className="text-lg font-bold text-text-main ml-8">
                                                {session.creator_pseudo}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default SessionDetails;
