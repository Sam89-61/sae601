
import React, { createContext, useContext, useState, useEffect } from 'react';
import { setupGamificationInterceptor } from '../utils/fetchInterceptor';

const GamificationContext = createContext();

export function GamificationProvider({ children }) {
    const [showBadgePopup, setShowBadgePopup] = useState(false);
    const [newBadges, setNewBadges] = useState([]);

    const triggerBadgePopup = (badges) => {
        if (badges && badges.length > 0) {
            setNewBadges(badges);
            setShowBadgePopup(true);
        }
    };

    const closeBadgePopup = () => {
        setShowBadgePopup(false);
        setNewBadges([]);
    };

    useEffect(() => {
        setupGamificationInterceptor(triggerBadgePopup);
    }, []);

    return (
        <GamificationContext.Provider value={{ 
            showBadgePopup, 
            newBadges, 
            triggerBadgePopup, 
            closeBadgePopup 
        }}>
            {children}
        </GamificationContext.Provider>
    );
}

export function useGamification() {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error('useGamification doit être utilisé dans un GamificationProvider');
    }
    return context;
}
