// Types spécifiques à la feature Programme
export type {
  ProgrammeSport,
  SessionSport,
  ExerciceSession,
  ProgrammeAlimentaire,
  SessionRepas,
  AlimentSession,
  ProgrammeResponse,
} from '@/types';

// Response types pour les endpoints
export interface ProgrammeSportResponse {
  programme: {
    id_programme: number;
    nom_programme: string;
    description?: string;
    duree_semaines: number;
    statut: 'actif' | 'termine' | 'en_pause';
  };
  sessionsSport?: Array<{
    id_session: number;
    jour_semaine: number;
    nom_session: string;
    exercices: Array<{
      id_exo: number;
      nom_exo: string;
      series: number;
      repetitions: string;
      repos_secondes: number;
      muscle_cible?: string;
      video_url?: string;
    }>;
  }>;
}

export interface ProgrammeAlimentaireResponse {
  programme: {
    id_programme_alim: number;
    calories_jour: number;
    proteines_g: number;
    glucides_g: number;
    lipides_g: number;
  };
  sessionRepas?: Array<{
    id_session_repas: number;
    jour_semaine: number;
    type_repas: 'Petit-déjeuner' | 'Déjeuner' | 'Dîner' | 'Collation';
    nom_repas?: string;
    aliments: Array<{
      id_aliment: number;
      nom_aliment: string;
      quantite_g: number;
      calories: number;
      proteines: number;
      glucides: number;
      lipides: number;
    }>;
  }>;
}

export interface GenererProgrammeResponse {
  message: string;
  programme?: any;
}
