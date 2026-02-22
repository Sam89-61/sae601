// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Trophy, Users, Dumbbell, Utensils, Heart, Copy } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import silhouette from '../../media/silhouette.png';
import jambesImg from '../../media/seance/jambe.png';
import abdoImg from '../../media/seance/buste.png';
import cardioImg from '../../media/seance/cardio.png';
import bouffe from '../../media/bouffe.png';
import { useAuthStore } from '../stores/authStore';

function Accueil() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const userName = useAuthStore((state) => state.getUserPseudo());
    const [muscleGroups, setMuscleGroups] = useState([]);
    const [popularSessions, setPopularSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const seanceRes = await fetch('/api/modeleSeance');
                if (seanceRes.ok) {
                    const data = await seanceRes.json();
                    const allZones = data.flatMap(modele => modele.tags_zone_corps);
                    const uniqueZones = [...new Set(allZones)];
                    setMuscleGroups(uniqueZones);
                }

                const communityRes = await fetch('/api/sessions/community');
                if (communityRes.ok) {
                    const data = await communityRes.json();
                    // L'API peut retourner un objet avec sessions ou directement un tableau
                    const sessions = Array.isArray(data) ? data : (data.sessions || []);
                    // Trier par nombre de likes et prendre les 3 premières
                    const sorted = sessions.sort((a, b) => (b.likes || 0) - (a.likes || 0)).slice(0, 3);
                    setPopularSessions(sorted);
                }
            } catch (err) {
                console.error("Erreur chargement données:", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const getImageForMuscle = (muscle) => {
        const muscleLower = muscle.toLowerCase();
        if (muscleLower.includes('jambe') || muscleLower.includes('leg')) return jambesImg;
        if (muscleLower.includes('haut du corps') || muscleLower.includes('torse') || muscleLower.includes('buste')) return abdoImg;
        if (muscleLower.includes('bras') || muscleLower.includes('arm')) return cardioImg;
        if (muscleLower.includes('pectoraux') || muscleLower.includes('chest')) return abdoImg;
        return cardioImg;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-6 pb-24 max-w-6xl mx-auto w-full">
                <div className="bg-sport rounded-2xl p-8 mb-8 shadow-lg">
                    <div>
                        <h1 className="text-white text-3xl md:text-4xl font-bold mb-2">
                            {t('home.welcome_user', { name: userName })}
                        </h1>
                        <p className="text-white/90 text-base mb-6">
                            {t('home.coach_waiting')}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => navigate('/mon-programme-sport')}
                                className="bg-white hover:bg-gray-50 text-sport rounded-xl p-5 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-sport/10 rounded-lg flex items-center justify-center">
                                        <Dumbbell className="w-8 h-8 text-sport" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-bold text-text-main">{t('home.sportProgram')}</div>
                                        <div className="text-sm text-gray-600">{t('home.your_training')}</div>
                                    </div>
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/mon-programme-alimentaire')}
                                className="bg-white hover:bg-gray-50 text-nutrition rounded-xl p-5 transition-all duration-200 shadow-md hover:shadow-lg"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-nutrition/10 rounded-lg flex items-center justify-center">
                                        <Utensils className="w-8 h-8 text-nutrition" />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-lg font-bold text-text-main">{t('home.foodProgram')}</div>
                                        <div className="text-sm text-gray-600">{t('home.your_meals')}</div>
                                    </div>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>


                <div className="border-t border-gray-400 my-8"></div>


                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-text-main mb-1">
                                {t('home.library_title')}
                            </h2>
                            <p className="text-gray-600 text-sm">{t('home.library_subtitle')}</p>
                        </div>
                        <button
                            onClick={() => navigate('/modeles')}
                            className="text-sport font-semibold hover:underline flex items-center gap-1 text-sm"
                        >
                            {t('common.view_all')}
                        </button>
                    </div>

                    {muscleGroups.length === 0 ? (
                        <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {muscleGroups.map((muscle) => (
                                <button
                                    key={muscle}
                                    onClick={() => {
                                        navigate(`/modeles/${encodeURIComponent(muscle)}`);
                                    }}
                                    className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 aspect-square group"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${getImageForMuscle(muscle)})`,
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-lg md:text-xl font-bold text-shadow text-center px-2">
                                            {muscle}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <div className="border-t border-gray-400 my-8"></div>
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-text-main">
                                {t('home.popular_sessions')}
                            </h2>
                            <p className="text-gray-600 text-sm">{t('home.popular_subtitle')}</p>
                        </div>
                        <button
                            onClick={() => navigate('/sessions/community')}
                            className="text-sport font-semibold hover:underline flex items-center gap-1 text-sm"
                        >
                            {t('common.view_all')}
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
                    ) : popularSessions.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                            <p className="text-gray-500">{t('home.no_community_sessions')}</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {popularSessions.map((session, index) => (
                                <div
                                    key={`${session.type}-${session.id || session.id_session_sport || session.id_session_repas || index}`}
                                    onClick={() => navigate(`/sessions/${session.type}/${session.id || session.id_session_sport || session.id_session_repas}`)}
                                    className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-gray-200 hover:border-sport"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-text-main line-clamp-1 mb-1">{session.nom}</h3>
                                            <p className="text-xs text-gray-500">{t('home.by_user', { name: session.createur_pseudo })}</p>
                                        </div>
                                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${session.type === 'sport' ? 'bg-sport/10 text-sport' : 'bg-nutrition/10 text-nutrition'}`}>
                                            {session.type === 'sport' ? t('session.sport') : t('session.repas')}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                                        {session.description || t('home.no_description')}
                                    </p>

                                    <div className="flex items-center gap-4 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            {session.likes || 0} {t('session.likes')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Copy className="w-4 h-4 text-blue-500" />
                                            {session.copies || 0} {t('session.copy')}s
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => navigate('/classement')}
                        className="bg-rank-1 hover:brightness-110 text-text-main font-bold py-6 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-white/30 rounded-lg flex items-center justify-center text-2xl">
                            <Trophy className="w-8 h-8 text-rank-3" />
                        </div>
                        <div className="text-left">
                            <div className="text-xl font-bold">{t('home.ranking')}</div>
                            <div className="text-sm opacity-80">{t('home.ranking_subtitle')}</div>
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/communaute')}
                        className="bg-sport hover:brightness-110 text-white font-bold py-6 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-4"
                    >
                        <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center text-2xl">
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-xl font-bold">{t('social.title')}</div>
                            <div className="text-sm opacity-90">{t('home.community_subtitle')}</div>
                        </div>
                    </button>
                </div>
            </main>

            <Footer />

            <style>{`
                .text-shadow {
                    text-shadow: 2px 2px 8px rgba(0, 0, 0, 0.9);
                }
            `}</style>
        </div>
    );
}

export default Accueil;
