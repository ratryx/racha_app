import { calculatePlayerCard } from '../calculateOverall';
import { createClient } from './client';
import type {
  Player,
  PlayerAggregates,
  PlayerPosition,
  PlayerWithCard,
  Profile,
} from '@/types';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error('Você precisa entrar para continuar.');
  }

  return user;
}

function emptyAggregates(playerId: string): PlayerAggregates {
  return {
    player_id: playerId,
    matches_played: 0,
    total_goals: 0,
    total_assists: 0,
    total_tackles: 0,
    total_saves: 0,
    total_motm: 0,
    avg_rating: 0,
  };
}

async function uploadPlayerPhoto(file: File, userId: string): Promise<string> {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    throw new Error('Use uma imagem JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('A foto pode ter no máximo 5 MB.');
  }

  const supabase = createClient();
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;

  const { data, error } = await supabase.storage
    .from('player-photos')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });

  if (error) {
    throw error;
  }

  return supabase.storage.from('player-photos').getPublicUrl(data.path).data.publicUrl;
}

export async function getMyProfile(): Promise<Profile | null> {
  const user = await requireUser();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Profile | null;
}

export async function getMyPlayer(): Promise<Player | null> {
  const user = await requireUser();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as Player | null;
}

export async function getPlayersWithCards(): Promise<PlayerWithCard[]> {
  const supabase = createClient();

  const { data: players, error: playersError } = await supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: true });

  if (playersError) {
    throw playersError;
  }

  const { data: aggregates, error: aggregatesError } = await supabase
    .from('player_aggregates')
    .select('*');

  if (aggregatesError) {
    throw aggregatesError;
  }

  const aggregateList = (aggregates ?? []) as PlayerAggregates[];

  return ((players ?? []) as Player[]).map((player) => {
    const playerAggregates =
      aggregateList.find((item) => item.player_id === player.id) ??
      emptyAggregates(player.id);

    return {
      ...player,
      aggregates: playerAggregates,
      card: calculatePlayerCard(playerAggregates, player.position),
    };
  });
}

export async function createPlayer(input: {
  name: string;
  nickname?: string;
  position: PlayerPosition;
  photoFile?: File;
}): Promise<Player> {
  const user = await requireUser();
  const supabase = createClient();

  const normalizedName = input.name.trim();
  const normalizedNickname = input.nickname?.trim() || null;

  if (!normalizedName) {
    throw new Error('Informe seu nome.');
  }

  const photoUrl = input.photoFile
    ? await uploadPlayerPhoto(input.photoFile, user.id)
    : null;

  const { data, error } = await supabase
    .from('players')
    .insert({
      user_id: user.id,
      name: normalizedName,
      nickname: normalizedNickname,
      position: input.position,
      photo_url: photoUrl,
    })
    .select('*')
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('Esta conta já possui um card.');
    }

    throw error;
  }

  return data as Player;
}

export async function updateMyPlayer(input: {
  name: string;
  nickname?: string | null;
  currentPhotoUrl: string | null;
  photoFile?: File;
}): Promise<Player> {
  const user = await requireUser();
  const supabase = createClient();

  const normalizedName = input.name.trim();

  if (!normalizedName) {
    throw new Error('Informe seu nome.');
  }

  const photoUrl = input.photoFile
    ? await uploadPlayerPhoto(input.photoFile, user.id)
    : input.currentPhotoUrl;

  const { data, error } = await supabase
    .rpc('update_my_player', {
      p_name: normalizedName,
      p_nickname: input.nickname?.trim() || null,
      p_photo_url: photoUrl,
    })
    .single();

  if (error) {
    throw error;
  }

  return data as Player;
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
): Promise<string> {
  const supabase = createClient();

  const { data, error } = await supabase.rpc('create_match_with_stats', {
    p_match_date: matchDate,
    p_stats: stats,
  });

  if (error) {
    if (error.message.includes('admin_only')) {
      throw new Error('Somente o administrador pode lançar o pós-jogo.');
    }

    throw error;
  }

  return data as string;
}
