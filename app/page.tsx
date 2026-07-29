'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  type LucideIcon,
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
  const hasPlayerCard = Boolean(myPlayer);

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
    setErrorMessage('');

    try {
      await signOut();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível sair.'
      );
    }
  }

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#030605] text-sm font-semibold text-zinc-500">
        Carregando sessão...
      </main>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden bg-[#030605] text-white">
      <StadiumBackground />

      <div className="relative z-20 mx-auto max-w-[1500px] px-4 pt-4 sm:px-8 sm:pt-6">
        <header className="relative overflow-hidden rounded-[28px] border border-white/[0.08] bg-[#050705]/[0.94] shadow-2xl shadow-black/40 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(163,230,53,.12),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(34,211,238,.07),transparent_28%),linear-gradient(180deg,rgba(255,255,255,.025),transparent_70%)]" />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="relative px-4 py-5 sm:px-6 sm:py-6">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-zinc-600 sm:text-[10px]">
                  Elenco oficial
                </p>

                <h1 className="font-display mt-2 text-[29px] font-black leading-none tracking-[-0.035em] text-white sm:text-[38px]">
                  Racha da <span className="text-lime-400">Terça</span>
                </h1>

                <p className="mt-2 hidden text-sm text-zinc-500 sm:block">
                  Gerencie seu card e acompanhe os números do elenco.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                aria-label="Sair"
                title="Sair"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white active:scale-95"
              >
                <LogOut size={18} />
              </button>
            </div>

            <div
              className={`mt-5 grid gap-2.5 ${
                isAdmin
                  ? 'grid-cols-2 sm:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {isAdmin && (
                <>
                  <HeaderAction
                    icon={KeyRound}
                    eyebrow="Segurança"
                    title="Redefinir PIN"
                    description="Alterar o acesso de um jogador"
                    variant="neutral"
                    onClick={() => setResetPinOpen(true)}
                  />

                  <HeaderAction
                    icon={ShieldCheck}
                    eyebrow="Administração"
                    title="Pós-jogo"
                    description="Registrar a última partida"
                    variant="admin"
                    onClick={() => setMatchOpen(true)}
                  />
                </>
              )}

              <HeaderAction
                icon={hasPlayerCard ? Pencil : Plus}
                eyebrow="Seu jogador"
                title={
                  hasPlayerCard
                    ? 'Editar meu card'
                    : 'Criar meu card'
                }
                description={
                  hasPlayerCard
                    ? 'Alterar nome, posição e foto'
                    : 'Criar seu único card no elenco'
                }
                variant="primary"
                onClick={() => {
                  if (hasPlayerCard) {
                    setEditOpen(true);
                  } else {
                    setCreateOpen(true);
                  }
                }}
                className={
                  isAdmin
                    ? 'col-span-2 sm:col-span-1'
                    : ''
                }
              />
            </div>
          </div>
        </header>
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-4 pb-12 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="min-w-0">
          {errorMessage && (
            <p className="mb-5 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-md">
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

        <aside className="h-fit min-w-0 lg:sticky lg:top-6">
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

interface HeaderActionProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  variant: 'primary' | 'admin' | 'neutral';
  onClick: () => void;
  className?: string;
}

function HeaderAction({
  icon: Icon,
  eyebrow,
  title,
  description,
  variant,
  onClick,
  className = '',
}: HeaderActionProps) {
  const variants = {
    primary: {
      container:
        'border-lime-400/30 bg-lime-400/[0.09] hover:border-lime-400/55 hover:bg-lime-400/[0.14]',
      icon: 'bg-lime-400 text-black',
      eyebrow: 'text-lime-400/70',
    },
    admin: {
      container:
        'border-emerald-400/25 bg-emerald-400/[0.07] hover:border-emerald-400/45 hover:bg-emerald-400/[0.12]',
      icon: 'bg-emerald-400 text-black',
      eyebrow: 'text-emerald-400/70',
    },
    neutral: {
      container:
        'border-white/[0.08] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.055]',
      icon: 'bg-white/[0.08] text-zinc-300',
      eyebrow: 'text-zinc-600',
    },
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex min-h-[76px] items-center gap-3 rounded-[20px] border p-3 text-left transition active:scale-[0.99] sm:min-h-[88px] sm:p-3.5 ${variants.container} ${className}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl sm:h-12 sm:w-12 ${variants.icon}`}
      >
        <Icon size={19} />
      </span>

      <span className="min-w-0">
        <span
          className={`block text-[8px] font-extrabold uppercase tracking-[0.17em] ${variants.eyebrow}`}
        >
          {eyebrow}
        </span>

        <span className="mt-1 block truncate text-sm font-black text-white sm:text-[15px]">
          {title}
        </span>

        <span className="mt-1 hidden text-[11px] leading-relaxed text-zinc-500 sm:block">
          {description}
        </span>
      </span>
    </button>
  );
}