// Types spécifiques à la feature Planning
export type { Event } from '@/types';

export interface CreateEventParams {
  titre: string;
  description?: string;
  date_debut: string;
  date_fin?: string;
  type_evenement: 'sport' | 'repas' | 'autre';
  lieu?: string;
}

export interface DeleteEventParams {
  eventId: number;
}
