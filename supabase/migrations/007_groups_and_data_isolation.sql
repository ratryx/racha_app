begin;

-- =========================================================
-- Grupos
-- =========================================================

create table if not exists public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  created_by uuid references auth.users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint groups_name_length_check
    check (char_length(btrim(name)) between 2 and 60),
  constraint groups_slug_length_check
    check (char_length(slug) between 2 and 64)
);

create table if not exists public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups(id)
    on delete cascade,
  user_id uuid not null references auth.users(id)
    on delete cascade,
  added_by uuid references auth.users(id)
    on delete set null,
  created_at timestamptz not null default now(),
  unique (user_id)
);

alter table public.players
  add column if not exists group_id uuid
  references public.groups(id)
  on delete set null;

alter table public.matches
  add column if not exists group_id uuid
  references public.groups(id)
  on delete restrict;

create index if not exists group_members_group_id_idx
  on public.group_members(group_id);

create index if not exists players_group_id_idx
  on public.players(group_id);

create index if not exists matches_group_id_match_date_idx
  on public.matches(group_id, match_date desc);

-- =========================================================
-- Migração dos dados atuais
-- =========================================================

do $$
declare
  default_group_id uuid;
  admin_user_id uuid;
begin
  select profiles.id
  into admin_user_id
  from public.profiles
  where profiles.role = 'admin'
  order by profiles.created_at asc
  limit 1;

  insert into public.groups (
    name,
    slug,
    created_by
  )
  values (
    'Racha dos Amigos',
    'racha-dos-amigos',
    admin_user_id
  )
  on conflict (slug)
  do update set
    name = excluded.name
  returning id into default_group_id;

  insert into public.group_members (
    group_id,
    user_id,
    added_by
  )
  select
    default_group_id,
    profiles.id,
    admin_user_id
  from public.profiles
  on conflict (user_id)
  do nothing;

  update public.players
  set group_id = default_group_id
  where group_id is null;

  update public.matches
  set group_id = default_group_id
  where group_id is null;
end
$$;

alter table public.matches
  alter column group_id set not null;

-- =========================================================
-- Funções auxiliares
-- =========================================================

create or replace function public.current_group_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select group_members.group_id
  from public.group_members
  where group_members.user_id = (select auth.uid())
  limit 1;
$$;

create or replace function public.group_for_user(
  target_user_id uuid
)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select group_members.group_id
  from public.group_members
  where group_members.user_id = target_user_id
  limit 1;
$$;

create or replace function public.can_access_group(
  target_group_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.is_admin()
    or (
      target_group_id is not null
      and target_group_id = public.current_group_id()
    );
$$;

revoke all on function public.current_group_id()
  from public;

revoke all on function public.group_for_user(uuid)
  from public;

revoke all on function public.can_access_group(uuid)
  from public;

grant execute on function public.current_group_id()
  to authenticated;

grant execute on function public.can_access_group(uuid)
  to authenticated;

-- O grupo do card sempre acompanha o cadastro em group_members.
create or replace function public.sync_player_group()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.user_id is not null then
    new.group_id := public.group_for_user(new.user_id);
  end if;

  return new;
end;
$$;

drop trigger if exists players_sync_group
  on public.players;

create trigger players_sync_group
before insert or update of user_id
on public.players
for each row
execute function public.sync_player_group();

-- Quando o administrador move ou remove um membro,
-- o card acompanha a alteração automaticamente.
create or replace function public.sync_membership_player()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'DELETE' then
    update public.players
    set group_id = null
    where user_id = old.user_id;

    return old;
  end if;

  update public.players
  set group_id = new.group_id
  where user_id = new.user_id;

  return new;
end;
$$;

drop trigger if exists group_members_sync_player
  on public.group_members;

create trigger group_members_sync_player
after insert or update of group_id or delete
on public.group_members
for each row
execute function public.sync_membership_player();

-- Impede que um usuário comum transforme a própria conta
-- em administrador ao atualizar o perfil.
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin()
    and new.role is distinct from old.role
  then
    raise exception 'role_change_not_allowed'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_protect_role
  on public.profiles;

create trigger profiles_protect_role
before update of role
on public.profiles
for each row
execute function public.protect_profile_role();

-- =========================================================
-- RLS
-- Remove políticas anteriores das tabelas afetadas e recria
-- a matriz completa de acesso.
-- =========================================================

do $$
declare
  policy_record record;
begin
  for policy_record in
    select
      schemaname,
      tablename,
      policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in (
        'profiles',
        'groups',
        'group_members',
        'players',
        'matches',
        'match_stats'
      )
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
  end loop;
end
$$;

alter table public.profiles enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_stats enable row level security;

-- Perfis
create policy profiles_select_self_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
);

