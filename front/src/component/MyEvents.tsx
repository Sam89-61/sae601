// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, Users, Clock, MapPin, ArrowLeft } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

const MyEvents = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [createdEvents, setCreatedEvents] = useState([]);
    const [joinedEvents, setJoinedEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('created');

    useEffect(() => {
        fetchMyEvents();
    }, []);

    const fetchMyEvents = async () => {
        try {
            const response = await fetch('/api/evenement/my-events');
            if (response.ok) {
                const data = await response.json();
                setCreatedEvents(data.created || []);
                setJoinedEvents(data.joined || []);
            }
        } catch (err) {
            console.error("Erreur chargement mes événements:", err);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString(t('common.locale') === 'en' ? 'en-US' : 'fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const EventCard = ({ event, isCreator }) => (
        <div
            onClick={() => navigate('/Evenement')}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-sport transition-all duration-200 cursor-pointer group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-text-main group-hover:text-sport transition-colors text-lg">
                            {event.nom}
                        </h3>
                        {isCreator && (
                            <span className="bg-sport/10 text-sport px-2 py-1 rounded-lg text-xs font-semibold">
                                {t('events.creator')}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                        {event.description || t('home.no_description')}
                    </p>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-sport" />
                    <span>{formatDate(event.date)}</span>
                </div>
                {event.heure && (
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-sport" />
                        <span>{event.heure}</span>
                    </div>
                )}
                {event.lieu && (
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-sport" />
                        <span>{event.lieu}</span>
                    </div>
                )}
                {event.nb_participants_max && (
                    <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-sport" />
                        <span>{t('events.max_participants', { count: event.nb_participants_max })}</span>
                    </div>
                )}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    {isCreator ? t('events.organizer') : t('events.participant')}
                    {event.organisateur_nom && t('events.by', { name: event.organisateur_nom })}
                </span>
                <span className="text-sport text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('events.view_details')}
                </span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />

            <main className="flex-1 px-4 py-6 pb-24 max-w-6xl mx-auto w-full">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-sport font-semibold hover:underline mb-4 flex items-center gap-2"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t('common.back')}
                    </button>
                    <h1 className="text-3xl font-bold text-text-main mb-2">
                        {t('events.my_events_title')}
                    </h1>
                    <p className="text-gray-600">
                        {t('events.my_events_subtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6">
                    <button
                        onClick={() => setActiveTab('created')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'created'
                                ? 'bg-sport text-white shadow-lg'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <Calendar className="w-4 h-4" />
                        {t('events.my_creations')}
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                            {createdEvents.length}
                        </span>
                    </button>
                    <button
                        onClick={() => setActiveTab('joined')}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${
                            activeTab === 'joined'
                                ? 'bg-sport text-white shadow-lg'
                                : 'text-gray-500 hover:bg-gray-50'
                        }`}
                    >
                        <Users className="w-4 h-4" />
                        {t('events.my_participations')}
                        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">
                            {joinedEvents.length}
                        </span>
                    </button>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12 text-gray-400">{t('common.loading')}</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeTab === 'created' ? (
                            createdEvents.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                                    <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 mb-4">{t('events.no_created')}</p>
                                    <button
                                        onClick={() => navigate('/Evenement')}
                                        className="bg-sport text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition-all"
                                    >
                                        {t('events.create_now')}
                                    </button>
                                </div>
                            ) : (
                                createdEvents.map(event => (
                                    <EventCard key={event.id_evenement} event={event} isCreator={true} />
                                ))
                            )
                        ) : (
                            joinedEvents.length === 0 ? (
                                <div className="col-span-full bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
                                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                    <p className="text-gray-500 mb-4">{t('events.no_joined')}</p>
                                    <button
                                        onClick={() => navigate('/Evenement')}
                                        className="bg-sport text-white px-6 py-3 rounded-xl font-semibold hover:brightness-110 transition-all"
                                    >
                                        {t('events.explore')}
                                    </button>
                                </div>
                            ) : (
                                joinedEvents.map(event => (
                                    <EventCard key={event.id_evenement} event={event} isCreator={false} />
                                ))
                            )
                        )}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default MyEvents;
