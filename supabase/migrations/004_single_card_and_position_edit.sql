begin;

-- Uma conta autenticada pode possuir no máximo um card.
create unique index if not exists players_user_id_unique
  on public.players(user_id)
  where user_id is not null;

-- Remove a assinatura antiga para evitar duas versões da mesma RPC.
drop function if exists public.update_my_player(text, text, text);

create or replace function public.update_my_player(
  p_name text,
  p_nickname text,
  p_photo_url text,
  p_position public.player_position
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
    photo_url = nullif(btrim(coalesce(p_photo_url, '')), ''),
    position = p_position
  where user_id = (select auth.uid())
  returning * into updated_player;

  if updated_player.id is null then
    raise exception 'player_not_found' using errcode = 'P0002';
  end if;

  return updated_player;
end;
$$;

revoke all on function public.update_my_player(
  text,
  text,
  text,
  public.player_position
) from public;

grant execute on function public.update_my_player(
  text,
  text,
  text,
  public.player_position
) to authenticated;

commit;
