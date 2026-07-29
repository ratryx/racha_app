-- =========================================================
-- SCHEMA: Racha da Terça — Dashboard de Overall
-- =========================================================

create type player_position as enum ('GOL', 'ZAG', 'LAT', 'MEI', 'ATA');

-- ---------------------------------------------------------
-- players: cadastro de cada jogador (o "cartão")
-- ---------------------------------------------------------
create table players (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  nickname     text,
  photo_url    text,
  position     player_position not null,
  foot         text check (foot in ('destro', 'canhoto', 'ambidestro')),
  height_cm    smallint,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------
-- matches: cada terça-feira gera uma partida
-- ---------------------------------------------------------
create table matches (
  id           uuid primary key default gen_random_uuid(),
  match_date   date not null,
  location     text,
  notes        text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------
-- match_stats: estatísticas de cada jogador em cada partida
-- (linha só existe se o jogador jogou aquela partida)
-- ---------------------------------------------------------
create table match_stats (
  id            uuid primary key default gen_random_uuid(),
  match_id      uuid not null references matches(id) on delete cascade,
  player_id     uuid not null references players(id) on delete cascade,
  goals         smallint not null default 0,
  assists       smallint not null default 0,
  tackles       smallint not null default 0,  -- desarmes
  saves         smallint not null default 0,  -- defesas (goleiro)
  fouls         smallint not null default 0,
  yellow_cards  smallint not null default 0,
  red_cards     smallint not null default 0,
  is_motm       boolean not null default false, -- man of the match
  rating        numeric(3,1),                   -- nota manual opcional (0-10)
  unique (match_id, player_id)
);

-- índices para os cálculos de overall / rankings
create index idx_match_stats_player on match_stats(player_id);
create index idx_match_stats_match on match_stats(match_id);

-- ---------------------------------------------------------
-- view auxiliar: agregados por jogador (usada no cálculo de OVR)
-- ---------------------------------------------------------
create view player_aggregates as
select
  p.id as player_id,
  count(ms.id)                         as matches_played,
  coalesce(sum(ms.goals), 0)           as total_goals,
  coalesce(sum(ms.assists), 0)         as total_assists,
  coalesce(sum(ms.tackles), 0)         as total_tackles,
  coalesce(sum(ms.saves), 0)           as total_saves,
  coalesce(sum(ms.is_motm::int), 0)    as total_motm,
  coalesce(avg(ms.rating), 0)          as avg_rating
from players p
left join match_stats ms on ms.player_id = p.id
group by p.id;
