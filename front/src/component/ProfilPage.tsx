// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { 
    User, 
    Lock, 
    Settings, 
    Trophy, 
    LogOut, 
    Trash2, 
    ChevronLeft, 
    ShieldCheck, 
    Globe, 
    Eye, 
    EyeOff,
    Activity,
    ClipboardList,
    Mail,
    Dumbbell,
    CheckCircle,
    AlertTriangle,
    Award,
    DoorOpen
} from 'lucide-react';
import Header from './Header';
import Footer from './Footer';
import mascotteSvg from '../../media/mascotte.svg';
import i18n from '../i18n';
import { getUserInfo, logout } from '../utils/auth';
import { useAuthStore } from '../stores/authStore';
import { useSettingsStore } from '../stores/settingsStore';

function ProfilPage() {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const setUserPseudo = useAuthStore((state) => state.setUserPseudo);
    const logoutStore = useAuthStore((state) => state.logout);
    const lang = useSettingsStore((state) => state.lang);
    const setLang = useSettingsStore((state) => state.setLang);

    const [user, setUser] = useState({ pseudo: '', email: '' });
    const [formData, setFormData] = useState({
        pseudo: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        langue: lang || i18n.language || 'fr',
        profil_public: true,
    });
    const [loading, setLoading] = useState({});
    const [message, setMessage] = useState({ section: '', type: '', text: '' });
    const [badges, setBadges] = useState([]);
    const [mascotte, setMascotte] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                const userInfo = await getUserInfo();
                if (userInfo && userInfo.user) {
                    const { id, pseudo, email, profil_public } = userInfo.user;

                    setUser({ id, pseudo, email });
                    setFormData(prev => ({ ...prev, pseudo, email, profil_public: profil_public !== false }));

                    fetch(`/api/mascotte/badges/${id}`)
                        .then(res => res.json())
                        .then(data => { if (data.badges) setBadges(data.badges); })
                        .catch(err => console.error("Error fetching badges", err));

                    fetch(`/api/mascotte/getByUser/${id}`)
                        .then(res => res.json())
                        .then(data => {
                            if (data.mascotte && data.mascotte.length > 0) {
                                setMascotte(data.mascotte[0]);
                            }
                        })
                        .catch(err => console.error("Error fetching mascotte", err));
                }
            } catch (e) {
                console.error("Error loading user data", e);
            }
        };

        loadUserData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleProfilPublicToggle = async () => {
        const newValue = !formData.profil_public;
        setFormData(prev => ({ ...prev, profil_public: newValue }));
        setLoading(prev => ({ ...prev, profilPublic: true }));
        setMessage({ section: '', type: '', text: '' });

        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ profil_public: newValue })
            });
            const data = await res.json();
            if (res.ok) {
                setMessage({ section: 'preferences', type: 'success', text: newValue ? t('profilePage.visibility.success_public') : t('profilePage.visibility.success_private') });
            } else {
                setFormData(prev => ({ ...prev, profil_public: !newValue }));
                setMessage({ section: 'preferences', type: 'error', text: data.message || t('profilePage.form.error') });
            }
        } catch {
            setFormData(prev => ({ ...prev, profil_public: !newValue }));
            setMessage({ section: 'preferences', type: 'error', text: t('profilePage.form.serverError') });
        } finally {
            setLoading(prev => ({ ...prev, profilPublic: false }));
        }
    };

    const handleLanguageChange = async (e) => {
        const { value } = e.target;
        setLoading({ preferences: true });
        setMessage({ section: '', type: '', text: '' });

        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ langue: value })
            });

            const data = await res.json();

            if (res.ok) {
                setFormData(prev => ({ ...prev, langue: value }));
                i18n.changeLanguage(value);
                setLang(value);
                setMessage({ section: 'preferences', type: 'success', text: t('profile.languageTitle') + " " + t('common.success') });
            } else {
                setMessage({ section: 'preferences', type: 'error', text: data.message || t('profilePage.form.error') });
            }
        } catch (error) {
            setMessage({ section: 'preferences', type: 'error', text: t('profilePage.form.serverError') });
        } finally {
            setLoading({ preferences: false });
        }
    };

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        setLoading({ account: true });
        setMessage({ section: '', type: '', text: '' });

        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pseudo: formData.pseudo, email: formData.email })
            });

            const data = await res.json();


            if (res.ok) {
                setMessage({ section: 'account', type: 'success', text: t('profilePage.form.success') });
                setUser(prev => ({ ...prev, pseudo: formData.pseudo, email: formData.email }));
                if (formData.pseudo) setUserPseudo(formData.pseudo);
            } else {
                setMessage({ section: 'account', type: 'error', text: data.message || t('profilePage.form.error') });
            }
        } catch (error) {
            setMessage({ section: 'account', type: 'error', text: t('profilePage.form.serverError') });
        } finally {
            setLoading({ account: false });
        }
    };

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading({ security: true });
        setMessage({ section: '', type: '', text: '' });

        if (!formData.currentPassword || !formData.newPassword) {
            setMessage({ section: 'security', type: 'error', text: t('profilePage.form.serverError') });
            setLoading({ security: false });
            return;
        }

        try {
            const res = await fetch('/api/auth/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });

            const data = await res.json();

            if (res.ok) {
                setMessage({ section: 'security', type: 'success', text: t('profilePage.form.success') });
                setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
            } else {
                console.error("Password update failed", data);
                setMessage({
                    section: 'security',
                    type: 'error',
                    text: data.errors?.[0]?.msg || data.message || t('profilePage.form.error')
                });
                console.error("Password update error", data);
            }
        } catch (error) {
            setMessage({ section: 'security', type: 'error', text: t('profilePage.form.serverError') });
        } finally {
            setLoading({ security: false });
        }
    };

    const handleDelete = async () => {
        if (!window.confirm(t('profilePage.actions.deleteConfirm'))) return;

        try {
            const res = await fetch('/api/auth/delete', {
                method: 'DELETE',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            });
            if (res.ok) {
                logoutStore();
                navigate('/inscription');
            } else {
                const data = await res.json();
                alert(data.message || t('profilePage.actions.deleteError'));
            }
        } catch (error) {
            alert(t('profilePage.actions.serverDeleteError'));
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <>
            <Header />

            <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full" style={{ minHeight: "0vh" }}>
                <div className="px-4 pt-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sport hover:text-sport-secondary font-bold mb-6 transition-colors"
                    >
                        {t('common.back')}
                    </button>
                </div>
                <div className="bg-gradient-to-r from-sport to-sport/80 rounded-2xl shadow-lg p-6 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>

                    <div className="relative flex items-center gap-6">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border-4 border-white/30 overflow-hidden p-2 shadow-xl flex-shrink-0">
                            <img src={mascotteSvg} alt="Mascotte" className="w-full h-full object-contain" />
                        </div>

                        <div className="flex-1">
                            <h1 className="text-white text-2xl font-bold mb-1">{user.pseudo}</h1>
                            <p className="text-white/80 text-sm">{user.email}</p>

                            {mascotte && (
                                <div className="mt-3 flex items-center gap-4">
                                    <div className="bg-rank-1 text-text-main text-xs font-black px-3 py-1 rounded-full border-2 border-white/20 shadow-sm">
                                        {t('profilePage.mascotte.level', { level: mascotte.niveau })}
                                    </div>
                                    <div className="flex-1 max-w-xs">
                                        <div className="flex justify-between text-xs text-white/90 mb-1 font-medium">
                                            <span>{t('profilePage.mascotte.xp', { current: mascotte.experience % 100, total: 100 })}</span>
                                        </div>
                                        <div className="w-full h-2 bg-black/20 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-rank-1 shadow-[0_0_10px_rgba(250,204,21,0.6)] transition-all duration-500"
                                                style={{ width: `${mascotte.experience % 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Santé & Programme */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-sport/10 rounded-xl flex items-center justify-center">
                                <Dumbbell className="w-6 h-6 text-sport" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{t('profilePage.tabs.health_program')}</h2>
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            {t('profilePage.health.desc')}
                        </p>

                        <button
                            onClick={() => navigate('/adaptation-programme')}
                            className="w-full bg-sport/5 hover:bg-sport/10 text-sport font-bold py-3 rounded-xl transition-all border-2 border-sport/20 hover:border-sport/40 flex items-center justify-center gap-2"
                        >
                            <ClipboardList className="w-5 h-5" />
                            {t('profilePage.health.adaptButton')}
                        </button>
                    </div>

                    {/* Confidentialité - Compte */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-500" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{t('profilePage.tabs.account_info')}</h2>
                        </div>

                        {message.section === 'account' && message.text && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleUpdateAccount} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profilePage.form.pseudo')}</label>
                                <input
                                    type="text"
                                    name="pseudo"
                                    value={formData.pseudo}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport focus:border-sport outline-none transition-all text-text-main"
                                    placeholder={t('profilePage.form.pseudoPlaceholder')}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profilePage.form.email')}</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport focus:border-sport outline-none transition-all text-text-main"
                                    placeholder={t('profilePage.form.emailPlaceholder')}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading.account}
                                className="w-full bg-sport hover:brightness-110 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.account ? t('profilePage.form.submitting') : t('profilePage.form.save')}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center">
                                <Lock className="w-6 h-6 text-red-500" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{t('profilePage.tabs.security')}</h2>
                        </div>

                        {message.section === 'security' && message.text && (
                            <div className={`p-4 rounded-xl mb-4 text-sm font-medium leading-relaxed ${message.type === 'success' ? 'bg-success/10 text-success border-2 border-success/30' : 'bg-error/10 text-error border-2 border-error/30'}`}>
                                <div className="flex items-start gap-3">
                                    {message.type === 'success' ? (
                                        <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1 break-words">{message.text}</div>
                                </div>
                            </div>
                        )}

                        <div className="p-3 bg-rank-1/10 text-rank-3 text-xs rounded-lg mb-4 border border-rank-1/20 font-medium">
                            <div className="font-bold mb-1">{t('profilePage.form.pwd_criteria.title')}</div>
                            <ul className="space-y-1 ml-4">
                                <li>• {t('profilePage.form.pwd_criteria.min')}</li>
                                <li>• {t('profilePage.form.pwd_criteria.upper')}</li>
                                <li>• {t('profilePage.form.pwd_criteria.lower')}</li>
                                <li>• {t('profilePage.form.pwd_criteria.digit')}</li>
                            </ul>
                        </div>

                        <form onSubmit={handleUpdatePassword} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profilePage.form.currentPassword')}</label>
                                <input
                                    type="password"
                                    name="currentPassword"
                                    value={formData.currentPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport focus:border-sport outline-none transition-all text-text-main"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t('profilePage.form.newPassword')}</label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={formData.newPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport focus:border-sport outline-none transition-all text-text-main"
                                    placeholder="••••••••"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading.security}
                                className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading.security ? t('profilePage.form.submitting') : t('profilePage.form.newPassword')}
                            </button>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center">
                                <Settings className="w-6 h-6 text-purple-500" />
                            </div>
                            <h2 className="text-xl font-bold text-text-main">{t('profilePage.tabs.preferences')}</h2>
                        </div>

                        {message.section === 'preferences' && message.text && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-success/10 text-success border border-success/20' : 'bg-error/10 text-error border border-error/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <span className="flex items-center gap-2">
                                    <Globe className="w-4 h-4" />
                                    {t('profilePage.language.label')}
                                </span>
                            </label>
                            <select
                                name="langue"
                                value={formData.langue}
                                onChange={handleLanguageChange}
                                disabled={loading.preferences}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sport focus:border-sport outline-none transition-all text-text-main bg-white disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <option value="fr">{t('common.french')}</option>
                                <option value="en">{t('common.english')}</option>
                            </select>
                            <p className="text-xs text-gray-500 mt-2">
                                {t('profilePage.language.hint')}
                            </p>
                        </div>

                        <div className="mt-5 pt-5 border-t border-gray-100">
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                <span className="flex items-center gap-2">
                                    <Eye className="w-4 h-4" />
                                    {t('profilePage.tabs.visibility')}
                                </span>
                            </label>
                            <button
                                type="button"
                                onClick={handleProfilPublicToggle}
                                disabled={loading.profilPublic}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                                    formData.profil_public
                                        ? 'bg-success/5 border-success/30 hover:border-success/50'
                                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    {formData.profil_public ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                                    <div className="text-left">
                                        <div className={`font-bold text-sm ${formData.profil_public ? 'text-success' : 'text-gray-600'}`}>
                                            {formData.profil_public ? t('profilePage.visibility.public') : t('profilePage.visibility.private')}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {formData.profil_public
                                                ? t('profilePage.visibility.public_desc')
                                                : t('profilePage.visibility.private_desc')}
                                        </div>
                                    </div>
                                </div>
                                <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${formData.profil_public ? 'bg-success' : 'bg-gray-300'}`}>
                                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${formData.profil_public ? 'translate-x-7' : 'translate-x-1'}`}></div>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Badges */}
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-rank-1/20 rounded-xl flex items-center justify-center">
                                <Trophy className="w-6 h-6 text-rank-1" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-text-main">{t('profilePage.badges.title')}</h2>
                                <p className="text-sm text-gray-500">
                                    {badges.length > 1 ? t('profilePage.badges.count_plural', { count: badges.length }) : t('profilePage.badges.count', { count: badges.length })}
                                </p>
                            </div>
                        </div>

                        {badges.length === 0 ? (
                            <div className="text-center py-12 bg-background rounded-xl">
                                <Award className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p className="text-gray-400 italic">{t('profilePage.badges.empty')}</p>
                                <p className="text-gray-400 text-xs mt-2">{t('profilePage.badges.hint')}</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {badges.map((badge) => (
                                    <div key={badge.id_badge} className="bg-gradient-to-br from-rank-1/5 to-sport/5 border border-sport/10 rounded-xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-all hover:scale-105">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-4xl mb-2 shadow-inner">
                                            {badge.icone}
                                        </div>
                                        <h4 className="text-text-main font-bold text-sm leading-tight mb-1">{badge.nom}</h4>
                                        <p className="text-gray-500 text-[10px] line-clamp-2 leading-tight mb-2">{badge.description}</p>
                                        <p className="text-sport/60 text-[9px] italic font-medium">
                                            {t('profilePage.badges.obtainedDate', { date: new Date(badge.date_obtention).toLocaleDateString() })}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions Dangereuses */}
                <div className="mt-8 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
                    <h3 className="text-lg font-bold text-text-main mb-4">{t('profilePage.actions.title')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={handleLogout}
                            className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors"
                        >
                            <DoorOpen className="w-5 h-5" />
                            {t('profilePage.actions.logout')}
                        </button>

                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center gap-2 bg-error/5 hover:bg-error/10 text-error font-semibold py-3 rounded-xl transition-colors border border-error/10 hover:border-error/20"
                        >
                            <AlertTriangle className="w-5 h-5" />
                            {t('profilePage.actions.deleteAccount')}
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}

export default ProfilPage;
