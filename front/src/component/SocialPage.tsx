// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus, UserCheck, UserX, Users, Clock, Trash2, MessageCircle, Send, ChevronLeft, Calendar, User } from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import { useSocialData, useSearchUsers, useConversation, useSendMessage, useSendFriendRequest, useAcceptFriendRequest, useRemoveFriend } from '@/features/social';
import { useEvents } from '@/features/planning';
import { LoadingSpinner } from './shared';

const SocialPage: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { data: socialData = { friends: [], pending: [], notifications: [] } } = useSocialData();
    const { data: eventsData } = useEvents();
    const events = eventsData?.evenements || [];

    // États locaux (UI uniquement)
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('friends');
    const [selectedFriend, setSelectedFriend] = useState<any>(null);
    const [newMessage, setNewMessage] = useState('');

    const { data: searchResults = [], isLoading: searchLoading } = useSearchUsers(searchQuery);

    const { data: messages = [], isLoading: chatLoading } = useConversation(selectedFriend?.id);

    const sendMessageMutation = useSendMessage();
    const sendFriendRequestMutation = useSendFriendRequest();
    const acceptFriendRequestMutation = useAcceptFriendRequest();
    const removeFriendMutation = useRemoveFriend();

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedFriend) return;

        const content = newMessage.trim();
        setNewMessage('');

        sendMessageMutation.mutate({
            id_receveur: selectedFriend.id,
            contenu: content,
        }, {
            onSuccess: () => {
                setTimeout(scrollToBottom, 50);
            },
        });
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
    };

    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    const sendRequest = (userId) => {
        sendFriendRequestMutation.mutate(userId);
    };

    const acceptRequest = (userId) => {
        acceptFriendRequestMutation.mutate(userId);
    };

    const removeRelation = (userId) => {
        if (!window.confirm(t('profilePage.actions.deleteConfirm'))) return;
        removeFriendMutation.mutate(userId);
    };

    return (
        <>
            <Header />
            
            <main className={`min-h-screen bg-gray-50 ${!selectedFriend ? 'pt-4 px-4 sm:px-6 lg:px-8 pb-24' : 'p-0'} max-w-2xl mx-auto`}>
                
                {!selectedFriend ? (
                    <>
                        <div className="mb-6">
                            <h1 className="text-3xl font-extrabold text-gray-900">
                                {t('social.title')}
                            </h1>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            <div className="bg-sport rounded-2xl shadow-lg overflow-hidden">
                                <button 
                                    onClick={() => navigate('/sessions/community')} 
                                    className="w-full h-full p-4 flex items-center justify-between hover:brightness-110 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-3 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-bold text-lg">{t('session.communitySessions')}</div>
                                            <div className="text-white/80 text-xs">{t('social.exploreSessions')}</div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>

                            <div className="bg-success rounded-2xl shadow-lg overflow-hidden">
                                <button 
                                    onClick={() => navigate('/sessions/my-sessions')} 
                                    className="w-full h-full p-4 flex items-center justify-between hover:brightness-110 transition-all"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-3 rounded-xl">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-white font-bold text-lg">{t('session.myCustomSessions')}</div>
                                            <div className="text-white/80 text-xs">{t('social.manageYourSessions')}</div>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                       

                        <div className="mb-6">
                            <h3 className="text-xl font-bold text-text-main mb-4 px-2">{t('social.events_title')}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => navigate('/Evenement')}
                                    className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-sport transition-all duration-200 text-left group"
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 bg-sport/10 rounded-xl flex items-center justify-center text-sport group-hover:scale-110 transition-transform">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-main group-hover:text-sport transition-colors">
                                                {t('social.explore_events')}
                                            </h4>
                                            <p className="text-xs text-gray-500">{t('social.all_events_subtitle')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{events.length} {t('social.events_available')}</span>
                                        <span className="text-sport text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Voir →
                                        </span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => navigate('/my-events')}
                                    className="bg-white hover:bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-sport transition-all duration-200 text-left group"
                                >
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center text-success group-hover:scale-110 transition-transform">
                                            <UserCheck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-main group-hover:text-sport transition-colors">
                                                {t('social.my_events')}
                                            </h4>
                                            <p className="text-xs text-gray-500">{t('social.my_events_subtitle')}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">{t('social.see_my_events')}</span>
                                        <span className="text-sport text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                            Voir →
                                        </span>
                                    </div>
                                </button>
                            </div>
                        </div>
                         <div className="relative mb-8">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={handleSearch}
                                className="block w-full pl-11 pr-4 py-4 bg-white border-0 rounded-2xl shadow-sm focus:ring-2 focus:ring-sport outline-none font-medium"
                                placeholder={t('social.searchPlaceholder')}
                            />
                            {searchLoading && (
                                <div className="absolute right-4 top-4">
                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sport"></div>
                                </div>
                            )}

                            {searchResults.length > 0 && (
                                <div className="absolute z-10 w-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-fadeIn">
                                    {searchResults.map((user) => (
                                        <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-sport/10 rounded-full flex items-center justify-center text-sport font-bold">
                                                    {user.pseudo.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-text-main">{user.pseudo}</span>
                                            </div>

                                            {user.relationStatus === 'aucun' ? (
                                                <button
                                                    onClick={() => sendRequest(user.id)}
                                                    disabled={sendFriendRequestMutation.isPending && sendFriendRequestMutation.variables === user.id}
                                                    className="flex items-center gap-2 bg-sport text-white px-4 py-2 rounded-xl text-sm font-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {sendFriendRequestMutation.isPending && sendFriendRequestMutation.variables === user.id ? (
                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                    ) : (
                                                        <UserPlus className="w-4 h-4" />
                                                    )}
                                                    {t('social.addFriend')}
                                                </button>
                                            ) : (
                                                <span className="text-sm font-bold text-gray-400 bg-gray-100 px-4 py-2 rounded-xl flex items-center gap-2">
                                                    {user.relationStatus === 'accepte' ? <UserCheck className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                                    {t(`social.friendStatus.${user.relationStatus === 'en_attente' ? 'pending' : 'accepted'}`)}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex bg-white p-1 rounded-2xl shadow-sm border border-gray-100 mb-6">
                            <button
                                onClick={() => handleTabChange('friends')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'friends' ? 'bg-sport text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Users className="w-4 h-4" />
                                {t('social.friendsTab')}
                                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px]">{socialData.friends.length}</span>
                            </button>
                            <button
                                onClick={() => handleTabChange('requests')}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'requests' ? 'bg-sport text-white shadow-lg' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <Clock className="w-4 h-4" />
                                {t('social.requestsTab')}
                                {socialData.pending.length > 0 && <span className="bg-error text-white px-2 py-0.5 rounded-full text-[10px] animate-pulse">{socialData.pending.length}</span>}
                            </button>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden ">
                            {activeTab === 'friends' && (
                                <div className="divide-y divide-gray-50">
                                    {socialData.friends.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400">
                                            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>{t('social.noFriends')}</p>
                                        </div>
                                    ) : (
                                        socialData.friends.map(friend => (
                                            <div key={friend.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer group" onClick={() => setSelectedFriend(friend)}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-success/10 rounded-2xl flex items-center justify-center text-success font-black text-lg">
                                                        {friend.pseudo.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-text-main group-hover:text-sport transition-colors">{friend.pseudo}</h4>
                                                            {friend.unreadCount > 0 && (
                                                                <span className="bg-error text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                                                                    {friend.unreadCount}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-gray-400">{t('social.friend_since', { date: new Date(friend.date_acceptation).toLocaleDateString() })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); navigate(`/profil-public/${friend.id}`); }}
                                                        className="p-2 bg-gray-100 text-gray-500 hover:bg-sport/10 hover:text-sport rounded-xl transition-all"
                                                        title="Voir le profil"
                                                    >
                                                        <User className="w-5 h-5" />
                                                    </button>
                                                    <div className="p-2 bg-sport/5 text-sport rounded-xl opacity-0 group-hover:opacity-100 transition-all">
                                                        <MessageCircle className="w-5 h-5" />
                                                    </div>
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); removeRelation(friend.id); }}
                                                        className="p-2 text-gray-300 hover:text-error transition-colors"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {activeTab === 'requests' && (
                                <div className="divide-y divide-gray-50">
                                    {socialData.pending.length === 0 ? (
                                        <div className="p-12 text-center text-gray-400">
                                            <Clock className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                            <p>{t('social.noRequests')}</p>
                                        </div>
                                    ) : (
                                        socialData.pending.map(req => (
                                            <div key={req.id} className="p-6 flex items-center justify-between bg-sport/5">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-sport/10 rounded-2xl flex items-center justify-center text-sport font-black">
                                                        {req.pseudo.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-text-main">{req.pseudo}</h4>
                                                        <p className="text-xs text-gray-400">{t('social.received_on', { date: new Date(req.date_creation).toLocaleDateString() })}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => acceptRequest(req.id)}
                                                        className="bg-success text-white px-4 py-2 rounded-xl text-xs font-bold hover:brightness-110 shadow-lg shadow-success/10"
                                                    >
                                                        {t('social.accept')}
                                                    </button>
                                                    <button
                                                        onClick={() => removeRelation(req.id)}
                                                        className="bg-white text-gray-500 border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50"
                                                    >
                                                        {t('social.decline')}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </>
                ) : (
              

                        <div className="bg-white flex flex-col h-screen animate-slideInRight">
                            <div className="flex  items-center gap-4 p-4 border-b border-gray-200 bg-white">
                                <button
                                    onClick={() => setSelectedFriend(null)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <ChevronLeft className="w-6 h-6 text-text-main" />
                                </button>
                                <div className="flex items-center gap-3 flex-1">
                                    <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center text-success font-bold">
                                        {selectedFriend.pseudo.charAt(0).toUpperCase()}
                                    </div>
                                    <h2 className="text-lg font-bold text-text-main">{selectedFriend.pseudo}</h2>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-background">
                                {chatLoading ? (
                                    <div className="flex justify-center items-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sport"></div>
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400 italic text-sm">
                                        <MessageCircle className="w-12 h-12 mb-3 opacity-10" />
                                        <p>{t('social.chat.noMessages')}</p>
                                    </div>
                                ) : (
                                    messages.map((msg) => (
                                        <div key={msg.id_message} className={`flex ${msg.id_emetteur === selectedFriend.id ? 'justify-start' : 'justify-end'}`}>
                                            <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium shadow-sm ${msg.id_emetteur === selectedFriend.id
                                                ? 'bg-white text-text-main rounded-bl-none border border-gray-100'
                                                : 'bg-sport text-white rounded-br-none'
                                                }`}>
                                                {msg.contenu}
                                                <p className={`text-[10px] mt-1 ${msg.id_emetteur === selectedFriend.id ? 'text-gray-400' : 'text-white/70'}`}>
                                                    {new Date(msg.date_envoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 bg-white flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    className="flex-1 bg-gray-100 border-0 rounded-full px-4 py-3 focus:ring-2 focus:ring-sport outline-none"
                                    placeholder={t('social.chat.placeholder')}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="bg-sport text-white p-3 rounded-full hover:brightness-110 disabled:bg-gray-300 transition-all active:scale-95 shadow-lg shadow-sport/10"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </form>
                        </div>
                    
                )}
            </main>
            <Footer />
        </>
    );
};

export default SocialPage;
