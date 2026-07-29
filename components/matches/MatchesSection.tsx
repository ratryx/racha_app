'use client';

import { motion } from 'framer-motion';
import {
  CircleDot,
  TimerReset,
} from 'lucide-react';

import { FutsalRulesPanel } from './FutsalRulesPanel';
import { MatchCenterHero } from './MatchCenterHero';

interface MatchesSectionProps {
  isAdmin: boolean;
  groupName: string;
  onOpenPostMatch: () => void;
}

export function MatchesSection({
  isAdmin,
  groupName,
  onOpenPostMatch,
}: MatchesSectionProps) {
  return (
    <section className="space-y-4">
      <MatchCenterHero
        isAdmin={isAdmin}
        groupName={groupName}
        onOpenPostMatch={onOpenPostMatch}
      />

      <FutsalRulesPanel />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.05,
          duration: 0.3,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,.65fr)]"
      >
        <article className="relative overflow-hidden rounded-[24px] border border-white/[0.11] bg-[#061008]/88 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
          <div className="pointer-events-none absolute inset-4 rounded-[18px] border border-white/[0.06]" />
          <div className="pointer-events-none absolute left-1/2 top-4 h-[calc(100%-2rem)] w-px -translate-x-1/2 bg-white/[0.06]" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.07]" />

          <div className="relative flex min-h-56 items-center justify-center">
            <div className="grid w-full max-w-lg grid-cols-[1fr_auto_1fr] items-center gap-4">
              <TeamPreview
                name="Time A"
                side="left"
              />

              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                  Próxima partida
                </span>

                <span className="mt-2 text-4xl font-black text-white">
                  0
                  <span className="mx-2 text-zinc-500">
                    ×
                  </span>
                  0
                </span>

                <span className="mt-3 rounded-full border border-white/[0.10] bg-black/40 px-3 py-1.5 text-xs font-bold text-zinc-300">
                  07:00
                </span>
              </div>

              <TeamPreview
                name="Time B"
                side="right"
              />
            </div>
          </div>
        </article>

        <article className="rounded-[24px] border border-white/[0.11] bg-[#08100a]/88 p-5 shadow-xl shadow-black/15 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-cyan-200">
            <TimerReset size={17} />
            <p className="text-[10px] font-bold uppercase tracking-[0.14em]">
              Próximas entregas
            </p>
          </div>

          <ol className="mt-4 space-y-3">
            {[
              'Selecionar participantes do dia',
              'Sortear times equilibrados',
              'Adicionar goleiro convidado',
              'Registrar placares em sequência',
            ].map((item, index) => (
              <li
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.09] bg-black/25 px-3.5 py-3.5"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.055] text-xs font-black text-zinc-300">
                  {index + 1}
                </span>

                <span className="text-sm font-semibold leading-5 text-zinc-300">
                  {item}
                </span>
              </li>
            ))}
          </ol>
        </article>
      </motion.div>
    </section>
  );
}

function TeamPreview({
  name,
  side,
}: {
  name: string;
  side: 'left' | 'right';
}) {
  return (
    <div
      className={`flex flex-col gap-2 ${
        side === 'left'
          ? 'items-start'
          : 'items-end'
      }`}
    >
      <p className="text-sm font-black text-zinc-200">
        {name}
      </p>

      <div
        className={`flex max-w-24 flex-wrap gap-1.5 ${
          side === 'right'
            ? 'justify-end'
            : ''
        }`}
      >
        {Array.from({ length: 5 }).map(
          (_, index) => (
            <CircleDot
              key={index}
              size={14}
              className={
                index === 0
                  ? 'text-lime-300'
                  : 'text-zinc-500'
              }
            />
          )
        )}
      </div>
    </div>
  );
}
