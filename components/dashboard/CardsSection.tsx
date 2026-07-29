'use client';

import type { PlayerWithCard } from '@/types';
import { CardCarousel } from './CardCarousel';
import { CardGrid } from './CardGrid';

interface CardsSectionProps {
  players: PlayerWithCard[];
  onSelectPlayer: (
    player: PlayerWithCard
  ) => void;
}

export function CardsSection({
  players,
  onSelectPlayer,
}: CardsSectionProps) {
  return (
    <section className="min-w-0">
      <div className="mb-6 rounded-[22px] border border-white/[0.08] bg-black/25 px-5 py-4 backdrop-blur-lg">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-lime-300">
          Elenco atual
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-white">
          Cards dos jogadores
        </h2>

        <p className="mt-2 max-w-xl text-[15px] leading-6 text-zinc-300/80">
          Toque em um card para abrir o histórico
          completo e os números individuais.
        </p>
      </div>

      <div className="lg:hidden">
        <CardCarousel
          players={players}
          onSelect={onSelectPlayer}
        />
      </div>

      <div className="hidden lg:block">
        <CardGrid
          players={players}
          onSelect={onSelectPlayer}
        />
      </div>
    </section>
  );
}
