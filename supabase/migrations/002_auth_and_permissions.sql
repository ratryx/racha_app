begin;

do $$
begin
  create type public.user_role as enum ('user', 'admin');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  phone      text unique,
  role       public.user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.players
  add column if not exists user_id uuid references auth.users(id) on delete set null;

create unique index if not exists players_user_id_unique
  on public.players(user_id)
  where user_id is not null;

create index if not exists players_user_id_idx
  on public.players(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, phone)
  values (new.id, new.phone)
  on conflict (id) do update
    set phone = excluded.phone,
        updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of phone on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (id, phone)
select id, phone
from auth.users
on conflict (id) do update
  set phone = excluded.phone,
      updated_at = now();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

alter table public.profiles enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;
alter table public.match_stats enable row level security;

drop policy if exists profiles_select_own_or_admin on public.profiles;
create policy profiles_select_own_or_admin
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.is_admin()
);

drop policy if exists players_select_authenticated on public.players;
create policy players_select_authenticated
on public.players
for select
to authenticated
using (true);

drop policy if exists players_insert_own on public.players;
create policy players_insert_own
on public.players
for insert
to authenticated
with check (
  user_id = (select auth.uid())
);

drop policy if exists matches_select_authenticated on public.matches;
create policy matches_select_authenticated
on public.matches
for select
to authenticated
using (true);

drop policy if exists match_stats_select_authenticated on public.match_stats;
create policy match_stats_select_authenticated
on public.match_stats
for select
to authenticated
using (true);

revoke all on public.profiles from anon, authenticated;
revoke all on public.players from anon, authenticated;
revoke all on public.matches from anon, authenticated;
revoke all on public.match_stats from anon, authenticated;

grant select on public.profiles to authenticated;
grant select on public.players to authenticated;
grant insert (user_id, name, nickname, photo_url, position)
  on public.players to authenticated;
grant select on public.matches to authenticated;
grant select on public.match_stats to authenticated;

create or replace function public.update_my_player(
  p_name text,
  p_nickname text,
  p_photo_url text
)
returns public.players
language plpgsql
security definer
set search_path = ''
as $$
declare
  updated_player public.players;
begin
  if (select auth.uid()) is null then
    raise exception 'not_authenticated' using errcode = '42501';
  end if;

  if nullif(btrim(p_name), '') is null then
    raise exception 'name_required' using errcode = '22023';
  end if;

  update public.players
  set
    name = btrim(p_name),
    nickname = nullif(btrim(coalesce(p_nickname, '')), ''),
    photo_url = nullif(btrim(coalesce(p_photo_url, '')), '')
  where user_id = (select auth.uid())
  returning * into updated_player;

  if updated_player.id is null then
    raise exception 'player_not_found' using errcode = 'P0002';
  end if;

  return updated_player;
end;
$$;

revoke all on function public.update_my_player(text, text, text) from public;
grant execute on function public.update_my_player(text, text, text) to authenticated;

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
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  if p_match_date is null then
    raise exception 'match_date_required' using errcode = '22023';
  end if;

  if p_stats is null or jsonb_typeof(p_stats) <> 'array' then
    raise exception 'stats_must_be_an_array' using errcode = '22023';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_stats) as item(
      player_id uuid,
      goals integer,
      assists integer,
      tackles integer,
      saves integer,
      is_motm boolean
    )
    where coalesce(item.goals, 0) < 0
       or coalesce(item.assists, 0) < 0
       or coalesce(item.tackles, 0) < 0
       or coalesce(item.saves, 0) < 0
  ) then
    raise exception 'stats_cannot_be_negative' using errcode = '22023';
  end if;

  insert into public.matches (match_date)
  values (p_match_date)
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
    coalesce(item.tackles, 0),
    coalesce(item.saves, 0),
    coalesce(item.is_motm, false)
  from jsonb_to_recordset(p_stats) as item(
    player_id uuid,
    goals integer,
    assists integer,
    tackles integer,
    saves integer,
    is_motm boolean
  );

  return new_match_id;
end;
$$;

revoke all on function public.create_match_with_stats(date, jsonb) from public;
grant execute on function public.create_match_with_stats(date, jsonb) to authenticated;

create or replace view public.player_aggregates
with (security_invoker = true)
as
select
  p.id as player_id,
  count(ms.id)                         as matches_played,
  coalesce(sum(ms.goals), 0)           as total_goals,
  coalesce(sum(ms.assists), 0)         as total_assists,
  coalesce(sum(ms.tackles), 0)         as total_tackles,
  coalesce(sum(ms.saves), 0)           as total_saves,
  coalesce(sum(ms.is_motm::int), 0)    as total_motm,
  coalesce(avg(ms.rating), 0)          as avg_rating
from public.players p
left join public.match_stats ms on ms.player_id = p.id
group by p.id;

revoke all on public.player_aggregates from anon, authenticated;
grant select on public.player_aggregates to authenticated;

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'player-photos',
  'player-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists player_photos_select_own on storage.objects;
create policy player_photos_select_own
on storage.objects
for select
to authenticated
using (
  bucket_id = 'player-photos'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists player_photos_insert_own_folder on storage.objects;
create policy player_photos_insert_own_folder
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'player-photos'
  and (storage.foldername(name))[1] = (select auth.uid()::text)
);

drop policy if exists player_photos_update_own on storage.objects;
create policy player_photos_update_own
on storage.objects
for update
to authenticated
using (
  bucket_id = 'player-photos'
  and owner_id = (select auth.uid()::text)
)
with check (
  bucket_id = 'player-photos'
  and owner_id = (select auth.uid()::text)
);

drop policy if exists player_photos_delete_own on storage.objects;
create policy player_photos_delete_own
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'player-photos'
  and owner_id = (select auth.uid()::text)
);

commit;
