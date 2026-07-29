'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { KeyRound, LoaderCircle, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  formatBrazilianPhone,
  isValidBrazilianMobile,
  isValidPin,
  onlyDigits,
} from '@/lib/phone';

interface ResetPinModalProps {
  open: boolean;
  onClose: () => void;
}

export function ResetPinModal({ open, onClose }: ResetPinModalProps) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  function resetForm() {
    setPhone('');
    setPin('');
    setPinConfirmation('');
    setErrorMessage('');
    setSuccessMessage('');
  }

  function closeModal() {
    if (loading) {
      return;
    }

    resetForm();
    onClose();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isValidBrazilianMobile(phone)) {
      setErrorMessage('Informe um celular válido com DDD.');
      return;
    }

    if (!isValidPin(pin)) {
      setErrorMessage('O novo PIN precisa ter exatamente 6 números.');
      return;
    }

    if (pin !== pinConfirmation) {
      setErrorMessage('Os dois PINs não são iguais.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Sua sessão expirou. Entre novamente.');
      }

      const response = await fetch('/api/admin/reset-pin', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          pin,
        }),
      });

      const result = (await response.json()) as {
        error?: string;
        success?: boolean;
      };

      if (!response.ok) {
        throw new Error(result.error ?? 'Não foi possível redefinir o PIN.');
      }

      setPin('');
      setPinConfirmation('');
      setSuccessMessage('PIN redefinido. O jogador já pode entrar com o novo código.');
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível redefinir o PIN.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
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
            className="w-full max-w-md rounded-t-[28px] border border-white/10 bg-zinc-950 p-5 shadow-2xl sm:rounded-[28px] sm:p-7"
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-lime-400">
                  Administração
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-tight text-white">
                  Redefinir PIN
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  Use quando alguém esquecer o código de acesso.
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

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="reset-phone"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Número do jogador
                </label>
                <input
                  id="reset-phone"
                  type="tel"
                  inputMode="numeric"
                  value={formatBrazilianPhone(phone)}
                  onChange={(event) =>
                    setPhone(onlyDigits(event.target.value).slice(0, 11))
                  }
                  placeholder="(12) 99227-7250"
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-lime-400/70 focus:ring-4 focus:ring-lime-400/10"
                />
              </div>

              <div>
                <label
                  htmlFor="reset-pin"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Novo PIN
                </label>
                <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-black/40 px-4 transition focus-within:border-lime-400/70 focus-within:ring-4 focus-within:ring-lime-400/10">
                  <KeyRound size={17} className="mr-3 text-zinc-600" />
                  <input
                    id="reset-pin"
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(event) =>
                      setPin(onlyDigits(event.target.value).slice(0, 6))
                    }
                    maxLength={6}
                    className="min-w-0 flex-1 bg-transparent text-lg font-black tracking-[0.3em] text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reset-pin-confirmation"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Confirme o novo PIN
                </label>
                <input
                  id="reset-pin-confirmation"
                  type="password"
                  inputMode="numeric"
                  value={pinConfirmation}
                  onChange={(event) =>
                    setPinConfirmation(
                      onlyDigits(event.target.value).slice(0, 6)
                    )
                  }
                  maxLength={6}
                  className="h-12 w-full rounded-2xl border border-white/10 bg-black/40 px-4 text-lg font-black tracking-[0.3em] text-white outline-none transition focus:border-lime-400/70 focus:ring-4 focus:ring-lime-400/10"
                />
              </div>

              {errorMessage && (
                <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              {successMessage && (
                <p className="rounded-xl border border-lime-400/20 bg-lime-400/10 px-3 py-2 text-sm text-lime-300">
                  {successMessage}
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
                Fechar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 font-extrabold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <LoaderCircle size={18} className="animate-spin" />}
                Redefinir
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