create policy profiles_insert_self
on public.profiles
for insert
to authenticated
with check (
  id = (select auth.uid())
);

create policy profiles_update_self_or_admin
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
)
with check (
  id = (select auth.uid())
  or public.is_admin()
);

-- Grupos
create policy groups_select_accessible
on public.groups
for select
to authenticated
using (
  public.can_access_group(id)
);

create policy groups_admin_insert
on public.groups
for insert
to authenticated
with check (
  public.is_admin()
);

create policy groups_admin_update
on public.groups
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy groups_admin_delete
on public.groups
for delete
to authenticated
using (
  public.is_admin()
);

-- Membros
create policy group_members_select_self_or_admin
on public.group_members
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.is_admin()
);

create policy group_members_admin_insert
on public.group_members
for insert
to authenticated
with check (
  public.is_admin()
);

create policy group_members_admin_update
on public.group_members
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy group_members_admin_delete
on public.group_members
for delete
to authenticated
using (
  public.is_admin()
);

-- Cards
create policy players_select_own_group_or_admin
on public.players
for select
to authenticated
using (
  public.is_admin()
  or user_id = (select auth.uid())
  or (
    group_id is not null
    and group_id = public.current_group_id()
  )
);

create policy players_insert_own_or_admin
on public.players
for insert
to authenticated
with check (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and group_id is not distinct from
      public.current_group_id()
  )
);

create policy players_update_own_or_admin
on public.players
for update
to authenticated
using (
  public.is_admin()
  or user_id = (select auth.uid())
)
with check (
  public.is_admin()
  or (
    user_id = (select auth.uid())
    and group_id is not distinct from
      public.current_group_id()
  )
);

create policy players_admin_delete
on public.players
for delete
to authenticated
using (
  public.is_admin()
);

-- Partidas
create policy matches_select_group_or_admin
on public.matches
for select
to authenticated
using (
  public.can_access_group(group_id)
);

create policy matches_admin_insert
on public.matches
for insert
to authenticated
with check (
  public.is_admin()
);

create policy matches_admin_update
on public.matches
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy matches_admin_delete
on public.matches
for delete
to authenticated
using (
  public.is_admin()
);

-- Estatísticas
create policy match_stats_select_group_or_admin
on public.match_stats
for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.matches
    where matches.id = match_stats.match_id
      and matches.group_id =
        public.current_group_id()
  )
);

create policy match_stats_admin_insert
on public.match_stats
for insert
to authenticated
with check (
  public.is_admin()
);

create policy match_stats_admin_update
on public.match_stats
for update
to authenticated
using (
  public.is_admin()
)
with check (
  public.is_admin()
);

create policy match_stats_admin_delete
on public.match_stats
for delete
to authenticated
using (
  public.is_admin()
);

-- =========================================================
-- Agregados limitados ao grupo atual do card
-- =========================================================

create or replace view public.player_aggregates
with (security_invoker = true)
as
select
  players.id as player_id,
  count(match_stats.id) as matches_played,
  coalesce(sum(match_stats.goals), 0) as total_goals,
  coalesce(sum(match_stats.assists), 0) as total_assists,
  coalesce(sum(match_stats.tackles), 0) as total_tackles,
  coalesce(sum(match_stats.saves), 0) as total_saves,
  coalesce(sum(match_stats.is_motm::integer), 0) as total_motm,
  coalesce(avg(match_stats.rating), 0) as avg_rating
from public.players
left join public.matches
  on matches.group_id = players.group_id
left join public.match_stats
  on match_stats.match_id = matches.id
  and match_stats.player_id = players.id
group by players.id;

