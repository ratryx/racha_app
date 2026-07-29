'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
} from 'lucide-react';
import type { Player, PlayerWithCard } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import {
  getMyPlayer,
  getPlayersWithCards,
} from '@/lib/supabase/queries';
import { LoginScreen } from '@/components/auth/LoginScreen';
import { StadiumBackground } from '@/components/dashboard/StadiumBackground';
import { CardGrid } from '@/components/dashboard/CardGrid';
import { CardCarousel } from '@/components/dashboard/CardCarousel';
import { Leaderboard } from '@/components/dashboard/Leaderboard';
import { CreatePlayerModal } from '@/components/modals/CreatePlayerModal';
import { EditPlayerModal } from '@/components/modals/EditPlayerModal';
import { PostMatchModal } from '@/components/modals/PostMatchModal';
import { ResetPinModal } from '@/components/modals/ResetPinModal';

export default function DashboardPage() {
  const { user, profile, loading: authLoading, signOut } = useAuth();

  const [players, setPlayers] = useState<PlayerWithCard[]>([]);
  const [myPlayer, setMyPlayer] = useState<Player | null>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [matchOpen, setMatchOpen] = useState(false);
  const [resetPinOpen, setResetPinOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  const loadDashboard = useCallback(async () => {
    if (!user) {
      setPlayers([]);
      setMyPlayer(null);
      return;
    }

    setDashboardLoading(true);
    setErrorMessage('');

    try {
      const [playerList, currentPlayer] = await Promise.all([
        getPlayersWithCards(),
        getMyPlayer(),
      ]);

      setPlayers(playerList);
      setMyPlayer(currentPlayer);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar o elenco.'
      );
    } finally {
      setDashboardLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  async function handleSignOut() {
    try {
      await signOut();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível sair.'
      );
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#050806] text-sm font-semibold text-zinc-500">
        Carregando sessão...
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#050806] text-white">
      <StadiumBackground />

      <header className="relative z-10 border-b border-white/[0.06] bg-black/20 px-4 py-4 backdrop-blur-md sm:px-8">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Elenco oficial
            </p>
            <h1 className="mt-1 text-xl font-black tracking-[-0.03em] sm:text-2xl">
              Racha da <span className="text-lime-400">Terça</span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={() => setResetPinOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 text-sm font-bold text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
                >
                  <KeyRound size={16} />
                  Redefinir PIN
                </button>

                <button
                  onClick={() => setMatchOpen(true)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-lime-400/35 bg-lime-400/[0.06] px-3 text-sm font-bold text-lime-300 transition hover:border-lime-400 hover:bg-lime-400/10"
                >
                  <ShieldCheck size={16} />
                  Pós-jogo
                </button>
              </>
            )}

            {myPlayer ? (
              <button
                onClick={() => setEditOpen(true)}
                className="flex h-10 items-center gap-2 rounded-xl bg-lime-400 px-3 text-sm font-extrabold text-black transition hover:bg-lime-300"
              >
                <Pencil size={16} />
                Editar meu card
              </button>
            ) : (
              <button
                onClick={() => setCreateOpen(true)}
                className="flex h-10 items-center gap-2 rounded-xl bg-lime-400 px-3 text-sm font-extrabold text-black transition hover:bg-lime-300"
              >
                <Plus size={17} />
                Criar meu card
              </button>
            )}

            <button
              onClick={handleSignOut}
              aria-label="Sair"
              title="Sair"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-400 transition hover:border-white/20 hover:bg-white/5 hover:text-white"
            >
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 pb-12 sm:px-8 lg:grid-cols-[1fr_300px]">
        <section>
          {errorMessage && (
            <p className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </p>
          )}

          {dashboardLoading ? (
            <div className="flex min-h-[480px] items-center justify-center text-sm font-semibold text-zinc-600">
              Carregando cards...
            </div>
          ) : (
            <>
              <div className="lg:hidden">
                <CardCarousel players={players} />
              </div>
              <div className="hidden lg:block">
                <CardGrid players={players} />
              </div>
            </>
          )}
        </section>

        <aside className="h-fit lg:sticky lg:top-6">
          <Leaderboard players={players} />
        </aside>
      </div>

      <CreatePlayerModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={loadDashboard}
      />

      <EditPlayerModal
        open={editOpen}
        player={myPlayer}
        onClose={() => setEditOpen(false)}
        onUpdated={loadDashboard}
      />

      {isAdmin && (
        <>
          <PostMatchModal
            open={matchOpen}
            players={players}
            onClose={() => setMatchOpen(false)}
            onSaved={loadDashboard}
          />

          <ResetPinModal
            open={resetPinOpen}
            onClose={() => setResetPinOpen(false)}
          />
        </>
      )}
    </main>
  );
}
