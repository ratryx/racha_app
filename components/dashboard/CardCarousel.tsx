'use client';

import { useState } from 'react';
import { AnimatePresence, motion, PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PlayerWithCard } from '@/types';
import { PlayerCard } from '../cards/PlayerCard';

interface CardCarouselProps {
  players: PlayerWithCard[];
  onSelect?: (player: PlayerWithCard) => void;
}

const SWIPE_THRESHOLD = 60;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 260 : -260,
    opacity: 0,
    scale: 0.85,
  }),
  center: { x: 0, opacity: 1, scale: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -260 : 260,
    opacity: 0,
    scale: 0.85,
  }),
};

export function CardCarousel({ players, onSelect }: CardCarouselProps) {
  const [[index, direction], setIndex] = useState([0, 0]);

  if (players.length === 0) {
    return (
      <p className="text-center text-zinc-500 py-16">Nenhum card criado ainda.</p>
    );
  }

  const wrappedIndex = ((index % players.length) + players.length) % players.length;
  const player = players[wrappedIndex];

  function paginate(newDirection: number) {
    setIndex([index + newDirection, newDirection]);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      paginate(1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      paginate(-1);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="relative w-[260px] h-[380px] flex items-center justify-center">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={wrappedIndex}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ x: { type: 'spring', stiffness: 320, damping: 32 }, opacity: { duration: 0.2 } }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6}
            onDragEnd={handleDragEnd}
            className="absolute"
          >
            <PlayerCard player={player} onClick={() => onSelect?.(player)} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* setas de navegação */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => paginate(-1)}
          aria-label="Card anterior"
          className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-lime-400 hover:text-lime-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>

        {/* indicador de posição */}
        <span className="text-sm text-zinc-500">
          {wrappedIndex + 1} / {players.length}
        </span>

        <button
          onClick={() => paginate(1)}
          aria-label="Próximo card"
          className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 hover:border-lime-400 hover:text-lime-400 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* pontinhos (só até um limite razoável, senão fica poluído) */}
      {players.length <= 10 && (
        <div className="flex gap-1.5">
          {players.map((_, i) => (
            <button
              key={i}
              aria-label={`Ir para card ${i + 1}`}
              onClick={() => setIndex([i, i > wrappedIndex ? 1 : -1])}
              className={`h-1.5 rounded-full transition-all ${
                i === wrappedIndex ? 'w-6 bg-lime-400' : 'w-1.5 bg-zinc-700'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}