'use client';

import {
  useEffect,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  BarChart3,
  CheckCircle2,
  LoaderCircle,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';

import type {
  FutsalSessionDetails,
} from '@/types';
import {
  completeFutsalSession,
  deleteFutsalGame,
  reopenFutsalSession,
} from '@/lib/supabase/matchCenter';
import { formatSessionDate } from '@/lib/matchCenter/format';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { ScoreEntryPanel } from './ScoreEntryPanel';
import { SessionGamesList } from './SessionGamesList';
import { SessionStandings } from './SessionStandings';
import { TeamRosterGrid } from './TeamRosterGrid';

interface SessionDetailsModalProps {
  open: boolean;
  session: FutsalSessionDetails | null;
  isAdmin: boolean;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
  onOpenPostMatch: () => void;
}

export function SessionDetailsModal({
  open,
  session,
  isAdmin,
  onClose,
  onChanged,
  onOpenPostMatch,
}: SessionDetailsModalProps) {
  const [working, setWorking] =
    useState(false);
  const [
    deletingGameId,
    setDeletingGameId,
  ] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  if (!session) {
    return null;
  }

  const activeSession = session;

  async function toggleStatus() {
    if (working) {
      return;
    }

    setWorking(true);
    setErrorMessage('');

    try {
      if (
        activeSession.status ===
        'completed'
      ) {
        await reopenFutsalSession(
          activeSession.id
        );
      } else {
        await completeFutsalSession(
          activeSession.id
        );
      }

      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar a sessão.'
      );
    } finally {
      setWorking(false);
    }
  }

  async function removeGame(
    gameId: string
  ) {
    const confirmed = window.confirm(
      'Excluir este placar? A classificação será recalculada.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingGameId(gameId);
    setErrorMessage('');

    try {
      await deleteFutsalGame(gameId);
      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a partida.'
      );
    } finally {
      setDeletingGameId(null);
    }
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-stretch justify-center bg-black/90 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Detalhes do racha"
              initial={{
                opacity: 0,
                y: 28,
                scale: 0.99,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 28,
                scale: 0.99,
              }}
              transition={{
                duration: 0.22,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="flex h-[100dvh] w-full max-w-6xl flex-col overflow-hidden bg-[#070a08] shadow-2xl shadow-black/90 sm:h-auto sm:max-h-[92vh] sm:rounded-[30px] sm:border sm:border-white/[0.12]"
            >
              <header className="relative shrink-0 border-b border-white/[0.10] bg-[#070a08]/98 px-5 py-5 backdrop-blur-xl sm:px-7">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(163,230,53,.09),transparent_42%)]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.13em] text-lime-300">
                      {formatSessionDate(
                        activeSession.session_date
                      )}
                    </p>

                    <h2 className="mt-2 text-2xl font-black text-white">
                      {activeSession.location ||
                        'Racha do grupo'}
                    </h2>

                    <p className="mt-1.5 text-sm text-zinc-400">
                      {
                        activeSession.teams
                          .length
                      }{' '}
                      times ·{' '}
                      {
                        activeSession.games
                          .length
                      }{' '}
                      partidas
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.11] bg-black/25 text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <X size={19} />
                  </button>
                </div>
              </header>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
                {errorMessage && (
                  <p className="mb-4 rounded-2xl border border-red-300/20 bg-red-950/55 px-4 py-3 text-sm text-red-200">
                    {errorMessage}
                  </p>
                )}

                <div className="space-y-4">
                  {isAdmin &&
                    activeSession.status ===
                      'active' && (
                      <ScoreEntryPanel
                        session={
                          activeSession
                        }
                        onSaved={
                          onChanged
                        }
                      />
                    )}

                  <SessionStandings
                    session={
                      activeSession
                    }
                  />

                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(340px,.72fr)]">
                    <TeamRosterGrid
                      session={
                        activeSession
                      }
                    />

                    <SessionGamesList
                      session={
                        activeSession
                      }
                      isAdmin={
                        isAdmin &&
                        activeSession.status ===
                          'active'
                      }
                      deletingGameId={
                        deletingGameId
                      }
                      onDeleteGame={
                        removeGame
                      }
                    />
                  </div>

                  {isAdmin && (
                    <section className="grid gap-3 rounded-[22px] border border-white/[0.10] bg-black/25 p-4 sm:grid-cols-2">
                      <button
                        type="button"
                        onClick={() =>
                          void toggleStatus()
                        }
                        disabled={working}
                        className={`flex min-h-12 items-center justify-center gap-2 rounded-2xl border text-sm font-black transition disabled:opacity-40 ${
                          activeSession.status ===
                          'completed'
                            ? 'border-amber-300/25 bg-amber-300/[0.08] text-amber-100'
                            : 'border-emerald-300/25 bg-emerald-300/[0.08] text-emerald-100'
                        }`}
                      >
                        {working ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : activeSession.status ===
                          'completed' ? (
                          <RotateCcw
                            size={17}
                          />
                        ) : (
                          <CheckCircle2
                            size={17}
                          />
                        )}

                        {activeSession.status ===
                        'completed'
                          ? 'Reabrir sessão'
                          : 'Finalizar racha'}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onOpenPostMatch();
                        }}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-300/25 bg-cyan-300/[0.08] text-sm font-black text-cyan-100 transition hover:bg-cyan-300/[0.13]"
                      >
                        <BarChart3
                          size={17}
                        />
                        Estatísticas individuais
                      </button>

                      <div className="flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-xs leading-5 text-zinc-500 sm:col-span-2">
                        <ShieldCheck
                          size={15}
                          className="shrink-0"
                        />
                        Os placares desta sessão
                        ainda não alteram o
                        overall. Essa integração
                        entra no Overall V2.
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
