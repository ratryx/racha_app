'use client';

import {
  Shield,
  UserRound,
  UsersRound,
} from 'lucide-react';

import type { FutsalSessionDetails } from '@/types';
import { getTeamColor } from '@/lib/matchCenter/teamColors';

export function TeamRosterGrid({
  session,
}: {
  session: FutsalSessionDetails;
}) {
  return (
    <section className="grid gap-3 md:grid-cols-2">
      {session.teams.map((team) => {
        const color = getTeamColor(team.color);

        return (
          <article
            key={team.id}
            className={`rounded-[22px] border p-4 ${color.borderClass} ${color.backgroundClass}`}
          >
            <div className="flex items-center gap-3">
              <span className={`h-4 w-4 rounded-full ${color.dotClass}`} />
              <h3 className="min-w-0 flex-1 truncate text-base font-black text-white">
                {team.name}
              </h3>
              <span className="rounded-full border border-white/[0.10] bg-black/25 px-2.5 py-1 text-xs font-black text-zinc-300">
                {team.participants.length}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              {team.participants.map((participant) => (
                <div
                  key={participant.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-2.5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-zinc-300">
                    {participant.role === 'goalkeeper' ? (
                      <Shield size={15} />
                    ) : participant.role === 'rotating' ? (
                      <UsersRound size={15} />
                    ) : (
                      <UserRound size={15} />
                    )}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-bold text-white">
                      {participant.display_name}
                    </span>
                    <span className="mt-0.5 block text-xs text-zinc-500">
                      {participant.guest_name
                        ? 'Convidado'
                        : participant.position_snapshot || 'Jogador'}
                      {' · '}
                      {roleLabel(participant.role)}
                    </span>
                  </span>

                  {participant.overall_snapshot !== null && (
                    <span className="text-xs font-black tabular-nums text-zinc-300">
                      OVR {participant.overall_snapshot}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </article>
        );
      })}
    </section>
  );
}

function roleLabel(role: string): string {
  if (role === 'goalkeeper') return 'Goleiro';
  if (role === 'rotating') return 'Revezando no gol';
  return 'Linha';
}
