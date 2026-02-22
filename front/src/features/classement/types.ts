// Types spécifiques à la feature Classement
export type { Challenge, LeaderboardEntry, LeaderboardData } from '@/types';

// Params pour soumettre un score
export interface SubmitScoreParams {
  id_classement: number;
  score: number;
  url_video_preuve?: string;
}

export interface SubmitScoreResponse {
  message: string;
  participation?: any;
  badges_debloques?: Array<{
    id_badge: number;
    nom_badge: string;
    description: string;
  }>;
}
