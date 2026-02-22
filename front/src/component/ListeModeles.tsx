// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import './style/MonProgramme.css'; // Réutilisation du style existant
import jambesImg from '../../media/seance/jambe.png';
import abdoImg from '../../media/seance/buste.png';
import cardioImg from '../../media/seance/cardio.png';

function ListeModeles({ zone }) {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [modeles, setModeles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastCompletions, setLastCompletions] = useState({});

    useEffect(() => {
        const fetchModeles = async () => {
            try {
                const response = await fetch('/api/modeleSeance', {
                    headers: {
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const filtered = data.filter(m =>
                        Array.isArray(m.tags_zone_corps) && m.tags_zone_corps.includes(decodeURIComponent(zone))
                    );
                    setModeles(filtered);

                    // Récupérer la dernière complétion pour chaque modèle
                    const completions = {};
                    await Promise.all(filtered.map(async (modele) => {
                        try {
                            const resp = await fetch(`/api/sessionSport/last-completion/${modele.id}`);
                            if (resp.ok) {
                                const data = await resp.json();
                                completions[modele.id] = data.lastCompletion;
                            }
                        } catch (err) {
                            // Erreur silencieuse - pas critique
                        }
                    }));
                    setLastCompletions(completions);
                } else {
                    console.error("Erreur chargement modèles");
                }
            } catch (error) {
                console.error("Erreur réseau", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchModeles();
    }, [zone]);

    const handleLancer = (idModele) => {
        navigate(`/seance-libre/${idModele}`);
    };

    // Helper pour choisir l'image
    const getImageForModel = (modele) => {
        const tags = modele.tags_zone_corps || [];
        // On cherche un match dans les tags
        const tagsLower = tags.map(t => t.toLowerCase());

        if (tagsLower.some(t => t.includes('jambe') || t.includes('leg'))) return jambesImg;
        if (tagsLower.some(t => t.includes('haut du corps') || t.includes('buste') || t.includes('pectoraux') || t.includes('torse'))) return abdoImg;
        if (tagsLower.some(t => t.includes('bras') || t.includes('arm'))) return cardioImg;

        // Par défaut ou si tag cardio
        return cardioImg;
    };

    // Helper pour formatter le temps depuis la dernière complétion
    const getTimeSinceLastCompletion = (lastCompletion) => {
        if (!lastCompletion) return t('library.never_done');

        const now = new Date();
        const lastDate = new Date(lastCompletion);
        const diffMs = now - lastDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return t('library.just_now');
        if (diffMins < 60) return t('session.ago_min', { count: diffMins });
        if (diffHours < 24) return t('session.ago_hour', { count: diffHours });
        if (diffDays === 1) return t('session.yesterday');
        if (diffDays < 7) return t('session.ago_days', { count: diffDays });
        return lastDate.toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 mon-programme-container pb-24">
                <div className="programme-header">
                    <h1>{t('library.sessions_for', { zone: decodeURIComponent(zone) })}</h1>
                    <p className="programme-description">{t('library.predefined_desc')}</p>
                </div>

                <h2 className="section-title">{t('library.catalog')}</h2>

                {isLoading ? (
                    <div className="app-loading">{t('library.loading_sessions')}</div>
                ) : modeles.length === 0 ? (
                    <div className="empty-state">
                        <p>{t('library.no_sessions')}</p>
                        <button className="btn-lancer" onClick={() => navigate('/')}>{t('common.back')}</button>
                    </div>
                ) : (
                    modeles.map((modele) => (
                        <div key={modele.id} className="session-card">
                            <img
                                src={getImageForModel(modele)}
                                alt={modele.nom}
                                className="session-image"
                            />
                            <div className="session-info">
                                <span className="session-date">
                                    {modele.difficulte} • {modele.duree_minutes} min • {modele.tags_equipement ? modele.tags_equipement.join(', ') : t('library.no_material')}
                                </span>
                                <h3>{modele.nom}</h3>
                                <p>{modele.description}</p>
                                <div className="mt-2">
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                                        lastCompletions[modele.id] ? 'bg-sport/10 text-sport' : 'bg-gray-100 text-gray-500'
                                    }`}>
                                        <Calendar className="w-3 h-3" />
                                        {t('session.last_time')} {getTimeSinceLastCompletion(lastCompletions[modele.id])}
                                    </span>
                                </div>
                            </div>
                            <button
                                className="btn-lancer"
                                onClick={() => handleLancer(modele.id)}
                            >
                                {t('library.start')}
                            </button>
                        </div>
                    ))
                )}
            </main>
            <Footer />
        </div>
    );
}

export default ListeModeles;
