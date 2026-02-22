// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, Utensils, Heart, Play, Copy, User, Globe } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const CommunitySessions = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all'); // all, sport, repas

    useEffect(() => {
        fetchSessions();
    }, [filter, search]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const typeParam = filter !== 'all' ? `&type=${filter}` : '';
            const response = await fetch(
                `/api/sessions/community?search=${encodeURIComponent(search)}${typeParam}`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            setSessions(data.sessions || []);
        } catch (err) {
            console.error('Erreur chargement séances:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (session) => {
        try {
            const type = session.session_type || (session.id_session_sport ? 'sport' : 'repas');
            const id = session.id_session_sport || session.id_session_repas;

            const response = await fetch(`/api/sessions/${type}/${id}/like`, {
                method: 'POST'
            });
            const data = await response.json();

            setSessions(prev => prev.map(s =>
                (s.id_session_sport === id || s.id_session_repas === id)
                    ? { ...s, user_has_liked: data.liked, nb_likes: data.like_count }
                    : s
            ));
        } catch (err) {
            console.error('Erreur like:', err);
        }
    };

    const handleCopy = async (session) => {
        if (!confirm('Copier cette séance dans vos séances personnelles?')) return;

        try {
            const type = session.session_type || (session.id_session_sport ? 'sport' : 'repas');
            const id = session.id_session_sport || session.id_session_repas;

            const response = await fetch(`/api/sessions/${type}/${id}/copy`, {
                method: 'POST'
            });

            if (response.ok) {
                alert('Séance copiée avec succès!');
                navigate('/sessions/my-sessions');
            } else {
                const error = await response.json();
                alert(error.message);
            }
        } catch (err) {
            console.error('Erreur copie:', err);
            alert('Erreur lors de la copie');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-text-main">
            <Header />
            
            <main className="flex-1 py-8 px-4 pb-24">
                <div className="max-w-7xl mx-auto">
                    <button 
                        onClick={() => navigate('/communaute')}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                    >
                        {t('common.back')}
                    </button>
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                            <h1 className="text-3xl font-black text-text-main flex items-center gap-2">
                                {t('community.sessions')} <Globe className="w-7 h-7" />
                            </h1>
                                                    <button
                                                        onClick={() => navigate('/sessions/create')}
                                                        className="px-6 py-3 bg-sport hover:brightness-110 text-white rounded-lg transition-colors"
                                                    >
                                                        + Créer une séance
                                                    </button>
                                                </div>
                            
                                                <div className="mt-4 flex gap-4">
                                                    <input
                                                        type="text"
                                                        value={search}
                                                        onChange={(e) => setSearch(e.target.value)}
                                                        placeholder="Rechercher une séance..."
                                                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sport focus:border-transparent outline-none"
                                                    />
                                                    <select
                                                        value={filter}
                                                        onChange={(e) => setFilter(e.target.value)}
                                                        className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-sport outline-none"
                                                    >
                                                        <option value="all">Toutes</option>
                                                        <option value="sport">Sport</option>
                                                        <option value="repas">Repas</option>
                                                    </select>
                                                </div>
                                            </div>
                            
                                            {loading ? (
                                                <div className="text-center py-12">
                                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport mx-auto"></div>
                                                </div>
                                            ) : sessions.length === 0 ? (
                                                <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                                                    <p className="text-gray-500 text-lg">Aucune séance disponible</p>
                                                </div>
                                            ) : (
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {sessions.map(session => {
                                                        const type = session.session_type || (session.id_session_sport ? 'sport' : 'repas');
                                                        const id = session.id_session_sport || session.id_session_repas;
                            
                                                        return (
                                                            <div
                                                                key={`${type}-${id}`}
                                                                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                                                            >
                                                                <div className="p-6">
                                                                    <div className="flex justify-between items-start mb-4">
                                                                        <div className="flex items-center gap-2">
                                                                            {type === 'sport' ? (
                                                                                <Dumbbell className="w-6 h-6 text-sport" />
                                                                            ) : (
                                                                                <Utensils className="w-6 h-6 text-nutrition" />
                                                                            )}
                                                                            <h3 className="text-xl font-bold text-text-main">
                                                                                {session.nom}
                                                                            </h3>
                                                                        </div>
                                                                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-success/10 text-success flex items-center gap-1">
                                                                            <Globe className="w-3 h-3" /> Public
                                                                        </span>
                                                                    </div>
                            
                                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                                                        {session.description || session.notes || 'Aucune description'}
                                                                    </p>
                            
                                                                    <div className="flex items-center gap-2 mb-4 text-sm text-gray-500">
                                                                        <User className="w-4 h-4" />
                                                                        <span>{session.creator_pseudo}</span>
                                                                    </div>
                            
                                                                    <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
                                                                        <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {session.nb_likes || 0}</span>
                                                                        <span className="flex items-center gap-1"><Copy className="w-4 h-4" /> {session.nb_utilisations || 0} utilisations</span>
                                                                    </div>
                            
                                                                    <div className="flex gap-2">
                                                                        {type === 'sport' ? (
                                                                            <button
                                                                                onClick={() => navigate(`/session/${id}`)}
                                                                                className="flex-1 px-4 py-2 bg-success text-white rounded-lg hover:brightness-110 transition-colors flex items-center justify-center gap-2"
                                                                            >
                                                                                <Play className="w-4 h-4" /> Faire
                                                                            </button>
                                                                        ) : (
                                                                            <button
                                                                                onClick={() => navigate(`/sessions/repas/${id}`)}
                                                                                className="flex-1 px-4 py-2 bg-nutrition/10 text-nutrition rounded-lg hover:bg-nutrition/20 transition-colors flex items-center justify-center gap-2"
                                                                            >
                                                                                <Utensils className="w-4 h-4" /> Voir
                                                                            </button>
                                                                        )}
                                                                        <button
                                                                            onClick={() => handleLike(session)}
                                                                            className={`flex-1 px-4 py-2 rounded-lg border-2 transition-all flex items-center justify-center gap-1 ${
                                                                                session.user_has_liked
                                                                                    ? 'border-error bg-error/10 text-error'
                                                                                    : 'border-gray-200 hover:border-error/30 text-gray-700'
                                                                            }`}
                                                                        >
                                                                            <Heart className={`w-4 h-4 ${session.user_has_liked ? 'fill-error' : ''}`} /> Like
                                                                        </button>
                                                                        <button
                                                                            onClick={() => handleCopy(session)}
                                                                            className="flex-1 px-4 py-2 bg-sport text-white rounded-lg hover:brightness-110 transition-colors flex items-center justify-center gap-1"
                                                                        >
                                                                            <Copy className="w-4 h-4" /> Copier
                                                                        </button>
                                                                    </div>                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default CommunitySessions;
