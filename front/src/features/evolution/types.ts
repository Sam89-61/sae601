// Types spécifiques à la feature Evolution
export type {
  EvolutionStats,
  PoidsEntry,
  RecordEntry,
  ExoProgression,
  Exercice,
} from '@/types';

// Import des types nécessaires pour les réponses
import type { PoidsEntry, RecordEntry } from '@/types';

// Params pour ajouter un poids
export interface AddPoidsParams {
  poids: number;
}

export interface AddPoidsResponse {
  message: string;
  poids?: PoidsEntry;
}

// Params pour ajouter un record
export interface AddRecordParams {
  id_exo: number;
  score: number;
  type_record: 'Max Reps' | '1RM' | 'Temps' | 'Distance';
}

export interface AddRecordResponse {
  message: string;
  record?: RecordEntry;
  badges_debloques?: Array<{
    id_badge: number;
    nom_badge: string;
    description: string;
  }>;
}

export interface DeleteRecordResponse {
  message: string;
}
