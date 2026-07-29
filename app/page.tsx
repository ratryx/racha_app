'use client';

import { useEffect, useState, useCallback } from 'react';
import { PlayerWithCard } from '@/types';
import { getPlayersWithCards } from '@/lib/supabase/queries';
import { StadiumBackground } from '@/components/dashboard/StadiumBackground';
import { CardGrid } from '@/components/dashboard/CardGrid';
import { CardCarousel } from '@/components/dashboard/CardCarousel';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { CreatePlayerModal } from '@/components/modals/CreatePlayerModal';
import { PostMatchModal } from '@/components/modals/PostMatchModal';

export default function DashboardPage() {
  const [players, setPlayers] = useState<PlayerWithCard[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);

  const loadPlayers = useCallback(async () => {
    const data = await getPlayersWithCards();
    setPlayers(data);
  }, []);

  useEffect(() => {
    loadPlayers();
  }, [loadPlayers]);

  return (
    <main className="relative min-h-screen text-white">
      <StadiumBackground />

      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-4 sm:px-8 py-6">
        <h1 className="text-xl sm:text-2xl font-bold">
          Racha da <span className="text-lime-400">Terça</span>
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setMatchOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg border border-lime-400 text-lime-400 hover:bg-lime-400/10 transition-colors text-sm sm:text-base"
          >
            Lançar pós-jogo
          </button>
          <button
            onClick={() => setCreateOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 transition-colors text-sm sm:text-base"
          >
            + Novo card
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6 px-4 sm:px-8 pb-12">
        {/* mobile/tablet: carrossel com swipe. desktop: grid completo */}
        <div className="lg:hidden">
          <CardCarousel players={players} />
        </div>
        <div className="hidden lg:block">
          <CardGrid players={players} />
        </div>

        <aside className="lg:sticky lg:top-6 h-fit">
          <Leaderboard players={players} />
        </aside>
      </div>

      <CreatePlayerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadPlayers}
      />
      <PostMatchModal
        open={matchOpen}
        players={players}
        onClose={() => setMatchOpen(false)}
        onSaved={loadPlayers}
      />
    </main>
  );
}