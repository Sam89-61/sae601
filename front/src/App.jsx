import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { GamificationProvider, useGamification } from './context/GamificationContext.jsx';
import BadgePopup from './component/BadgePopup.jsx';
import { getUserInfo, logout } from './utils/auth';
import { apiFetch } from './utils/api';
import { resolveRoute } from './routes/config.jsx';
import { queryClient } from './config/queryClient';
import { useAuthStore } from './stores/authStore';

/**
 * Composant de protection des routes qui nécessitent une authentification
 */
function ProtectedRoute({ children }) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userInfo = await getUserInfo();
      setIsAuth(!!userInfo);
      setIsChecking(false);
    };
    checkAuth();
  }, []);

  if (isChecking) {
    return <div>Chargement...</div>;
  }

  if (!isAuth) {
    return <Navigate to="/inscription" replace />;
  }

  return children;
}

/**
 * Composant de gestion des routes selon le profil utilisateur
 */
function ProfileRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.login);
  const storeLogout = useAuthStore((state) => state.logout);
  const [hasProfile, setHasProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const checkProfile = async () => {
      setIsLoading(true);
      let currentUserId = user?.id;

      if (!currentUserId) {
        const info = await getUserInfo();
        if (info && info.user) {
          setUser(info.user);
          currentUserId = info.user.id;
        }
      }

      if (!currentUserId) {
        storeLogout();
        setIsLoading(false);
        return;
      }

      if (user?.role === 'admin') {
        setIsAdmin(true);
      }

      try {
        const response = await apiFetch(`/api/profil/getProfilByUser/${currentUserId}`);

        if (response.ok) {
          const result = await response.json();
          if (result.data && result.data.length > 0) {
            setHasProfile(true);
          } else {
            setHasProfile(false);
          }
        } else if (response.status === 401 || response.status === 403) {
          console.warn("Session expirée ou utilisateur invalide.");
          storeLogout();
          await logout(); // Appel de l'utilitaire qui gère le cookie et redirige
          return;
        } else if (response.status === 404) {
          setHasProfile(false);
        } else {
          console.error(`Erreur serveur ${response.status} lors de la vérification du profil`);
          setHasProfile(true);
        }
      } catch (error) {
        console.error("Erreur réseau lors de la vérification du profil:", error);
        setHasProfile(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [user, navigate, setUser]);

  useEffect(() => {
    if (isLoading) return;

    if (isAuthenticated) {
      if (location.pathname === '/admin' && !isAdmin) {
          navigate('/', { replace: true });
          return;
      }

      if (hasProfile === true) {
        if (location.pathname === '/creation-profil' || location.pathname === '/login' || location.pathname === '/inscription') {
          navigate('/', { replace: true });
        }
      } else if (hasProfile === false) {
        if (location.pathname !== '/creation-profil' && location.pathname !== '/mentions-legales') {
          navigate('/creation-profil', { replace: true });
        }
      }
    } else {
      const publicPaths = ['/inscription', '/login', '/mot-de-passe-oublie', '/reinitialiser-mot-de-passe'];
      if (!publicPaths.includes(location.pathname)) {
        navigate('/inscription', { replace: true });
      }
    }
  }, [isLoading, isAuthenticated, hasProfile, location.pathname, isAdmin, navigate]);

  if (isLoading) {
    return <div className="app-loading">Chargement...</div>;
  }

  const renderView = () => {
    const resolved = resolveRoute(
      location.pathname,
      isAuthenticated,
      hasProfile,
      isAdmin
    );

    if (!resolved) {
      // Fallback au cas où resolveRoute retourne null (ne devrait jamais arriver)
      return <div>Page introuvable</div>;
    }

    const Component = resolved.component;
    const props = resolved.props;

    return <Component {...props} />;
  };

  return (
    <>
        {renderView()}
    </>
  );
}

/**
 * Composant interne qui affiche la popup de badges
 */
function BadgePopupController() {
  const { showBadgePopup, newBadges, closeBadgePopup } = useGamification();
  
  return showBadgePopup ? (
    <BadgePopup badges={newBadges} onClose={closeBadgePopup} />
  ) : null;
}

/**
 * Application BuddyCoach principale avec Router
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <GamificationProvider>
        <BrowserRouter>
          <div className="app-container min-h-screen">
            <Routes>
              <Route path="/inscription" element={<ProfileRouter />} />
              <Route path="/login" element={<ProfileRouter />} />
              <Route path="/mot-de-passe-oublie" element={<ProfileRouter />} />
              <Route path="/reinitialiser-mot-de-passe" element={<ProfileRouter />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <ProfileRouter />
                </ProtectedRoute>
              } />
            </Routes>
            <BadgePopupController />
          </div>
        </BrowserRouter>
      </GamificationProvider>
    </QueryClientProvider>
  );
}

export default App;