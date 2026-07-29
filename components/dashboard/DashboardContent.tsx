'use client';

import type {
  Group,
  PlayerWithCard,
} from '@/types';
import { CardCarousel } from './CardCarousel';
import { CardGrid } from './CardGrid';
import { EmptyGroupState } from './EmptyGroupState';
import { Leaderboard } from './Leaderboard';

interface DashboardContentProps {
  players: PlayerWithCard[];
  currentGroup: Group | null;
  loading: boolean;
  errorMessage: string;
  isAdmin: boolean;
  hasPlayerCard: boolean;
  onSelectPlayer: (
    player: PlayerWithCard
  ) => void;
  onOpenGroups: () => void;
  onOpenCard: () => void;
}

export function DashboardContent({
  players,
  currentGroup,
  loading,
  errorMessage,
  isAdmin,
  hasPlayerCard,
  onSelectPlayer,
  onOpenGroups,
  onOpenCard,
}: DashboardContentProps) {
  const hasGroup = Boolean(currentGroup);

  return (
    <div
      className={`relative z-10 mx-auto max-w-[1500px] px-4 pb-12 pt-6 sm:px-8 ${
        hasGroup
          ? 'grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'
          : ''
      }`}
    >
      {errorMessage && (
        <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[480px] items-center justify-center text-sm font-semibold text-zinc-600">
          Carregando cards...
        </div>
      ) : !currentGroup ? (
        <EmptyGroupState
          isAdmin={isAdmin}
          hasPlayerCard={hasPlayerCard}
          onOpenGroups={onOpenGroups}
          onOpenCard={onOpenCard}
        />
      ) : (
        <>
          <section className="min-w-0">
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

          <aside className="h-fit min-w-0 lg:sticky lg:top-6">
            <Leaderboard players={players} />
          </aside>
        </>
      )}
    </div>
  );
}
