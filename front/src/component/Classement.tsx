// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { getUserId } from '../utils/auth';
import { useChallenges, useLeaderboard, useSubmitScore } from '@/features/classement';
import { LoadingSpinner } from './shared';

const Classement: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [userId, setUserId] = useState<number | null>(null);
    useEffect(() => {
        const loadUserId = async () => {
            const id = await getUserId();
            setUserId(id);
        };
        loadUserId();
    }, []);

    // États locaux (UI uniquement)
    const [selectedChallengeId, setSelectedChallengeId] = useState<number | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [submissionData, setSubmissionData] = useState({ score: '', url_video_preuve: '' });

    const {
        data: challenges = [],
        isLoading: challengesLoading,
    } = useChallenges();

    // Auto-sélectionner le premier challenge
    useEffect(() => {
        if (challenges.length > 0 && !selectedChallengeId) {
            setSelectedChallengeId((challenges[0] as any).id_classement);
        }
    }, [challenges, selectedChallengeId]);

    const {
        data: leaderboardData = { leaderboard: [], userRank: null, challenge: null } as any,
        isLoading: leaderboardLoading,
    } = useLeaderboard(selectedChallengeId, userId);

    const submitScoreMutation = useSubmitScore();

    // Loading général
    const isLoading = challengesLoading || (selectedChallengeId && leaderboardLoading);

    const handleChallengeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedChallengeId(parseInt(e.target.value));
        setShowForm(false);
    };

    const handleSubmission = async (e: React.FormEvent) => {
        e.preventDefault();

        submitScoreMutation.mutate(
            {
                id_classement: selectedChallengeId,
                score: Number(submissionData.score),
                url_video_preuve: submissionData.url_video_preuve,
            },
            {
                onSuccess: () => {
                    // Fermer le formulaire après 2s de succès
                    setTimeout(() => {
                        setShowForm(false);
                        setSubmissionData({ score: '', url_video_preuve: '' });
                    }, 2000);
                },
            }
        );
    };

    // Helper pour l'affichage du podium
    const renderPodium = () => {
        const top3 = leaderboardData.leaderboard.slice(0, 3);
        // On réorganise pour le visuel : 2ème (gauche), 1er (milieu), 3ème (droite)
        const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);

        if (podiumOrder.length === 0) return null;

        return (
            <div className="flex justify-center items-end gap-2 sm:gap-6 mb-8 mt-4 min-h-[180px]">
                {/* 2ND PLACE */}
                {top3[1] && (
                    <div className="flex flex-col items-center animate-[slideUp_0.6s_ease-out]">
                        <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-rank-2 bg-slate-50 flex items-center justify-center overflow-hidden shadow-lg">
                                <span className="text-xl font-bold text-slate-600">{top3[1].pseudo.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-rank-2 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                2
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[80px]">{top3[1].pseudo}</p>
                            <p className="text-xs text-gray-500 font-mono">{top3[1].score} <span className="text-[10px]">{leaderboardData.challenge?.unite_mesure}</span></p>
                        </div>
                        <div className="h-16 w-16 sm:w-20 bg-gradient-to-t from-rank-2 to-slate-100 opacity-40 rounded-t-lg mt-2"></div>
                    </div>
                )}

                {/* 1ST PLACE */}
                {top3[0] && (
                    <div className="flex flex-col items-center z-10 -mb-2 animate-[slideUp_0.5s_ease-out]">
                         <div className="relative">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-rank-1 bg-yellow-50 flex items-center justify-center overflow-hidden shadow-xl ring-4 ring-rank-1/20">
                                <Crown className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-600" />
                            </div>
                            <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-rank-1 text-white text-sm font-bold px-3 py-1 rounded-full shadow-md">
                                1
                            </div>
                        </div>
                         <div className="text-center mt-3">
                            <p className="font-bold text-gray-900 text-base sm:text-lg truncate max-w-[100px]">{top3[0].pseudo}</p>
                            <p className="text-sm font-bold text-rank-3 font-mono">{top3[0].score} <span className="text-xs">{leaderboardData.challenge?.unite_mesure}</span></p>
                        </div>
                        <div className="h-24 w-20 sm:w-24 bg-gradient-to-t from-rank-1 to-yellow-50 opacity-50 rounded-t-lg mt-2 shadow-inner"></div>
                    </div>
                )}

                {/* 3RD PLACE */}
                {top3[2] && (
                    <div className="flex flex-col items-center animate-[slideUp_0.7s_ease-out]">
                         <div className="relative">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-4 border-rank-3 bg-orange-50 flex items-center justify-center overflow-hidden shadow-lg">
                                <span className="text-xl font-bold text-rank-3">{top3[2].pseudo.charAt(0)}</span>
                            </div>
                            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-rank-3 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-sm">
                                3
                            </div>
                        </div>
                        <div className="text-center mt-2">
                            <p className="font-semibold text-gray-800 text-sm sm:text-base truncate max-w-[80px]">{top3[2].pseudo}</p>
                            <p className="text-xs text-gray-500 font-mono">{top3[2].score} <span className="text-[10px]">{leaderboardData.challenge?.unite_mesure}</span></p>
                        </div>
                        <div className="h-12 w-16 sm:w-20 bg-gradient-to-t from-rank-3 to-orange-50 opacity-40 rounded-t-lg mt-2"></div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-text-main">
            <Header />

            <main className="flex-grow container mx-auto px-4 py-6 max-w-3xl">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                >
                    {t('common.back')}
                </button>

                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-extrabold text-text-main mb-4">
                        {t('rankingPage.title')}
                    </h1>
                    
                    <div className="relative inline-block w-full max-w-xs mx-auto">
                        <select 
                            value={selectedChallengeId || ''} 
                            onChange={handleChallengeChange}
                            className="flex w-full px-4 py-3 pr-8 text-base text-text-main bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-sport focus:border-transparent appearance-none transition-shadow"
                        >
                            {challenges.map(c => (
                                <option className='text-s' key={c.id_classement} value={c.id_classement}>{c.nom}</option>
                            ))}
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                    </div>
                </div>

                {isLoading ? (
                     <LoadingSpinner size="lg" text={t('common.loading')} />
                ) : challenges.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <p className="text-gray-500 text-lg">{t('rankingPage.noChallenge')}</p>
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-sport/5 rounded-full blur-2xl opacity-50"></div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <h2 className="text-xl font-bold text-sport">{leaderboardData.challenge?.nom}</h2>
                                    <span className="px-3 py-1 bg-sport/10 text-sport text-xs font-bold uppercase tracking-wide rounded-full">
                                        {leaderboardData.challenge?.type_challenge}
                                    </span>
                                </div>
                                <p className="text-gray-600 text-sm leading-relaxed mb-4">{leaderboardData.challenge?.description}</p>
                                
                                {leaderboardData.userRank ? (
                                    <div className="flex items-center justify-between bg-sport rounded-xl p-4 text-white shadow-lg transform transition-transform active:scale-[0.99]">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white/10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg border border-white/20">
                                                #{leaderboardData.userRank.global_rank}
                                            </div>
                                            <div>
                                                <p className="text-xs text-white/70 uppercase tracking-wider font-semibold">{t('rankingPage.myScore')}</p>
                                                <p className="text-xl font-bold font-mono">{leaderboardData.userRank.score} <span className="text-xs font-normal opacity-70">{leaderboardData.challenge?.unite_mesure}</span></p>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => setShowForm(true)}
                                            className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-colors"
                                            title={t('rankingPage.improveScore')}
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                        </button>
                                    </div>
                                ) : (
                                    <button 
                                        onClick={() => setShowForm(true)}
                                        className="w-full py-3 bg-sport hover:brightness-110 text-white font-bold rounded-xl shadow-md transition-all active:scale-95"
                                    >
                                        {t('rankingPage.participate')}
                                    </button>
                                )}
                            </div>
                        </div>

                        {showForm && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
                                <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl transform transition-all animate-[scaleIn_0.3s_ease-out]">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-text-main">{t('rankingPage.submitTitle')}</h3>
                                        <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                        </button>
                                    </div>
                                    
                                    <form onSubmit={handleSubmission} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rankingPage.scoreLabel')} ({leaderboardData.challenge?.unite_mesure})</label>
                                            <input 
                                                type="number" 
                                                value={submissionData.score}
                                                onChange={(e) => setSubmissionData({...submissionData, score: e.target.value})}
                                                required 
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sport focus:border-sport transition-all outline-none"
                                                placeholder="0"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">{t('rankingPage.videoLabel')}</label>
                                            <input 
                                                type="url" 
                                                value={submissionData.url_video_preuve}
                                                onChange={(e) => setSubmissionData({...submissionData, url_video_preuve: e.target.value})}
                                                required 
                                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-sport focus:border-sport transition-all outline-none"
                                                placeholder="https://..."
                                            />
                                            <p className="text-xs text-gray-500 mt-1">{t('rankingPage.videoHint')}</p>
                                        </div>

                                        {submitScoreMutation.isError && (
                                            <div className="p-3 bg-error/10 text-error rounded-lg text-sm border border-error/20 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                                {t('rankingPage.submitError')}
                                            </div>
                                        )}
                                        {submitScoreMutation.isSuccess && (
                                            <div className="p-3 bg-success/10 text-success rounded-lg text-sm border border-success/20 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                {t('rankingPage.submitSuccess')}
                                            </div>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={submitScoreMutation.isPending}
                                            className="w-full py-3.5 bg-sport hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-70 disabled:active:scale-100 mt-2"
                                        >
                                            {submitScoreMutation.isPending ? (
                                                <span className="flex items-center justify-center gap-2">
                                                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                                    {t('rankingPage.submitting')}
                                                </span>
                                            ) : t('rankingPage.validateBtn')}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        )}

                        <div className="pb-20">
                            {renderPodium()}

                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            
                                <div className="divide-y divide-gray-100">
                                    {leaderboardData.leaderboard.length > 0 ? (
                                        leaderboardData.leaderboard.slice(3).map((entry, index) => (
                                            <div key={entry.id_classement_user} className={`flex items-center p-4 hover:bg-gray-50 transition-colors ${entry.id_utilisateur === userId ? 'bg-sport/5' : ''}`}>
                                                <div className="w-8 font-bold text-gray-400 text-center mr-4">
                                                    #{index + 4}
                                                </div>
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold mr-4 text-sm">
                                                    {entry.pseudo.charAt(0)}
                                                </div>
                                                <div className="flex-grow">
                                                    <p className={`font-semibold ${entry.id_utilisateur === userId ? 'text-sport' : 'text-gray-800'}`}>
                                                        {entry.pseudo} 
                                                        {entry.id_utilisateur === userId && <span className="ml-2 text-[10px] bg-sport/10 text-sport px-1.5 py-0.5 rounded uppercase tracking-wide">{t('rankingPage.me')}</span>}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-gray-900 font-mono">{entry.score}</p>
                                                    {entry.url_video_preuve && (
                                                        <a href={entry.url_video_preuve} target="_blank" rel="noopener noreferrer" className="text-xs text-sport hover:underline flex items-center justify-end gap-1 mt-0.5">
                                                            <span>{t('rankingPage.proof')}</span>
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    ) : leaderboardData.leaderboard.length === 0 ? (
                                        <div className="p-8 text-center text-gray-400">
                                            {t('rankingPage.beFirst')}
                                        </div>
                                    ) : (
                                        <div className="p-4 text-center text-gray-400 text-sm">
                                            {t('rankingPage.endOfRanking')}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>
            <Footer />

            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { transform: scale(0.9); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}

export default Classement;