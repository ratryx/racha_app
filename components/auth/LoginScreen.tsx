'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LoaderCircle,
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  UserRoundPlus,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import {
  formatBrazilianPhone,
  isValidBrazilianMobile,
  isValidPin,
  onlyDigits,
  toBrazilianE164,
} from '@/lib/phone';

type Mode = 'login' | 'register';

function friendlyAuthMessage(message: string, mode: Mode): string {
  const normalized = message.toLowerCase();

  if (
    normalized.includes('invalid login credentials') ||
    normalized.includes('invalid credentials')
  ) {
    return 'Número ou PIN incorreto.';
  }

  if (
    normalized.includes('user already registered') ||
    normalized.includes('already been registered')
  ) {
    return 'Este número já possui acesso. Use a opção Entrar.';
  }

  if (normalized.includes('password')) {
    return 'O PIN precisa ter exatamente 6 números.';
  }

  if (mode === 'register') {
    return 'Não foi possível criar o acesso.';
  }

  return 'Não foi possível entrar.';
}

export function LoginScreen() {
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [pinConfirmation, setPinConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const formattedPhone = useMemo(() => formatBrazilianPhone(phone), [phone]);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setPin('');
    setPinConfirmation('');
    setErrorMessage('');
  }

  function validateCommonFields(): boolean {
    if (!isValidBrazilianMobile(phone)) {
      setErrorMessage('Informe um celular válido com DDD.');
      return false;
    }

    if (!isValidPin(pin)) {
      setErrorMessage('O PIN precisa ter exatamente 6 números.');
      return false;
    }

    return true;
  }

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');

    if (!validateCommonFields()) {
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        phone: toBrazilianE164(phone),
        password: pin,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Não foi possível entrar.';
      setErrorMessage(friendlyAuthMessage(message, 'login'));
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage('');

    if (!name.trim()) {
      setErrorMessage('Informe seu nome.');
      return;
    }

    if (!validateCommonFields()) {
      return;
    }

    if (pin !== pinConfirmation) {
      setErrorMessage('Os dois PINs não são iguais.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        phone: toBrazilianE164(phone),
        password: pin,
        options: {
          data: {
            display_name: name.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data.session) {
        await supabase.auth.signOut();
        throw new Error(
          'A confirmação de telefone ainda está ativa no Supabase.'
        );
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o acesso.';

      if (message.includes('confirmação de telefone')) {
        setErrorMessage(
          'Desative a confirmação de telefone no Supabase para usar PIN sem SMS.'
        );
      } else {
        setErrorMessage(friendlyAuthMessage(message, 'register'));
      }
    } finally {
      setLoading(false);
    }
  }

  const isRegister = mode === 'register';

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050806] px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-20%] h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-lime-400/10 blur-[110px]" />
        <div className="absolute bottom-[-30%] right-[-10%] h-[420px] w-[420px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 shadow-2xl shadow-black/60 backdrop-blur-xl sm:p-8"
      >
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-lime-400">
              Racha da terça
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em]">
              {isRegister ? 'Crie seu acesso' : 'Entre no elenco'}
            </h1>
          </div>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/10 text-lime-400">
            {isRegister ? <UserRoundPlus size={22} /> : <Smartphone size={22} />}
          </div>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-2xl border border-white/10 bg-black/30 p-1">
          <button
            type="button"
            onClick={() => changeMode('login')}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              mode === 'login'
                ? 'bg-white/10 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => changeMode('register')}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              mode === 'register'
                ? 'bg-white/10 text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Primeiro acesso
          </button>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.form
            key={mode}
            onSubmit={isRegister ? handleRegister : handleLogin}
            initial={{ opacity: 0, x: isRegister ? 12 : -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRegister ? -12 : 12 }}
            className="space-y-4"
          >
            {isRegister && (
              <div>
                <label
                  htmlFor="access-name"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Seu nome
                </label>
                <input
                  id="access-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={60}
                  autoComplete="name"
                  placeholder="Nome e sobrenome"
                  className="h-14 w-full rounded-2xl border border-white/10 bg-black/40 px-4 font-semibold text-white outline-none transition placeholder:text-zinc-700 focus:border-lime-400/70 focus:ring-4 focus:ring-lime-400/10"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="access-phone"
                className="mb-2 block text-sm text-zinc-400"
              >
                Número com DDD
              </label>
              <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-black/40 px-4 transition focus-within:border-lime-400/70 focus-within:ring-4 focus-within:ring-lime-400/10">
                <span className="mr-3 border-r border-white/10 pr-3 text-sm font-semibold text-zinc-400">
                  +55
                </span>
                <input
                  id="access-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={formattedPhone}
                  onChange={(event) =>
                    setPhone(onlyDigits(event.target.value).slice(0, 11))
                  }
                  placeholder="(12) 99227-7250"
                  className="min-w-0 flex-1 bg-transparent text-lg font-semibold tracking-wide text-white outline-none placeholder:text-zinc-700"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="access-pin"
                className="mb-2 block text-sm text-zinc-400"
              >
                PIN de 6 números
              </label>
              <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-black/40 px-4 transition focus-within:border-lime-400/70 focus-within:ring-4 focus-within:ring-lime-400/10">
                <LockKeyhole size={18} className="mr-3 text-zinc-600" />
                <input
                  id="access-pin"
                  type="password"
                  inputMode="numeric"
                  autoComplete={isRegister ? 'new-password' : 'current-password'}
                  value={pin}
                  onChange={(event) =>
                    setPin(onlyDigits(event.target.value).slice(0, 6))
                  }
                  maxLength={6}
                  placeholder="••••••"
                  className="min-w-0 flex-1 bg-transparent text-xl font-black tracking-[0.34em] text-white outline-none placeholder:text-zinc-800"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label
                  htmlFor="access-pin-confirmation"
                  className="mb-2 block text-sm text-zinc-400"
                >
                  Confirme o PIN
                </label>
                <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-black/40 px-4 transition focus-within:border-lime-400/70 focus-within:ring-4 focus-within:ring-lime-400/10">
                  <ShieldCheck size={18} className="mr-3 text-zinc-600" />
                  <input
                    id="access-pin-confirmation"
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    value={pinConfirmation}
                    onChange={(event) =>
                      setPinConfirmation(
                        onlyDigits(event.target.value).slice(0, 6)
                      )
                    }
                    maxLength={6}
                    placeholder="••••••"
                    className="min-w-0 flex-1 bg-transparent text-xl font-black tracking-[0.34em] text-white outline-none placeholder:text-zinc-800"
                  />
                </div>
              </div>
            )}

            <p className="text-xs leading-relaxed text-zinc-500">
              {isRegister
                ? 'Evite data de nascimento e sequências como 123456.'
                : 'A sessão continuará salva neste aparelho após o login.'}
            </p>

            {errorMessage && (
              <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {errorMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3.5 font-extrabold text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <LoaderCircle size={18} className="animate-spin" />}
              {isRegister ? 'Criar e entrar' : 'Entrar'}
            </button>
          </motion.form>
        </AnimatePresence>
      </motion.section>
    </main>
  );
}
