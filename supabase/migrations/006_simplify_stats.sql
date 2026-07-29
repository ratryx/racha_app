begin;

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
      saves integer,
      is_motm boolean
    )
    left join public.players on players.id = item.player_id
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
      saves integer,
      is_motm boolean
    )
    where coalesce(item.goals, 0) not between 0 and 99
       or coalesce(item.assists, 0) not between 0 and 99
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
