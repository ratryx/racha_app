begin;

-- =========================================================
-- Central de Partidas
-- Mantém public.matches e public.match_stats intactos.
-- =========================================================

create table if not exists public.futsal_sessions (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id)
    on delete restrict,
  session_date date not null,
  location text,
  notes text,
  status text not null default 'active'
    check (status in ('active', 'completed')),
  created_by uuid references auth.users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  completed_at timestamptz,
  constraint futsal_sessions_location_length
    check (
      location is null
      or char_length(btrim(location)) between 1 and 100
    ),
  constraint futsal_sessions_notes_length
    check (
      notes is null
      or char_length(notes) <= 500
    ),
  constraint futsal_sessions_completed_state
    check (
      (status = 'active' and completed_at is null)
      or
      (status = 'completed' and completed_at is not null)
    )
);

create table if not exists public.futsal_teams (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null
    references public.futsal_sessions(id)
    on delete cascade,
  name text not null,
  color text not null
    check (
      color in (
        'lime',
        'cyan',
        'amber',
        'rose',
        'violet',
        'orange'
      )
    ),
  sort_order smallint not null
    check (sort_order between 1 and 6),
  created_at timestamptz not null default now(),
  constraint futsal_teams_name_length
    check (char_length(btrim(name)) between 2 and 40),
  unique (session_id, name),
  unique (session_id, sort_order),
  unique (id, session_id)
);

create table if not exists public.futsal_session_participants (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null
    references public.futsal_sessions(id)
    on delete cascade,
  team_id uuid not null,
  player_id uuid references public.players(id)
    on delete restrict,
  guest_name text,
  display_name text not null,
  role text not null
    check (
      role in (
        'line',
        'goalkeeper',
        'rotating'
      )
    ),
  position_snapshot public.player_position,
  overall_snapshot smallint
    check (
      overall_snapshot is null
      or overall_snapshot between 0 and 99
    ),
  created_at timestamptz not null default now(),
  constraint futsal_participant_source
    check (
      (
        player_id is not null
        and guest_name is null
      )
      or
      (
        player_id is null
        and guest_name is not null
      )
    ),
  constraint futsal_participant_guest_length
    check (
      guest_name is null
      or char_length(btrim(guest_name)) between 2 and 60
    ),
  constraint futsal_participant_display_length
    check (
      char_length(btrim(display_name)) between 2 and 80
    ),
  foreign key (team_id, session_id)
    references public.futsal_teams(id, session_id)
    on delete cascade
);

create unique index if not exists
  futsal_participants_unique_player
on public.futsal_session_participants(
  session_id,
  player_id
)
where player_id is not null;

create table if not exists public.futsal_games (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null
    references public.futsal_sessions(id)
    on delete cascade,
  sequence smallint not null
    check (sequence between 1 and 999),
  home_team_id uuid not null,
  away_team_id uuid not null,
  home_score smallint not null
    check (home_score between 0 and 2),
  away_score smallint not null
    check (away_score between 0 and 2),
  duration_seconds smallint not null
    check (duration_seconds between 1 and 420),
  ended_by text not null
    check (
      ended_by in (
        'goal_limit',
        'time_limit'
      )
    ),
  created_by uuid references auth.users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  constraint futsal_games_distinct_teams
    check (home_team_id <> away_team_id),
  constraint futsal_games_valid_result
    check (
      (
        ended_by = 'goal_limit'
        and (
          (
            home_score = 2
            and away_score between 0 and 1
          )
          or
          (
            away_score = 2
            and home_score between 0 and 1
          )
        )
      )
      or
      (
        ended_by = 'time_limit'
        and duration_seconds = 420
        and home_score between 0 and 1
        and away_score between 0 and 1
      )
    ),
  foreign key (home_team_id, session_id)
    references public.futsal_teams(id, session_id)
    on delete restrict,
  foreign key (away_team_id, session_id)
    references public.futsal_teams(id, session_id)
    on delete restrict,
  unique (session_id, sequence)
);

