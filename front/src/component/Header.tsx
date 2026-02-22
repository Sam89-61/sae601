// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Home, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ChatBot from './ChatBot.jsx';
import { getUserInfo } from '../utils/auth';

function Header() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            const userInfo = await getUserInfo();
            if (userInfo?.user?.role === 'admin') {
                setIsAdmin(true);
            }
        };
        checkAdmin();
    }, []);

    return (
        <header className=" w-full shadow-md sticky top-0 z-50 bg-white">
            <div className="flex flex-row justify-between items-center px-4 py-2">
                <div className="flex-1 flex justify-start">
                    <ChatBot />
                </div>
                
                <div className="flex-1 flex justify-center">
                    {isAdmin && (
                        <button 
                            className="bg-error px-3 py-1 rounded shadow text-sm font-bold text-white hover:brightness-110 transition-all" 
                            onClick={() => navigate('/admin')}
                            title={t('header.adminTitle')}
                        >
                            {t('header.admin')}
                        </button>
                    )}
                </div>
                
                <div className="flex-1 flex justify-end items-center gap-4">
                    <button 
                        onClick={() => navigate('/')}
                        className="p-2 text-text-main hover:bg-gray-100 rounded-full transition-all"
                        title={t('footer.home')}
                    >
                        <Home size={24} />
                    </button>
                    <button 
                        onClick={() => navigate('/profil')}
                        className="p-2 text-text-main hover:bg-gray-100 rounded-full transition-all"
                        title={t('footer.profile')}
                    >
                        <User size={24} />
                    </button>
                </div>
            </div>
        </header>
    );
}

export default Header;