'use client';

import { motion } from 'framer-motion';
import {
  CalendarRange,
  Medal,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

import type { PlayerWithCard } from '@/types';
import { Leaderboard } from '@/components/dashboard/Leaderboard';

interface RankingsSectionProps {
  players: PlayerWithCard[];
}

export function RankingsSection({
  players,
}: RankingsSectionProps) {
  return (
    <section>
      <div className="mb-6 rounded-[22px] border border-white/[0.09] bg-black/30 px-5 py-4 backdrop-blur-xl">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-200">
          Competição saudável
        </p>

        <h2 className="mt-2 text-3xl font-black tracking-[-0.025em] text-white">
          Rankings do grupo
        </h2>

        <p className="mt-2 max-w-xl text-[15px] leading-6 text-zinc-300/80">
          O ranking atual continua disponível
          enquanto temporadas e conquistas são
          preparadas.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="grid gap-4 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]"
      >
        <div className="min-w-0">
          <Leaderboard players={players} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <RoadmapCard
            icon={CalendarRange}
            title="Temporadas"
            description="Classificações mensais, anuais e históricas."
          />

          <RoadmapCard
            icon={Medal}
            title="Conquistas"
            description="Artilharia, assistências, muralhas e sequências."
          />

          <RoadmapCard
            icon={TrendingUp}
            title="Evolução"
            description="Gráfico do overall e forma recente de cada jogador."
          />
        </div>
      </motion.div>
    </section>
  );
}

function RoadmapCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <article className="rounded-[22px] border border-white/[0.11] bg-[#0a0d0a]/88 p-4 shadow-lg shadow-black/10 backdrop-blur-xl">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-200/15 bg-amber-200/[0.07] text-amber-100">
        <Icon size={18} />
      </span>

      <h3 className="mt-3 text-base font-black text-white">
        {title}
      </h3>

      <p className="mt-1.5 text-sm leading-6 text-zinc-400">
        {description}
      </p>
    </article>
  );
}
