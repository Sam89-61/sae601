// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, BarChart2, Star, Sparkles, Users, Dumbbell, Trophy, Award } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import mascotteSvg from '../../media/mascotte.svg';

interface Props {
    userId?: string | number;
}

const PublicProfilPage: React.FC<Props> = ({ userId }) => {
    const navigate = useNavigate();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);

    useEffect(() => {
        if (!userId) {
            setError('Utilisateur introuvable.');
            setLoading(false);
            return;
        }

        fetch(`/api/social/public-profile/${userId}`)
            .then(async res => {
                const json = await res.json();
                if (res.status === 403 && json.isPrivate) {
                    setIsPrivate(true);
                } else if (!res.ok) {
                    throw new Error(json.message || 'Utilisateur introuvable.');
                } else {
                    setData(json);
                }
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || 'Erreur lors du chargement.');
                setLoading(false);
            });
    }, [userId]);

    return (
        <>
            <Header />

            <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full" style={{ minHeight: '0vh' }}>
                <div className="px-4 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                    >
                        ← Retour
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center mt-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-sport"></div>
                    </div>
                ) : isPrivate ? (
                    <div className="text-center py-16 bg-white rounded-2xl shadow-md border border-gray-100 mx-4 h-85" style={{"minHeight": "70vh"}}>
                        <Lock className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h2 className="text-xl font-bold text-text-main mb-2">Profil privé</h2>
                        <p className="text-gray-400 text-sm">Cet utilisateur a choisi de ne pas rendre son profil visible.</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-100 mx-4">
                        <Frown className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-gray-400 italic">{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-gradient-to-r from-sport to-sport/80 rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                            <div className="relative flex items-center gap-6">
                                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white/30 overflow-hidden p-2 shadow-xl flex-shrink-0">
                                    <img src={mascotteSvg} alt="Mascotte" className="w-full h-full object-contain" />
                                </div>

                                <div className="flex-1">
                                    <h1 className="text-white text-2xl font-bold mb-1">{data.user.pseudo}</h1>
                                    {data.user.date_inscription && (
                                        <p className="text-white/80 text-sm">
                                            Membre depuis {new Date(data.user.date_inscription).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                        </p>
                                    )}

                                    {data.mascotte && (
                                        <div className="mt-3 flex items-center gap-4">
                                            <div className="bg-rank-1 text-text-main text-xs font-black px-3 py-1 rounded-full border-2 border-white/20 shadow-sm">
                                                Niveau {data.mascotte.niveau}
                                            </div>
                                            <div className="flex-1 max-w-xs">
                                                <div className="flex justify-between text-xs text-white/90 mb-1 font-medium">
                                                    <span>{data.mascotte.experience % 100} XP</span>
                                                    <span>100 XP</span>
                                                </div>
                                                <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-rank-1 shadow-[0_0_10px_rgba(250,204,21,0.6)] transition-all duration-500"
                                                        style={{ width: `${data.mascotte.experience % 100}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-sport/10 rounded-xl flex items-center justify-center">
                                        <BarChart2 className="w-6 h-6 text-sport" />
                                    </div>
                                    <h2 className="text-xl font-bold text-text-main">Statistiques</h2>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Star className="w-5 h-5 text-rank-1" />
                                            <span className="text-sm font-medium text-text-main">Niveau mascotte</span>
                                        </div>
                                        <span className="font-black text-sport">
                                            {data.mascotte ? data.mascotte.niveau : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Sparkles className="w-5 h-5 text-sport" />
                                            <span className="text-sm font-medium text-text-main">XP total</span>
                                        </div>
                                        <span className="font-black text-sport">
                                            {data.mascotte ? data.mascotte.experience : '—'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Users className="w-5 h-5 text-sport" />
                                            <span className="text-sm font-medium text-text-main">Amis</span>
                                        </div>
                                        <span className="font-black text-sport">{data.friendsCount}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-background rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <Dumbbell className="w-5 h-5 text-sport" />
                                            <span className="text-sm font-medium text-text-main">Séances complétées</span>
                                        </div>
                                        <span className="font-black text-sport">{data.sessionsCount}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 bg-rank-1/10 rounded-xl flex items-center justify-center">
                                        <Trophy className="w-6 h-6 text-rank-1" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-text-main">Badges</h2>
                                        <p className="text-sm text-gray-500">
                                            {data.badges.length} badge{data.badges.length > 1 ? 's' : ''} débloqué{data.badges.length > 1 ? 's' : ''}
                                        </p>
                                    </div>
                                </div>

                                {data.badges.length === 0 ? (
                                    <div className="text-center py-8 bg-background rounded-xl">
                                        <Award className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                        <p className="text-gray-400 italic text-sm">Aucun badge pour le moment</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 gap-3">
                                        {data.badges.map((badge: any) => (
                                            <div
                                                key={badge.id_badge}
                                                className="bg-gradient-to-br from-rank-1/5 to-sport/5 border border-sport/10 rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:scale-105"
                                            >
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-3xl mb-2 shadow-inner">
                                                    {badge.icone}
                                                </div>
                                                <h4 className="text-text-main font-bold text-xs leading-tight mb-1">{badge.nom}</h4>
                                                <p className="text-gray-500 text-[10px] line-clamp-2 leading-tight mb-1">{badge.description}</p>
                                                <p className="text-sport/60 text-[9px] italic font-medium">
                                                    {new Date(badge.date_obtention).toLocaleDateString()}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
            </main>

            <Footer />
        </>
    );
};

export default PublicProfilPage;