grant select on public.groups to authenticated;
grant select on public.group_members to authenticated;
grant select on public.player_aggregates to authenticated;

-- =========================================================
-- Pós-jogo: todos os jogadores devem pertencer ao mesmo grupo
-- =========================================================

create or replace function public.create_match_with_stats(
  p_match_date date,
  p_stats jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_match_id uuid;
  item_count integer;
  distinct_player_count integer;
  motm_count integer;
  distinct_group_count integer;
  players_without_group integer;
  target_group_id uuid;
begin
  if not public.is_admin() then
    raise exception 'admin_only'
      using errcode = '42501';
  end if;

  if p_match_date is null then
    raise exception 'match_date_required'
      using errcode = '22023';
  end if;

  if p_match_date > current_date then
    raise exception 'future_match_not_allowed'
      using errcode = '22023';
  end if;

  if p_stats is null
    or jsonb_typeof(p_stats) <> 'array'
  then
    raise exception 'stats_must_be_an_array'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_stats) = 0 then
    raise exception 'at_least_one_player_required'
      using errcode = '22023';
  end if;

  if jsonb_array_length(p_stats) > 100 then
    raise exception 'too_many_players'
      using errcode = '22023';
  end if;

  select
    count(*),
    count(distinct item.player_id),
    count(*) filter (
      where coalesce(item.is_motm, false)
    )
  into
    item_count,
    distinct_player_count,
    motm_count
  from jsonb_to_recordset(p_stats) as item(
    player_id uuid,
    goals integer,
    assists integer,
    saves integer,
    is_motm boolean
  );

  if item_count <> distinct_player_count then
    raise exception 'duplicate_or_invalid_player'
      using errcode = '22023';
  end if;

  if motm_count > 1 then
    raise exception 'only_one_motm_allowed'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_stats) as item(
      player_id uuid,
      goals integer,
      assists integer,
      saves integer,
      is_motm boolean
    )
    left join public.players
      on players.id = item.player_id
    where players.id is null
  ) then
    raise exception 'player_not_found'
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_stats) as item(
      player_id uuid,
      goals integer,
      assists integer,
      saves integer,
      is_motm boolean
    )
    where coalesce(item.goals, 0)
        not between 0 and 99
       or coalesce(item.assists, 0)
        not between 0 and 99
       or coalesce(item.saves, 0)
        not between 0 and 99
  ) then
    raise exception 'stats_out_of_range'
      using errcode = '22023';
  end if;

  select
    count(distinct players.group_id),
    count(*) filter (
      where players.group_id is null
    )
  into
    distinct_group_count,
    players_without_group
  from jsonb_to_recordset(p_stats) as item(
    player_id uuid,
    goals integer,
    assists integer,
    saves integer,
    is_motm boolean
  )
  join public.players
    on players.id = item.player_id;

  if players_without_group > 0 then
    raise exception 'players_without_group'
      using errcode = '22023';
  end if;

  if distinct_group_count <> 1 then
    raise exception 'mixed_groups'
      using errcode = '22023';
  end if;

  select players.group_id
  into target_group_id
  from jsonb_to_recordset(p_stats) as item(
    player_id uuid,
    goals integer,
    assists integer,
    saves integer,
    is_motm boolean
  )
  join public.players
    on players.id = item.player_id
  limit 1;

  insert into public.matches (
    group_id,
    match_date,
    created_by
  )
  values (
    target_group_id,
    p_match_date,
    (select auth.uid())
  )
  returning id into new_match_id;

  insert into public.match_stats (
    match_id,
    player_id,
    goals,
    assists,
    tackles,
    saves,
    is_motm
  )
  select
    new_match_id,
    item.player_id,
    coalesce(item.goals, 0),
    coalesce(item.assists, 0),
    0,
    coalesce(item.saves, 0),
    coalesce(item.is_motm, false)
  from jsonb_to_recordset(p_stats) as item(
    player_id uuid,
    goals integer,
    assists integer,
    saves integer,
    is_motm boolean
  );

  return new_match_id;
end;
$$;

revoke all on function public.create_match_with_stats(
  date,
  jsonb
) from public;

grant execute on function public.create_match_with_stats(
  date,
  jsonb
) to authenticated;

commit;
