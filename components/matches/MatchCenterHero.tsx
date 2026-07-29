'use client';

import { motion } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Swords,
} from 'lucide-react';

interface MatchCenterHeroProps {
  isAdmin: boolean;
  groupName: string;
  onOpenPostMatch: () => void;
}

export function MatchCenterHero({
  isAdmin,
  groupName,
  onOpenPostMatch,
}: MatchCenterHeroProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#070b08]/90 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(163,230,53,.14),transparent_38%),radial-gradient(circle_at_90%_20%,rgba(34,211,238,.08),transparent_36%)]" />

      <div className="pointer-events-none absolute -right-12 -top-12 h-52 w-52 rounded-full border border-white/[0.045]" />
      <div className="pointer-events-none absolute -right-3 -top-3 h-28 w-28 rounded-full border border-lime-400/[0.07]" />

      <div className="relative">
        <div className="flex items-center gap-2 text-lime-300">
          <Swords size={17} />
          <p className="text-[11px] font-bold uppercase tracking-[0.16em]">
            Central de partidas
          </p>
        </div>

        <h2 className="mt-4 max-w-3xl text-[2rem] font-black leading-[1.04] tracking-[-0.035em] text-white sm:text-5xl">
          O racha começa no sorteio e termina
          nos números.
        </h2>

        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-300/80">
          Esta área será a base para montar times,
          registrar partidas de sete minutos e
          acompanhar todos os placares do dia em{' '}
          <strong className="font-bold text-white">
            {groupName}
          </strong>
          .
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          {isAdmin ? (
            <button
              type="button"
              onClick={onOpenPostMatch}
              className="group flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 text-sm font-black text-black transition hover:bg-lime-300 active:scale-[0.98]"
            >
              Registrar pós-jogo atual
              <ArrowRight
                size={17}
                className="transition-transform group-hover:translate-x-0.5"
              />
            </button>
          ) : (
            <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-white/[0.12] bg-white/[0.05] px-4 py-3 text-sm font-semibold text-zinc-200">
              <ShieldCheck size={16} />
              Resultados administrados pelo grupo
            </span>
          )}

          <span className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.07] px-4 py-3 text-sm font-semibold text-cyan-100/90">
            <Sparkles size={16} />
            Sorteio inteligente na próxima etapa
          </span>
        </div>
      </div>
    </motion.section>
  );
}
