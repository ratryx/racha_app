'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { createPlayer } from '@/lib/supabase/queries';
import { PlayerPosition } from '@/types';

const POSITIONS: PlayerPosition[] = ['GOL', 'ZAG', 'LAT', 'MEI', 'ATA'];

interface CreatePlayerModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export function CreatePlayerModal({ open, onClose, onCreated }: CreatePlayerModalProps) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [position, setPosition] = useState<PlayerPosition>('MEI');
  const [photoFile, setPhotoFile] = useState<File | undefined>();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createPlayer({ name, nickname, position, photoFile });
      onCreated();
      onClose();
      setName('');
      setNickname('');
      setPhotoFile(undefined);
    } finally {
      setLoading(false);
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
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-white">Novo card</h2>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Nome</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-lime-400"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Apelido (aparece no card)</label>
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-white outline-none focus:border-lime-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Posição</label>
              <div className="flex flex-wrap gap-2">
                {POSITIONS.map((pos) => (
                  <button
                    type="button"
                    key={pos}
                    onClick={() => setPosition(pos)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      position === pos
                        ? 'bg-lime-400 text-black border-lime-400'
                        : 'border-zinc-700 text-zinc-300 hover:border-lime-400/60'
                    }`}
                  >
                    {pos}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm text-zinc-400">Foto</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setPhotoFile(e.target.files?.[0])}
                className="w-full text-sm text-zinc-300 file:mr-3 file:rounded-lg file:border-0 file:bg-zinc-800 file:px-3 file:py-2 file:text-lime-400"
              />
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
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-lime-400 text-black font-semibold hover:bg-lime-300 disabled:opacity-50"
              >
                {loading ? 'Criando...' : 'Criar card'}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}