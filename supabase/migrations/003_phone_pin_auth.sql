begin;

alter table public.profiles
  add column if not exists display_name text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (
    id,
    phone,
    display_name,
    role,
    created_at,
    updated_at
  )
  values (
    new.id,
    new.phone,
    nullif(btrim(new.raw_user_meta_data ->> 'display_name'), ''),
    'user',
    now(),
    now()
  )
  on conflict (id) do update
  set
    phone = excluded.phone,
    display_name = coalesce(excluded.display_name, public.profiles.display_name),
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert or update of phone, raw_user_meta_data on auth.users
for each row execute procedure public.handle_new_user();

insert into public.profiles (
  id,
  phone,
  display_name,
  role,
  created_at,
  updated_at
)
select
  users.id,
  users.phone,
  nullif(btrim(users.raw_user_meta_data ->> 'display_name'), ''),
  'user',
  now(),
  now()
from auth.users as users
on conflict (id) do update
set
  phone = excluded.phone,
  display_name = coalesce(excluded.display_name, public.profiles.display_name),
  updated_at = now();

commit;
