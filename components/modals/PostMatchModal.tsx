'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createMatchWithStats } from '@/lib/supabase/queries';
import { Player } from '@/types';

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
  onSaved: () => void;
}

export function PostMatchModal({ open, players, onClose, onSaved }: PostMatchModalProps) {
  const [matchDate, setMatchDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [rows, setRows] = useState<Record<string, PlayerStatRow>>({});
  const [saving, setSaving] = useState(false);

  function updateRow(playerId: string, patch: Partial<PlayerStatRow>) {
  setRows((prev) => {
    const existing: PlayerStatRow = prev[playerId] ?? {
      player_id: playerId,
      goals: 0,
      assists: 0,
      tackles: 0,
      saves: 0,
      is_motm: false,
    };

    return {
      ...prev,
      [playerId]: { ...existing, ...patch },
    };
  });
}

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const statsList = Object.values(rows).filter(
        (r) => r.goals || r.assists || r.tackles || r.saves || r.is_motm
      );
      await createMatchWithStats(matchDate, statsList);
      onSaved();
      onClose();
      setRows({});
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-700 p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Pós-jogo</h2>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Data</label>
              <input
                type="date"
                value={matchDate}
                onChange={(e) => setMatchDate(e.target.value)}
                className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-lime-400"
              />
            </div>

            <div className="space-y-2">
              {players.map((player) => {
                const row = rows[player.id];
                return (
                  <div
                    key={player.id}
                    className="flex flex-col gap-2 sm:grid sm:grid-cols-6 sm:items-center bg-zinc-800/50 rounded-lg p-3"
                  >
                    <span className="text-sm text-white truncate sm:col-span-2">
                      {player.nickname ?? player.name}
                    </span>
                    <div className="flex flex-wrap items-center gap-3 sm:contents">
                      <StatInput
                        label="Gols"
                        value={row?.goals ?? 0}
                        onChange={(v) => updateRow(player.id, { goals: v })}
                      />
                      <StatInput
                        label="Assist"
                        value={row?.assists ?? 0}
                        onChange={(v) => updateRow(player.id, { assists: v })}
                      />
                      <StatInput
                        label="Desarmes"
                        value={row?.tackles ?? 0}
                        onChange={(v) => updateRow(player.id, { tackles: v })}
                      />
                      <button
                        type="button"
                        onClick={() => updateRow(player.id, { is_motm: !row?.is_motm })}
                        className={`text-xs px-2 py-1 rounded-full border ${
                          row?.is_motm
                            ? 'bg-lime-400 text-black border-lime-400'
                            : 'border-zinc-600 text-zinc-400'
                        }`}
                      >
                        Craque
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-zinc-400 hover:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 disabled:opacity-50"
              >
                {saving ? 'Salvando...' : 'Salvar jogo'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StatInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 text-center rounded-md bg-zinc-900 border border-zinc-700 text-white py-1 outline-none focus:border-lime-400"
      />
      <span className="text-[10px] text-zinc-500 mt-1">{label}</span>
    </div>
  );
}