'use client';

import {
  ChevronLeft,
  ChevronRight,
  Palette,
  Shield,
  UserRound,
} from 'lucide-react';

import type {
  FutsalParticipantRole,
  FutsalTeamColor,
} from '@/types';
import {
  TEAM_COLOR_OPTIONS,
  getTeamColor,
} from '@/lib/matchCenter/teamColors';
import type {
  TeamAssignments,
  TeamDraft,
} from './sessionCreateTypes';

export interface LineupParticipant {
  key: string;
  name: string;
  subtitle: string;
  role: FutsalParticipantRole;
}

interface TeamLineupTableProps {
  teams: TeamDraft[];
  participants: LineupParticipant[];
  assignments: TeamAssignments;
  onTeamNameChange: (
    teamId: string,
    name: string
  ) => void;
  onTeamColorChange: (
    teamId: string,
    color: FutsalTeamColor
  ) => void;
  onMoveParticipant: (
    participantKey: string,
    direction: -1 | 1
  ) => void;
}

export function TeamLineupTable({
  teams,
  participants,
  assignments,
  onTeamNameChange,
  onTeamColorChange,
  onMoveParticipant,
}: TeamLineupTableProps) {
  const rosters = teams.map((team) => ({
    team,
    participants: participants.filter(
      (participant) =>
        assignments[participant.key] ===
        team.clientId
    ),
  }));

  const largestRoster = Math.max(
    1,
    ...rosters.map(
      (roster) =>
        roster.participants.length
    )
  );

  const minimumColumnWidth =
    teams.length <= 2 ? 164 : 190;

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/[0.11] bg-[#070a08]/95 shadow-xl shadow-black/25">
      <div className="border-b border-white/[0.09] px-4 py-3.5">
        <p className="text-sm font-black text-white">
          Tabela dos times
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-500">
          Use as setas em cada jogador para
          movê-lo de um time para outro.
        </p>
      </div>

      <div className="overflow-x-auto overscroll-x-contain p-3 sm:p-4">
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: `repeat(${teams.length}, minmax(${minimumColumnWidth}px, 1fr))`,
            minWidth:
              teams.length <= 2
                ? '100%'
                : `${teams.length * minimumColumnWidth + (teams.length - 1) * 12}px`,
          }}
        >
          {rosters.map(
            ({ team, participants: teamParticipants }) => (
              <TeamColumn
                key={team.clientId}
                team={team}
                participants={
                  teamParticipants
                }
                rowCount={largestRoster}
                canMoveLeft={
                  teams.length > 1
                }
                canMoveRight={
                  teams.length > 1
                }
                onNameChange={(name) =>
                  onTeamNameChange(
                    team.clientId,
                    name
                  )
                }
                onColorChange={(color) =>
                  onTeamColorChange(
                    team.clientId,
                    color
                  )
                }
                onMoveParticipant={
                  onMoveParticipant
                }
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

interface TeamColumnProps {
  team: TeamDraft;
  participants: LineupParticipant[];
  rowCount: number;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onNameChange: (name: string) => void;
  onColorChange: (
    color: FutsalTeamColor
  ) => void;
  onMoveParticipant: (
    participantKey: string,
    direction: -1 | 1
  ) => void;
}

function TeamColumn({
  team,
  participants,
  rowCount,
  canMoveLeft,
  canMoveRight,
  onNameChange,
  onColorChange,
  onMoveParticipant,
}: TeamColumnProps) {
  const color = getTeamColor(
    team.color
  );

  function cycleColor() {
    const currentIndex =
      TEAM_COLOR_OPTIONS.findIndex(
        (option) =>
          option.id === team.color
      );
    const nextColor =
      TEAM_COLOR_OPTIONS[
        (currentIndex + 1) %
          TEAM_COLOR_OPTIONS.length
      ];

    onColorChange(nextColor.id);
  }

  return (
    <article
      className={`overflow-hidden rounded-[20px] border ${color.borderClass} ${color.backgroundClass}`}
    >
      <header className="border-b border-white/[0.09] p-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={cycleColor}
            title="Trocar cor"
            aria-label={`Trocar cor de ${team.name}`}
            className={`group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-black/25 transition hover:bg-black/40`}
          >
            <span
              className={`h-4 w-4 rounded-full ${color.dotClass}`}
            />

            <Palette
              size={10}
              className="absolute -bottom-0.5 -right-0.5 rounded-full bg-[#080b09] p-0.5 text-zinc-300 opacity-70 transition group-hover:opacity-100"
            />
          </button>

          <div className="min-w-0 flex-1">
            <label
              htmlFor={`team-name-${team.clientId}`}
              className="sr-only"
            >
              Nome do time
            </label>

            <input
              id={`team-name-${team.clientId}`}
              value={team.name}
              onChange={(event) =>
                onNameChange(
                  event.target.value
                )
              }
              maxLength={40}
              className="h-8 w-full border-b border-white/[0.11] bg-transparent text-sm font-black text-white outline-none transition focus:border-white/35"
            />

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.10em] text-zinc-500">
              {participants.length}{' '}
              {participants.length === 1
                ? 'jogador'
                : 'jogadores'}
            </p>
          </div>
        </div>
      </header>

      <div className="space-y-2 p-2.5">
        {Array.from(
          { length: rowCount },
          (_, index) => {
            const participant =
              participants[index];

            if (!participant) {
              return (
                <EmptySlot
                  key={`empty-${index}`}
                  index={index}
                />
              );
            }

            return (
              <PlayerSlot
                key={participant.key}
                participant={
                  participant
                }
                canMoveLeft={
                  canMoveLeft
                }
                canMoveRight={
                  canMoveRight
                }
                onMoveLeft={() =>
                  onMoveParticipant(
                    participant.key,
                    -1
                  )
                }
                onMoveRight={() =>
                  onMoveParticipant(
                    participant.key,
                    1
                  )
                }
              />
            );
          }
        )}
      </div>
    </article>
  );
}

function PlayerSlot({
  participant,
  canMoveLeft,
  canMoveRight,
  onMoveLeft,
  onMoveRight,
}: {
  participant: LineupParticipant;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onMoveLeft: () => void;
  onMoveRight: () => void;
}) {
  const isGoalkeeper =
    participant.role ===
    'goalkeeper';

  return (
    <div className="grid min-h-[70px] grid-cols-[30px_minmax(0,1fr)_30px] items-center gap-1 rounded-[15px] border border-white/[0.09] bg-black/35 p-1.5 shadow-sm shadow-black/20">
      <button
        type="button"
        onClick={onMoveLeft}
        disabled={!canMoveLeft}
        aria-label={`Mover ${participant.name} para o time anterior`}
        title="Mover para o time anterior"
        className="flex h-9 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-20"
      >
        <ChevronLeft size={16} />
      </button>

      <div className="min-w-0 text-center">
        <span
          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-xl border ${
            isGoalkeeper
              ? 'border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200'
              : 'border-white/[0.09] bg-white/[0.04] text-zinc-300'
          }`}
        >
          {isGoalkeeper ? (
            <Shield size={14} />
          ) : (
            <UserRound size={14} />
          )}
        </span>

        <p className="mt-1.5 truncate text-xs font-black text-white">
          {participant.name}
        </p>

        <p className="mt-0.5 truncate text-[10px] font-medium text-zinc-500">
          {participant.subtitle}
        </p>
      </div>

      <button
        type="button"
        onClick={onMoveRight}
        disabled={!canMoveRight}
        aria-label={`Mover ${participant.name} para o próximo time`}
        title="Mover para o próximo time"
        className="flex h-9 w-7 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/[0.07] hover:text-white disabled:opacity-20"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}

function EmptySlot({
  index,
}: {
  index: number;
}) {
  return (
    <div
      aria-label={`Vaga ${index + 1}`}
      className="flex min-h-[70px] items-center justify-center rounded-[15px] border border-dashed border-white/[0.07] bg-black/10"
    >
      <span className="text-[10px] font-bold uppercase tracking-[0.11em] text-zinc-700">
        Vaga
      </span>
    </div>
  );
}
