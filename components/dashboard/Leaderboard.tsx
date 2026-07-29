'use client';

import { motion } from 'framer-motion';
import {
  Crown,
  Medal,
  Sparkles,
  Target,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { PlayerWithCard } from '@/types';

interface LeaderboardProps {
  players: PlayerWithCard[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  if (players.length === 0) {
    return (
      <section className="rounded-[26px] border border-white/[0.08] bg-white/[0.025] p-5">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.26em] text-zinc-600">
          Destaques
        </p>
        <p className="mt-4 text-sm leading-relaxed text-zinc-500">
          Os líderes aparecerão aqui depois que o elenco começar a registrar partidas.
        </p>
      </section>
    );
  }

  const byOverall = [...players].sort(
    (a, b) =>
      b.card.overall - a.card.overall ||
      b.aggregates.total_motm - a.aggregates.total_motm
  );

  const byGoals = [...players].sort(
    (a, b) =>
      b.aggregates.total_goals - a.aggregates.total_goals ||
      b.card.overall - a.card.overall
  );

  const byAssists = [...players].sort(
    (a, b) =>
      b.aggregates.total_assists - a.aggregates.total_assists ||
      b.card.overall - a.card.overall
  );

  const byMotm = [...players].sort(
    (a, b) =>
      b.aggregates.total_motm - a.aggregates.total_motm ||
      b.card.overall - a.card.overall
  );

  const artilheiro = byGoals[0];
  const garcom = byAssists[0];
  const hero = byMotm[0];
  const topThree = byOverall.slice(0, 3);
  const hasMotm = hero.aggregates.total_motm > 0;

  return (
    <section className="overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#0b0d0c]/[0.88] shadow-2xl shadow-black/30 backdrop-blur-xl">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
        <div>
          <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-lime-400">
            Números do racha
          </p>
          <h2 className="font-display mt-1 text-xl font-black uppercase tracking-[0.02em] text-white">
            Destaques
          </h2>
        </div>
        <Trophy size={20} className="text-zinc-700" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative m-3 min-h-[214px] overflow-hidden rounded-[22px] border border-white/10 bg-zinc-950"
      >
        {hero.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={hero.photo_url}
            alt=""
            className="absolute inset-0 h-full w-full object-cover object-top opacity-55"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_24%,rgba(163,230,53,.18),transparent_42%),linear-gradient(145deg,#171a18,#080a09)]" />
        )}

        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.35)_42%,rgba(0,0,0,.96)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-lime-400/25 bg-lime-400/10 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-lime-300 backdrop-blur-md">
              <Crown size={11} />
              {hasMotm ? 'Craque do racha' : 'Maior overall'}
            </span>
            <span className="font-display text-3xl font-black text-lime-300">
              {hasMotm ? hero.aggregates.total_motm : hero.card.overall}
            </span>
          </div>

          <p className="font-display truncate text-[26px] font-black uppercase leading-none tracking-wide text-white">
            {getDisplayName(hero)}
          </p>
          <p className="mt-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-zinc-400">
            {hasMotm
              ? `${hero.aggregates.total_motm}x eleito o melhor`
              : `${hero.card.overall} de overall`}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 gap-2 px-3 pb-3">
        <HighlightTile
          icon={Target}
          label="Artilheiro"
          player={artilheiro}
          value={artilheiro.aggregates.total_goals}
          suffix="gols"
          delay={0.06}
        />
        <HighlightTile
          icon={Sparkles}
          label="Garçom"
          player={garcom}
          value={garcom.aggregates.total_assists}
          suffix="assist."
          delay={0.12}
        />
      </div>

      <div className="border-t border-white/[0.06] px-4 pb-4 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-zinc-600">
            Top overall
          </p>
          <Medal size={15} className="text-zinc-700" />
        </div>

        <div className="space-y-1.5">
          {topThree.map((player, index) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.16 + index * 0.06 }}
              className="group flex items-center gap-3 rounded-2xl border border-transparent px-2.5 py-2 transition hover:border-white/[0.06] hover:bg-white/[0.025]"
            >
              <span
                className={`font-display w-5 text-center text-lg font-black ${
                  index === 0 ? 'text-lime-400' : 'text-zinc-700'
                }`}
              >
                {index + 1}
              </span>

              <PlayerAvatar player={player} />

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-extrabold text-zinc-200">
                  {getDisplayName(player)}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                  {player.position}
                </p>
              </div>

              <div className="text-right">
                <p className="font-display text-xl font-black leading-none text-white">
                  {player.card.overall}
                </p>
                <p className="mt-1 text-[8px] font-bold uppercase tracking-widest text-zinc-700">
                  OVR
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HighlightTile({
  icon: Icon,
  label,
  player,
  value,
  suffix,
  delay,
}: {
  icon: LucideIcon;
  label: string;
  player: PlayerWithCard;
  value: number;
  suffix: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="min-w-0 rounded-[18px] border border-white/[0.07] bg-white/[0.025] p-3"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-lime-400/[0.08] text-lime-400">
          <Icon size={15} />
        </span>
        <span className="font-display text-2xl font-black leading-none text-white">
          {value}
        </span>
      </div>

      <p className="text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-600">
        {label}
      </p>
      <p className="mt-1 truncate text-xs font-bold text-zinc-300">
        {getDisplayName(player)}
      </p>
      <p className="mt-0.5 text-[9px] font-semibold text-zinc-700">{suffix}</p>
    </motion.div>
  );
}

function PlayerAvatar({ player }: { player: PlayerWithCard }) {
  if (!player.photo_url) {
    return (
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-zinc-900 text-xs font-black text-zinc-500">
        {getDisplayName(player).slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={player.photo_url}
      alt=""
      className="h-9 w-9 shrink-0 rounded-xl border border-white/[0.08] object-cover object-top"
    />
  );
}

function getDisplayName(player: PlayerWithCard): string {
  return player.nickname?.trim() || player.name;
}
