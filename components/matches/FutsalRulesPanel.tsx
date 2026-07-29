'use client';

import {
  Clock3,
  Goal,
  RotateCcw,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

const RULES: Array<{
  icon: LucideIcon;
  label: string;
  value: string;
  description: string;
}> = [
  {
    icon: Goal,
    label: 'Limite',
    value: '2 gols',
    description:
      'A partida encerra quando um time chega a dois.',
  },
  {
    icon: Clock3,
    label: 'Tempo',
    value: '7 minutos',
    description:
      'Vale quando nenhum time chega ao limite.',
  },
  {
    icon: UsersRound,
    label: 'Formação',
    value: '4 ou 5',
    description:
      'A quantidade varia conforme quem compareceu.',
  },
  {
    icon: RotateCcw,
    label: 'Goleiros',
    value: 'Flexível',
    description:
      'Fixo, revezamento ou convidado externo.',
  },
];

export function FutsalRulesPanel() {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {RULES.map((rule) => {
        const Icon = rule.icon;

        return (
          <article
            key={rule.label}
            className="rounded-[20px] border border-white/[0.11] bg-[#08100a]/85 p-4 shadow-lg shadow-black/10 backdrop-blur-xl"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.10] bg-black/30 text-lime-300">
              <Icon size={17} />
            </span>

            <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
              {rule.label}
            </p>

            <p className="mt-1 text-base font-black text-white">
              {rule.value}
            </p>

            <p className="mt-1.5 text-xs leading-5 text-zinc-400">
              {rule.description}
            </p>
          </article>
        );
      })}
    </div>
  );
}
