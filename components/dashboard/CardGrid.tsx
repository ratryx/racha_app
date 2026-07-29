'use client';

import { motion } from 'framer-motion';
import { PlayerWithCard } from '@/types';
import { PlayerCard } from '../cards/PlayerCard';

interface CardGridProps {
  players: PlayerWithCard[];
  onSelect?: (player: PlayerWithCard) => void;
}

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06 },
  },
};

export function CardGrid({ players, onSelect }: CardGridProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-[repeat(auto-fill,260px)] gap-8 justify-center py-8"
    >
      {players.map((player) => (
        <PlayerCard key={player.id} player={player} onClick={() => onSelect?.(player)} />
      ))}
    </motion.div>
  );
}
