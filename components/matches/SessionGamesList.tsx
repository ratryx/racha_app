'use client';

import {
  Clock3,
  Goal,
  Trash2,
} from 'lucide-react';

import type { FutsalSessionDetails } from '@/types';
import { formatDuration } from '@/lib/matchCenter/format';
import { getTeamColor } from '@/lib/matchCenter/teamColors';

interface SessionGamesListProps {
  session: FutsalSessionDetails;
  isAdmin: boolean;
  deletingGameId: string | null;
  onDeleteGame: (
    gameId: string
  ) => void | Promise<void>;
}

export function SessionGamesList({
  session,
  isAdmin,
  deletingGameId,
  onDeleteGame,
}: SessionGamesListProps) {
  const teamsById = new Map(
    session.teams.map((team) => [team.id, team])
  );

  return (
    <section className="overflow-hidden rounded-[22px] border border-white/[0.10] bg-[#090d0a]/90">
      <div className="border-b border-white/[0.09] px-4 py-3.5">
        <h3 className="text-sm font-black text-white">
          Partidas registradas
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          {session.games.length}{' '}
          {session.games.length === 1 ? 'partida' : 'partidas'}
        </p>
      </div>

      {session.games.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <Goal size={22} className="mx-auto text-zinc-600" />
          <p className="mt-3 text-sm font-semibold text-zinc-300">
            Nenhum placar registrado
          </p>
        </div>
      ) : (
        <div className="divide-y divide-white/[0.07]">
          {session.games.map((game) => {
            const home = teamsById.get(game.home_team_id);
            const away = teamsById.get(game.away_team_id);
            if (!home || !away) return null;

            const homeColor = getTeamColor(home.color);
            const awayColor = getTeamColor(away.color);

            return (
              <article
                key={game.id}
                className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-4"
              >
                <div className="min-w-0">
                  <p className="truncate text-right text-sm font-bold text-white">
                    {home.name}
                  </p>
                  <span
                    className={`ml-auto mt-1 block h-2 w-8 rounded-full ${homeColor.dotClass}`}
                  />
                </div>

                <div className="flex min-w-24 flex-col items-center">
                  <p className="text-2xl font-black tabular-nums text-white">
                    {game.home_score}
                    <span className="mx-2 text-zinc-600">×</span>
                    {game.away_score}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold text-zinc-500">
                    {game.ended_by === 'goal_limit' ? (
                      <Goal size={12} />
                    ) : (
                      <Clock3 size={12} />
                    )}
                    {formatDuration(game.duration_seconds)}
                  </div>
                </div>

                <div className="flex min-w-0 items-center gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-white">
                      {away.name}
                    </p>
                    <span
                      className={`mt-1 block h-2 w-8 rounded-full ${awayColor.dotClass}`}
                    />
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      disabled={deletingGameId === game.id}
                      onClick={() => void onDeleteGame(game.id)}
                      aria-label="Excluir partida"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-red-300/15 text-red-200 transition hover:bg-red-300/[0.08] disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
