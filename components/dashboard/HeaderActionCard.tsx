'use client';

import type { LucideIcon } from 'lucide-react';

type ActionVariant =
  | 'primary'
  | 'admin'
  | 'neutral'
  | 'groups';

interface HeaderActionCardProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  description: string;
  variant: ActionVariant;
  onClick: () => void;
  disabled?: boolean;
  badge?: number;
}

const VARIANTS: Record<
  ActionVariant,
  {
    container: string;
    icon: string;
    eyebrow: string;
  }
> = {
  primary: {
    container:
      'border-lime-400/30 bg-lime-400/[0.09] hover:border-lime-400/55 hover:bg-lime-400/[0.14]',
    icon: 'bg-lime-400 text-black',
    eyebrow: 'text-lime-400/70',
  },
  admin: {
    container:
      'border-emerald-400/25 bg-emerald-400/[0.07] hover:border-emerald-400/45 hover:bg-emerald-400/[0.12]',
    icon: 'bg-emerald-400 text-black',
    eyebrow: 'text-emerald-400/70',
  },
  groups: {
    container:
      'border-cyan-400/20 bg-cyan-400/[0.055] hover:border-cyan-400/40 hover:bg-cyan-400/[0.10]',
    icon: 'bg-cyan-400 text-black',
    eyebrow: 'text-cyan-300/70',
  },
  neutral: {
    container:
      'border-white/[0.08] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.055]',
    icon: 'bg-white/[0.08] text-zinc-300',
    eyebrow: 'text-zinc-600',
  },
};

export function HeaderActionCard({
  icon: Icon,
  eyebrow,
  title,
  description,
  variant,
  onClick,
  disabled = false,
  badge = 0,
}: HeaderActionCardProps) {
  const styles = VARIANTS[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group relative flex min-h-[76px] items-center gap-3 rounded-[20px] border p-3 text-left transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[88px] sm:p-3.5 ${styles.container}`}
    >
      {badge > 0 && (
        <span className="absolute right-2.5 top-2.5 flex min-w-5 items-center justify-center rounded-full border border-amber-300/25 bg-amber-300 px-1.5 py-0.5 text-[9px] font-black leading-none text-black shadow-lg shadow-black/20">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg shadow-black/10 sm:h-12 sm:w-12 ${styles.icon}`}
      >
        <Icon size={19} />
      </span>

      <span className="min-w-0">
        <span
          className={`block text-[8px] font-extrabold uppercase tracking-[0.17em] ${styles.eyebrow}`}
        >
          {eyebrow}
        </span>

        <span className="mt-1 block text-sm font-black leading-tight text-white sm:text-[15px]">
          {title}
        </span>

        <span className="mt-1 hidden text-[11px] leading-relaxed text-zinc-500 sm:block">
          {description}
        </span>
      </span>
    </button>
  );
}
