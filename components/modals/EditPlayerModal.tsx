'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { updateMyPlayer } from '@/lib/supabase/queries';
import type { Player } from '@/types';

interface EditPlayerModalProps {
  open: boolean;
  player: Player | null;
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
}

export function EditPlayerModal({
  open,
  player,
  onClose,
  onUpdated,
}: EditPlayerModalProps) {
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [photoFile, setPhotoFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open || !player) {
      return;
    }

    setName(player.name);
    setNickname(player.nickname ?? '');
    setPhotoFile(undefined);
    setErrorMessage('');
  }, [open, player]);

  function closeModal() {
    if (!loading) {
      onClose();
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!player) {
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      await updateMyPlayer({
        name,
        nickname,
        currentPhotoUrl: player.photo_url,
        photoFile,
      });

      await onUpdated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Não foi possível editar o card.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && player && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
        >
          <motion.form
            onSubmit={handleSubmit}
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 50, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="w-full max-w-lg rounded-t-[28px] border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:rounded-[28px] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-400">
                  Seu jogador
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Editar card
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  A posição e as estatísticas não podem ser alteradas aqui.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-xl border border-white/10 p-2 text-zinc-400 transition hover:bg-white/5 hover:text-white"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="edit-player-name" className="mb-2 block text-sm text-zinc-400">
                  Nome
                </label>
                <input
                  id="edit-player-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={60}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-lime-400/70 focus:ring-4 focus:ring-lime-400/10"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="edit-player-nickname"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Nome no card
                </label>
                <input
                  id="edit-player-nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  maxLength={24}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition focus:border-lime-400/70 focus:ring-4 focus:ring-lime-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-player-photo"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Nova foto
                </label>
                <label
                  htmlFor="edit-player-photo"
                  className="flex min-h-24 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-white/15 bg-white/[0.025] px-4 py-4 transition hover:border-lime-400/50 hover:bg-lime-400/[0.04]"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400/10 text-lime-400">
                    <ImagePlus size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-white">
                      {photoFile?.name ?? 'Manter foto atual'}
                    </span>
                    <span className="mt-1 block text-xs text-zinc-500">
                      Selecione um arquivo apenas para substituir.
                    </span>
                  </span>
                </label>
                <input
                  id="edit-player-photo"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(event) => setPhotoFile(event.target.files?.[0])}
                  className="sr-only"
                />
              </div>

              {errorMessage && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}
            </div>

            <div className="mt-7 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={loading}
                className="flex-1 rounded-2xl border border-white/10 px-4 py-3 font-semibold text-zinc-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 font-extrabold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle size={18} className="animate-spin" />}
                Salvar
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