create index if not exists
  futsal_sessions_group_date_idx
on public.futsal_sessions(
  group_id,
  session_date desc
);

create index if not exists
  futsal_teams_session_idx
on public.futsal_teams(session_id);

create index if not exists
  futsal_participants_session_idx
on public.futsal_session_participants(session_id);

create index if not exists
  futsal_participants_team_idx
on public.futsal_session_participants(team_id);

create index if not exists
  futsal_games_session_sequence_idx
on public.futsal_games(
  session_id,
  sequence
);

-- =========================================================
-- RLS
-- =========================================================

alter table public.futsal_sessions
  enable row level security;
alter table public.futsal_teams
  enable row level security;
alter table public.futsal_session_participants
  enable row level security;
alter table public.futsal_games
  enable row level security;

drop policy if exists futsal_sessions_select_group
  on public.futsal_sessions;
drop policy if exists futsal_sessions_admin_write
  on public.futsal_sessions;
drop policy if exists futsal_teams_select_group
  on public.futsal_teams;
drop policy if exists futsal_teams_admin_write
  on public.futsal_teams;
drop policy if exists futsal_participants_select_group
  on public.futsal_session_participants;
drop policy if exists futsal_participants_admin_write
  on public.futsal_session_participants;
drop policy if exists futsal_games_select_group
  on public.futsal_games;
drop policy if exists futsal_games_admin_write
  on public.futsal_games;

create policy futsal_sessions_select_group
on public.futsal_sessions
for select
to authenticated
using (
  public.can_access_group(group_id)
);

create policy futsal_sessions_admin_write
on public.futsal_sessions
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy futsal_teams_select_group
on public.futsal_teams
for select
to authenticated
using (
  exists (
    select 1
    from public.futsal_sessions
    where futsal_sessions.id =
      futsal_teams.session_id
      and public.can_access_group(
        futsal_sessions.group_id
      )
  )
);

create policy futsal_teams_admin_write
on public.futsal_teams
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy futsal_participants_select_group
on public.futsal_session_participants
for select
to authenticated
using (
  exists (
    select 1
    from public.futsal_sessions
    where futsal_sessions.id =
      futsal_session_participants.session_id
      and public.can_access_group(
        futsal_sessions.group_id
      )
  )
);

create policy futsal_participants_admin_write
on public.futsal_session_participants
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy futsal_games_select_group
on public.futsal_games
for select
to authenticated
using (
  exists (
    select 1
    from public.futsal_sessions
    where futsal_sessions.id =
      futsal_games.session_id
      and public.can_access_group(
        futsal_sessions.group_id
      )
  )
);

create policy futsal_games_admin_write
on public.futsal_games
for all
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

grant select on public.futsal_sessions
  to authenticated;
grant select on public.futsal_teams
  to authenticated;
grant select on public.futsal_session_participants
  to authenticated;
grant select on public.futsal_games
  to authenticated;

-- =========================================================
-- Criar sessão com times e participantes
-- =========================================================

