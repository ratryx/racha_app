'use client';

import {
  MapPin,
  StickyNote,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import { MatchDatePicker } from './MatchDatePicker';

interface SessionBasicsStepProps {
  sessionDate: string;
  location: string;
  notes: string;
  teamCount: number;
  onSessionDateChange: (
    value: string
  ) => void;
  onLocationChange: (
    value: string
  ) => void;
  onNotesChange: (
    value: string
  ) => void;
  onTeamCountChange: (
    value: number
  ) => void;
}

export function SessionBasicsStep({
  sessionDate,
  location,
  notes,
  teamCount,
  onSessionDateChange,
  onLocationChange,
  onNotesChange,
  onTeamCountChange,
}: SessionBasicsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-lime-400/20 bg-lime-400/[0.09] text-lime-300">
          <UsersRound size={19} />
        </span>

        <h3 className="mt-4 text-xl font-black text-white">
          Dados do racha
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-zinc-400">
          Registre quando aconteceu e quantos
          times participaram.
        </p>
      </div>

      <MatchDatePicker
        value={sessionDate}
        onChange={
          onSessionDateChange
        }
      />

      <FieldShell
        icon={MapPin}
        label="Local, opcional"
      >
        <input
          value={location}
          onChange={(event) =>
            onLocationChange(
              event.target.value
            )
          }
          placeholder="Ex.: Arena do bairro"
          maxLength={100}
          className="h-12 w-full bg-transparent text-base font-semibold text-white outline-none placeholder:text-zinc-600"
        />
      </FieldShell>

      <div className="rounded-[22px] border border-white/[0.10] bg-black/25 p-4">
        <div className="flex items-center gap-2 text-zinc-200">
          <UsersRound size={17} />

          <p className="text-sm font-black">
            Quantidade de times
          </p>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-zinc-500">
          A Central aceita de dois a seis
          times.
        </p>

        <div className="mt-4 grid grid-cols-5 gap-2">
          {[2, 3, 4, 5, 6].map(
            (count) => (
              <button
                key={count}
                type="button"
                onClick={() =>
                  onTeamCountChange(
                    count
                  )
                }
                className={`h-11 rounded-xl border text-sm font-black transition ${
                  teamCount === count
                    ? 'border-lime-400/45 bg-lime-400/[0.13] text-lime-200'
                    : 'border-white/[0.09] bg-white/[0.025] text-zinc-400 hover:border-white/[0.16] hover:text-white'
                }`}
              >
                {count}
              </button>
            )
          )}
        </div>
      </div>

      <FieldShell
        icon={StickyNote}
        label="Observações, opcional"
      >
        <textarea
          value={notes}
          onChange={(event) =>
            onNotesChange(
              event.target.value
            )
          }
          placeholder="Ex.: goleiro convidado, quadra diferente..."
          maxLength={500}
          rows={4}
          className="w-full resize-none bg-transparent text-base font-medium leading-6 text-white outline-none placeholder:text-zinc-600"
        />
      </FieldShell>
    </div>
  );
}

function FieldShell({
  icon: Icon,
  label,
  children,
}: {
  icon: LucideIcon;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block rounded-[20px] border border-white/[0.10] bg-black/30 p-4 transition focus-within:border-lime-400/40 focus-within:ring-2 focus-within:ring-lime-400/10">
      <span className="flex items-center gap-2 text-xs font-bold text-zinc-400">
        <Icon size={15} />
        {label}
      </span>

      <span className="mt-2 block">
        {children}
      </span>
    </label>
  );
}
