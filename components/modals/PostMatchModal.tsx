'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
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
  tackles: number;
  saves: number;
  is_motm: boolean;
}

interface PostMatchModalProps {
  open: boolean;
  players: Player[];
  onClose: () => void;
  onSaved: () => void | Promise<void>;
}

type StatKey = 'goals' | 'assists' | 'tackles' | 'saves';

const EMPTY_STATS: Omit<PlayerStatRow, 'player_id' | 'is_motm'> = {
  goals: 0,
  assists: 0,
  tackles: 0,
  saves: 0,
};

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
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [motmPlayerId, setMotmPlayerId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const selectedPlayers = useMemo(
    () => players.filter((player) => Boolean(rows[player.id])),
    [players, rows]
  );

  const totals = useMemo(() => {
    return Object.values(rows).reduce(
      (result, row) => ({
        goals: result.goals + row.goals,
        assists: result.assists + row.assists,
        tackles: result.tackles + row.tackles,
        saves: result.saves + row.saves,
      }),
      { goals: 0, assists: 0, tackles: 0, saves: 0 }
    );
  }, [rows]);

  function createRow(playerId: string): PlayerStatRow {
    return {
      player_id: playerId,
      ...EMPTY_STATS,
      is_motm: false,
    };
  }

  function togglePlayer(playerId: string) {
    setErrorMessage('');

    setRows((currentRows) => {
      if (currentRows[playerId]) {
        const nextRows = { ...currentRows };
        delete nextRows[playerId];
        return nextRows;
      }

      return {
        ...currentRows,
        [playerId]: createRow(playerId),
      };
    });

    setExpandedPlayerId((current) =>
      current === playerId ? null : playerId
    );

    if (motmPlayerId === playerId) {
      setMotmPlayerId(null);
    }
  }

  function updateStat(playerId: string, stat: StatKey, difference: number) {
    setRows((currentRows) => {
      const currentRow = currentRows[playerId] ?? createRow(playerId);
      const nextValue = Math.max(0, Math.min(99, currentRow[stat] + difference));

      return {
        ...currentRows,
        [playerId]: {
          ...currentRow,
          [stat]: nextValue,
        },
      };
    });
  }

  function selectMotm(playerId: string) {
    const nextMotm = motmPlayerId === playerId ? null : playerId;
    setMotmPlayerId(nextMotm);

    setRows((currentRows) => {
      const nextRows: Record<string, PlayerStatRow> = {};

      for (const [id, row] of Object.entries(currentRows)) {
        nextRows[id] = {
          ...row,
          is_motm: id === nextMotm,
        };
      }

      return nextRows;
    });
  }

  function resetForm() {
    setRows({});
    setMotmPlayerId(null);
    setExpandedPlayerId(null);
    setErrorMessage('');
    setMatchDate(new Date().toISOString().slice(0, 10));
  }

  function closeModal() {
    if (!saving) {
      onClose();
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');

    const statsList = Object.values(rows);

    if (statsList.length === 0) {
      setErrorMessage('Selecione pelo menos um jogador que participou da partida.');
      return;
    }

    setSaving(true);

    try {
      await createMatchWithStats(matchDate, statsList);
      await onSaved();
      resetForm();
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
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 48, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 48, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#090b0a] shadow-2xl shadow-black/60 sm:max-h-[90vh] sm:rounded-[28px]"
          >
            <header className="flex shrink-0 items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2 text-lime-400">
                  <ShieldCheck size={15} />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.24em]">
                    Administração
                  </p>
                </div>
                <h2 className="font-display mt-2 text-3xl font-black uppercase tracking-[0.02em] text-white">
                  Lançar pós-jogo
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Selecione quem jogou e registre os números da partida.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </header>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-hidden lg:grid-cols-[1fr_270px]">
              <section className="min-h-0 overflow-y-auto px-4 py-5 sm:px-6">
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                      <CalendarDays size={18} />
                    </span>
                    <div>
                      <label
                        htmlFor="match-date"
                        className="block text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-600"
                      >
                        Data da partida
                      </label>
                      <input
                        id="match-date"
                        type="date"
                        value={matchDate}
                        onChange={(event) => setMatchDate(event.target.value)}
                        className="mt-1 bg-transparent text-sm font-bold text-white outline-none [color-scheme:dark]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Users size={15} />
                    <span>
                      <strong className="text-zinc-200">{selectedPlayers.length}</strong>{' '}
                      participantes
                    </span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {players.map((player) => {
                    const row = rows[player.id];
                    const selected = Boolean(row);
                    const expanded = expandedPlayerId === player.id;
                    const isMotm = motmPlayerId === player.id;
                    const displayName = player.nickname?.trim() || player.name;

                    return (
                      <article
                        key={player.id}
                        className={`overflow-hidden rounded-[20px] border transition ${
                          selected
                            ? 'border-lime-400/25 bg-lime-400/[0.035]'
                            : 'border-white/[0.07] bg-white/[0.02]'
                        }`}
                      >
                        <div className="flex min-h-[72px] items-center gap-3 px-3 py-3 sm:px-4">
                          <button
                            type="button"
                            onClick={() => togglePlayer(player.id)}
                            aria-label={
                              selected
                                ? `Remover ${displayName} da partida`
                                : `Adicionar ${displayName} à partida`
                            }
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border transition ${
                              selected
                                ? 'border-lime-400 bg-lime-400 text-black'
                                : 'border-white/15 text-transparent hover:border-lime-400/50'
                            }`}
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>

                          <PlayerPhoto player={player} />

                          <button
                            type="button"
                            onClick={() => {
                              if (!selected) {
                                togglePlayer(player.id);
                                return;
                              }

                              setExpandedPlayerId(expanded ? null : player.id);
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate text-sm font-extrabold text-white">
                              {displayName}
                            </p>
                            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.18em] text-zinc-600">
                              {player.position}
                            </p>
                          </button>

                          {selected && (
                            <div className="hidden items-center gap-1.5 sm:flex">
                              <CompactStat label="G" value={row.goals} />
                              <CompactStat label="A" value={row.assists} />
                              <CompactStat
                                label={player.position === 'GOL' ? 'DEF' : 'DES'}
                                value={
                                  player.position === 'GOL'
                                    ? row.saves
                                    : row.tackles
                                }
                              />
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={!selected}
                            onClick={() =>
                              setExpandedPlayerId(expanded ? null : player.id)
                            }
                            aria-label={expanded ? 'Recolher estatísticas' : 'Abrir estatísticas'}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-20"
                          >
                            {expanded ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
                          </button>
                        </div>

                        <AnimatePresence initial={false}>
                          {selected && expanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-white/[0.06] px-3 pb-4 pt-3 sm:px-4">
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                  <StatStepper
                                    label="Gols"
                                    value={row.goals}
                                    onDecrease={() => updateStat(player.id, 'goals', -1)}
                                    onIncrease={() => updateStat(player.id, 'goals', 1)}
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
                                    label="Desarmes"
                                    value={row.tackles}
                                    onDecrease={() =>
                                      updateStat(player.id, 'tackles', -1)
                                    }
                                    onIncrease={() =>
                                      updateStat(player.id, 'tackles', 1)
                                    }
                                  />
                                  <StatStepper
                                    label="Defesas"
                                    value={row.saves}
                                    onDecrease={() => updateStat(player.id, 'saves', -1)}
                                    onIncrease={() => updateStat(player.id, 'saves', 1)}
                                    emphasized={player.position === 'GOL'}
                                  />
                                </div>

                                <button
                                  type="button"
                                  onClick={() => selectMotm(player.id)}
                                  className={`mt-3 flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
                                    isMotm
                                      ? 'border-amber-300/50 bg-amber-300/10 text-amber-200'
                                      : 'border-white/[0.07] bg-black/20 text-zinc-500 hover:border-amber-300/25 hover:text-zinc-300'
                                  }`}
                                >
                                  <span className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.14em]">
                                    <Crown size={15} />
                                    Craque da partida
                                  </span>
                                  <span className="text-[10px] font-bold uppercase tracking-[0.16em]">
                                    {isMotm ? 'Selecionado' : 'Marcar'}
                                  </span>
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </article>
                    );
                  })}
                </div>
              </section>

              <aside className="hidden border-l border-white/[0.07] bg-black/20 p-5 lg:block">
                <p className="text-[9px] font-extrabold uppercase tracking-[0.24em] text-zinc-600">
                  Resumo da partida
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <SummaryValue label="Jogadores" value={selectedPlayers.length} />
                  <SummaryValue label="Gols" value={totals.goals} />
                  <SummaryValue label="Assist." value={totals.assists} />
                  <SummaryValue label="Desarmes" value={totals.tackles} />
                  <SummaryValue label="Defesas" value={totals.saves} />
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                  <div className="flex items-center gap-2 text-amber-300">
                    <Crown size={15} />
                    <p className="text-[9px] font-extrabold uppercase tracking-[0.18em]">
                      Craque
                    </p>
                  </div>
                  <p className="mt-3 truncate text-sm font-extrabold text-white">
                    {motmPlayerId
                      ? getPlayerName(players, motmPlayerId)
                      : 'Não selecionado'}
                  </p>
                </div>

                <p className="mt-5 text-xs leading-relaxed text-zinc-600">
                  Todo jogador selecionado contará como participante, mesmo que termine com zero estatísticas.
                </p>
              </aside>
            </div>

            <footer className="shrink-0 border-t border-white/[0.07] bg-[#090b0a]/95 px-4 py-4 backdrop-blur-md sm:px-6">
              {errorMessage && (
                <p className="mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="hidden text-xs text-zinc-600 sm:block">
                  {selectedPlayers.length === 0
                    ? 'Nenhum participante selecionado'
                    : `${selectedPlayers.length} jogador${
                        selectedPlayers.length === 1 ? '' : 'es'
                      } na partida`}
                </div>

                <div className="flex w-full gap-3 sm:w-auto">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-zinc-400 transition hover:bg-white/5 hover:text-white disabled:opacity-50 sm:flex-none"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || selectedPlayers.length === 0}
                    className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-40 sm:flex-none"
                  >
                    {saving && <LoaderCircle size={17} className="animate-spin" />}
                    {saving ? 'Salvando...' : 'Salvar partida'}
                  </button>
                </div>
              </div>
            </footer>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerPhoto({ player }: { player: Player }) {
  const displayName = player.nickname?.trim() || player.name;

  if (!player.photo_url) {
    return (
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.07] bg-zinc-900 text-sm font-black text-zinc-500">
        {displayName.slice(0, 1).toUpperCase()}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={player.photo_url}
      alt=""
      className="h-11 w-11 shrink-0 rounded-xl border border-white/[0.08] object-cover object-top"
    />
  );
}

function StatStepper({
  label,
  value,
  onDecrease,
  onIncrease,
  emphasized = false,
}: {
  label: string;
  value: number;
  onDecrease: () => void;
  onIncrease: () => void;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-2.5 ${
        emphasized
          ? 'border-cyan-400/20 bg-cyan-400/[0.045]'
          : 'border-white/[0.07] bg-black/20'
      }`}
    >
      <p className="truncate text-center text-[8px] font-extrabold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
      <div className="mt-2 flex items-center justify-between gap-1">
        <button
          type="button"
          onClick={onDecrease}
          disabled={value <= 0}
          aria-label={`Diminuir ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-500 transition hover:bg-white/5 hover:text-white disabled:opacity-20"
        >
          <Minus size={14} />
        </button>
        <span className="w-8 text-center text-lg font-black tabular-nums text-white">
          {value}
        </span>
        <button
          type="button"
          onClick={onIncrease}
          aria-label={`Aumentar ${label}`}
          className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/[0.06] text-zinc-300 transition hover:bg-lime-400 hover:text-black"
        >
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

function CompactStat({ label, value }: { label: string; value: number }) {
  return (
    <span className="flex min-w-10 items-baseline justify-center gap-1 rounded-lg bg-black/25 px-2 py-1.5">
      <strong className="text-xs tabular-nums text-zinc-200">{value}</strong>
      <span className="text-[7px] font-extrabold uppercase tracking-wider text-zinc-600">
        {label}
      </span>
    </span>
  );
}

function SummaryValue({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3">
      <p className="text-2xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function getPlayerName(players: Player[], playerId: string): string {
  const player = players.find((item) => item.id === playerId);
  return player?.nickname?.trim() || player?.name || 'Jogador';
}
