// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from './Header';
import Footer from './Footer';
import jambesImg from '../../media/seance/jambe.png';
import abdoImg from '../../media/seance/buste.png';
import cardioImg from '../../media/seance/cardio.png';

function TousLesModeles() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadZones = async () => {
            try {
                const res = await fetch('/api/modeleSeance');
                if (res.ok) {
                    const data = await res.json();
                    // Extraire toutes les zones uniques
                    const allZones = data.flatMap(m => m.tags_zone_corps || []);
                    const uniqueZones = [...new Set(allZones)];
                    setZones(uniqueZones);
                }
            } catch (err) {
                console.error("Erreur chargement zones:", err);
            } finally {
                setLoading(false);
            }
        };
        loadZones();
    }, []);

    const getImageForZone = (zone) => {
        const zoneLower = zone.toLowerCase();
        if (zoneLower.includes('jambe') || zoneLower.includes('leg')) return jambesImg;
        if (zoneLower.includes('haut du corps') || zoneLower.includes('torse') || zoneLower.includes('buste')) return abdoImg;
        if (zoneLower.includes('bras') || zoneLower.includes('arm')) return cardioImg;
        if (zoneLower.includes('pectoraux') || zoneLower.includes('chest')) return abdoImg;
        if (zoneLower.includes('cardio')) return cardioImg;
        return cardioImg;
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-6 pb-24 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sport font-semibold hover:underline mb-4 flex items-center gap-1"
                    >
                        {t('common.back')}
                    </button>
                    <h1 className="text-3xl font-bold text-text-main mb-2">
                        {t('home.library_title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('home.library_subtitle')}
                    </p>
                </div>

                {/* Grille des zones musculaires */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
                ) : zones.length === 0 ? (
                    <div className="bg-white rounded-xl p-8 text-center shadow-sm border border-gray-200">
                        <p className="text-gray-500">{t('library.no_zone')}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {zones.map((zone) => (
                                <button
                                    key={zone}
                                    onClick={() => navigate(`/modeles/${encodeURIComponent(zone)}`)}
                                    className="relative rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 aspect-square group"
                                >
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transition-transform duration-200 group-hover:scale-105"
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${getImageForZone(zone)})`,
                                        }}
                                    ></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white text-lg md:text-xl font-bold text-shadow text-center px-2">
                                            {zone}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Nombre de zones */}
                        <div className="mt-6 text-center text-sm text-gray-500">
                            {zones.length} {t('library.zones_available')}
                        </div>
                    </>
                )}
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

export default TousLesModeles;
