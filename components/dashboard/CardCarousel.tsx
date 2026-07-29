'use client';

import { memo, useCallback, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { PlayerWithCard } from '@/types';
import { PlayerCard } from '../cards/PlayerCard';

interface CardCarouselProps {
  players: PlayerWithCard[];
  onSelect?: (player: PlayerWithCard) => void;
}

const SWIPE_THRESHOLD = 55;

export const CardCarousel = memo(function CardCarousel({
  players,
  onSelect,
}: CardCarouselProps) {
  const reduceMotion = useReducedMotion();
  const [index, setIndex] = useState(0);

  const safeIndex = players.length
    ? ((index % players.length) + players.length) % players.length
    : 0;

  const player = players[safeIndex];

  const changeCard = useCallback(
    (direction: number) => {
      setIndex((current) => current + direction);
    },
    []
  );

  const dots = useMemo(
    () => players.map((playerItem) => playerItem.id),
    [players]
  );

  if (!player) {
    return (
      <p className="py-16 text-center text-zinc-500">
        Nenhum card criado ainda.
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-5 py-6">
      <div className="relative flex h-[380px] w-[260px] items-center justify-center">
        <motion.div
          key={player.id}
          initial={
            reduceMotion
              ? false
              : { opacity: 0, scale: 0.94, x: 22, filter: 'blur(4px)' }
          }
          animate={{ opacity: 1, scale: 1, x: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
          drag={players.length > 1 ? 'x' : false}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.28}
          onDragEnd={(_, info) => {
            if (info.offset.x <= -SWIPE_THRESHOLD) {
              changeCard(1);
            } else if (info.offset.x >= SWIPE_THRESHOLD) {
              changeCard(-1);
            }
          }}
          className="absolute will-change-transform"
        >
          <PlayerCard
            player={player}
            interactiveTilt={false}
            onClick={() => onSelect?.(player)}
          />
        </motion.div>
      </div>

      {players.length > 1 && (
        <>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => changeCard(-1)}
              aria-label="Card anterior"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition hover:border-lime-400/50 hover:text-lime-400 active:scale-95"
            >
              <ChevronLeft size={20} />
            </button>

            <span className="min-w-16 text-center text-sm tabular-nums text-zinc-500">
              {safeIndex + 1} / {players.length}
            </span>

            <button
              type="button"
              onClick={() => changeCard(1)}
              aria-label="Próximo card"
              className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-black/20 text-zinc-300 transition hover:border-lime-400/50 hover:text-lime-400 active:scale-95"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          {players.length <= 12 && (
            <div className="flex gap-1.5">
              {dots.map((id, dotIndex) => (
                <button
                  key={id}
                  type="button"
                  aria-label={`Ir para card ${dotIndex + 1}`}
                  onClick={() => setIndex(dotIndex)}
                  className={`h-1.5 rounded-full transition-[width,background-color] duration-150 ${
                    dotIndex === safeIndex
                      ? 'w-6 bg-lime-400'
                      : 'w-1.5 bg-zinc-700'
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
});