create or replace function public.create_futsal_session(
  p_group_id uuid,
  p_session_date date,
  p_location text,
  p_notes text,
  p_teams jsonb,
  p_participants jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_session_id uuid;
  team_item jsonb;
  participant_item jsonb;
  new_team_id uuid;
  team_map jsonb := '{}'::jsonb;
  target_team_id uuid;
  target_player public.players%rowtype;
  normalized_guest_name text;
  participant_display_name text;
  participant_position public.player_position;
  participant_overall smallint;
begin
  if not public.is_admin() then
    raise exception 'admin_only'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.groups
    where groups.id = p_group_id
      and groups.is_active
  ) then
    raise exception 'group_not_found'
      using errcode = '22023';
  end if;

  if p_session_date is null then
    raise exception 'session_date_required'
      using errcode = '22023';
  end if;

  if p_teams is null
    or jsonb_typeof(p_teams) <> 'array'
    or jsonb_array_length(p_teams)
      not between 2 and 6
  then
    raise exception 'invalid_teams'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_teams) as team(
      client_id text,
      name text,
      color text,
      sort_order integer
    )
    where nullif(btrim(team.client_id), '') is null
      or nullif(btrim(team.name), '') is null
      or char_length(btrim(team.name))
        not between 2 and 40
      or team.color not in (
        'lime',
        'cyan',
        'amber',
        'rose',
        'violet',
        'orange'
      )
      or team.sort_order not between 1 and 6
  ) then
    raise exception 'invalid_teams'
      using errcode = '22023';
  end if;

  if (
    select count(*)
    from jsonb_to_recordset(p_teams) as team(
      client_id text,
      name text,
      color text,
      sort_order integer
    )
  ) <> (
    select count(distinct team.client_id)
    from jsonb_to_recordset(p_teams) as team(
      client_id text,
      name text,
      color text,
      sort_order integer
    )
  )
  or (
    select count(*)
    from jsonb_to_recordset(p_teams) as team(
      client_id text,
      name text,
      color text,
      sort_order integer
    )
  ) <> (
    select count(distinct lower(btrim(team.name)))
    from jsonb_to_recordset(p_teams) as team(
      client_id text,
      name text,
      color text,
      sort_order integer
    )
  )
  then
    raise exception 'duplicate_teams'
      using errcode = '22023';
  end if;

  if p_participants is null
    or jsonb_typeof(p_participants) <> 'array'
    or jsonb_array_length(p_participants)
      not between 2 and 80
  then
    raise exception 'invalid_participants'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_participants)
      as participant(
        player_id uuid,
        guest_name text,
        team_client_id text,
        role text,
        overall_snapshot integer
      )
    where (
        participant.player_id is null
        and nullif(
          btrim(participant.guest_name),
          ''
        ) is null
      )
      or (
        participant.player_id is not null
        and participant.guest_name is not null
      )
      or participant.role not in (
        'line',
        'goalkeeper',
        'rotating'
      )
      or (
        participant.overall_snapshot is not null
        and participant.overall_snapshot
          not between 0 and 99
      )
      or not exists (
        select 1
        from jsonb_to_recordset(p_teams)
          as team(
            client_id text,
            name text,
            color text,
            sort_order integer
          )
        where team.client_id =
          participant.team_client_id
      )
  ) then
    raise exception 'invalid_participants'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_participants)
      as participant(
        player_id uuid,
        guest_name text,
        team_client_id text,
        role text,
        overall_snapshot integer
      )
    join public.players
      on players.id = participant.player_id
    where players.group_id is distinct from
      p_group_id
  )
  or exists (
    select 1
    from jsonb_to_recordset(p_participants)
      as participant(
        player_id uuid,
        guest_name text,
        team_client_id text,
        role text,
        overall_snapshot integer
      )
    left join public.players
      on players.id = participant.player_id
    where participant.player_id is not null
      and players.id is null
  )
  then
    raise exception 'player_outside_group'
      using errcode = '22023';
  end if;

  if (
    select count(*)
    from jsonb_to_recordset(p_participants)
      as participant(
        player_id uuid,
        guest_name text,
        team_client_id text,
        role text,
        overall_snapshot integer
      )
    where participant.player_id is not null
  ) <> (
    select count(distinct participant.player_id)
    from jsonb_to_recordset(p_participants)
      as participant(
        player_id uuid,
        guest_name text,
        team_client_id text,
        role text,
        overall_snapshot integer
      )
    where participant.player_id is not null
  ) then
    raise exception 'invalid_participants'
      using errcode = '22023';
  end if;

  insert into public.futsal_sessions (
    group_id,
    session_date,
    location,
    notes,
    status,
    created_by
  )
  values (
    p_group_id,
    p_session_date,
    nullif(btrim(coalesce(p_location, '')), ''),
    nullif(btrim(coalesce(p_notes, '')), ''),
    'active',
    (select auth.uid())
  )
  returning id into new_session_id;

  for team_item in
    select value
    from jsonb_array_elements(p_teams)
  loop
    insert into public.futsal_teams (
      session_id,
      name,
      color,
      sort_order
    )
    values (
      new_session_id,
      btrim(team_item ->> 'name'),
      team_item ->> 'color',
      (team_item ->> 'sort_order')::smallint
    )
    returning id into new_team_id;

    team_map := team_map ||
      jsonb_build_object(
        team_item ->> 'client_id',
        new_team_id::text
      );
  end loop;

  for participant_item in
    select value
    from jsonb_array_elements(p_participants)
  loop
    target_team_id := (
      team_map ->>
        (participant_item ->>
          'team_client_id')
    )::uuid;

    if target_team_id is null then
      raise exception 'invalid_team_assignment'
        using errcode = '22023';
    end if;

    if nullif(
      participant_item ->> 'player_id',
      ''
    ) is not null then
      select players.*
      into target_player
      from public.players
      where players.id = (
        participant_item ->>
          'player_id'
      )::uuid;

      participant_display_name :=
        coalesce(
          nullif(
            btrim(target_player.nickname),
            ''
          ),
          target_player.name
        );
      participant_position :=
        target_player.position;
      participant_overall :=
        nullif(
          participant_item ->>
            'overall_snapshot',
          ''
        )::smallint;

      insert into public.futsal_session_participants (
        session_id,
        team_id,
        player_id,
        guest_name,
        display_name,
        role,
        position_snapshot,
        overall_snapshot
      )
      values (
        new_session_id,
        target_team_id,
        target_player.id,
        null,
        participant_display_name,
        participant_item ->> 'role',
        participant_position,
        participant_overall
      );
    else
      normalized_guest_name :=
        btrim(
          participant_item ->>
            'guest_name'
        );

      insert into public.futsal_session_participants (
        session_id,
        team_id,
        player_id,
        guest_name,
        display_name,
        role,
        position_snapshot,
        overall_snapshot
      )
      values (
        new_session_id,
        target_team_id,
        null,
        normalized_guest_name,
        normalized_guest_name,
        participant_item ->> 'role',
        case
          when participant_item ->> 'role' =
            'goalkeeper'
          then 'GOL'::public.player_position
          else null
        end,
        null
      );
    end if;
  end loop;

  if exists (
    select 1
    from public.futsal_teams
    where futsal_teams.session_id =
      new_session_id
      and not exists (
        select 1
        from public.futsal_session_participants
        where futsal_session_participants.team_id =
          futsal_teams.id
      )
  ) then
    raise exception 'empty_team'
      using errcode = '22023';
  end if;

  return new_session_id;
