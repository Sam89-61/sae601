// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Dumbbell, Utensils, Globe, Lock, Eye, Trash2, Play, ClipboardList, Heart, Copy, Timer, Download } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';

function MyCustomSessions() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // all, owned, saved

  useEffect(() => {
    fetchMySessions();
  }, []);

  const fetchMySessions = async () => {
    try {
      const response = await fetch(`/api/sessions/my-sessions`);

      if (!response.ok) throw new Error('Failed to fetch sessions');

      const data = await response.json();
      setSessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (session) => {
    if (session.source_session_id) return; // Cannot toggle visibility of a saved session

    try {
      const type = session.id_session_sport ? 'sport' : 'repas';
      const id = session.id_session_sport || session.id_session_repas;

      const response = await fetch(
        `/api/sessions/${type}/${id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            is_public: !session.is_public
          })
        }
      );

      if (!response.ok) throw new Error('Failed to update visibility');

      // Update local state
      setSessions(sessions.map(s => {
        if ((s.id_session_sport && s.id_session_sport === session.id_session_sport) ||
            (s.id_session_repas && s.id_session_repas === session.id_session_repas)) {
          return { ...s, is_public: !s.is_public };
        }
        return s;
      }));
    } catch (error) {
      console.error('Error updating visibility:', error);
      alert(t('session.errorUpdating'));
    }
  };

  const deleteSession = async (session) => {
    if (!window.confirm(t('session.confirmDelete'))) return;

    try {
      const type = session.id_session_sport ? 'sport' : 'repas';
      const id = session.id_session_sport || session.id_session_repas;

      const response = await fetch(
        `/api/sessions/${type}/${id}`,
        {
          method: 'DELETE'
        }
      );

      if (!response.ok) throw new Error('Failed to delete session');

      // Remove from local state
      setSessions(sessions.filter(s => {
        if (type === 'sport') {
          return s.id_session_sport !== id;
        } else {
          return s.id_session_repas !== id;
        }
      }));
    } catch (error) {
      console.error('Error deleting session:', error);
      alert(t('session.errorDeleting'));
    }
  };

  const viewDetails = (session) => {
    const type = session.id_session_sport ? 'sport' : 'repas';
    const id = session.id_session_sport || session.id_session_repas;
    navigate(`/sessions/${type}/${id}`);
  };

  const filteredSessions = sessions.filter(session => {
    // Type filter
    const matchesType = filter === 'all' || 
                       (filter === 'sport' && !!session.id_session_sport) || 
                       (filter === 'repas' && !!session.id_session_repas);
    
    // Source filter
    const matchesSource = sourceFilter === 'all' || 
                         (sourceFilter === 'owned' && !session.source_session_id) || 
                         (sourceFilter === 'saved' && !!session.source_session_id);

    return matchesType && matchesSource;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-xl font-semibold text-gray-600">{t('common.loading')}</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans text-text-main">
      <Header />
      
      <main className="flex-1 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={() => navigate('/communaute')}
            className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
          >
            {t('common.back')}
          </button>
          <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
            <h1 className="text-3xl font-black text-text-main tracking-tight">{t('session.myCustomSessions')}</h1>
            <button 
              className="bg-sport text-white px-6 py-3 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-sport/20 transform hover:-translate-y-0.5 active:scale-95"
              onClick={() => navigate('/sessions/create')}
            >
               {t('session.createNew')}
            </button>
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-gray-100">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <h2 className="text-2xl font-black text-text-main mb-2 uppercase tracking-tight">{t('session.noCustomSessions')}</h2>
              <p className="text-gray-500 font-medium mb-8">{t('session.createFirstSession')}</p>
              <button 
                className="bg-sport text-white px-8 py-4 rounded-2xl text-lg font-black uppercase tracking-wider hover:brightness-110 transition-all shadow-lg shadow-sport/20 transform hover:-translate-y-0.5 active:scale-95"
                onClick={() => navigate('/sessions/create')}
              >
                {t('session.createFirstSessionButton')}
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4 mb-8">
                <div className="flex gap-2 flex-wrap">
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      sourceFilter === 'all' 
                        ? 'bg-text-main text-white shadow-md' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSourceFilter('all')}
                  >
                    {t('session.all')}
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      sourceFilter === 'owned' 
                        ? 'bg-sport text-white shadow-md' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSourceFilter('owned')}
                  >
                    {t('session.myCreations')}
                  </button>
                  <button 
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      sourceFilter === 'saved' 
                        ? 'bg-success text-white shadow-md' 
                        : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
                    }`}
                    onClick={() => setSourceFilter('saved')}
                  >
                    {t('session.savedSessions')}
                  </button>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button 
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${
                      filter === 'all' 
                        ? 'bg-sport/5 text-sport border-2 border-sport shadow-sm' 
                        : 'bg-transparent text-gray-400 border-2 border-transparent hover:text-gray-600'
                    }`}
                    onClick={() => setFilter('all')}
                  >
                    {t('session.all')}
                  </button>
                  <button 
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${
                      filter === 'sport' 
                        ? 'bg-sport/5 text-sport border-2 border-sport shadow-sm' 
                        : 'bg-transparent text-gray-400 border-2 border-transparent hover:text-gray-600'
                    }`}
                    onClick={() => setFilter('sport')}
                  >
                    {t('session.sport')}
                  </button>
                  <button 
                    className={`px-6 py-2 rounded-xl font-bold transition-all ${
                      filter === 'repas' 
                        ? 'bg-nutrition/5 text-nutrition border-2 border-nutrition shadow-sm' 
                        : 'bg-transparent text-gray-400 border-2 border-transparent hover:text-gray-600'
                    }`}
                    onClick={() => setFilter('repas')}
                  >
                    {t('session.repas')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSessions.map((session) => {
                  const isSport = !!session.id_session_sport;
                  const sessionId = isSport ? session.id_session_sport : session.id_session_repas;
                  const isSaved = !!session.source_session_id;

                  return (
                    <div key={`${isSport ? 'sport' : 'repas'}-${sessionId}`} className="bg-white rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col border border-gray-100 group">
                      <div className="flex justify-between items-center mb-4 gap-2 flex-wrap">
                        <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                          isSaved ? 'bg-success/10 text-success' : 'bg-sport/10 text-sport'
                        }`}>
                          {isSport ? <Dumbbell className="w-3 h-3" /> : <Utensils className="w-3 h-3" />} {isSport ? t('session.sport') : t('session.repas')}
                        </div>
                        {!isSaved && (
                          <div className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 ${
                            session.is_public 
                              ? 'bg-success/10 text-success' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {session.is_public ? (
                              <><Globe className="w-3 h-3" /> {t('session.public')}</>
                            ) : (
                              <><Lock className="w-3 h-3" /> {t('session.private')}</>
                            )}
                          </div>
                        )}
                        {isSaved && (
                          <div className="bg-success/5 text-success px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border border-success/10 flex items-center gap-1">
                            <Download className="w-3 h-3" /> {t('session.savedSessions')}
                          </div>
                        )}
                      </div>

                      <h3 className="text-xl font-black text-text-main mb-2 group-hover:text-sport transition-colors">{session.nom}</h3>
                      <p className="text-gray-500 text-sm mb-4 flex-grow line-clamp-3 font-medium">{session.description || session.notes || t('home.no_description')}</p>

                      {isSaved && session.original_creator_pseudo && (
                        <div className="text-xs text-gray-500 italic mb-4">
                          {t('session.originalCreator')}: <span className="font-bold text-success">{session.original_creator_pseudo}</span>
                        </div>
                      )}

                      {isSport && (
                        <div className="text-gray-700 text-sm font-medium mb-4 flex items-center gap-1">
                          <Timer className="w-4 h-4" /> {session.duree_minutes} {t('session.minutes')}
                        </div>
                      )}

                      <div className="flex gap-6 py-4 border-t border-b border-gray-100 mb-4">
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <Heart className="w-5 h-5" />
                          <span>{session.nb_likes || 0}</span>
                        </div>
                        <div className="flex items-center gap-2 font-semibold text-gray-700">
                          <Copy className="w-5 h-5" />
                          <span>{session.nb_utilisations || 0} {t('session.utilisations')}</span>
                        </div>
                      </div>

                      <div className="text-gray-400 text-xs mb-4">
                        {t('session.createdOn')} {new Date(session.date_creation).toLocaleDateString()}
                      </div>

                      <div className="flex gap-2 justify-end">
                        {isSport ? (
                          <button 
                            className="bg-success text-white px-4 py-2 rounded-xl text-lg hover:brightness-110 transition-all shadow-md shadow-success/20 active:scale-95 flex items-center justify-center"
                            onClick={() => navigate(`/session/${sessionId}`)}
                            title={t('session.startSession')}
                          >
                            <Play className="w-5 h-5" />
                          </button>
                        ) : (
                          <button 
                            className="bg-sport text-white px-4 py-2 rounded-xl text-lg hover:brightness-110 transition-all shadow-md shadow-sport/20 active:scale-95 flex items-center justify-center"
                            onClick={() => viewDetails(session)}
                            title={t('session.viewDetails')}
                          >
                            <Utensils className="w-5 h-5" />
                          </button>
                        )}
                        <button 
                          className="bg-white border-2 border-gray-100 text-gray-400 px-4 py-2 rounded-xl text-lg hover:border-sport hover:text-sport transition-all flex items-center justify-center"
                          onClick={() => viewDetails(session)}
                          title={t('session.viewDetails')}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {!isSaved && (
                          <button 
                            className="bg-white border-2 border-gray-100 text-gray-400 px-4 py-2 rounded-xl text-lg hover:border-sport hover:text-sport transition-all flex items-center justify-center"
                            onClick={() => toggleVisibility(session)}
                            title={session.is_public ? t('session.makePrivate') : t('session.makePublic')}
                          >
                            {session.is_public ? <Lock className="w-5 h-5" /> : <Globe className="w-5 h-5" />}
                          </button>
                        )}
                        <button 
                          className="bg-white border-2 border-gray-100 text-gray-400 px-4 py-2 rounded-xl text-lg hover:border-error hover:text-error transition-all flex items-center justify-center"
                          onClick={() => deleteSession(session)}
                          title={t('session.delete')}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default MyCustomSessions;
