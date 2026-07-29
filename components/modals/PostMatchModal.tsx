'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  Crown,
  LoaderCircle,
  Minus,
  Plus,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { createMatchWithStats } from '@/lib/supabase/queries';
import type { Player } from '@/types';

interface PlayerStatRow {
  player_id: string;
  goals: number;
  assists: number;
  saves: number;
  is_motm: boolean;
}

interface PostMatchModalProps {
  open: boolean;
  players: Player[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

type StatKey = 'goals' | 'assists' | 'saves';

export function PostMatchModal({
  open,
  players,
  onClose,
  onSaved,
}: PostMatchModalProps) {
  const [matchDate, setMatchDate] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [rows, setRows] = useState<Record<string, PlayerStatRow>>({});
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedPlayers = useMemo(
    () => players.filter((player) => Boolean(rows[player.id])),
    [players, rows]
  );

  const totals = useMemo(
    () =>
      Object.values(rows).reduce(
        (total, row) => ({
          goals: total.goals + row.goals,
          assists: total.assists + row.assists,
          saves: total.saves + row.saves,
        }),
        { goals: 0, assists: 0, saves: 0 }
      ),
    [rows]
  );

  function createRow(playerId: string): PlayerStatRow {
    return {
      player_id: playerId,
      goals: 0,
      assists: 0,
      saves: 0,
      is_motm: false,
    };
  }

  function togglePlayer(playerId: string) {
    setRows((current) => {
      if (current[playerId]) {
        const next = { ...current };
        delete next[playerId];
        return next;
      }

      return {
        ...current,
        [playerId]: createRow(playerId),
      };
    });
  }

  function updateStat(
    playerId: string,
    stat: StatKey,
    difference: number
  ) {
    setRows((current) => {
      const row = current[playerId] ?? createRow(playerId);

      return {
        ...current,
        [playerId]: {
          ...row,
          [stat]: Math.max(
            0,
            Math.min(99, row[stat] + difference)
          ),
        },
      };
    });
  }

  function selectMotm(playerId: string) {
    setRows((current) => {
      const next: Record<string, PlayerStatRow> = {};

      for (const [id, row] of Object.entries(current)) {
        next[id] = {
          ...row,
          is_motm: id === playerId ? !row.is_motm : false,
        };
      }

      return next;
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');

    const selectedRows = Object.values(rows);

    if (!selectedRows.length) {
      setErrorMessage('Selecione pelo menos um participante.');
      return;
    }

    setSaving(true);

    try {
      await createMatchWithStats(
        matchDate,
        selectedRows.map((row) => ({
          ...row,
          tackles: 0,
        }))
      );

      await onSaved();
      setRows({});
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível salvar o pós-jogo.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !saving && onClose()}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 34, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 34, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="flex max-h-[94vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#090b0a] shadow-2xl sm:max-h-[90vh] sm:rounded-[28px]"
          >
            <header className="flex items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2 text-lime-400">
                  <ShieldCheck size={15} />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.24em]">
                    Administração
                  </p>
                </div>
                <h2 className="font-display mt-2 text-3xl font-black uppercase text-white">
                  Lançar pós-jogo
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Participação, gols, assistências, defesas e craque.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <label className="flex items-center gap-3">
                  <CalendarDays size={18} className="text-lime-400" />
                  <span>
                    <span className="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-600">
                      Data
                    </span>
                    <input
                      type="date"
                      value={matchDate}
                      max={new Date().toISOString().slice(0, 10)}
                      onChange={(event) =>
                        setMatchDate(event.target.value)
                      }
                      className="mt-1 bg-transparent text-sm font-bold text-white outline-none [color-scheme:dark]"
                    />
                  </span>
                </label>

                <span className="flex items-center gap-2 text-xs text-zinc-500">
                  <Users size={15} />
                  {selectedPlayers.length} participantes
                </span>
              </div>

              <div className="space-y-2.5">
                {players.map((player) => {
                  const row = rows[player.id];
                  const selected = Boolean(row);
                  const displayName =
                    player.nickname?.trim() || player.name;

                  return (
                    <article
                      key={player.id}
                      className={`rounded-[20px] border p-3 transition ${
                        selected
                          ? 'border-lime-400/25 bg-lime-400/[0.04]'
                          : 'border-white/[0.07] bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => togglePlayer(player.id)}
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition ${
                            selected
                              ? 'border-lime-400 bg-lime-400 text-black'
                              : 'border-white/15 text-transparent'
                          }`}
                          aria-label={
                            selected
                              ? `Remover ${displayName}`
                              : `Adicionar ${displayName}`
                          }
                        >
                          <Check size={16} strokeWidth={3} />
                        </button>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-extrabold text-white">
                            {displayName}
                          </p>
                          <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.16em] text-zinc-600">
                            {player.position}
                          </p>
                        </div>

                        {selected && (
                          <button
                            type="button"
                            onClick={() => selectMotm(player.id)}
                            className={`flex h-9 items-center gap-1.5 rounded-xl border px-3 text-xs font-extrabold transition ${
                              row.is_motm
                                ? 'border-amber-300/40 bg-amber-300/10 text-amber-200'
                                : 'border-white/10 text-zinc-500'
                            }`}
                          >
                            <Crown size={14} />
                            Craque
                          </button>
                        )}
                      </div>

                      {selected && (
                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-white/[0.06] pt-3">
                          <StatStepper
                            label="Gols"
                            value={row.goals}
                            onDecrease={() =>
                              updateStat(player.id, 'goals', -1)
                            }
                            onIncrease={() =>
                              updateStat(player.id, 'goals', 1)
                            }
                          />
                          <StatStepper
                            label="Assistências"
                            value={row.assists}
                            onDecrease={() =>
                              updateStat(player.id, 'assists', -1)
                            }
                            onIncrease={() =>
                              updateStat(player.id, 'assists', 1)
                            }
                          />
                          <StatStepper
                            label="Defesas"
                            value={row.saves}
                            onDecrease={() =>
                              updateStat(player.id, 'saves', -1)
                            }
                            onIncrease={() =>
                              updateStat(player.id, 'saves', 1)
                            }
                          />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            </div>

            <footer className="border-t border-white/[0.07] bg-[#090b0a]/95 p-4 sm:px-6">
              {errorMessage && (
                <p className="mb-3 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <div className="mb-3 flex gap-4 text-xs text-zinc-500">
                <span>Gols: {totals.goals}</span>
                <span>Assist.: {totals.assists}</span>
                <span>Defesas: {totals.saves}</span>
              </div>

              <button
                type="submit"
                disabled={saving || selectedPlayers.length === 0}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 font-extrabold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                {saving ? 'Salvando...' : 'Salvar pós-jogo'}
              </button>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatStepper({
  label,
  value,
  onDecrease,
  onIncrease,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-black/20 p-2 text-center">
      <p className="truncate text-[8px] font-extrabold uppercase tracking-[0.12em] text-zinc-600">
        {label}
      </p>

      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={onDecrease}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-zinc-400 active:scale-95"
        >
          <Minus size={14} />
        </button>

        <strong className="min-w-6 text-lg tabular-nums text-white">
          {value}
        </strong>

        <button
          type="button"
          onClick={onIncrease}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.07] text-white active:scale-95"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
