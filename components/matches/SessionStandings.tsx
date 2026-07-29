'use client';

import { Medal } from 'lucide-react';

import type { FutsalSessionDetails } from '@/types';
import { calculateSessionStandings } from '@/lib/matchCenter/standings';
import { getTeamColor } from '@/lib/matchCenter/teamColors';

export function SessionStandings({
  session,
}: {
  session: FutsalSessionDetails;
}) {
  const standings = calculateSessionStandings(session);

  return (
    <section className="overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#090d0a]/90">
      <div className="flex items-center gap-2 border-b border-white/[0.09] px-4 py-3.5 text-amber-200">
        <Medal size={16} />
        <h3 className="text-sm font-black">Classificação do dia</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] text-[10px] font-bold uppercase tracking-[0.11em] text-zinc-500">
              <th className="px-4 py-3 text-left">Time</th>
              <th className="px-2 py-3 text-center">J</th>
              <th className="px-2 py-3 text-center">V</th>
              <th className="px-2 py-3 text-center">E</th>
              <th className="px-2 py-3 text-center">D</th>
              <th className="px-2 py-3 text-center">GP</th>
              <th className="px-2 py-3 text-center">GC</th>
              <th className="px-2 py-3 text-center">SG</th>
              <th className="px-4 py-3 text-center">PTS</th>
            </tr>
          </thead>

          <tbody>
            {standings.map((standing, index) => {
              const color = getTeamColor(standing.color);
              const values = [
                standing.played,
                standing.wins,
                standing.draws,
                standing.losses,
                standing.goals_for,
                standing.goals_against,
                standing.goal_difference,
              ];

              return (
                <tr
                  key={standing.team_id}
                  className="border-b border-white/[0.06] last:border-0"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="w-5 text-xs font-black text-zinc-500">
                        {index + 1}
                      </span>
                      <span className={`h-3 w-3 rounded-full ${color.dotClass}`} />
                      <span className="font-bold text-white">
                        {standing.team_name}
                      </span>
                    </div>
                  </td>

                  {values.map((value, itemIndex) => (
                    <td
                      key={itemIndex}
                      className="px-2 py-3 text-center font-semibold tabular-nums text-zinc-300"
                    >
                      {itemIndex === 6 && value > 0 ? `+${value}` : value}
                    </td>
                  ))}

                  <td className="px-4 py-3 text-center font-black tabular-nums text-lime-300">
                    {standing.points}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
