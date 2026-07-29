import { createClient } from './client';

import type {
  AddFutsalGameInput,
  CreateFutsalSessionInput,
  FutsalGame,
  FutsalParticipant,
  FutsalSession,
  FutsalSessionDetails,
  FutsalTeam,
  FutsalTeamWithParticipants,
} from '@/types';

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error('Você precisa entrar para continuar.');

  return user;
}

export async function getFutsalSessions(
  groupId: string,
  limit = 20
): Promise<FutsalSessionDetails[]> {
  await requireUser();
  const supabase = createClient();

  const { data: sessionRows, error: sessionsError } = await supabase
    .from('futsal_sessions')
    .select('*')
    .eq('group_id', groupId)
    .order('session_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (sessionsError) throw sessionsError;

  const sessions = (sessionRows ?? []) as FutsalSession[];
  if (!sessions.length) return [];

  const sessionIds = sessions.map((session) => session.id);

  const [teamsResult, participantsResult, gamesResult] = await Promise.all([
    supabase
      .from('futsal_teams')
      .select('*')
      .in('session_id', sessionIds)
      .order('sort_order', { ascending: true }),
    supabase
      .from('futsal_session_participants')
      .select('*')
      .in('session_id', sessionIds)
      .order('created_at', { ascending: true }),
    supabase
      .from('futsal_games')
      .select('*')
      .in('session_id', sessionIds)
      .order('sequence', { ascending: true }),
  ]);

  if (teamsResult.error) throw teamsResult.error;
  if (participantsResult.error) throw participantsResult.error;
  if (gamesResult.error) throw gamesResult.error;

  const teams = (teamsResult.data ?? []) as FutsalTeam[];
  const participants = (participantsResult.data ?? []) as FutsalParticipant[];
  const games = (gamesResult.data ?? []) as FutsalGame[];

  const participantsByTeam = new Map<string, FutsalParticipant[]>();
  for (const participant of participants) {
    const current = participantsByTeam.get(participant.team_id) ?? [];
    current.push(participant);
    participantsByTeam.set(participant.team_id, current);
  }

  const teamsBySession = new Map<string, FutsalTeamWithParticipants[]>();
  for (const team of teams) {
    const current = teamsBySession.get(team.session_id) ?? [];
    current.push({
      ...team,
      participants: participantsByTeam.get(team.id) ?? [],
    });
    teamsBySession.set(team.session_id, current);
  }

  const gamesBySession = new Map<string, FutsalGame[]>();
  for (const game of games) {
    const current = gamesBySession.get(game.session_id) ?? [];
    current.push(game);
    gamesBySession.set(game.session_id, current);
  }

  return sessions.map((session) => ({
    ...session,
    teams: teamsBySession.get(session.id) ?? [],
    games: gamesBySession.get(session.id) ?? [],
  }));
}

export async function createFutsalSession(
  input: CreateFutsalSessionInput
): Promise<string> {
  await requireUser();
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_futsal_session', {
    p_group_id: input.groupId,
    p_session_date: input.sessionDate,
    p_location: input.location.trim() || null,
    p_notes: input.notes.trim() || null,
    p_teams: input.teams,
    p_participants: input.participants,
  });

  if (error) throw mapMatchCenterError(error);
  return data as string;
}

export async function addFutsalGame(
  input: AddFutsalGameInput
): Promise<string> {
  await requireUser();
  const supabase = createClient();

  const { data, error } = await supabase.rpc('add_futsal_game', {
    p_session_id: input.sessionId,
    p_home_team_id: input.homeTeamId,
    p_away_team_id: input.awayTeamId,
    p_home_score: input.homeScore,
    p_away_score: input.awayScore,
    p_duration_seconds: input.durationSeconds,
    p_ended_by: input.endedBy,
  });

  if (error) throw mapMatchCenterError(error);
  return data as string;
}

export async function deleteFutsalGame(gameId: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { error } = await supabase.rpc('delete_futsal_game', {
    p_game_id: gameId,
  });

  if (error) throw mapMatchCenterError(error);
}

export async function completeFutsalSession(sessionId: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { error } = await supabase.rpc('complete_futsal_session', {
    p_session_id: sessionId,
  });

  if (error) throw mapMatchCenterError(error);
}

export async function reopenFutsalSession(sessionId: string): Promise<void> {
  await requireUser();
  const supabase = createClient();
  const { error } = await supabase.rpc('reopen_futsal_session', {
    p_session_id: sessionId,
  });

  if (error) throw mapMatchCenterError(error);
}

function mapMatchCenterError(error: { message: string }): Error {
  const message = error.message;
  const knownErrors: Array<[string, string]> = [
    ['admin_only', 'Somente o administrador pode alterar a Central de Partidas.'],
    ['group_not_found', 'O grupo selecionado não foi encontrado.'],
    ['invalid_teams', 'Crie entre dois e seis times válidos.'],
    ['duplicate_teams', 'Os times precisam ter nomes diferentes.'],
    ['invalid_participants', 'Selecione participantes válidos.'],
    ['player_outside_group', 'Todos os jogadores precisam pertencer ao grupo selecionado.'],
    ['invalid_team_assignment', 'Todos os participantes precisam estar em um time.'],
    ['empty_team', 'Cada time precisa ter pelo menos um participante.'],
    ['session_not_active', 'Esta sessão já foi finalizada.'],
    ['invalid_game_teams', 'Escolha dois times diferentes da mesma sessão.'],
    ['invalid_goal_limit_score', 'Partida por limite precisa terminar em 2–0 ou 2–1.'],
    ['invalid_time_limit_score', 'Partida por tempo pode terminar em 0–0, 1–0 ou 1–1.'],
    ['session_without_games', 'Registre pelo menos uma partida antes de finalizar o racha.'],
  ];

  const knownError = knownErrors.find(([code]) => message.includes(code));
  return new Error(knownError?.[1] || 'Não foi possível concluir a operação.');
}
