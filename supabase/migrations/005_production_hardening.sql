begin;

alter table public.matches
  add column if not exists created_by uuid
  references auth.users(id)
  on delete set null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'players_name_length_check'
      and conrelid = 'public.players'::regclass
  ) then
    alter table public.players
      add constraint players_name_length_check
      check (
        char_length(btrim(name)) between 1 and 60
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'players_nickname_length_check'
      and conrelid = 'public.players'::regclass
  ) then
    alter table public.players
      add constraint players_nickname_length_check
      check (
        nickname is null
        or char_length(btrim(nickname)) between 1 and 24
      );
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'match_stats_values_check'
      and conrelid = 'public.match_stats'::regclass
  ) then
    alter table public.match_stats
      add constraint match_stats_values_check
      check (
        goals between 0 and 99
        and assists between 0 and 99
        and tackles between 0 and 99
        and saves between 0 and 99
        and fouls between 0 and 99
        and yellow_cards between 0 and 2
        and red_cards between 0 and 1
        and (
          rating is null
          or rating between 0 and 10
        )
      );
  end if;
end
$$;

create unique index if not exists match_stats_single_motm_per_match
  on public.match_stats(match_id)
  where is_motm = true;

create index if not exists matches_created_by_idx
  on public.matches(created_by);

create index if not exists matches_match_date_idx
  on public.matches(match_date desc);

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
begin
  if not public.is_admin() then
    raise exception 'admin_only' using errcode = '42501';
  end if;

  if p_match_date is null then
    raise exception 'match_date_required' using errcode = '22023';
  end if;

  if p_match_date > current_date then
    raise exception 'future_match_not_allowed' using errcode = '22023';
  end if;

  if p_stats is null or jsonb_typeof(p_stats) <> 'array' then
    raise exception 'stats_must_be_an_array' using errcode = '22023';
  end if;

  if jsonb_array_length(p_stats) = 0 then
    raise exception 'at_least_one_player_required' using errcode = '22023';
  end if;

  if jsonb_array_length(p_stats) > 100 then
    raise exception 'too_many_players' using errcode = '22023';
  end if;

  select
    count(*),
    count(distinct item.player_id),
    count(*) filter (where coalesce(item.is_motm, false))
  into
    item_count,
    distinct_player_count,
    motm_count
  from jsonb_to_recordset(p_stats) as item(
    player_id uuid,
    goals integer,
    assists integer,
    tackles integer,
    saves integer,
    is_motm boolean
  );

  if item_count <> distinct_player_count then
    raise exception 'duplicate_or_invalid_player' using errcode = '22023';
  end if;

  if motm_count > 1 then
    raise exception 'only_one_motm_allowed' using errcode = '22023';
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
    left join public.players
      on players.id = item.player_id
    where players.id is null
  ) then
    raise exception 'player_not_found' using errcode = '22023';
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
    where coalesce(item.goals, 0) not between 0 and 99
       or coalesce(item.assists, 0) not between 0 and 99
       or coalesce(item.tackles, 0) not between 0 and 99
       or coalesce(item.saves, 0) not between 0 and 99
  ) then
    raise exception 'stats_out_of_range' using errcode = '22023';
  end if;

  insert into public.matches (
    match_date,
    created_by
  )
  values (
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

revoke all on function public.create_match_with_stats(
  date,
  jsonb
) from public;

grant execute on function public.create_match_with_stats(
  date,
  jsonb
) to authenticated;

commit;
