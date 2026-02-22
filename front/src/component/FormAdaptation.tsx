// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Scale, Salad, Ban,Calendar, CheckCircle,Rocket, Heart, AlertTriangle, Stethoscope, Dumbbell, RefreshCw } from 'lucide-react';
import { getUserId } from '../utils/auth';
import Header from './Header';
import Footer from './Footer';

const FormAdaptation = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [submitting, setSubLoading] = useState(false);
    const [error, setError] = useState('');
    const [profilId, setProfilId] = useState(null);
    const [fullProfil, setFullProfil] = useState(null);
    const [formData, setFormData] = useState({
        poids: '',
        problemes_medical: [],
        problemes_physique: [],
        matos: [],
        jour_disponible: [],
        heure_disponible: '18:00',
        regime_alimentaire: 'Omnivore',
        allergies: []
    });

    useEffect(() => {
        const fetchProfil = async () => {
            const userId = await getUserId();
            try {
                const response = await fetch(`/api/profil/full/${userId}`);
                if (response.ok) {
                    const { data } = await response.json();
                    setProfilId(data.id_profil);
                    setFullProfil(data); 
                    setFormData({
                        poids: data.poids,
                        problemes_medical: data.conditions_medicales || [],
                        problemes_physique: data.condition_physique || [],
                        matos: data.equipement || [],
                        jour_disponible: typeof data.jour_disponible === 'string' ? JSON.parse(data.jour_disponible) : data.jour_disponible,
                        heure_disponible: data.heure_disponible,
                        regime_alimentaire: data.regime_alimentaire || 'Omnivore',
                        allergies: data.restrictions_alimentaires || []
                    });
                }
            } catch (err) {
                setError("Erreur lors du chargement de votre profil.");
            } finally {
                setLoading(false);
            }
        };
        fetchProfil();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleToggle = (value, field) => {
        setFormData(prev => {
            const current = prev[field] || [];
            let updated;
            if (value === "Aucun") {
                updated = ["Aucun"];
            } else {
                const filtered = current.filter(v => v !== "Aucun");
                updated = filtered.includes(value) 
                    ? filtered.filter(v => v !== value) 
                    : [...filtered, value];
            }
            return { ...prev, [field]: updated };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubLoading(true);

        if (!fullProfil) {
            setError("Données de profil manquantes.");
            setSubLoading(false);
            return;
        }

        try {
            const payload = {
                ...fullProfil,
                poids: parseFloat(formData.poids),
                condition_physique: formData.problemes_physique,
                conditions_medicales: formData.problemes_medical,
                equipement: formData.matos,
                jour_disponible: formData.jour_disponible,
                heure_disponible: formData.heure_disponible,
                regime_alimentaire: formData.regime_alimentaire,
                restrictions_alimentaires: formData.allergies
            };

            const upRes = await fetch(`/api/profil/update/${profilId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!upRes.ok) {
                const errData = await upRes.json();
                throw new Error(errData.message || "Erreur lors de la mise à jour du profil");
            }

            const adaptRes = await fetch(`/api/programme/adapt/${profilId}`, {
                method: 'POST'
            });

            if (adaptRes.ok) {
                alert("Votre programme a été réadapté avec succès !");
                navigate('/profil');
            } else {
                throw new Error("Erreur lors de la réadaptation du programme");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSubLoading(false);
        }
    };

    if (loading) return <div className="p-10 text-center flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-gray-600">Récupération de vos anciennes valeurs...</p>
    </div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <main className="flex-1 max-w-2xl mx-auto w-full p-4 py-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2 text-center flex items-center justify-center gap-2">
                        <RefreshCw className="w-6 h-6" />
                        <span>Adapter mon programme</span>
                    </h1>
                    <p className="text-gray-500 text-sm text-center mb-8">
                        Voici vos réglages actuels. Modifiez ce que vous souhaitez changer.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        <section className="bg-indigo-50/30 p-5 rounded-2xl border border-indigo-100">
                            <label className="block text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                                <Scale className="w-5 h-5" /> Mon poids actuel
                            </label>
                            <div className="relative">
                                <input 
                                    type="number" name="poids" value={formData.poids} onChange={handleChange}
                                    className="w-full px-4 py-4 text-xl font-bold text-center border-2 border-white bg-white rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-gray-400">kg</span>
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Salad className="w-5 h-5" /> Régime alimentaire
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {["Omnivore", "Végétarien", "Végan"].map(diet => (
                                    <label key={diet} className={`flex items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.regime_alimentaire === diet ? 'border-indigo-600 bg-indigo-50 shadow-inner' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
                                        <input type="radio" name="regime_alimentaire" className="hidden" value={diet} checked={formData.regime_alimentaire === diet} onChange={handleChange} />
                                        <span className={`font-bold ${formData.regime_alimentaire === diet ? 'text-indigo-700' : 'text-gray-500'}`}>{diet}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Ban className="w-5 h-5" /> Restrictions / Allergies
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["Lactose", "Gluten", "Noix", "Aucun"].map(item => (
                                    <button key={item} type="button" onClick={() => handleToggle(item, 'allergies')}
                                        className={`px-5 py-3 rounded-xl border-2 font-medium transition-all flex items-center gap-1 ${
                                            formData.allergies.includes(item) ? 'bg-orange-100 border-orange-500 text-orange-700' : 'bg-white border-gray-100 text-gray-500 hover:border-orange-200'
                                        }`}
                                    >
                                        {formData.allergies.includes(item) && <CheckCircle className="w-4 h-4" />}
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Heart className="w-5 h-5" /> Problèmes Médicaux
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {['Problèmes cardiaques', 'Asthme', 'Hypertension', "Aucun"].map(condition => (
                                    <label key={condition} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all gap-2 ${
                                        formData.problemes_medical.includes(condition) ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white hover:border-red-200'
                                    }`}>
                                        <input type="checkbox" className="hidden" checked={formData.problemes_medical.includes(condition)} onChange={() => handleToggle(condition, 'problemes_medical')} />
                                        {formData.problemes_medical.includes(condition) && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                        <span className={`font-medium ${formData.problemes_medical.includes(condition) ? 'text-red-700' : 'text-gray-600'}`}>
                                            {condition}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Stethoscope className="w-5 h-5" /> Ma santé / Blessures
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {["Mal de dos", "Douleurs aux jambes", "Douleurs aux bras", "Douleurs aux épaules", "Douleurs pectorales", "Aucun"].map(injury => (
                                    <label key={injury} className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all gap-2 ${
                                        formData.problemes_physique.includes(injury) ? 'border-red-500 bg-red-50' : 'border-gray-100 bg-white hover:border-red-200'
                                    }`}>
                                        <input type="checkbox" className="hidden" checked={formData.problemes_physique.includes(injury)} onChange={() => handleToggle(injury, 'problemes_physique')} />
                                        {formData.problemes_physique.includes(injury) && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                        <span className={`font-medium ${formData.problemes_physique.includes(injury) ? 'text-red-700' : 'text-gray-600'}`}>
                                            {injury}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Dumbbell className="w-5 h-5" /> Équipement disponible
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {["Haltères", "Barre", "Banc", "Salle de sport", "Aucun"].map(item => (
                                    <label key={item} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer text-center transition-all ${formData.matos.includes(item) ? 'border-indigo-600 bg-indigo-50' : 'border-gray-100 bg-white hover:border-indigo-200'}`}>
                                        <input type="checkbox" className="hidden" checked={formData.matos.includes(item)} onChange={() => handleToggle(item, 'matos')} />
                                        <span className={`text-sm font-bold ${formData.matos.includes(item) ? 'text-indigo-700' : 'text-gray-500'}`}>{item}</span>
                                    </label>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                <span>Jours d'entraînement</span>
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"].map(day => (
                                    <button key={day} type="button" onClick={() => handleToggle(day, 'jour_disponible')}
                                        className={`px-4 py-3 rounded-xl border-2 font-medium transition-all ${formData.jour_disponible.includes(day) ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}`}
                                    >
                                        {day}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {error && (
                            <div className="p-4 bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 animate-pulse flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" /> {error}
                            </div>
                        )}

                        <div className="sticky bottom-4 pt-4">
                            <button 
                                type="submit" disabled={submitting}
                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-5 rounded-2xl shadow-2xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-3 text-lg"
                            >
                                {submitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Calcul de l'avenir en cours...
                                    </>
                                ) : (
                                    <>
                                        <Rocket className="w-5 h-5" />
                                        <span>Appliquer les changements</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FormAdaptation;