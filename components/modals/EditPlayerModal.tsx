'use client';

import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  ImagePlus,
  LoaderCircle,
  MapPin,
  UserRound,
  X,
} from 'lucide-react';
import { updateMyPlayer } from '@/lib/supabase/queries';
import type { Player, PlayerPosition } from '@/types';

const POSITIONS: Array<{
  value: PlayerPosition;
  label: string;
}> = [
  { value: 'GOL', label: 'Goleiro' },
  { value: 'ZAG', label: 'Zagueiro' },
  { value: 'LAT', label: 'Lateral' },
  { value: 'MEI', label: 'Meia' },
  { value: 'ATA', label: 'Atacante' },
];

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
  const [position, setPosition] = useState<PlayerPosition>('MEI');
  const [photoFile, setPhotoFile] = useState<File>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open || !player) {
      return;
    }

    setName(player.name);
    setNickname(player.nickname ?? '');
    setPosition(player.position);
    setPhotoFile(undefined);
    setErrorMessage('');
  }, [open, player]);

  const previewUrl = useMemo(() => {
    if (photoFile) {
      return URL.createObjectURL(photoFile);
    }

    return player?.photo_url ?? null;
  }, [photoFile, player?.photo_url]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

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
        position,
        currentPhotoUrl: player.photo_url,
        photoFile,
      });

      await onUpdated();
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível editar o card.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && player && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 p-0 backdrop-blur-md sm:items-center sm:p-4"
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
            className="max-h-[94vh] w-full max-w-xl overflow-y-auto rounded-t-[28px] border border-white/10 bg-[#090b0a] p-5 shadow-2xl shadow-black/60 sm:rounded-[28px] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.24em] text-lime-400">
                  Seu jogador
                </p>
                <h2 className="font-display mt-2 text-3xl font-black uppercase tracking-[0.02em] text-white">
                  Editar meu card
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Você pode alterar nome, posição e foto. As estatísticas continuam protegidas.
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:bg-white/5 hover:text-white"
                aria-label="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-zinc-900">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="Prévia da foto"
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-zinc-700">
                    <UserRound size={34} />
                  </div>
                )}
                <span className="absolute bottom-1.5 right-1.5 flex h-7 w-7 items-center justify-center rounded-lg bg-black/75 text-lime-400 backdrop-blur-md">
                  <Camera size={13} />
                </span>
              </div>

              <div className="min-w-0">
                <p className="truncate text-lg font-black text-white">
                  {nickname.trim() || name.trim() || 'Seu nome'}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.16em] text-zinc-600">
                  <MapPin size={12} />
                  {position}
                </p>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="edit-player-name"
                  className="mb-2 block text-sm font-semibold text-zinc-400"
                >
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
                  className="mb-2 block text-sm font-semibold text-zinc-400"
                >
                  Nome exibido no card
                </label>
                <input
                  id="edit-player-nickname"
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  maxLength={24}
                  placeholder="Deixe vazio para usar o nome"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-zinc-700 focus:border-lime-400/70 focus:ring-4 focus:ring-lime-400/10"
                />
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-zinc-400">
                  Posição
                </legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {POSITIONS.map((item) => (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setPosition(item.value)}
                      className={`rounded-2xl border px-3 py-3 text-center transition ${
                        position === item.value
                          ? 'border-lime-400 bg-lime-400 text-black'
                          : 'border-white/[0.08] bg-white/[0.025] text-zinc-400 hover:border-lime-400/30 hover:text-white'
                      }`}
                    >
                      <span className="block text-sm font-black">{item.value}</span>
                      <span
                        className={`mt-1 block text-[8px] font-bold uppercase tracking-[0.12em] ${
                          position === item.value
                            ? 'text-black/60'
                            : 'text-zinc-700'
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div>
                <label
                  htmlFor="edit-player-photo"
                  className="mb-2 block text-sm font-semibold text-zinc-400"
                >
                  Foto
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
                      JPG, PNG ou WEBP. Máximo de 5 MB.
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
                Salvar alterações
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
