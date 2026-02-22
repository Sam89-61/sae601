// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Dumbbell, Utensils, Timer, Trash2, Smile, Globe, Rocket, Hourglass } from 'lucide-react';
import { apiFetch } from '../utils/api';
import Header from './Header';
import Footer from './Footer';

const CreateCustomSession = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [sessionType, setSessionType] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [exercices, setExercices] = useState([]);
    const [entrees, setEntrees] = useState([]);
    const [plats, setPlats] = useState([]);
    const [desserts, setDesserts] = useState([]);

    const [formData, setFormData] = useState({
        nom: '',
        description: '',
        duree_minutes: 60,
        is_public: false,
        exercices: [],
        type_repas: 'dejeuner',
        id_entree: null,
        id_plat: null,
        id_dessert: null,
        notes: ''
    });

    useEffect(() => {
        if (sessionType === 'sport') {
            fetchExercices();
        } else if (sessionType === 'repas') {
            fetchAliments();
        }
    }, [sessionType]);

    const fetchExercices = async () => {
        try {
            const response = await fetch('/api/exos/getAll');
            const data = await response.json();
            setExercices(data);
        } catch (err) {
            console.error('Erreur chargement exercices:', err);
        }
    };

    const fetchAliments = async () => {
        try {
            const [entreesRes, platsRes, dessertsRes] = await Promise.all([
                fetch('/api/alimentation/entree/getAll'),
                fetch('/api/alimentation/plat/getAll'),
                fetch('/api/alimentation/dessert/getAll')
            ]);

            const entreesData = await entreesRes.json();
            const platsData = await platsRes.json();
            const dessertsData = await dessertsRes.json();

            setEntrees(entreesData.entrees || []);
            setPlats(platsData.plats || []);
            setDesserts(dessertsData.desserts || []);
        } catch (err) {
            console.error('Erreur chargement aliments:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addExercice = () => {
        setFormData(prev => ({
            ...prev,
            exercices: [...prev.exercices, {
                id_exo: exercices[0]?.id || null,
                series: 3,
                repetitions: 10,
                repos: 60,
                temps_par_rep: 3 // Temps moyen par répétition en secondes
            }]
        }));
    };

    // Calcul automatique du temps total estimé de la séance
    const calculateTotalTime = () => {
        if (sessionType !== 'sport' || formData.exercices.length === 0) {
            return 0;
        }

        let totalSeconds = 0;

        formData.exercices.forEach(exo => {
            // Temps d'effort : séries × répétitions × temps par rep
            const effortTime = (exo.series || 0) * (exo.repetitions || 0) * (exo.temps_par_rep || 3);

            // Temps de repos : (séries - 1) × temps de repos (pas de repos après la dernière série)
            const restTime = Math.max(0, (exo.series || 0) - 1) * (exo.repos || 60);

            totalSeconds += effortTime + restTime;
        });

        // Ajouter 30 secondes entre chaque exercice pour la transition
        if (formData.exercices.length > 1) {
            totalSeconds += (formData.exercices.length - 1) * 30;
        }

        return Math.ceil(totalSeconds / 60); // Convertir en minutes
    };

    const estimatedTime = calculateTotalTime();

    // Formater le temps en heures:minutes
    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    const removeExercice = (index) => {
        setFormData(prev => ({
            ...prev,
            exercices: prev.exercices.filter((_, i) => i !== index)
        }));
    };

    const updateExercice = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            exercices: prev.exercices.map((exo, i) =>
                i === index ? { ...exo, [field]: value } : exo
            )
        }));
    };

    const handleSubmit = async () => {
        if (!formData.nom) {
            setError(t('session.name_required'));
            return;
        }

        if (sessionType === 'sport' && formData.exercices.length === 0) {
            setError(t('session.at_least_one_exercise'));
            return;
        }

        setLoading(true);
        setError('');

        try {
            const endpoint = sessionType === 'sport'
                ? '/api/sessions/custom/sport/create'
                : '/api/sessions/custom/repas/create';

            // Mettre à jour la durée avec le temps calculé automatiquement
            const dataToSend = {
                ...formData,
                duree_minutes: sessionType === 'sport' ? estimatedTime : formData.duree_minutes
            };

            const response = await apiFetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dataToSend)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || t('session.error_creating'));
            }

            navigate('/sessions/my-sessions');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col font-sans text-text-main">
            <Header />

            <main className="flex-1 py-8 px-4 pb-24">
                <div className="max-w-4xl mx-auto">
                    <button 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-semibold mb-6 transition-colors"
                    >
                     {t('common.back')}
                    </button>
                    
                    <div className="bg-sport rounded-2xl shadow-xl p-8 mb-8 text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-white">
                            {t('session.createCustomSession')}
                        </h1>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 font-semibold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> {error}
                            </div>
                        )}

                        {!sessionType ? (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-text-main text-center mb-8">
                                    {t('session.selectType')}
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <button
                                        onClick={() => setSessionType('sport')}
                                        className="group relative p-8 rounded-2xl bg-sport hover:bg-sport-secondary transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 duration-300"
                                    >
                                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                                            <Dumbbell className="w-20 h-20 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{t('session.createSportSession')}</h3>
                                        <p className="text-white/80 mt-2 text-sm">{t('session.create_sport_desc')}</p>
                                    </button>
                                    <button
                                        onClick={() => setSessionType('repas')}
                                        className="group relative p-8 rounded-2xl bg-nutrition hover:bg-nutrition-secondary transition-all shadow-lg hover:shadow-2xl transform hover:-translate-y-1 duration-300"
                                    >
                                        <div className="mb-4 group-hover:scale-110 transition-transform duration-300 flex justify-center">
                                            <Utensils className="w-20 h-20 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white">{t('session.createRepasSession')}</h3>
                                        <p className="text-white/80 mt-2 text-sm">{t('session.create_repas_desc')}</p>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <button
                                    onClick={() => setSessionType('')}
                                    className="flex items-center gap-2 text-gray-600 hover:text-sport font-semibold transition-colors"
                                >
                                     {t('session.back')}
                                </button>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('session.sessionName')} *
                                    </label>
                                    <input
                                        type="text"
                                        name="nom"
                                        value={formData.nom}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-sport focus:bg-white focus:ring-4 focus:ring-sport/10 transition-all outline-none"
                                        placeholder={t('session.sessionNamePlaceholder')}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        {t('session.description')}
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-sport focus:bg-white focus:ring-4 focus:ring-sport/10 transition-all outline-none resize-none"
                                        placeholder={t('session.descriptionPlaceholder')}
                                    />
                                </div>

                                {sessionType === 'sport' ? (
                                    <>
                                        {estimatedTime > 0 && (
                                            <div className="bg-gradient-to-r from-sport/10 to-sport/5 rounded-xl p-5 border-2 border-sport/20">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-semibold text-gray-600 mb-1">{t('session.estimated_duration')}</p>
                                                        <p className="text-3xl font-extrabold text-sport">{formatTime(estimatedTime)}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs text-gray-500">{formData.exercices.length} exercice{formData.exercices.length > 1 ? 's' : ''}</p>
                                                        <p className="text-xs text-gray-500 mt-1">{t('session.calculated_automatically')}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <div className="border-t-2 border-gray-100 pt-6 mt-6">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-bold text-text-main">{t('session.exercises')}</h3>
                                                <button
                                                    onClick={addExercice}
                                                    className="px-4 py-2 bg-success hover:bg-green-600 text-white rounded-xl font-semibold transition-all shadow-md hover:shadow-lg"
                                                >
                                                     {t('session.addExercise')}
                                                </button>
                                            </div>

                                            <div className="space-y-4">
                                                {formData.exercices.map((exo, index) => {
                                                    // Calcul du temps pour cet exercice
                                                    const effortTime = (exo.series || 0) * (exo.repetitions || 0) * (exo.temps_par_rep || 3);
                                                    const restTime = Math.max(0, (exo.series || 0) - 1) * (exo.repos || 60);
                                                    const totalExoTime = Math.ceil((effortTime + restTime) / 60);

                                                    return (
                                                        <div key={index} className="p-5 bg-gradient-to-br from-white to-gray-50 rounded-xl border-2 border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                                            <div className="flex items-center justify-between mb-3">
                                                                <span className="text-sm font-bold text-sport bg-sport/10 px-3 py-1 rounded-full">
                                                                    Exercice {index + 1}
                                                                </span>
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                                                        <Timer className="w-3 h-3" /> ~{totalExoTime}min
                                                                    </span>
                                                                    <button
                                                                        onClick={() => removeExercice(index)}
                                                                        className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-all"
                                                                        title="Supprimer"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-3">
                                                                {/* Sélection de l'exercice */}
                                                                <div>
                                                                    <label className="block text-xs font-semibold text-gray-600 mb-1">{t('session.selectExercise')}</label>
                                                                    <select
                                                                        value={exo.id_exo}
                                                                        onChange={(e) => updateExercice(index, 'id_exo', parseInt(e.target.value))}
                                                                        className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-sport focus:ring-2 focus:ring-sport/10 outline-none font-medium"
                                                                    >
                                                                        {exercices.map(ex => (
                                                                            <option key={ex.id} value={ex.id}>{ex.nom_exercice}</option>
                                                                        ))}
                                                                    </select>
                                                                </div>

                                                                {/* Séries, Répétitions, Repos */}
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    <div>
                                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('session.sets')}</label>
                                                                        <input
                                                                            type="number"
                                                                            value={exo.series}
                                                                            onChange={(e) => updateExercice(index, 'series', parseInt(e.target.value))}
                                                                            min="1"
                                                                            className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-sport focus:ring-2 focus:ring-sport/10 outline-none text-center font-bold"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('session.reps')}</label>
                                                                        <input
                                                                            type="number"
                                                                            value={exo.repetitions}
                                                                            onChange={(e) => updateExercice(index, 'repetitions', parseInt(e.target.value))}
                                                                            min="1"
                                                                            className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-sport focus:ring-2 focus:ring-sport/10 outline-none text-center font-bold"
                                                                        />
                                                                    </div>
                                                                    <div>
                                                                        <label className="block text-xs font-semibold text-gray-600 mb-1">{t('session.rest_label')} (s)</label>
                                                                        <input
                                                                            type="number"
                                                                            value={exo.repos}
                                                                            onChange={(e) => updateExercice(index, 'repos', parseInt(e.target.value))}
                                                                            min="0"
                                                                            step="15"
                                                                            className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-sport focus:ring-2 focus:ring-sport/10 outline-none text-center font-bold"
                                                                        />
                                                                    </div>
                                                                </div>

                                                                {/* Info visuelle */}
                                                                <div className="bg-sport/5 rounded-lg p-2 text-xs text-gray-600 flex items-center gap-3">
                                                                    <span className="font-medium flex items-center gap-1">
                                                                        <Dumbbell className="w-3 h-3" /> {t('session.effort')}: {Math.ceil(effortTime / 60)}min
                                                                    </span>
                                                                    •
                                                                    <span className="font-medium flex items-center gap-1">
                                                                        <Smile className="w-3 h-3" /> {t('session.rest_label')}: {Math.ceil(restTime / 60)}min
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                                {formData.exercices.length === 0 && (
                                                    <div className="text-center py-8 text-gray-400">
                                                        {t('session.no_exercise_added')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                {t('session.mealType')}
                                            </label>
                                            <select
                                                name="type_repas"
                                                value={formData.type_repas}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:bg-white focus:ring-4 focus:ring-green-100 transition-all outline-none"
                                            >
                                                <option value="petit_dejeuner">{t('session.breakfast')}</option>
                                                <option value="dejeuner">{t('session.lunch')}</option>
                                                <option value="diner">{t('session.dinner')}</option>
                                                <option value="collation">{t('session.snack')}</option>
                                            </select>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    {t('session.starter')} <span className="text-gray-400 text-xs">({t('session.optional')})</span>
                                                </label>
                                                <select
                                                    name="id_entree"
                                                    value={formData.id_entree || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, id_entree: e.target.value ? parseInt(e.target.value) : null }))}
                                                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                                >
                                                    <option value="">{t('session.selectStarter')}</option>
                                                    {entrees.map(e => (
                                                        <option key={e.id_entree} value={e.id_entree}>{e.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    {t('session.mainCourse')}
                                                </label>
                                                <select
                                                    name="id_plat"
                                                    value={formData.id_plat || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, id_plat: e.target.value ? parseInt(e.target.value) : null }))}
                                                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                                >
                                                    <option value="">{t('session.selectMainCourse')}</option>
                                                    {plats.map(p => (
                                                        <option key={p.id_plat} value={p.id_plat}>{p.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    {t('session.dessert')} <span className="text-gray-400 text-xs">({t('session.optional')})</span>
                                                </label>
                                                <select
                                                    name="id_dessert"
                                                    value={formData.id_dessert || ''}
                                                    onChange={(e) => setFormData(prev => ({ ...prev, id_dessert: e.target.value ? parseInt(e.target.value) : null }))}
                                                    className="w-full px-3 py-2.5 bg-white border-2 border-gray-200 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-100 outline-none"
                                                >
                                                    <option value="">{t('session.selectDessert')}</option>
                                                    {desserts.map(d => (
                                                        <option key={d.id_dessert} value={d.id_dessert}>{d.nom}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>
                                    </>
                                )}

                                <div className="flex items-center gap-3 p-5 bg-sport/10 rounded-xl border-2 border-sport/20">
                                    <input
                                        type="checkbox"
                                        name="is_public"
                                        id="is_public"
                                        checked={formData.is_public}
                                        onChange={handleChange}
                                        className="w-5 h-5 text-sport rounded-lg focus:ring-sport cursor-pointer"
                                    />
                                    <label htmlFor="is_public" className="flex-1 font-semibold text-gray-700 cursor-pointer flex items-center gap-2">
                                        <Globe className="w-5 h-5" />
                                        <span>{t('session.shareWithCommunity')}</span>
                                    </label>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`w-full px-8 py-4 text-white rounded-xl shadow-lg transition-all disabled:opacity-50 font-bold text-lg transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${
                                        sessionType === 'sport' 
                                            ? 'bg-sport hover:bg-sport-secondary' 
                                            : 'bg-nutrition hover:bg-nutrition-secondary'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <Hourglass className="w-5 h-5" />
                                            <span>{t('session.creating')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <Rocket className="w-5 h-5" />
                                            <span>{t('session.createSession')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default CreateCustomSession;
