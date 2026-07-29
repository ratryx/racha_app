export type FutsalSessionStatus = 'active' | 'completed';
export type FutsalParticipantRole = 'line' | 'goalkeeper' | 'rotating';
export type FutsalGameEndReason = 'goal_limit' | 'time_limit';
export type FutsalTeamColor = 'lime' | 'cyan' | 'amber' | 'rose' | 'violet' | 'orange';

export interface FutsalSession {
  id: string;
  group_id: string;
  session_date: string;
  location: string | null;
  notes: string | null;
  status: FutsalSessionStatus;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface FutsalTeam {
  id: string;
  session_id: string;
  name: string;
  color: FutsalTeamColor;
  sort_order: number;
  created_at: string;
}

export interface FutsalParticipant {
  id: string;
  session_id: string;
  team_id: string;
  player_id: string | null;
  guest_name: string | null;
  display_name: string;
  role: FutsalParticipantRole;
  position_snapshot: string | null;
  overall_snapshot: number | null;
  created_at: string;
}

export interface FutsalGame {
  id: string;
  session_id: string;
  sequence: number;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  duration_seconds: number;
  ended_by: FutsalGameEndReason;
  created_by: string | null;
  created_at: string;
}

export type FutsalTeamWithParticipants = FutsalTeam & {
  participants: FutsalParticipant[];
};

export type FutsalSessionDetails = FutsalSession & {
  teams: FutsalTeamWithParticipants[];
  games: FutsalGame[];
};

export interface FutsalTeamStanding {
  team_id: string;
  team_name: string;
  color: FutsalTeamColor;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export interface CreateFutsalTeamInput {
  client_id: string;
  name: string;
  color: FutsalTeamColor;
  sort_order: number;
}

export interface CreateFutsalParticipantInput {
  player_id: string | null;
  guest_name: string | null;
  team_client_id: string;
  role: FutsalParticipantRole;
  overall_snapshot: number | null;
}

export interface CreateFutsalSessionInput {
  groupId: string;
  sessionDate: string;
  location: string;
  notes: string;
  teams: CreateFutsalTeamInput[];
  participants: CreateFutsalParticipantInput[];
}

export interface AddFutsalGameInput {
  sessionId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  durationSeconds: number;
  endedBy: FutsalGameEndReason;
}
