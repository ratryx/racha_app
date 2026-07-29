'use client';

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Swords,
  UsersRound,
} from 'lucide-react';

import type { FutsalSessionDetails } from '@/types';
import { formatSessionDate } from '@/lib/matchCenter/format';
import { calculateSessionStandings } from '@/lib/matchCenter/standings';
import { getTeamColor } from '@/lib/matchCenter/teamColors';

interface SessionCardProps {
  session: FutsalSessionDetails;
  onOpen: () => void;
}

export function SessionCard({
  session,
  onOpen,
}: SessionCardProps) {
  const standings = calculateSessionStandings(session);
  const leader = standings[0];
  const participantCount = session.teams.reduce(
    (total, team) => total + team.participants.length,
    0
  );

  return (
    <article className="relative overflow-hidden rounded-[26px] border border-white/[0.11] bg-[#070b08]/90 p-5 shadow-xl shadow-black/20 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(163,230,53,.09),transparent_36%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-lime-300">
              <CalendarDays size={15} />
              <p className="text-[11px] font-bold uppercase tracking-[0.13em]">
                {formatSessionDate(session.session_date)}
              </p>
            </div>

            <h3 className="mt-3 text-xl font-black text-white">
              {session.location || 'Racha do grupo'}
            </h3>

            {session.notes && (
              <p className="mt-1.5 line-clamp-2 text-sm leading-6 text-zinc-400">
                {session.notes}
              </p>
            )}
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.10em] ${
              session.status === 'completed'
                ? 'border-emerald-300/20 bg-emerald-300/[0.08] text-emerald-200'
                : 'border-amber-300/20 bg-amber-300/[0.08] text-amber-200'
            }`}
          >
            {session.status === 'completed' ? (
              <CheckCircle2 size={12} />
            ) : (
              <Swords size={12} />
            )}
            {session.status === 'completed' ? 'Finalizado' : 'Em andamento'}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <Metric icon={UsersRound} value={participantCount} label="Jogadores" />
          <Metric icon={Swords} value={session.teams.length} label="Times" />
          <Metric icon={CheckCircle2} value={session.games.length} label="Partidas" />
        </div>

        {leader && session.games.length > 0 && (
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-3">
            <span
              className={`h-3 w-3 rounded-full ${
                getTeamColor(leader.color).dotClass
              }`}
            />
            <span className="min-w-0 flex-1">
              <span className="block text-[10px] font-bold uppercase tracking-[0.11em] text-zinc-500">
                Líder do dia
              </span>
              <span className="mt-0.5 block truncate text-sm font-black text-white">
                {leader.team_name}
              </span>
            </span>
            <span className="text-sm font-black text-lime-300">
              {leader.points} pts
            </span>
          </div>
        )}

        <button
          type="button"
          onClick={onOpen}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.11] bg-white/[0.035] text-sm font-black text-white transition hover:border-lime-400/30 hover:bg-lime-400/[0.08]"
        >
          Abrir sessão
          <ArrowRight size={16} />
        </button>
      </div>
    </article>
  );
}

function Metric({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof Swords;
  value: number;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-black/25 p-3 text-center">
      <Icon size={14} className="mx-auto text-zinc-500" />
      <p className="mt-2 text-lg font-black tabular-nums text-white">
        {value}
      </p>
      <p className="mt-0.5 text-[10px] font-bold text-zinc-500">
        {label}
      </p>
    </div>
  );
}