end;
$$;

-- =========================================================
-- Registrar e corrigir placares
-- =========================================================

create or replace function public.add_futsal_game(
  p_session_id uuid,
  p_home_team_id uuid,
  p_away_team_id uuid,
  p_home_score integer,
  p_away_score integer,
  p_duration_seconds integer,
  p_ended_by text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  session_status text;
  next_sequence integer;
  new_game_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_only'
      using errcode = '42501';
  end if;

  select futsal_sessions.status
  into session_status
  from public.futsal_sessions
  where futsal_sessions.id = p_session_id
  for update;

  if session_status is null then
    raise exception 'session_not_found'
      using errcode = '22023';
  end if;

  if session_status <> 'active' then
    raise exception 'session_not_active'
      using errcode = '22023';
  end if;

  if p_home_team_id = p_away_team_id
    or not exists (
      select 1
      from public.futsal_teams
      where futsal_teams.id =
        p_home_team_id
        and futsal_teams.session_id =
          p_session_id
    )
    or not exists (
      select 1
      from public.futsal_teams
      where futsal_teams.id =
        p_away_team_id
        and futsal_teams.session_id =
          p_session_id
    )
  then
    raise exception 'invalid_game_teams'
      using errcode = '22023';
  end if;

  if p_ended_by = 'goal_limit' then
    if not (
      (
        p_home_score = 2
        and p_away_score between 0 and 1
      )
      or
      (
        p_away_score = 2
        and p_home_score between 0 and 1
      )
    )
    or p_duration_seconds not between 1 and 420
    then
      raise exception 'invalid_goal_limit_score'
        using errcode = '22023';
    end if;
  elsif p_ended_by = 'time_limit' then
    if p_duration_seconds <> 420
      or p_home_score not between 0 and 1
      or p_away_score not between 0 and 1
    then
      raise exception 'invalid_time_limit_score'
        using errcode = '22023';
    end if;
  else
    raise exception 'invalid_game_result'
      using errcode = '22023';
  end if;

  select coalesce(
    max(futsal_games.sequence),
    0
  ) + 1
  into next_sequence
  from public.futsal_games
  where futsal_games.session_id =
    p_session_id;

  insert into public.futsal_games (
    session_id,
    sequence,
    home_team_id,
    away_team_id,
    home_score,
    away_score,
    duration_seconds,
    ended_by,
    created_by
  )
  values (
    p_session_id,
    next_sequence,
    p_home_team_id,
    p_away_team_id,
    p_home_score,
    p_away_score,
    p_duration_seconds,
    p_ended_by,
    (select auth.uid())
  )
  returning id into new_game_id;

  update public.futsal_sessions
  set updated_at = now()
  where futsal_sessions.id =
    p_session_id;

  return new_game_id;
end;
$$;

create or replace function public.delete_futsal_game(
  p_game_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_session_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_only'
      using errcode = '42501';
  end if;

  select futsal_games.session_id
  into target_session_id
  from public.futsal_games
  join public.futsal_sessions
    on futsal_sessions.id =
      futsal_games.session_id
  where futsal_games.id = p_game_id
    and futsal_sessions.status = 'active';

  if target_session_id is null then
    raise exception 'session_not_active'
      using errcode = '22023';
  end if;

  delete from public.futsal_games
  where futsal_games.id = p_game_id;

  update public.futsal_sessions
  set updated_at = now()
  where futsal_sessions.id =
    target_session_id;
end;
$$;

create or replace function public.complete_futsal_session(
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.futsal_games
    where futsal_games.session_id =
      p_session_id
  ) then
    raise exception 'session_without_games'
      using errcode = '22023';
  end if;

  update public.futsal_sessions
  set
    status = 'completed',
    completed_at = now(),
    updated_at = now()
  where futsal_sessions.id =
    p_session_id
    and futsal_sessions.status =
      'active';

  if not found then
    raise exception 'session_not_active'
      using errcode = '22023';
  end if;
end;
$$;

create or replace function public.reopen_futsal_session(
  p_session_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'admin_only'
      using errcode = '42501';
  end if;

  update public.futsal_sessions
  set
    status = 'active',
    completed_at = null,
    updated_at = now()
  where futsal_sessions.id =
    p_session_id
    and futsal_sessions.status =
      'completed';

  if not found then
    raise exception 'session_not_completed'
      using errcode = '22023';
  end if;
end;
$$;

revoke all on function public.create_futsal_session(
  uuid,
  date,
  text,
  text,
  jsonb,
  jsonb
) from public;

revoke all on function public.add_futsal_game(
  uuid,
  uuid,
  uuid,
  integer,
  integer,
  integer,
  text
) from public;

revoke all on function public.delete_futsal_game(
  uuid
) from public;

revoke all on function public.complete_futsal_session(
  uuid
) from public;

revoke all on function public.reopen_futsal_session(
  uuid
) from public;

grant execute on function public.create_futsal_session(
  uuid,
  date,
  text,
  text,
  jsonb,
  jsonb
) to authenticated;

grant execute on function public.add_futsal_game(
  uuid,
  uuid,
  uuid,
  integer,
  integer,
  integer,
  text
) to authenticated;

grant execute on function public.delete_futsal_game(
  uuid
) to authenticated;

grant execute on function public.complete_futsal_session(
  uuid
) to authenticated;

grant execute on function public.reopen_futsal_session(
  uuid
) to authenticated;

commit;
