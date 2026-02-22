// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { Sparkles, Footprints, Sword, Flame, Target, Trophy } from 'lucide-react';

function BadgePopup({ badges, onClose }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const visible = async () => {
            if (badges && badges.length > 0) {
                setIsVisible(true);
            }
        };
        visible();
    }, [badges]);

    useEffect(() => {
        if (badges && badges.length > 0 && isVisible) {
            // Auto-fermeture après 4 secondes
            const timer = setTimeout(() => {
                if (currentIndex < badges.length - 1) {
                    // Passer au badge suivant
                    setIsVisible(false);
                    setTimeout(() => {
                        setCurrentIndex(prev => prev + 1);
                    }, 300);
                } else {
                    // Fermer complètement
                    setIsVisible(false);
                    setTimeout(() => {
                        onClose();
                    }, 300);
                }
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [currentIndex, badges, onClose, isVisible]);

    if (!badges || badges.length === 0) return null;

    const currentBadge = badges[currentIndex];
    
    const badgeInfo = {
        premier_pas: { icon: Footprints, nom: 'Premier pas', description: 'Première séance terminée !' },
        guerrier_lundi: { icon: Sword, nom: 'Guerrier du lundi', description: 'Séance un lundi !' },
        serie_7_jours: { icon: Flame, nom: '7 séances de suite', description: 'Une semaine complète !' },
        participation: { icon: Trophy, nom: 'Participation', description: 'Participation à un événement !' }
    };

    const info = badgeInfo[currentBadge] || { icon: Trophy, nom: currentBadge, description: 'Badge débloqué !' };
    const BadgeIcon = info.icon;

    return (
        <div
            className={`fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300 p-4 ${
                isVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
            onClick={onClose}
        >
            <div
                className={`bg-gradient-to-br from-purple-600 to-purple-800 rounded-3xl p-6 sm:p-8 max-w-sm w-full max-h-[90vh] overflow-y-auto shadow-2xl relative transition-all duration-500 scrollbar-thin scrollbar-thumb-white/30 scrollbar-track-transparent hover:scrollbar-thumb-white/50 ${
                    isVisible ? 'scale-100 translate-y-0 opacity-100' : 'scale-75 translate-y-12 opacity-0'
                }`}
                onClick={(e) => e.stopPropagation()}
                style={{
                    transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Effet de brillance en arrière-plan */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div 
                        className="absolute w-full h-full bg-gradient-to-r from-transparent via-white/10 to-transparent"
                        style={{
                            animation: 'shine 3s infinite linear',
                            transform: 'rotate(45deg) translateX(-100%)',
                        }}
                    />
                </div>

                {/* Header avec étincelles */}
                <div className="flex items-center justify-center gap-3 mb-6 relative z-10">
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" />
                    <h2 className="text-3xl font-extrabold text-white drop-shadow-lg">
                        Nouveau Badge !
                    </h2>
                    <Sparkles className="w-6 h-6 text-yellow-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                </div>

                {/* Contenu central */}
                <div className="text-center relative z-10">
                    {/* Conteneur du badge avec glow */}
                    <div className="relative w-32 h-32 mx-auto mb-5 flex items-center justify-center">
                        {/* Effet de glow pulsant */}
                        <div 
                            className="absolute inset-0 rounded-full bg-yellow-400 opacity-60 blur-xl"
                            style={{
                                animation: 'pulse-glow 2s ease-in-out infinite',
                            }}
                        />
                        
                        {/* Badge icône avec animation */}
                        <div 
                            className="relative z-10 drop-shadow-2xl flex items-center justify-center"
                            style={{
                                animation: 'badge-bounce 0.6s ease-out',
                            }}
                        >
                            <BadgeIcon className="w-20 h-20 text-white" />
                        </div>
                    </div>

                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                        {info.nom}
                    </h3>
                    
                    <p className="text-white/90 text-base mb-5 leading-relaxed">
                        {info.description}
                    </p>

                    {badges.length > 1 && (
                        <div className="inline-block bg-white/15 text-white/80 text-sm font-semibold px-3 py-1.5 rounded-xl mt-4 backdrop-blur-sm">
                            Badge {currentIndex + 1} / {badges.length}
                        </div>
                    )}
                </div>

                {/* Bouton de fermeture */}
                <button 
                    className="w-full bg-white text-purple-600 font-bold py-3.5 rounded-xl mt-5 shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 relative z-10"
                    onClick={onClose}
                >
                    Continuer
                </button>
            </div>

            {/* Styles pour les animations personnalisées */}
            <style>{`
                @keyframes shine {
                    0% { transform: rotate(45deg) translateX(-100%); }
                    100% { transform: rotate(45deg) translateX(200%); }
                }

                @keyframes pulse-glow {
                    0%, 100% { transform: scale(0.9); opacity: 0.6; }
                    50% { transform: scale(1.1); opacity: 1; }
                }

                @keyframes badge-bounce {
                    0% { transform: scale(0) rotate(-180deg); }
                    60% { transform: scale(1.2) rotate(10deg); }
                    80% { transform: scale(0.9) rotate(-5deg); }
                    100% { transform: scale(1) rotate(0deg); }
                }

                /* Style personnalisé pour la scrollbar */
                .bg-gradient-to-br::-webkit-scrollbar {
                    width: 8px;
                }

                .bg-gradient-to-br::-webkit-scrollbar-track {
                    background: transparent;
                    border-radius: 10px;
                }

                .bg-gradient-to-br::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 10px;
                }

                .bg-gradient-to-br::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </div>
    );
}

export default BadgePopup;
