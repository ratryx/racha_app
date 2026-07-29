import { calculatePlayerCard } from '../calculateOverall';
import { createClient } from './client';
import type {
  AdminUserOverview,
  Group,
  GroupMembership,
  Player,
  PlayerAggregates,
  PlayerMatchHistory,
  PlayerPosition,
  PlayerWithCard,
  Profile,
} from '@/types';

const MAX_PHOTO_SIZE = 5 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
]);

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

function normalizeGroupRelation(
  relation: Group | Group[] | null
): Group | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation;
}

function createGroupSlug(name: string): string {
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 42);

  const base = normalized || 'grupo';
  return `${base}-${crypto.randomUUID().slice(0, 6)}`;
}

async function uploadPlayerPhoto(
  file: File,
  userId: string
): Promise<string> {
  if (!ALLOWED_PHOTO_TYPES.has(file.type)) {
    throw new Error('Use uma imagem JPG, PNG ou WEBP.');
  }

  if (file.size > MAX_PHOTO_SIZE) {
    throw new Error('A foto pode ter no máximo 5 MB.');
  }

  const supabase = createClient();
  const extension =
    file.name.split('.').pop()?.toLowerCase() || 'jpg';
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

  return supabase.storage
    .from('player-photos')
    .getPublicUrl(data.path).data.publicUrl;
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

export async function getMyGroupMembership():
  Promise<GroupMembership | null> {
  const user = await requireUser();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('group_members')
    .select(
      `
        id,
        group_id,
        user_id,
        created_at,
        groups (
          id,
          name,
          slug,
          is_active,
          created_by,
          created_at,
          updated_at
        )
      `
    )
    .eq('user_id', user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const rawMembership = data as unknown as {
    id: string;
    group_id: string;
    user_id: string;
    created_at: string;
    groups: Group | Group[] | null;
  };

  return {
    id: rawMembership.id,
    group_id: rawMembership.group_id,
    user_id: rawMembership.user_id,
    created_at: rawMembership.created_at,
    group: normalizeGroupRelation(rawMembership.groups),
  };
}

export async function getGroups(): Promise<Group[]> {
  await requireUser();
  const supabase = createClient();

  const { data, error } = await supabase
    .from('groups')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as Group[];
}


export async function getAdminUsers():
  Promise<AdminUserOverview[]> {
  await requireUser();
  const supabase = createClient();

  const [
    profilesResult,
    membershipsResult,
    playersResult,
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'id, phone, display_name, role, created_at'
      )
      .order('created_at', { ascending: true }),
    supabase
      .from('group_members')
      .select(
        `
          user_id,
          group_id,
          groups (
            name
          )
        `
      ),
    supabase
      .from('players')
      .select(
        'id, user_id, name, nickname'
      ),
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }

  if (membershipsResult.error) {
    throw membershipsResult.error;
  }

  if (playersResult.error) {
    throw playersResult.error;
  }

  const membershipsByUser = new Map<
    string,
    {
      group_id: string;
      group_name: string | null;
    }
  >();

  for (const rawMembership of
    membershipsResult.data ?? []) {
    const membership =
      rawMembership as unknown as {
        user_id: string;
        group_id: string;
        groups:
          | { name: string }
          | Array<{ name: string }>
          | null;
      };

    const groupRelation = Array.isArray(
      membership.groups
    )
      ? membership.groups[0] ?? null
      : membership.groups;

    membershipsByUser.set(
      membership.user_id,
      {
        group_id: membership.group_id,
        group_name: groupRelation?.name ?? null,
      }
    );
  }

  const playersByUser = new Map<
    string,
    {
      id: string;
      name: string;
      nickname: string | null;
    }
  >();

  for (const rawPlayer of playersResult.data ?? []) {
    const player = rawPlayer as {
      id: string;
      user_id: string | null;
      name: string;
      nickname: string | null;
    };

    if (!player.user_id) {
      continue;
    }

    playersByUser.set(player.user_id, {
      id: player.id,
      name: player.name,
      nickname: player.nickname,
    });
  }

  return (profilesResult.data ?? []).map(
    (rawProfile) => {
      const profile = rawProfile as {
        id: string;
        phone: string | null;
        display_name: string | null;
        role: 'user' | 'admin';
        created_at: string;
      };

      const membership =
        membershipsByUser.get(profile.id);
      const player =
        playersByUser.get(profile.id);

      return {
        id: profile.id,
        phone: profile.phone,
        display_name: profile.display_name,
        role: profile.role,
        created_at: profile.created_at,
        group_id: membership?.group_id ?? null,
        group_name:
          membership?.group_name ?? null,
        player_id: player?.id ?? null,
        player_name: player?.name ?? null,
        player_nickname:
          player?.nickname ?? null,
      };
    }
  );
}

export async function createGroup(name: string): Promise<Group> {
  const user = await requireUser();
  const supabase = createClient();
  const normalizedName = name.trim();

  if (normalizedName.length < 2 || normalizedName.length > 60) {
    throw new Error(
      'O nome do grupo precisa ter entre 2 e 60 caracteres.'
    );
  }

  const { data, error } = await supabase
    .from('groups')
    .insert({
      name: normalizedName,
      slug: createGroupSlug(normalizedName),
      created_by: user.id,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Group;
}


export async function renameGroup(
  groupId: string,
  name: string
): Promise<Group> {
  await requireUser();
  const supabase = createClient();
  const normalizedName = name.trim();

  if (
    normalizedName.length < 2 ||
    normalizedName.length > 60
  ) {
    throw new Error(
      'O nome do grupo precisa ter entre 2 e 60 caracteres.'
    );
  }

  const { data, error } = await supabase
    .from('groups')
    .update({
      name: normalizedName,
      updated_at: new Date().toISOString(),
    })
    .eq('id', groupId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data as Group;
}

export async function assignUserToGroup(
  userId: string,
  groupId: string
): Promise<void> {
  const user = await requireUser();
  const supabase = createClient();

  const { error } = await supabase
    .from('group_members')
    .upsert(
      {
        user_id: userId,
        group_id: groupId,
        added_by: user.id,
      },
      {
        onConflict: 'user_id',
      }
    );

  if (error) {
    throw error;
  }
}

export async function removeUserFromGroup(
  userId: string
): Promise<void> {
  await requireUser();
  const supabase = createClient();

  const { error } = await supabase
    .from('group_members')
    .delete()
    .eq('user_id', userId);

  if (error) {
    throw error;
  }
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

export async function getPlayersWithCards(
  groupId?: string | null
): Promise<PlayerWithCard[]> {
  const supabase = createClient();

  let playersQuery = supabase
    .from('players')
    .select('*')
    .order('created_at', { ascending: true });

  if (groupId === null) {
    playersQuery = playersQuery.is('group_id', null);
  } else if (groupId) {
    playersQuery = playersQuery.eq('group_id', groupId);
  }

  const {
    data: players,
    error: playersError,
  } = await playersQuery;

  if (playersError) {
    throw playersError;
  }

  const playerList = (players ?? []) as Player[];

  if (!playerList.length) {
    return [];
  }

  const playerIds = playerList.map((player) => player.id);

  const {
    data: aggregates,
    error: aggregatesError,
  } = await supabase
    .from('player_aggregates')
    .select('*')
    .in('player_id', playerIds);

  if (aggregatesError) {
    throw aggregatesError;
  }

  const aggregateList =
    (aggregates ?? []) as PlayerAggregates[];

  const aggregatesByPlayer = new Map(
    aggregateList.map((item) => [item.player_id, item])
  );

  return playerList.map((player) => {
    const playerAggregates =
      aggregatesByPlayer.get(player.id) ??
      emptyAggregates(player.id);

    return {
      ...player,
      aggregates: playerAggregates,
      card: calculatePlayerCard(
        playerAggregates,
        player.position
      ),
    };
  });
}

export async function getPlayerMatchHistory(
  playerId: string,
  limit = 12
): Promise<PlayerMatchHistory[]> {
  await requireUser();
  const supabase = createClient();

  const {
    data: stats,
    error: statsError,
  } = await supabase
    .from('match_stats')
    .select(
      'id, match_id, goals, assists, tackles, saves, is_motm, rating'
    )
    .eq('player_id', playerId);

  if (statsError) {
    throw statsError;
  }

  if (!stats?.length) {
    return [];
  }

  const statsByMatch = new Map(
    stats.map((stat) => [stat.match_id as string, stat])
  );

  const {
    data: matches,
    error: matchesError,
  } = await supabase
    .from('matches')
    .select('id, match_date, location, notes')
    .in(
      'id',
      stats.map((stat) => stat.match_id)
    )
    .order('match_date', { ascending: false })
    .limit(limit);

  if (matchesError) {
    throw matchesError;
  }

  return (matches ?? []).flatMap((match) => {
    const stat = statsByMatch.get(match.id as string);

    if (!stat) {
      return [];
    }

    return [
      {
        id: stat.id as string,
        match_id: match.id as string,
        match_date: match.match_date as string,
        location:
          (match.location as string | null) ?? null,
        notes: (match.notes as string | null) ?? null,
        goals: Number(stat.goals ?? 0),
        assists: Number(stat.assists ?? 0),
        tackles: Number(stat.tackles ?? 0),
        saves: Number(stat.saves ?? 0),
        is_motm: Boolean(stat.is_motm),
        rating:
          stat.rating === null
            ? null
            : Number(stat.rating),
      },
    ];
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
  const normalizedNickname =
    input.nickname?.trim() || null;

  if (!normalizedName) {
    throw new Error('Informe seu nome.');
  }

  const {
    data: existingPlayer,
    error: existingPlayerError,
  } = await supabase
    .from('players')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (existingPlayerError) {
    throw existingPlayerError;
  }

  if (existingPlayer) {
    throw new Error(
      'Esta conta já possui um card. Use Editar meu card.'
    );
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
      throw new Error(
        'Esta conta já possui um card. Use Editar meu card.'
      );
    }

    throw error;
  }

  return data as Player;
}

export async function updateMyPlayer(input: {
  name: string;
  nickname?: string | null;
  position: PlayerPosition;
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
      p_nickname:
        input.nickname?.trim() || null,
      p_photo_url: photoUrl,
      p_position: input.position,
    })
    .single();

  if (error) {
    if (error.message.includes('player_not_found')) {
      throw new Error(
        'Nenhum card foi encontrado para esta conta.'
      );
    }

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

  const { data, error } = await supabase.rpc(
    'create_match_with_stats',
    {
      p_match_date: matchDate,
      p_stats: stats,
    }
  );

  if (error) {
    if (error.message.includes('admin_only')) {
      throw new Error(
        'Somente o administrador pode lançar o pós-jogo.'
      );
    }

    if (error.message.includes('players_without_group')) {
      throw new Error(
        'Todos os participantes precisam estar em um grupo.'
      );
    }

    if (error.message.includes('mixed_groups')) {
      throw new Error(
        'A partida só pode conter jogadores do mesmo grupo.'
      );
    }

    throw error;
  }

  return data as string;
}
