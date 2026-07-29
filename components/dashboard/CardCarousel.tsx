'use client';

import { useState } from 'react';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlayerWithCard } from '@/types';
import { CARD_HEIGHT, CARD_WIDTH } from '@/lib/cardTier';
import { PlayerCard } from '../cards/PlayerCard';

interface CardCarouselProps {
  players: PlayerWithCard[];
  onSelect?: (player: PlayerWithCard) => void;
}

const SWIPE_THRESHOLD = 58;

const variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 220 : -220,
    opacity: 0,
    scale: 0.9,
    rotate: direction > 0 ? 3 : -3,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -220 : 220,
    opacity: 0,
    scale: 0.9,
    rotate: direction > 0 ? -3 : 3,
  }),
};

export function CardCarousel({ players, onSelect }: CardCarouselProps) {
  const [[index, direction], setIndex] = useState<[number, number]>([0, 0]);

  if (players.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="font-display text-xl font-black uppercase tracking-wide text-zinc-300">
          Nenhum card criado
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          Use o botão no topo para entrar no elenco.
        </p>
      </div>
    );
  }

  const wrappedIndex =
    ((index % players.length) + players.length) % players.length;
  const player = players[wrappedIndex];

  function paginate(nextDirection: number) {
    setIndex(([currentIndex]) => [
      currentIndex + nextDirection,
      nextDirection,
    ]);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x < -SWIPE_THRESHOLD) {
      paginate(1);
    } else if (info.offset.x > SWIPE_THRESHOLD) {
      paginate(-1);
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 py-8">
      <div
        className="relative flex max-w-full items-center justify-center"
        style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={player.id}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 31 },
              opacity: { duration: 0.18 },
              rotate: { duration: 0.22 },
            }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.55}
            onDragEnd={handleDragEnd}
            className="absolute touch-pan-y"
          >
            <PlayerCard
              player={player}
              interactiveTilt={false}
              onClick={() => onSelect?.(player)}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-4 rounded-2xl border border-white/[0.08] bg-black/30 p-1.5 backdrop-blur-md">
        <button
          type="button"
          onClick={() => paginate(-1)}
          aria-label="Card anterior"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/[0.06] hover:text-white active:scale-95"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="min-w-[92px] text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-600">
            Jogador
          </p>
          <p className="mt-0.5 text-sm font-extrabold text-zinc-200">
            {wrappedIndex + 1}{' '}
            <span className="font-medium text-zinc-600">/ {players.length}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => paginate(1)}
          aria-label="Próximo card"
          className="flex h-10 w-10 items-center justify-center rounded-xl text-zinc-400 transition hover:bg-white/[0.06] hover:text-white active:scale-95"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {players.length <= 12 && (
        <div className="flex items-center gap-1.5">
          {players.map((item, itemIndex) => (
            <button
              type="button"
              key={item.id}
              aria-label={`Ir para o card ${itemIndex + 1}`}
              onClick={() =>
                setIndex([
                  itemIndex,
                  itemIndex >= wrappedIndex ? 1 : -1,
                ])
              }
              className={`h-1.5 rounded-full transition-all ${
                itemIndex === wrappedIndex
                  ? 'w-7 bg-lime-400'
                  : 'w-1.5 bg-zinc-800 hover:bg-zinc-600'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
