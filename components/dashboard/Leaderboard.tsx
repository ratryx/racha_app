'use client';

import { motion } from 'framer-motion';
import { PlayerWithCard } from '@/types';

interface LeaderboardProps {
  players: PlayerWithCard[];
}

export function Leaderboard({ players }: LeaderboardProps) {
  const artilheiro = [...players].sort(
    (a, b) => b.aggregates.total_goals - a.aggregates.total_goals
  )[0];
  const garcom = [...players].sort(
    (a, b) => b.aggregates.total_assists - a.aggregates.total_assists
  )[0];
  const maiorOvr = [...players].sort((a, b) => b.card.overall - a.card.overall)[0];

  const items = [
    { label: 'Artilheiro', player: artilheiro, stat: artilheiro?.aggregates.total_goals, suffix: 'gols' },
    { label: 'Garçom', player: garcom, stat: garcom?.aggregates.total_assists, suffix: 'assist.' },
    { label: 'Maior OVR', player: maiorOvr, stat: maiorOvr?.card.overall, suffix: 'ovr' },
  ];

  return (
    <div className="space-y-3">
      <h3 className="text-sm uppercase tracking-wider text-zinc-500">Destaques</h3>
      {items.map(
        (item, i) =>
          item.player && (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex items-center justify-between bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3"
            >
              <div>
                <p className="text-xs text-zinc-500">{item.label}</p>
                <p className="text-white font-semibold">
                  {item.player.nickname ?? item.player.name}
                </p>
              </div>
              <span className="text-lime-400 font-bold">
                {item.stat} <span className="text-xs text-zinc-500">{item.suffix}</span>
              </span>
            </motion.div>
          )
      )}
    </div>
  );
}
