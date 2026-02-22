// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Award, Trophy, ArrowLeft, Timer, Dumbbell, Footprints, Sword, Flame, Target } from 'lucide-react';
import Seance from './Seance';
import Repos from './Repos';
import './style/SessionManager.css';
import Header from './Header';
import Footer from './Footer';

function SessionManager({ mode }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [sessionId, setSessionId] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentExerciceIndex, setCurrentExerciceIndex] = useState(0);
    const [currentSerie, setCurrentSerie] = useState(1);
    const [isResting, setIsResting] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const [isAlreadyDone, setIsAlreadyDone] = useState(false);
    const [gamificationData, setGamificationData] = useState(null);
    const [lastCompletion, setLastCompletion] = useState(null);
    const [isCommunitySession, setIsCommunitySession] = useState(false);

    useEffect(() => {
        const parts = window.location.pathname.split('/');
        const id = parts[parts.length - 1];

        if (!id || isNaN(id)) {
            setError("ID invalide");
            setLoading(false);
            return;
        }
        setSessionId(id);

        const fetchData = async () => {

            try {
                if (mode === 'libre') {
                    // --- MODE SÉANCE LIBRE (Modèle) ---
                    // 1. Récupérer les infos du modèle
                    const respModel = await fetch(`/api/modeleSeance/${id}`);
                    if (!respModel.ok) throw new Error("Modèle introuvable");
                    const modelInfo = await respModel.json();

                    // 2. Récupérer la dernière fois que cette séance a été faite
                    try {
                        const respLast = await fetch(`/api/sessionSport/last-completion/${id}`);
                        if (respLast.ok) {
                            const lastData = await respLast.json();
                            setLastCompletion(lastData.lastCompletion);
                        }
                    } catch (err) {
                        // Erreur silencieuse - pas critique
                    }

                    // 3. Récupérer les exos du modèle
                    const respExos = await fetch(`/api/modeleSeance/${id}/exos`);
                    if (!respExos.ok) throw new Error("Exos du modèle introuvables");
                    const rawExos = await respExos.json();

                    // 3. Adapter les données pour correspondre au format attendu par Seance.jsx
                    const adaptedExos = rawExos.map(exo => ({
                        ...exo,
                        description: exo.description_exo, // Mapping
                        img: exo.img_exo, // Mapping
                        // Les autres champs (series, repetitions, notes) sont déjà là
                    }));

                    setSessionData({
                        session: {
                            nom: modelInfo.nom,
                            duree_minutes: modelInfo.duree_minutes,
                            description: modelInfo.description,
                            tags_zone_corps: modelInfo.tags_zone_corps, // Ajouté ici
                            finish: false // Une séance libre n'est jamais "déjà finie" au chargement
                        },
                        exercices: adaptedExos
                    });

                } else {
                    // --- MODE NORMAL (Session planifiée OU communautaire) ---
                    const response = await fetch(`/api/sessionSport/details/${id}`);
                    if (response.ok) {
                        const data = await response.json();

                        // Déterminer si c'est une session communautaire ou personnalisée
                        const isComm = data.session.is_public && data.session.created_by_user_id;
                        const isCustom = !data.session.is_generated;
                        setIsCommunitySession(isComm || isCustom);

                        if (isComm || isCustom) {
                            // Pour les sessions communautaires et perso, charger la dernière complétion
                            try {
                                const respLast = await fetch(`/api/sessionSport/community-last-completion/${id}`);
                                if (respLast.ok) {
                                    const lastData = await respLast.json();
                                    setLastCompletion(lastData.lastCompletion);
                                }
                            } catch (err) {
                                // Erreur silencieuse - pas critique
                            }
                        } else if (data.session.finish) {
                            setIsAlreadyDone(true);
                        }

                        setSessionData(data);
                    } else {
                        setError("Impossible de charger la séance.");
                    }
                }
            } catch (err) {
                console.error(err);
                setError("Erreur de chargement.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [mode]);

    const currentExo = sessionData ? sessionData.exercices[currentExerciceIndex] : null;

    const handleExoFinished = () => {
        setIsResting(true);
    };

    const handleRestFinished = async () => {
        setIsResting(false);

        const currentSeriesNum = Number(currentSerie);
        const totalSeriesNum = Number(currentExo.series);

        if (currentSeriesNum < totalSeriesNum) {
            setCurrentSerie(prev => prev + 1);
        } else {
            if (currentExerciceIndex < sessionData.exercices.length - 1) {
                setCurrentSerie(1);
                setCurrentExerciceIndex(prev => prev + 1);
            } else {
                // SÉANCE TERMINÉE
                try {
                    let endpoint;
                    if (mode === 'libre') {
                        endpoint = `/api/sessionSport/complete-free/${sessionId}`;
                    } else if (isCommunitySession) {
                        endpoint = `/api/sessionSport/complete-community/${sessionId}`;
                    } else {
                        endpoint = `/api/sessionSport/${sessionId}/complete`;
                    }

                    const response = await fetch(endpoint, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setGamificationData(data);
                    }
                } catch (err) {
                    console.error("Erreur validation", err);
                }
                
                setIsFinished(true);
            }
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
            <Dumbbell className="w-12 h-12 text-sport animate-bounce" />
            <div className="text-xl font-semibold text-sport">{t('session.preparing_session')}</div>
        </div>
    );
    if (error) return <div className="flex items-center justify-center min-h-screen text-error text-lg">{t('session.global_load_error')} <a href="/" className="ml-2 underline text-sport flex items-center gap-1"><ArrowLeft className="w-4 h-4" /> {t('common.back')}</a></div>;
    if (!sessionData) return <div className="flex items-center justify-center min-h-screen text-gray-600">{t('session.no_data')}</div>;

    if (isFinished) {
        let returnPath = '/mon-programme-sport';

        if (mode === 'libre' && sessionData.session.tags_zone_corps) {
            returnPath = `/modeles/${encodeURIComponent(sessionData.session.tags_zone_corps[0])}`;
        } else if (isCommunitySession) {
            // Si c'est une séance qu'on a créée soi-même mais qu'on a faite via ce manager
            returnPath = sessionData.session.created_by_user_id === sessionData.session.id_utilisateur 
                ? '/sessions/my-sessions' 
                : '/sessions/community';
        }

        const hasBadges = gamificationData?.badges_debloques && gamificationData.badges_debloques.length > 0;

        return (
            <>
                <Header />
                <main className="min-h-screen bg-background text-text-main py-8 px-4 pb-24">
                    <div className="bg-white p-10 rounded-2xl shadow-sm max-w-[500px] mx-auto border border-gray-100">
                        <div className="flex justify-center mb-4 text-success animate-bounce">
                            <CheckCircle2 size={64} />
                        </div>
                        <h1 className="text-success text-4xl font-bold mb-5 text-center">{t('session.congrats')}</h1>
                        <p className="text-gray-700 mb-3 text-xl text-center">
                            {t('session.completed_text')} <strong>{sessionData.session.nom}</strong>.
                        </p>
                        <p className="text-gray-500 mb-6 text-center"></p>

                    {gamificationData && (
                        <div className="my-8">
                            {/* Section XP/Mascotte - Uniquement pour les séances personnalisées du programme */}
                            {mode !== 'libre' && !isCommunitySession && (
                                <div className="p-6 bg-gradient-to-br from-sport/10 to-sport/5 rounded-xl border border-sport/20 mb-6">
                                    <div className="flex items-center justify-center gap-6">
                                        <div className="text-center">
                                            <p className="text-sport font-bold text-3xl mb-1">+50 XP</p>
                                            <p className="text-sport/60 text-sm">{t('session.xp_earned')}</p>
                                        </div>
                                        <div className="h-12 w-[2px] bg-sport/30"></div>
                                        <div className="text-center flex flex-col items-center">
                                            <Award className="w-6 h-6 text-sport mb-1" />
                                            <p className="text-sport font-bold text-xl mb-1">{t('profilePage.mascotte.level', { level: gamificationData.mascotte?.niveau || '?' })}</p>
                                            <p className="text-sport/60 text-xs">{t('session.mascot_level')}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section Mascotte seule - Pour les séances libres et communautaires */}
                            {(mode === 'libre' || isCommunitySession) && !hasBadges && (
                                <div className="p-6 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                                    <div className="text-center flex flex-col items-center">
                                        <Award className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-gray-600 text-sm mb-1">{t('session.your_mascot')}</p>
                                        <p className="text-gray-800 font-bold text-2xl">{t('profilePage.mascotte.level', { level: gamificationData.mascotte?.niveau || '?' })}</p>
                                        <p className="text-gray-500 text-xs mt-2">
                                            {mode === 'libre' ? t('session.no_xp_free') : (sessionData.session.is_public ? t('session.no_xp_community') : t('session.no_xp_custom'))}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Section Badges - Pour tous les types de séances si badges débloqués */}
                            {hasBadges && (
                                <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-300 shadow-md">
                                    <p className="text-gray-800 font-bold text-lg mb-4 flex items-center justify-center gap-2">
                                        <Trophy className="text-yellow-500 w-6 h-6" />
                                        {t('session.new_badges')}
                                    </p>
                                    <div className="flex justify-center gap-4 flex-wrap">
                                        {gamificationData.badges_debloques.map((badge, idx) => {
                                            const BadgeIcon = 
                                                badge === 'premier_pas' ? Footprints :
                                                badge === 'guerrier_lundi' ? Sword :
                                                badge === 'serie_7_jours' ? Flame :
                                                badge === 'participation' ? Target : Trophy;
                                            
                                            return (
                                                <div key={idx} className="bg-white p-4 rounded-xl shadow-md border-2 border-yellow-400 flex flex-col items-center min-w-[90px] transform hover:scale-105 transition-transform">
                                                    <BadgeIcon className="w-8 h-8 mb-2 text-yellow-600" />
                                                    <span className="text-xs font-bold text-gray-700 text-center leading-tight uppercase">
                                                        {badge.replace(/_/g, ' ')}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <button
                        className="w-full bg-sport text-white px-8 py-4 text-xl rounded-full font-bold hover:brightness-110 transition-all duration-200 active:scale-95 shadow-lg shadow-sport/20 mt-4"
                        onClick={() => navigate(returnPath)}
                    >
                        {mode === 'libre' ? t('session.return_to_sessions') : isCommunitySession ? t('session.return_to_community') : t('session.return_to_program')}
                    </button>
                </div>
                </main>
                <Footer />
            </>
        );
    }

    // Calcul du nom de la prochaine étape pour l'affichage repos
    const currentSeriesNum = Number(currentSerie);
    const totalSeriesNum = Number(currentExo ? currentExo.series : 0);

    let nextStepName = t('session.finish_session');
    if (currentSeriesNum < totalSeriesNum) {
        nextStepName = `${t('session.set')} ${currentSeriesNum + 1}`;
    } else if (currentExerciceIndex < sessionData.exercices.length - 1) {
        nextStepName = sessionData.exercices[currentExerciceIndex + 1].nom_exercice;
    }

    // Calcul du temps écoulé depuis la dernière fois
    const getTimeSinceLastCompletion = () => {
        if (!lastCompletion) return null;

        const now = new Date();
        const lastDate = new Date(lastCompletion);
        const diffMs = now - lastDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return t('session.ago_min', { count: diffMins });
        if (diffHours < 24) return t('session.ago_hour', { count: diffHours });
        if (diffDays === 1) return t('session.yesterday');
        if (diffDays < 7) return t('session.ago_days', { count: diffDays });
        return lastDate.toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR');
    };

    return (
        <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
            isResting ? 'bg-sport text-white' : 'bg-background text-text-main'
        }`}>
            <Header />
            <main className="flex-1 flex flex-col items-center p-5 max-w-[600px] mx-auto w-full justify-around pb-24">
                <div className="w-full h-2.5 bg-gray-200 rounded-md mb-3 overflow-hidden">
                    <div
                        className="h-full bg-sport transition-all duration-500"
                        style={{ width: `${((currentExerciceIndex) / sessionData.exercices.length) * 100}%` }}
                    ></div>
                </div>

                {/* Affichage de la dernière fois */}
                {(mode === 'libre' || isCommunitySession) && lastCompletion && (
                    <div className="w-full mb-3 text-center">
                        <span className="inline-block px-3 py-1 bg-sport/10 text-sport rounded-full text-sm flex items-center justify-center gap-2 mx-auto w-fit">
                            <Timer className="w-4 h-4" />
                            {t('session.last_time')} {getTimeSinceLastCompletion()}
                        </span>
                    </div>
                )}

                {isResting ? (
                    <Repos
                        nextExo={handleRestFinished}
                        restTime={currentExo.temps_repos_secondes || 60}
                        nextExoName={nextStepName}
                    />
                ) : (
                    <Seance
                        exercice={currentExo}
                        exerciceIndex={currentExerciceIndex + 1}
                        totalExos={sessionData.exercices.length}
                        currentSerie={currentSerie}
                        isAlreadyDone={isAlreadyDone}
                        onExoFini={handleExoFinished}
                    />
                )}
            </main>
            <Footer />
        </div>
    );
}

export default SessionManager;