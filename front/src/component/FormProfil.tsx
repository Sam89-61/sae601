// @ts-nocheck
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle } from 'lucide-react';
import { getUserId } from '../utils/auth';
import i18n from '../i18n';
import WaweEffect from './waveEffect.jsx';
import ConsentPopup from './ConsentPopup.jsx';
import RadioStep from './form/RadioStep.jsx';
import CheckboxStep from './form/CheckboxStep.jsx';
import NumberStep from './form/NumberStep.jsx';
import DaySelector from './form/DaySelector.jsx';
import TimeStep from './form/TimeStep.jsx';
import WelcomeStep from './form/WelcomeStep.jsx';
import FinalStep from './form/FinalStep.jsx';


function Form() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const totalSteps = 18;
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        langue: i18n.language || 'fr',
        sex: '', age: '', poids: '', taille: '', niveau: '', frequence: 1,
        problemes_medical: [], problemes_physique: [], date_fin: 90, matos: [],
        objectif: '', regime_alimentaire: 'Omnivore', allergies: [],
        jour_disponible: [], heure_disponible: '18:00'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleLanguageChange = (e) => {
        const { value } = e.target;
        setFormData(prev => ({ ...prev, langue: value }));
        i18n.changeLanguage(value);
    };

    const handleCheckboxChange = (e, field) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            let currentList = prev[field] || [];
            if (checked) {
                if (value === "Aucun") return { ...prev, [field]: ["Aucun"] };
                currentList = currentList.filter(item => item !== "Aucun");
                return { ...prev, [field]: [...currentList, value] };
            } else {
                return { ...prev, [field]: currentList.filter(item => item !== value) };
            }
        });
    };

    const nextStep = () => { setStep(prev => prev + 1); }
    const prevStep = () => { setStep(prev => Math.max(1, prev - 1)); }

    const canNext = () => {
        const f = formData;
        switch (step) {
            case 1: return !!f.langue;
            case 3: return !!f.sex;
            case 4: return !!f.age;
            case 5: return !!f.poids;
            case 6: return !!f.taille;
            case 7: return !!f.niveau;
            case 8: return !!f.frequence;
            case 9: return f.problemes_medical.length > 0; // Au moins une option (même "Aucun")
            case 10: return f.problemes_physique.length > 0; // Au moins une option (même "Aucun")
            case 11: return f.matos.length > 0; // Au moins un équipement (même "Aucun")
            case 12: return !!f.objectif;
            case 13: return f.jour_disponible.length >= f.frequence;
            case 17: return f.allergies.length > 0; // Au moins une option (même "Aucun")
            default: return true;
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const userId = await getUserId();

        if (!userId) {
            setError(t('profile.sessionExpired'));
            setLoading(false);
            return;
        }

        try {
            if (formData.langue) {
                const langResponse = await fetch('/api/auth/update', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ langue: formData.langue })
                });

                if (!langResponse.ok) {
                    const langData = await langResponse.json().catch(() => ({}));
                    throw new Error(langData.message || t('profile.languageUpdateError'));
                }
            }

            const profilPayload = {
                id_utilisateur: parseInt(userId),
                age: parseInt(formData.age),
                poids: parseFloat(formData.poids),
                taille: parseFloat(formData.taille),
                sexe: formData.sex,
                niveau: formData.niveau === "Avancer" ? "Avancé" : formData.niveau,
                frequence: parseInt(formData.frequence),
                jour_disponible: formData.jour_disponible,
                heure_disponible: formData.heure_disponible,
                categorie_objectif: formData.objectif,
                date_fin: parseInt(formData.date_fin),
                equipement: formData.matos.length > 0 ? formData.matos : ["Aucun"],
                conditions_medicales: (formData.problemes_medical.includes("Aucun") || !formData.problemes_medical.length) ? [] : formData.problemes_medical,
                condition_physique: (formData.problemes_physique.includes("Aucun") || !formData.problemes_physique.length) ? [] : formData.problemes_physique,
                regime_alimentaire: formData.regime_alimentaire,
                restrictions_alimentaires: formData.allergies
            };

            const response = await fetch('/api/profil/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(profilPayload)
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || "Erreur création profil");

            // Génération
            const genResponse = await fetch(`/api/programme/generate/${data.data.id_profil}`, {
                method: 'POST'
            });

            if (!genResponse.ok) throw new Error("Erreur génération programme");

            navigate("/");

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const dayUnitLabel = (count) => (count > 1 ? t('profile.days') : t('profile.day'));

    const languageOptions = [
        { value: 'fr', label: t('common.french') },
        { value: 'en', label: t('common.english') }
    ];

    const genderOptions = [
        { value: 'Homme', label: t('profile.options.gender.male') },
        { value: 'Femme', label: t('profile.options.gender.female') },
    ];

    const levelOptions = [
        { value: 'Débutant', label: t('profile.options.level.beginner') },
        { value: 'Intermédiaire', label: t('profile.options.level.intermediate') },
        { value: 'Avancer', label: t('profile.options.level.advanced') }
    ];

    const medicalOptions = [
        { value: 'Problèmes cardiaques', label: t('profile.options.medical.cardiac') },
        { value: 'Asthme', label: t('profile.options.medical.asthma') },
        { value: 'Hypertension', label: t('profile.options.medical.hypertension') },
        { value: 'Aucun', label: t('profile.options.medical.none') }
    ];

    const physicalOptions = [
        { value: 'Mal de dos', label: t('profile.options.physical.back') },
        { value: 'Douleurs aux jambes', label: t('profile.options.physical.legs') },
        { value: 'Douleurs aux bras', label: t('profile.options.physical.arms') },
        { value: 'Douleurs aux épaules', label: t('profile.options.physical.shoulders') },
        { value: 'Douleurs pectorales', label: t('profile.options.physical.chest') },
        { value: 'Aucun', label: t('profile.options.physical.none') }
    ];

    const equipmentOptions = [
        { value: 'Haltères', label: t('profile.options.equipment.dumbbells') },
        { value: 'Barre', label: t('profile.options.equipment.bar') },
        { value: 'Banc', label: t('profile.options.equipment.bench') },
        { value: 'Salle de sport', label: t('profile.options.equipment.gym') },
        { value: 'Aucun', label: t('profile.options.equipment.none') }
    ];

    const objectiveOptions = [
        { value: 'Perte de poids', label: t('profile.options.objective.loss') },
        { value: 'Prise de masse', label: t('profile.options.objective.gain') }
    ];

    const dayOptions = [
        { value: 'Lundi', label: t('profile.options.days.monday') },
        { value: 'Mardi', label: t('profile.options.days.tuesday') },
        { value: 'Mercredi', label: t('profile.options.days.wednesday') },
        { value: 'Jeudi', label: t('profile.options.days.thursday') },
        { value: 'Vendredi', label: t('profile.options.days.friday') },
        { value: 'Samedi', label: t('profile.options.days.saturday') },
        { value: 'Dimanche', label: t('profile.options.days.sunday') }
    ];

    const durationOptions = [
        { value: 90, label: t('profile.options.duration.90') },
        { value: 180, label: t('profile.options.duration.180') },
        { value: 360, label: t('profile.options.duration.360') }
    ];

    const dietOptions = [
        { value: 'Omnivore', label: t('profile.options.diet.omnivore') },
        { value: 'Végétarien', label: t('profile.options.diet.vegetarian') },
        { value: 'Végan', label: t('profile.options.diet.vegan') }
    ];

    const allergyOptions = [
        { value: 'Lactose', label: t('profile.options.allergies.lactose') },
        { value: 'Gluten', label: t('profile.options.allergies.gluten') },
        { value: 'Noix', label: t('profile.options.allergies.nuts') },
        { value: 'Aucun', label: t('profile.options.allergies.none') }
    ];

    // --- Rendu dynamique du contenu ---
    const renderStepContent = () => {
        switch(step) {
            case 1:
                return (
                    <RadioStep
                        title={t('profile.languageTitle')}
                        subtitle={t('profile.languageSubtitle')}
                        name="langue"
                        value={formData.langue}
                        options={languageOptions}
                        onChange={handleLanguageChange}
                    />
                );
            case 2: return <WelcomeStep title={t('profile.welcomeTitle')} subtitle={t('profile.welcomeSubtitle')} buttonText={t('profile.startButton')} onNext={nextStep} />;
            case 3: return <RadioStep title={t('profile.sexTitle')} name="sex" value={formData.sex} options={genderOptions} onChange={handleChange} />;
            case 4: return <NumberStep title={t('profile.ageTitle')} name="age" value={formData.age} min="10" max="100" subtitle={t('profile.ageSubtitle')} onChange={handleChange} />;
            case 5: return <NumberStep title={t('profile.weightTitle')} name="poids" value={formData.poids} min="30" max="300" unit="kg" subtitle={t('profile.weightSubtitle')} onChange={handleChange} />;
            case 6: return <NumberStep title={t('profile.heightTitle')} name="taille" value={formData.taille} min="100" max="250" unit="cm" subtitle={t('profile.heightSubtitle')} onChange={handleChange} />;
            case 7: return <RadioStep title={t('profile.levelTitle')} name="niveau" value={formData.niveau} options={levelOptions} onChange={handleChange} />;
            case 8: return <RadioStep title={t('profile.frequencyTitle')} name="frequence" value={formData.frequence} options={[1, 2, 3, 4, 5]} suffix={` ${t('profile.frequencySuffix')}`} onChange={handleChange} />;
            case 9: return <CheckboxStep title={t('profile.medicalTitle')} selectedValues={formData.problemes_medical} options={medicalOptions} onToggle={(e) => handleCheckboxChange(e, 'problemes_medical')} />;
            case 10: return <CheckboxStep title={t('profile.physicalTitle')} selectedValues={formData.problemes_physique} options={physicalOptions} onToggle={(e) => handleCheckboxChange(e, 'problemes_physique')} />;
            case 11: return <CheckboxStep title={t('profile.equipmentTitle')} subtitle={t('profile.equipmentSubtitle')} selectedValues={formData.matos} options={equipmentOptions} onToggle={(e) => handleCheckboxChange(e, 'matos')} />;
            case 12: return <RadioStep title={t('profile.objectiveTitle')} name="objectif" value={formData.objectif} options={objectiveOptions} onChange={handleChange} />;
            case 13:
                return (
                    <DaySelector
                        title={t('profile.trainingDaysTitle')}
                        dayOptions={dayOptions}
                        selectedDays={formData.jour_disponible}
                        requiredCount={formData.frequence}
                        onToggle={(e) => handleCheckboxChange(e, 'jour_disponible')}
                        dayUnitLabel={dayUnitLabel}
                    />
                );
            case 14: return <TimeStep title={t('profile.timeTitle')} name="heure_disponible" value={formData.heure_disponible} onChange={handleChange} />;
            case 15: return <RadioStep title={t('profile.durationTitle')} name="date_fin" value={formData.date_fin} options={durationOptions} onChange={handleChange} />;
            case 16: return <RadioStep title={t('profile.dietTitle')} name="regime_alimentaire" value={formData.regime_alimentaire} options={dietOptions} onChange={handleChange} />;
            case 17: return <CheckboxStep title={t('profile.allergiesTitle')} subtitle={t('profile.allergiesSubtitle')} selectedValues={formData.allergies} options={allergyOptions} onToggle={(e) => handleCheckboxChange(e, 'allergies')} />;
            case 18: return <FinalStep title={t('profile.finalTitle')} subtitle={t('profile.finalSubtitle')} />;
            default: return null;
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
            <ConsentPopup />
            <div className="w-full max-w-2xl z-10">
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{t('profile.progress', { current: step, total: totalSteps })}</span>
                        <span className="text-sm font-medium text-sport">{Math.round(((step - 1) / (totalSteps - 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-sport h-2 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / (totalSteps - 1)) * 100}%` }} />
                    </div>
                </div>

                <form className="bg-white rounded-2xl shadow-xl p-8 space-y-6" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{error}</span>
                        </div>
                    )}

                    {renderStepContent()}

                    {/* Navigation */}
                    <div className="flex gap-4 pt-6 border-t border-gray-200">
                        {step > 1 && (
                            <button type="button" onClick={prevStep} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 px-6 rounded-xl transition-all duration-200">
                                {t('common.back')}
                            </button>
                        )}
                        {step < totalSteps && (
                            <button type="button" onClick={nextStep} disabled={!canNext()} className="flex-1 bg-sport hover:brightness-110 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100">
                                {t('common.next')}
                            </button>
                        )}
                        {step === totalSteps && (
                            <button type="submit" disabled={loading} className="flex-1 bg-sport hover:brightness-110 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105">
                                {loading ? t('profile.finalLoading') : t('profile.finalButton')}
                            </button>
                        )}
                    </div>
                </form>
            </div>
            <WaweEffect />
        </main>
    );
}

export default Form;