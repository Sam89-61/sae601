import Accueil from '../component/Accueil.jsx';
import FormProfil from '../component/FormProfil.jsx';
import Form_Inscr from '../component/Form_Inscr.jsx';
import Form_Co from '../component/Form_Co.jsx';
import MonProgrammeSport from '../component/MonProgrammeSport.jsx';
import SessionManager from '../component/SessionManager.jsx';
import ListeModeles from '../component/ListeModeles.jsx';
import Classement from '../component/Classement.jsx';
import AdminDashboard from '../component/AdminDashboard.jsx';
import ScanExo from '../component/scanExo.jsx';
import VideoEvent from '../component/VideoEvent.jsx';
import Planning from '../component/Planning.jsx';
import LegalPage from '../component/LegalPage.jsx';
import ProgrammeAlimentaire from '../component/ProgrammeAlimentaire.jsx';
import ProfilPage from '../component/ProfilPage.jsx';
import FormAdaptation from '../component/FormAdaptation.jsx';
import Evolution from '../component/Evolution.jsx';
import SocialPage from '../component/SocialPage.jsx';
import CreateCustomSession from '../component/CreateCustomSession.jsx';
import CommunitySessions from '../component/CommunitySessions.jsx';
import SessionDetails from '../component/SessionDetails.jsx';
import MyCustomSessions from '../component/MyCustomSessions.jsx';
import TousLesModeles from '../component/TousLesModeles.jsx';
import MyEvents from '../component/MyEvents.jsx';
import PublicProfilPage from '../component/PublicProfilPage.tsx';
import MotDePasseOublie from '../component/MotDePasseOublie.tsx';
import ReinitialiserMotDePasse from '../component/ReinitialiserMotDePasse.tsx';

/**
 * Configuration des routes de l'application
 *
 * Chaque route peut avoir les propriétés suivantes :
 * - path: Le chemin de la route (string ou fonction pour routes dynamiques)
 * - component: Le composant à afficher
 * - requireAuth: true si la route nécessite une authentification (défaut: true)
 * - requireProfile: true si la route nécessite un profil complété (défaut: true si requireAuth)
 * - adminOnly: true si la route est réservée aux admins
 * - exact: true pour matcher exactement le path (défaut: false)
 * - matcher: fonction custom pour matcher des routes dynamiques
 */

// Routes publiques (pas d'authentification requise)
export const PUBLIC_ROUTES = [
  {
    path: '/inscription',
    component: Form_Inscr,
    requireAuth: false,
  },
  {
    path: '/login',
    component: Form_Co,
    requireAuth: false,
  },
  {
    path: '/mot-de-passe-oublie',
    component: MotDePasseOublie,
    requireAuth: false,
  },
  {
    path: '/reinitialiser-mot-de-passe',
    component: ReinitialiserMotDePasse,
    requireAuth: false,
  },
];

// Routes pour utilisateurs authentifiés SANS profil
export const NO_PROFILE_ROUTES = [
  {
    path: '/creation-profil',
    component: FormProfil,
    requireAuth: true,
    requireProfile: false,
  },
  {
    path: '/mentions-legales',
    component: LegalPage,
    requireAuth: true,
    requireProfile: false,
  },
];

