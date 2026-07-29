'use client';

import { motion } from 'framer-motion';
import type { PlayerWithCard } from '@/types';
import { CARD_WIDTH } from '@/lib/cardTier';
import { PlayerCard } from '../cards/PlayerCard';

interface CardGridProps {
  players: PlayerWithCard[];
  onSelect?: (player: PlayerWithCard) => void;
}

export function CardGrid({ players, onSelect }: CardGridProps) {
  if (players.length === 0) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-8 py-10 text-center">
          <p className="font-display text-xl font-black uppercase tracking-wide text-zinc-300">
            O elenco ainda está vazio
          </p>
          <p className="mt-2 text-sm text-zinc-600">
            O primeiro jogador pode criar o card pelo menu superior.
          </p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.08,
          },
        },
      }}
      className="grid justify-center gap-x-8 gap-y-14 py-12"
      style={{
        gridTemplateColumns: `repeat(auto-fill, minmax(${CARD_WIDTH}px, ${CARD_WIDTH}px))`,
      }}
    >
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onClick={() => onSelect?.(player)}
        />
      ))}
    </motion.div>
  );
}
