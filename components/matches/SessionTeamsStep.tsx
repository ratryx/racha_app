'use client';

import {
  Info,
  Shuffle,
  UsersRound,
} from 'lucide-react';

import type {
  FutsalTeamColor,
  PlayerWithCard,
} from '@/types';
import type {
  GuestDraft,
  TeamAssignments,
  TeamDraft,
} from './sessionCreateTypes';
import {
  guestKey,
  playerKey,
} from './sessionCreateTypes';
import {
  TeamLineupTable,
  type LineupParticipant,
} from './TeamLineupTable';

interface SessionTeamsStepProps {
  teams: TeamDraft[];
  players: PlayerWithCard[];
  selectedPlayerIds: Set<string>;
  guests: GuestDraft[];
  assignments: TeamAssignments;
  onTeamChange: (
    teamId: string,
    patch: Partial<TeamDraft>
  ) => void;
  onAssign: (
    participantKey: string,
    teamId: string
  ) => void;
  onDistribute: () => void;
}

export function SessionTeamsStep({
  teams,
  players,
  selectedPlayerIds,
  guests,
  assignments,
  onTeamChange,
  onAssign,
  onDistribute,
}: SessionTeamsStepProps) {
  const selectedPlayers = players.filter(
    (player) =>
      selectedPlayerIds.has(player.id)
  );

  const participants:
    LineupParticipant[] = [
    ...selectedPlayers.map((player) => ({
      key: playerKey(player.id),
      name:
        player.nickname || player.name,
      subtitle: `${player.position} · OVR ${player.card.overall}`,
      role:
        player.position === 'GOL'
          ? ('goalkeeper' as const)
          : ('line' as const),
    })),
    ...guests.map((guest) => ({
      key: guestKey(guest.clientId),
      name: guest.name,
      subtitle:
        guest.role === 'goalkeeper'
          ? 'Convidado · Goleiro'
          : 'Convidado',
      role: guest.role,
    })),
  ];

  function moveParticipant(
    participantKey: string,
    direction: -1 | 1
  ) {
    const currentTeamId =
      assignments[participantKey];
    const currentIndex =
      teams.findIndex(
        (team) =>
          team.clientId ===
          currentTeamId
      );

    if (currentIndex < 0) {
      return;
    }

    const nextIndex =
      (currentIndex +
        direction +
        teams.length) %
      teams.length;

    onAssign(
      participantKey,
      teams[nextIndex].clientId
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-violet-300/20 bg-violet-300/[0.08] text-violet-200">
          <UsersRound size={19} />
        </span>

        <h3 className="mt-4 text-xl font-black text-white">
          Times sorteados
        </h3>

        <p className="mt-1.5 text-sm leading-6 text-zinc-400">
          Confira a formação e mova jogadores
          pelas setas quando precisar ajustar o
          sorteio.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-[20px] border border-violet-300/18 bg-violet-300/[0.055] p-3.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-300/[0.08] text-violet-200">
            <Shuffle size={16} />
          </span>

          <div>
            <p className="text-sm font-black text-white">
              Sorteio simples
            </p>

            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Distribui a quantidade de jogadores
              igualmente entre os times.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onDistribute}
          className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-violet-300/25 bg-violet-300/[0.09] px-4 text-sm font-black text-violet-100 transition hover:bg-violet-300/[0.14]"
        >
          <Shuffle size={16} />
          Sortear novamente
        </button>
      </div>

      <TeamLineupTable
        teams={teams}
        participants={participants}
        assignments={assignments}
        onTeamNameChange={(
          teamId,
          name
        ) =>
          onTeamChange(teamId, {
            name,
          })
        }
        onTeamColorChange={(
          teamId,
          color: FutsalTeamColor
        ) =>
          onTeamChange(teamId, {
            color,
          })
        }
        onMoveParticipant={
          moveParticipant
        }
      />

      <div className="flex items-start gap-3 rounded-[18px] border border-cyan-300/15 bg-cyan-300/[0.05] px-4 py-3.5">
        <Info
          size={17}
          className="mt-0.5 shrink-0 text-cyan-200"
        />

        <p className="text-xs leading-5 text-zinc-400">
          Quem revezará no gol é decidido na hora
          do jogo e não precisa ser registrado
          nesta etapa. Apenas o goleiro fixo ou um
          convidado cadastrado como goleiro aparece
          identificado.
        </p>
      </div>
    </div>
  );
}
