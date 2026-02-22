// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { TrendingDown, TrendingUp, Trophy, Activity, Plus, Calendar, Scale, ChevronRight, Trash2 } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useEvolutionStats, useExoProgression, useExercices, useAddPoids, useAddRecord, useDeleteRecord } from '@/features/evolution';
import { LoadingSpinner, Modal, useModal } from './shared';

const Evolution: React.FC = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { data: stats = {} as any, isLoading: loading, error: fetchError } = useEvolutionStats();
    const { data: exercices = [] } = useExercices();

    // États locaux (UI uniquement)
    const [selectedExoForChart, setSelectedExoForChart] = useState<any>('');
    const [selectedTypeForChart, setSelectedTypeForChart] = useState('Max Reps');
    const [newPoids, setNewPoids] = useState('');
    const [newRecord, setNewRecord] = useState<any>({ id_exo: '', score: '', type_record: 'Max Reps' });

    // Modals
    const [isPoidsModalOpen, openPoidsModal, closePoidsModal] = useModal();
    const [isRecordModalOpen, openRecordModal, closeRecordModal] = useModal();

    const { data: exoProgressionRaw = [] as any } = useExoProgression(selectedExoForChart);

    const addPoidsMutation = useAddPoids();
    const addRecordMutation = useAddRecord();
    const deleteRecordMutation = useDeleteRecord();

    const error = fetchError ? t('evolution.loadingStatsError') : null;

    // Auto-sélectionner le premier exercice au chargement
    useEffect(() => {
        if (stats?.records?.length > 0 && !selectedExoForChart) {
            const uniqueExos = [...new Set(stats.records.map(r => r.id_exo))];
            setSelectedExoForChart(uniqueExos[0]);
            setSelectedTypeForChart(stats.records.find(r => r.id_exo == uniqueExos[0])?.type_record || 'Max Reps');
        }
    }, [stats, selectedExoForChart]);

    // Formater les données de progression
    const exoProgressionData = exoProgressionRaw.map(d => ({
        date: new Date(d.date_record).toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: '2-digit' }),
        score: parseFloat(d.score),
        type: d.type_record
    }));

    const filteredProgressionData = exoProgressionData.filter(d => d.type === selectedTypeForChart);

    const handleAddPoids = async (e) => {
        e.preventDefault();
        addPoidsMutation.mutate(newPoids, {
            onSuccess: () => {
                closePoidsModal();
                setNewPoids('');
            },
        });
    };

    const handleAddRecord = async (e) => {
        e.preventDefault();
        addRecordMutation.mutate(newRecord, {
            onSuccess: () => {
                closeRecordModal();
                setNewRecord({ id_exo: '', score: '', type_record: 'Max Reps' });
            },
        });
    };

    const handleDeleteRecord = (id) => {
        if (!window.confirm(t('evolution.deleteConfirm'))) return;
        deleteRecordMutation.mutate(id);
    };

    if (loading) return (
        <div className="flex justify-center items-center min-h-screen bg-background">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sport"></div>
        </div>
    );

    const sessionData = stats ? [
        { name: t('evolution.personalized'), value: stats.sessions.personnalisees, color: 'var(--sport)' },
        { name: t('evolution.free'), value: stats.sessions.libres, color: 'var(--accent)' }
    ] : [];

    const formattedPoidsData = stats?.poidsHistory.map(item => ({
        date: new Date(item.date_mesure).toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR', { day: '2-digit', month: '2-digit' }),
        poids: item.poids
    })) || [];

    const latestPoids = stats?.poidsHistory[stats.poidsHistory.length - 1]?.poids || '--';
    const firstPoids = stats?.poidsHistory[0]?.poids || '--';
    const poidsDiff = (typeof latestPoids === 'number' && typeof firstPoids === 'number') 
        ? (latestPoids - firstPoids).toFixed(1) 
        : 0;

    return (
        <>
            <Header />
            <main className="min-h-screen bg-background pb-24 pt-4 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-text-main">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                >
                    {t('common.back')}
                </button>

                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-text-main">{t('evolution.title')}</h1>
                        <p className="text-gray-500 mt-1">{t('evolution.subtitle')}</p>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => openPoidsModal()}
                            className="bg-white p-2 rounded-xl shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                            <Scale className="w-6 h-6 text-sport" />
                        </button>
                        <button 
                            onClick={() => openRecordModal()}
                            className="bg-sport p-2 rounded-xl shadow-sm text-white hover:brightness-110 transition-all"
                        >
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-sport/10 rounded-2xl text-sport">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{t('evolution.sessionsCompleted')}</p>
                            <p className="text-2xl font-bold text-text-main">
                                {stats?.sessions.personnalisees + stats?.sessions.libres}
                            </p>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-nutrition/10 rounded-2xl text-nutrition">
                            <Scale className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{t('evolution.currentWeight')}</p>
                            <div className="flex items-center gap-2">
                                <p className="text-2xl font-bold text-text-main">{latestPoids} {t('evolution.weightUnit')}</p>
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${poidsDiff <= 0 ? 'bg-success/10 text-success' : 'bg-error/10 text-error'}`}>
                                    {poidsDiff <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                                    {Math.abs(poidsDiff)} {t('evolution.weightUnit')}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 bg-rank-1/10 rounded-2xl text-rank-3">
                            <Trophy className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{t('evolution.personalRecords')}</p>
                            <p className="text-2xl font-bold text-text-main">{stats?.records.length}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-text-main">{t('evolution.weightHistory')}</h2>
                            <Calendar className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={formattedPoidsData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
                                    <Tooltip 
                                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                        labelStyle={{fontWeight: 'bold', color: 'var(--text-main)'}}
                                    />
                                    <Line 
                                        type="monotone" 
                                        dataKey="poids" 
                                        stroke="var(--sport)" 
                                        strokeWidth={3} 
                                        dot={{r: 4, fill: 'var(--sport)', strokeWidth: 2, stroke: '#fff'}}
                                        activeDot={{r: 6, strokeWidth: 0}}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-text-main">{t('evolution.sessionDistribution')}</h2>
                            <Activity className="w-5 h-5 text-gray-400" />
                        </div>
                        <div className="h-64 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={sessionData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                    <YAxis hide />
                                    <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={40}>
                                        {sessionData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <h2 className="text-lg font-bold text-text-main">{t('evolution.progressionByExercise')}</h2>
                        <div className="flex gap-2">
                            <select 
                                value={selectedExoForChart}
                                onChange={(e) => setSelectedExoForChart(e.target.value)}
                                className="bg-gray-50 border-0 rounded-xl px-4 py-2 text-sm font-bold text-sport focus:ring-2 focus:ring-sport outline-none"
                            >
                                <option value="">{t('evolution.chooseExercise')}</option>
                                {[...new Map(stats?.records.map(item => [item.id_exo, item])).values()].map(rec => (
                                    <option key={rec.id_exo} value={rec.id_exo}>{rec.nom_exercice}</option>
                                ))}
                            </select>
                            
                            {selectedExoForChart && (
                                <div className="flex bg-gray-100 p-1 rounded-xl">
                                    <button 
                                        onClick={() => setSelectedTypeForChart('Max Reps')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedTypeForChart === 'Max Reps' ? 'bg-white text-sport shadow-sm' : 'text-gray-400'}`}
                                    >
                                        {t('evolution.repsUnit')}
                                    </button>
                                    <button 
                                        onClick={() => setSelectedTypeForChart('Charge Max')}
                                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${selectedTypeForChart === 'Charge Max' ? 'bg-white text-sport shadow-sm' : 'text-gray-400'}`}
                                    >
                                        {t('evolution.weightUnit')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {selectedExoForChart ? (
                        <div className="h-64 w-full">
                            {filteredProgressionData.length > 0 ? (
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={filteredProgressionData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                                        <Tooltip 
                                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                                            labelStyle={{fontWeight: 'bold', color: 'var(--text-main)'}}
                                        />
                                        <Line 
                                            type="monotone" 
                                            dataKey="score" 
                                            name={selectedTypeForChart === 'Max Reps' ? t('evolution.repsUnit') : t('evolution.weightLabel')}
                                            stroke="var(--success)" 
                                            strokeWidth={3} 
                                            dot={{r: 4, fill: 'var(--success)', strokeWidth: 2, stroke: '#fff'}}
                                            activeDot={{r: 6, strokeWidth: 0}}
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                                    <p>{t('evolution.noRecord', { type: selectedTypeForChart === 'Max Reps' ? t('evolution.maxReps') : t('evolution.maxWeight') })}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                            <Activity className="w-12 h-12 mb-2 opacity-20" />
                            <p>{t('evolution.selectExercisePrompt')}</p>
                        </div>
                    )}
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-text-main">
                            {selectedExoForChart 
                                ? t('evolution.historyHeader', { 
                                    type: selectedTypeForChart === 'Max Reps' ? t('evolution.repsUnit') : t('evolution.weightUnit'), 
                                    exo: stats?.records.find(r => r.id_exo == selectedExoForChart)?.nom_exercice 
                                }) 
                                : t('evolution.recordsHistory')}
                        </h2>
                        <span className="text-sm text-sport font-bold bg-sport/5 px-3 py-1 rounded-full border border-sport/10">
                            {t('evolution.entriesCount', { count: stats?.records.filter(r => (!selectedExoForChart || r.id_exo == selectedExoForChart) && r.type_record === selectedTypeForChart).length })}
                        </span>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-96 overflow-y-auto">
                        {(!stats?.records || stats.records.filter(r => (!selectedExoForChart || r.id_exo == selectedExoForChart) && r.type_record === selectedTypeForChart).length === 0) ? (
                            <div className="p-12 text-center">
                                <Trophy className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500">{t('evolution.noRecord', { type: selectedTypeForChart === 'Max Reps' ? t('evolution.maxReps') : t('evolution.maxWeight') })}</p>
                            </div>
                        ) : (
                            stats?.records
                                .filter(r => (!selectedExoForChart || r.id_exo == selectedExoForChart) && r.type_record === selectedTypeForChart)
                                .map((rec, i) => (
                                    <div key={i} className="p-5 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 bg-sport/5 rounded-xl flex items-center justify-center text-sport border border-sport/10">
                                                <TrendingUp className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-text-main text-sm">{rec.nom_exercice}</h4>
                                                <p className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(rec.date_record).toLocaleDateString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className="text-base font-black text-sport">{rec.score}</span>
                                                <span className="text-[10px] font-bold text-gray-400 ml-1">
                                                    {rec.type_record === 'Max Reps' ? t('evolution.repsUnit') : t('evolution.weightUnit')}
                                                </span>
                                            </div>
                                            <button 
                                                onClick={() => handleDeleteRecord(rec.id_record)}
                                                className="p-2 text-gray-300 hover:text-error transition-colors"
                                                title={t('evolution.deleteConfirm')}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            </main>

            {isPoidsModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
                        <h3 className="text-2xl font-bold text-text-main mb-6">{t('evolution.weightModalTitle')}</h3>
                        <form onSubmit={handleAddPoids} className="space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('evolution.weightLabel')}</label>
                                <input 
                                    type="number" 
                                    step="0.1"
                                    value={newPoids}
                                    onChange={(e) => setNewPoids(e.target.value)}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 text-lg font-bold focus:ring-2 focus:ring-sport outline-none text-text-main"
                                    placeholder="ex: 75.5"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={closePoidsModal}
                                    className="flex-1 py-4 text-gray-500 font-bold"
                                >
                                    {t('evolution.cancel')}
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-sport text-white font-bold py-4 rounded-2xl shadow-lg shadow-sport/20 hover:brightness-110 transition-all active:scale-95"
                                >
                                    {t('evolution.save')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isRecordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl">
                        <h3 className="text-2xl font-bold text-text-main mb-6">{t('evolution.addRecordModalTitle')}</h3>
                        <form onSubmit={handleAddRecord} className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">{t('evolution.exerciseLabel')}</label>
                                <select 
                                    value={newRecord.id_exo}
                                    onChange={(e) => setNewRecord({...newRecord, id_exo: e.target.value})}
                                    className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-sport outline-none text-text-main"
                                    required
                                >
                                    <option value="">{t('evolution.chooseExercise')}</option>
                                    {exercices.map(exo => (
                                        <option key={exo.id} value={exo.id}>{exo.nom_exercice}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('evolution.typeLabel')}</label>
                                    <select 
                                        value={newRecord.type_record}
                                        onChange={(e) => setNewRecord({...newRecord, type_record: e.target.value})}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 focus:ring-2 focus:ring-sport outline-none text-text-main"
                                    >
                                        <option value="Max Reps">{t('evolution.maxReps')}</option>
                                        <option value="Charge Max">{t('evolution.maxWeight')} ({t('evolution.weightUnit')})</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">{t('evolution.performanceLabel')}</label>
                                    <input 
                                        type="number" 
                                        value={newRecord.score}
                                        onChange={(e) => setNewRecord({...newRecord, score: e.target.value})}
                                        className="w-full bg-gray-50 border-0 rounded-2xl p-4 font-bold focus:ring-2 focus:ring-sport outline-none text-text-main"
                                        placeholder="ex: 20"
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button 
                                    type="button" 
                                    onClick={() => closeRecordModal()}
                                    className="flex-1 py-4 text-gray-500 font-bold"
                                >
                                    {t('evolution.cancel')}
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 bg-sport text-white font-bold py-4 rounded-2xl shadow-lg shadow-sport/20 hover:brightness-110 transition-all active:scale-95"
                                >
                                    {t('evolution.validate')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            <Footer />
        </>
    );
};

export default Evolution;
