'use client';

import { motion } from 'framer-motion';

import type {
  Group,
  PlayerWithCard,
} from '@/types';
import type { AppSection } from '@/types/navigation';
import { CardsSection } from '@/components/dashboard/CardsSection';
import { EmptyGroupState } from '@/components/dashboard/EmptyGroupState';
import { MatchesSection } from '@/components/matches/MatchesSection';
import { RankingsSection } from '@/components/rankings/RankingsSection';

interface DashboardSectionContentProps {
  activeSection: AppSection;
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
  onOpenPostMatch: () => void;
}

export function DashboardSectionContent({
  activeSection,
  players,
  currentGroup,
  loading,
  errorMessage,
  isAdmin,
  hasPlayerCard,
  onSelectPlayer,
  onOpenGroups,
  onOpenCard,
  onOpenPostMatch,
}: DashboardSectionContentProps) {
  return (
    <div className="relative z-10 mx-auto max-w-[1500px] px-4 pb-28 pt-6 sm:px-8 lg:pb-12">
      {errorMessage && (
        <p className="mb-5 rounded-2xl border border-red-400/25 bg-red-950/70 px-4 py-3 text-sm font-medium text-red-200 backdrop-blur-xl">
          {errorMessage}
        </p>
      )}

      {loading ? (
        <div className="flex min-h-[480px] items-center justify-center text-sm font-semibold text-zinc-400">
          Carregando dados...
        </div>
      ) : !currentGroup ? (
        <EmptyGroupState
          isAdmin={isAdmin}
          hasPlayerCard={hasPlayerCard}
          onOpenGroups={onOpenGroups}
          onOpenCard={onOpenCard}
        />
      ) : (
        <motion.div
          key={activeSection}
          initial={{
            opacity: 0,
            y: 8,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.18,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          {activeSection === 'cards' && (
            <CardsSection
              players={players}
              onSelectPlayer={onSelectPlayer}
            />
          )}

          {activeSection === 'matches' && (
            <MatchesSection
              isAdmin={isAdmin}
              groupName={currentGroup.name}
              onOpenPostMatch={onOpenPostMatch}
            />
          )}

          {activeSection === 'rankings' && (
            <RankingsSection
              players={players}
            />
          )}
        </motion.div>
      )}
    </div>
  );
}
