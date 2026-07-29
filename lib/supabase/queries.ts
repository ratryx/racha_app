import { createClient } from './client';
import { calculatePlayerCard } from '../calculateOverall';
import { Player, PlayerAggregates, PlayerWithCard } from '@/types';

export async function getPlayersWithCards(): Promise<PlayerWithCard[]> {
  const supabase = createClient();

  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*');

  if (playersError) throw playersError;

  const { data: aggregates, error: aggError } = await supabase
    .from('player_aggregates')
    .select('*');

  if (aggError) throw aggError;

  return (players as Player[]).map((player) => {
    const agg =
      (aggregates as PlayerAggregates[]).find((a) => a.player_id === player.id) ??
      {
        player_id: player.id,
        matches_played: 0,
        total_goals: 0,
        total_assists: 0,
        total_tackles: 0,
        total_saves: 0,
        total_motm: 0,
        avg_rating: 0,
      };

    return {
      ...player,
      aggregates: agg,
      card: calculatePlayerCard(agg, player.position),
    };
  });
}

export async function createPlayer(input: {
  name: string;
  nickname?: string;
  position: Player['position'];
  photoFile?: File;
}) {
  const supabase = createClient();
  let photo_url: string | null = null;

  if (input.photoFile) {
    const fileName = `${crypto.randomUUID()}-${input.photoFile.name}`;
    const { data, error } = await supabase.storage
      .from('player-photos')
      .upload(fileName, input.photoFile);

    if (error) throw error;

    photo_url = supabase.storage.from('player-photos').getPublicUrl(data.path)
      .data.publicUrl;
  }

  const { error } = await supabase.from('players').insert({
    name: input.name,
    nickname: input.nickname ?? null,
    position: input.position,
    photo_url,
  });

  if (error) throw error;
}

export async function createMatchWithStats(
  matchDate: string,
  stats: Array<{
    player_id: string;
    goals: number;
    assists: number;
    tackles: number;
    saves: number;
    is_motm: boolean;
  }>
) {
  const supabase = createClient();

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .insert({ match_date: matchDate })
    .select()
    .single();

  if (matchError) throw matchError;

  const rows = stats.map((s) => ({ ...s, match_id: match.id }));

  const { error: statsError } = await supabase.from('match_stats').insert(rows);
  if (statsError) throw statsError;

  return match;
}
