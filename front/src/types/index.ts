// ============================================
// Types de base BuddyCoach
// ============================================

// ============================================
// Auth & User
// ============================================

export interface User {
  id_utilisateur: number;
  pseudo: string;
  email: string;
  role: 'user' | 'admin';
  date_inscription: string;
  cgu_accepte: boolean;
  langue?: string;
}

export interface Profil {
  id_profil: number;
  id_utilisateur: number;
  age: number;
  poids: number;
  taille: number;
  sexe: 'M' | 'F' | 'Autre';
  niveau_activite: string;
  objectif_principal: string;
  date_creation: string;
}

// ============================================
// Programme Sport
// ============================================

export interface ProgrammeSport {
  id_programme: number;
  id_utilisateur: number;
  nom_programme: string;
  description?: string;
  duree_semaines: number;
  date_creation: string;
  statut: 'actif' | 'termine' | 'en_pause';
}

export interface SessionSport {
  id_session: number;
  id_programme: number;
  jour_semaine: number;
  nom_session: string;
  ordre?: number;
}

export interface Exercice {
  id_exo: number;
  nom_exo: string;
  description?: string;
  muscle_cible: string;
  difficulte: 'Débutant' | 'Intermédiaire' | 'Avancé';
  equipement_requis?: string;
  video_url?: string;
}

export interface ExerciceSession {
  id_exo_session: number;
  id_session: number;
  id_exo: number;
  series: number;
  repetitions: string;
  repos_secondes: number;
  ordre: number;
  nom_exo?: string;
  muscle_cible?: string;
  video_url?: string;
}

// ============================================
// Programme Alimentaire
// ============================================

export interface ProgrammeAlimentaire {
  id_programme_alim: number;
  id_utilisateur: number;
  calories_jour: number;
  proteines_g: number;
  glucides_g: number;
  lipides_g: number;
  date_creation: string;
}

export interface SessionRepas {
  id_session_repas: number;
  id_programme_alim: number;
  jour_semaine: number;
  type_repas: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
  nom_repas?: string;
}

export interface Aliment {
  id_aliment: number;
  nom_aliment: string;
  calories_100g: number;
  proteines_100g: number;
  glucides_100g: number;
  lipides_100g: number;
  categorie?: string;
}

export interface AlimentSession {
  id_aliment_session: number;
  id_session_repas: number;
  id_aliment: number;
  quantite_g: number;
  nom_aliment?: string;
  calories?: number;
  proteines?: number;
  glucides?: number;
  lipides?: number;
}

// ============================================
// Social
// ============================================

export interface Friend {
  id: number;
  pseudo: string;
  date_acceptation: string;
  unreadCount?: number;
}

export interface FriendRequest {
  id: number;
  pseudo: string;
  date_creation: string;
}

export interface SocialData {
  friends: Friend[];
  pending: FriendRequest[];
  notifications: Notification[];
}

export interface Message {
  id_message: number;
  id_emetteur: number;
  id_receveur: number;
  contenu: string;
  date_envoi: string;
  lu: boolean;
}

export interface Notification {
  id_notification: number;
  id_destinataire: number;
  id_emetteur?: number;
  type: 'demande_ami' | 'acceptation_ami' | 'nouveau_message' | 'badge' | 'autre';
  contenu: string;
  lu: boolean;
  date_creation: string;
}

// ============================================
// Classement & Challenges
// ============================================

export interface Challenge {
  id_classement: number;
  nom_classement: string;
  description?: string;
  type_classement: string;
  date_debut: string;
  date_fin: string;
  statut: 'actif' | 'termine';
}

export interface LeaderboardEntry {
  id_participation: number;
  id_utilisateur: number;
  pseudo: string;
  score: number;
  rang?: number;
  date_participation: string;
}

export interface LeaderboardData {
  classement: LeaderboardEntry[];
  userParticipation?: LeaderboardEntry;
}

// ============================================
// Evolution & Stats
// ============================================

export interface EvolutionStats {
  poids: PoidsEntry[];
  records: RecordEntry[];
  sessionStats: {
    total: number;
    thisWeek: number;
    thisMonth: number;
  };
}

export interface PoidsEntry {
  id_poids: number;
  id_utilisateur: number;
  poids: number;
  date_mesure: string;
}

export interface RecordEntry {
  id_record: number;
  id_utilisateur: number;
  id_exo: number;
  nom_exo: string;
  muscle_cible?: string;
  score: number;
  type_record: 'Max Reps' | '1RM' | 'Temps' | 'Distance';
  date_record: string;
}

export interface ExoProgression {
  date_record: string;
  score: number;
}

// ============================================
// Planning & Events
// ============================================

export interface Event {
  id_evenement: number;
  id_utilisateur: number;
  titre: string;
  description?: string;
  date_debut: string;
  date_fin?: string;
  type_evenement: 'sport' | 'repas' | 'autre';
  lieu?: string;
  participants?: number;
}

// ============================================
// Gamification
// ============================================

export interface Badge {
  id_badge: number;
  nom_badge: string;
  description: string;
  icone?: string;
  condition_obtention?: string;
}

export interface UserBadge {
  id_utilisateur_badge: number;
  id_utilisateur: number;
  id_badge: number;
  date_obtention: string;
  badge?: Badge;
}

// ============================================
// API Responses
// ============================================

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data?: T;
  badges_debloques?: Badge[];
}

export interface ProgrammeResponse {
  programme: ProgrammeSport | ProgrammeAlimentaire;
  sessionsSport?: SessionSport[];
  sessionRepas?: SessionRepas[];
}

export interface ErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================
// Forms & Input
// ============================================

export interface LoginCredentials {
  email: string;
  mot_de_passe: string;
}

export interface RegisterData {
  pseudo: string;
  email: string;
  mot_de_passe: string;
}

export interface ProfilFormData {
  age: number;
  poids: number;
  taille: number;
  sexe: 'M' | 'F' | 'Autre';
  niveau_activite: string;
  objectif_principal: string;
}

// ============================================
// Utility Types
// ============================================

export type ApiMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface RequestConfig {
  method?: ApiMethod;
  headers?: Record<string, string>;
  body?: any;
  credentials?: RequestCredentials;
}