// Routes pour utilisateurs authentifiés AVEC profil
export const PROTECTED_ROUTES = [
  {
    path: '/',
    component: Accueil,
    exact: true,
  },
  {
    path: '/mon-programme-sport',
    component: MonProgrammeSport,
  },
  {
    path: '/mon-programme-alimentaire',
    component: ProgrammeAlimentaire,
  },
  {
    path: '/adaptation-programme',
    component: FormAdaptation,
  },
  {
    path: '/sessions/create',
    component: CreateCustomSession,
  },
  {
    path: '/sessions/community',
    component: CommunitySessions,
  },
  {
    path: '/sessions/my-sessions',
    component: MyCustomSessions,
  },
  {
    path: '/sessions/:type/:id',
    component: SessionDetails,
    matcher: (pathname) => {
      const match = pathname.match(/^\/sessions\/([^/]+)\/([^/]+)$/);
      if (match) {
        return { type: match[1], id: match[2] };
      }
      return null;
    },
  },
  {
    path: '/session/:id',
    component: SessionManager,
    matcher: (pathname) => {
      const match = pathname.match(/^\/session\/([^/]+)$/);
      return match ? { id: match[1] } : null;
    },
  },
  {
    path: '/seance-libre/:id',
    component: SessionManager,
    matcher: (pathname) => {
      const match = pathname.match(/^\/seance-libre\/([^/]+)$/);
      return match ? { mode: 'libre', id: match[1] } : null;
    },
  },
  {
    path: '/Evenement',
    component: Planning,
  },
  {
    path: '/my-events',
    component: MyEvents,
  },
  {
    path: '/join-event/:id',
    component: VideoEvent,
    matcher: (pathname) => {
      const match = pathname.match(/^\/join-event\/([^/]+)$/);
      return match ? { eventId: match[1] } : null;
    },
  },
  {
    path: '/modeles',
    component: TousLesModeles,
  },
  {
    path: '/modeles/:zone',
    component: ListeModeles,
    matcher: (pathname) => {
      const match = pathname.match(/^\/modeles\/([^/]+)$/);
      return match ? { zone: decodeURIComponent(match[1]) } : null;
    },
  },
  {
    path: '/scan',
    component: ScanExo,
  },
  {
    path: '/scan-exo',
    component: ScanExo,
  },
  {
    path: '/profil',
    component: ProfilPage,
  },
  {
    path: '/profil-public/:userId',
    component: PublicProfilPage,
    matcher: (pathname) => {
      const match = pathname.match(/^\/profil-public\/([^/]+)$/);
      return match ? { userId: match[1] } : null;
    },
  },
  {
    path: '/communaute',
    component: SocialPage,
  },
  {
    path: '/classement',
    component: Classement,
  },
  {
    path: '/evolution',
    component: Evolution,
  },
  {
    path: '/mentions-legales',
    component: LegalPage,
  },
];

export const ADMIN_ROUTES = [
  {
    path: '/admin',
    component: AdminDashboard,
    adminOnly: true,
  },
];

/**
 * Trouve la route correspondant au pathname donné
 * @param {string} pathname - Le pathname à matcher
 * @param {Array} routes - Liste des routes à vérifier
 * @returns {Object|null} - { route, params } ou null si pas de match
 */
export function matchRoute(pathname, routes) {
  for (const route of routes) {
    if (route.exact && route.path === pathname) {
      return { route, params: {} };
    }

    if (route.matcher) {
      const params = route.matcher(pathname);
      if (params !== null) {
        return { route, params };
      }
    }

    if (!route.exact && !route.matcher && route.path === pathname) {
      return { route, params: {} };
    }
  }

  return null;
}

/**
 * Trouve la meilleure route à afficher selon l'état de l'utilisateur
 * @param {string} pathname - Le pathname actuel
 * @param {boolean} isAuthenticated - L'utilisateur est-il connecté ?
 * @param {boolean} hasProfile - L'utilisateur a-t-il un profil ?
 * @param {boolean} isAdmin - L'utilisateur est-il admin ?
 * @returns {Object|null} - { component, props } ou null
 */
export function resolveRoute(pathname, isAuthenticated, hasProfile, isAdmin) {
  // 1. Vérifier les routes admin en priorité
  if (isAdmin) {
    const adminMatch = matchRoute(pathname, ADMIN_ROUTES);
    if (adminMatch) {
      return {
        component: adminMatch.route.component,
        props: adminMatch.params,
      };
    }
  }

  // 2. Utilisateur non authentifié → routes publiques uniquement
  if (!isAuthenticated) {
    const publicMatch = matchRoute(pathname, PUBLIC_ROUTES);
    if (publicMatch) {
      return {
        component: publicMatch.route.component,
        props: publicMatch.params,
      };
    }
    // Default: page d'inscription
    return {
      component: Form_Inscr,
      props: {},
    };
  }

  // 3. Utilisateur authentifié SANS profil → routes limitées
  if (hasProfile === false) {
    const noProfileMatch = matchRoute(pathname, NO_PROFILE_ROUTES);
    if (noProfileMatch) {
      return {
        component: noProfileMatch.route.component,
        props: noProfileMatch.params,
      };
    }
    // Default: formulaire de profil
    return {
      component: FormProfil,
      props: {},
    };
  }

  // 4. Utilisateur authentifié AVEC profil → toutes les routes protégées
  const protectedMatch = matchRoute(pathname, PROTECTED_ROUTES);
  if (protectedMatch) {
    return {
      component: protectedMatch.route.component,
      props: protectedMatch.params,
    };
  }

  // Default: page d'accueil
  return {
    component: Accueil,
    props: {},
  };
}
