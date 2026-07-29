export type PlayerPosition = 'GOL' | 'ZAG' | 'LAT' | 'MEI' | 'ATA';
export type UserRole = 'user' | 'admin';

export interface Profile {
  id: string;
  phone: string | null;
  display_name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Player {
  id: string;
  user_id: string | null;
  name: string;
  nickname: string | null;
  photo_url: string | null;
  position: PlayerPosition;
  foot: 'destro' | 'canhoto' | 'ambidestro' | null;
  height_cm: number | null;
  created_at: string;
}

export interface Match {
  id: string;
  match_date: string;
  location: string | null;
  notes: string | null;
  created_at: string;
}

export interface MatchStat {
  id: string;
  match_id: string;
  player_id: string;
  goals: number;
  assists: number;
  tackles: number;
  saves: number;
  fouls: number;
  yellow_cards: number;
  red_cards: number;
  is_motm: boolean;
  rating: number | null;
}

export interface PlayerAggregates {
  player_id: string;
  matches_played: number;
  total_goals: number;
  total_assists: number;
  total_tackles: number;
  total_saves: number;
  total_motm: number;
  avg_rating: number;
}

export interface CardAttributes {
  overall: number;
  ata: number;
  def: number;
  fis: number;
  hab: number;
}

export type PlayerWithCard = Player & {
  aggregates: PlayerAggregates;
  card: CardAttributes;
};
