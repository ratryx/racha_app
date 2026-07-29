'use client';

import {
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  LoaderCircle,
  Swords,
  X,
} from 'lucide-react';

import type {
  CreateFutsalParticipantInput,
  CreateFutsalTeamInput,
  Group,
  PlayerWithCard,
} from '@/types';
import { createFutsalSession } from '@/lib/supabase/matchCenter';
import { ModalPortal } from '@/components/ui/ModalPortal';
import { SessionBasicsStep } from './SessionBasicsStep';
import { SessionParticipantsStep } from './SessionParticipantsStep';
import { SessionTeamsStep } from './SessionTeamsStep';
import type {
  GuestDraft,
  TeamAssignments,
  TeamDraft,
} from './sessionCreateTypes';
import {
  guestKey,
  playerKey,
} from './sessionCreateTypes';

interface SessionCreateModalProps {
  open: boolean;
  group: Group;
  players: PlayerWithCard[];
  onClose: () => void;
  onCreated: (
    sessionId: string
  ) => void | Promise<void>;
}

const DEFAULT_TEAM_NAMES = [
  'Time Verde',
  'Time Azul',
  'Time Vermelho',
  'Time Roxo',
  'Time Amarelo',
  'Time Laranja',
];

const DEFAULT_TEAM_COLORS = [
  'lime',
  'cyan',
  'rose',
  'violet',
  'amber',
  'orange',
] as const;

const STEPS = [
  {
    number: 1,
    label: 'Dados',
  },
  {
    number: 2,
    label: 'Participantes',
  },
  {
    number: 3,
    label: 'Times',
  },
];

function todayValue(): string {
  const now = new Date();
  const offset =
    now.getTimezoneOffset() * 60_000;

  return new Date(
    now.getTime() - offset
  )
    .toISOString()
    .slice(0, 10);
}

function makeTeams(
  count: number
): TeamDraft[] {
  return Array.from(
    { length: count },
    (_, index) => ({
      clientId: `team-${index + 1}`,
      name:
        DEFAULT_TEAM_NAMES[index] ??
        `Time ${index + 1}`,
      color:
        DEFAULT_TEAM_COLORS[index] ??
        'lime',
    })
  );
}

export function SessionCreateModal({
  open,
  group,
  players,
  onClose,
  onCreated,
}: SessionCreateModalProps) {
  const [step, setStep] = useState(1);
  const [sessionDate, setSessionDate] =
    useState(todayValue());
  const [location, setLocation] =
    useState('');
  const [notes, setNotes] =
    useState('');
  const [teams, setTeams] =
    useState<TeamDraft[]>(
      makeTeams(3)
    );
  const [
    selectedPlayerIds,
    setSelectedPlayerIds,
  ] = useState<Set<string>>(
    new Set<string>()
  );
  const [guests, setGuests] =
    useState<GuestDraft[]>([]);
  const [assignments, setAssignments] =
    useState<TeamAssignments>({});
  const [saving, setSaving] =
    useState(false);
  const [errorMessage, setErrorMessage] =
    useState('');

  useEffect(() => {
    if (!open) {
      return;
    }

    setStep(1);
    setSessionDate(todayValue());
    setLocation('');
    setNotes('');
    setTeams(makeTeams(3));
    setSelectedPlayerIds(
      new Set<string>()
    );
    setGuests([]);
    setAssignments({});
    setErrorMessage('');
    setSaving(false);
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [open]);

  const participantKeys = useMemo(
    () => [
      ...Array.from(
        selectedPlayerIds
      ).map(playerKey),
      ...guests.map((guest) =>
        guestKey(guest.clientId)
      ),
    ],
    [guests, selectedPlayerIds]
  );

  const basicsValid = Boolean(
    sessionDate &&
      teams.length >= 2 &&
      teams.length <= 6
  );

  const participantsValid =
    participantKeys.length >= teams.length;

  const teamsValid = useMemo(() => {
    const validTeamIds = new Set(
      teams.map(
        (team) => team.clientId
      )
    );

    return (
      teams.every(
        (team) =>
          team.name.trim().length >= 2
      ) &&
      participantKeys.every((key) =>
        validTeamIds.has(
          assignments[key]
        )
      ) &&
      teams.every((team) =>
        participantKeys.some(
          (key) =>
            assignments[key] ===
            team.clientId
        )
      )
    );
  }, [
    assignments,
    participantKeys,
    teams,
  ]);

  const canContinue =
    step === 1
      ? basicsValid
      : step === 2
        ? participantsValid
        : teamsValid;

  function setTeamCount(
    count: number
  ) {
    const nextTeams =
      makeTeams(count);

    setTeams((currentTeams) =>
      nextTeams.map(
        (nextTeam, index) => ({
          ...nextTeam,
          name:
            currentTeams[index]
              ?.name ?? nextTeam.name,
          color:
            currentTeams[index]
              ?.color ?? nextTeam.color,
        })
      )
    );

    setAssignments({});
  }

  function togglePlayer(
    playerId: string
  ) {
    setSelectedPlayerIds(
      (currentSelection) => {
        const nextSelection = new Set(
          currentSelection
        );

        if (
          nextSelection.has(playerId)
        ) {
          nextSelection.delete(
            playerId
          );
        } else {
          nextSelection.add(playerId);
        }

        return nextSelection;
      }
    );
  }

  function addGuest(
    guest: GuestDraft
  ) {
    setGuests((currentGuests) => [
      ...currentGuests,
      guest,
    ]);

  }

  function removeGuest(
    guestId: string
  ) {
    const key = guestKey(guestId);

    setGuests((currentGuests) =>
      currentGuests.filter(
        (guest) =>
          guest.clientId !== guestId
      )
    );

    setAssignments(
      (currentAssignments) => {
        const nextAssignments = {
          ...currentAssignments,
        };

        delete nextAssignments[key];
        return nextAssignments;
      }
    );
  }

  function distributeParticipants() {
    if (!teams.length) {
      return;
    }

    const shuffledParticipants = [
      ...participantKeys,
    ];

    for (
      let index =
        shuffledParticipants.length - 1;
      index > 0;
      index -= 1
    ) {
      const randomIndex = Math.floor(
        Math.random() * (index + 1)
      );

      [
        shuffledParticipants[index],
        shuffledParticipants[
          randomIndex
        ],
      ] = [
        shuffledParticipants[
          randomIndex
        ],
        shuffledParticipants[index],
      ];
    }

    const nextAssignments:
      TeamAssignments = {};

    shuffledParticipants.forEach(
      (key, index) => {
        nextAssignments[key] =
          teams[index % teams.length]
            .clientId;
      }
    );

    setAssignments(nextAssignments);
  }

  function ensureAssignments() {
    const validTeamIds = new Set(
      teams.map(
        (team) => team.clientId
      )
    );

    const complete =
      participantKeys.every((key) =>
        validTeamIds.has(
          assignments[key]
        )
      );

    if (!complete) {
      distributeParticipants();
    }
  }

  function navigateToStep(
    targetStep: number
  ) {
    setErrorMessage('');

    if (targetStep === 1) {
      setStep(1);
      return;
    }

    if (!basicsValid) {
      setStep(1);
      setErrorMessage(
        'Escolha a data e a quantidade de times antes de continuar.'
      );
      return;
    }

    if (targetStep === 2) {
      setStep(2);
      return;
    }

    if (!participantsValid) {
      setStep(2);
      setErrorMessage(
        `Selecione pelo menos ${teams.length} participantes para preencher os ${teams.length} times.`
      );
      return;
    }

    ensureAssignments();
    setStep(3);
  }

  function goNext() {
    if (step === 1) {
      navigateToStep(2);
      return;
    }

    if (step === 2) {
      navigateToStep(3);
    }
  }

  async function saveSession() {
    if (!teamsValid || saving) {
      setErrorMessage(
        'Todos os participantes precisam estar em um time e nenhum time pode ficar vazio.'
      );
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      const teamInputs:
        CreateFutsalTeamInput[] =
        teams.map((team, index) => ({
          client_id: team.clientId,
          name: team.name.trim(),
          color: team.color,
          sort_order: index + 1,
        }));

      const participantInputs:
        CreateFutsalParticipantInput[] = [
        ...players
          .filter((player) =>
            selectedPlayerIds.has(
              player.id
            )
          )
          .map((player) => {
            const key = playerKey(
              player.id
            );

            return {
              player_id: player.id,
              guest_name: null,
              team_client_id:
                assignments[key],
              role:
                player.position === 'GOL'
                  ? 'goalkeeper'
                  : 'line',
              overall_snapshot:
                player.card.overall,
            };
          }),
        ...guests.map((guest) => {
          const key = guestKey(
            guest.clientId
          );

          return {
            player_id: null,
            guest_name: guest.name,
            team_client_id:
              assignments[key],
            role: guest.role,
            overall_snapshot: null,
          };
        }),
      ];

      const sessionId =
        await createFutsalSession({
          groupId: group.id,
          sessionDate,
          location,
          notes,
          teams: teamInputs,
          participants:
            participantInputs,
        });

      await onCreated(sessionId);
      onClose();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o racha.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <ModalPortal>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-stretch justify-center bg-black/90 sm:items-center sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Criar novo racha"
              initial={{
                opacity: 0,
                y: 28,
                scale: 0.99,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 28,
                scale: 0.99,
              }}
              transition={{
                duration: 0.22,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ],
              }}
              onClick={(event) =>
                event.stopPropagation()
              }
              className="flex h-[100dvh] w-full max-w-4xl flex-col overflow-hidden bg-[#070a08] shadow-2xl shadow-black/90 sm:h-auto sm:max-h-[92vh] sm:rounded-[30px] sm:border sm:border-white/[0.12]"
            >
              <header className="relative shrink-0 border-b border-white/[0.10] bg-[#070a08]/98 px-5 py-4 backdrop-blur-xl sm:px-7 sm:py-5">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(163,230,53,.09),transparent_45%)]" />

                <div className="relative flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-lime-300">
                      <Swords size={16} />

                      <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
                        Novo racha
                      </p>
                    </div>

                    <h2 className="mt-2 text-2xl font-black text-white">
                      {group.name}
                    </h2>

                    <p className="mt-1 text-sm font-medium text-zinc-400">
                      Etapa {step} de 3
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Fechar"
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.11] bg-black/25 text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <X size={19} />
                  </button>
                </div>
              </header>

              <nav
                aria-label="Etapas do novo racha"
                className="shrink-0 border-b border-white/[0.08] bg-[#070a08]/98 px-4 py-3 sm:px-7"
              >
                <div className="grid grid-cols-3 gap-2">
                  {STEPS.map((item) => {
                    const active =
                      item.number === step;
                    const completed =
                      item.number < step;
                    const reachable =
                      item.number === 1 ||
                      (item.number === 2 &&
                        basicsValid) ||
                      (item.number === 3 &&
                        basicsValid &&
                        participantsValid);

                    return (
                      <button
                        key={item.number}
                        type="button"
                        onClick={() =>
                          navigateToStep(
                            item.number
                          )
                        }
                        className={`relative min-h-11 rounded-xl border px-2 text-xs font-black transition ${
                          active
                            ? 'border-lime-400/40 bg-lime-400/[0.13] text-lime-200 shadow-[0_0_18px_rgba(163,230,53,.08)]'
                            : completed
                              ? 'border-emerald-300/20 bg-emerald-300/[0.07] text-emerald-200'
                              : reachable
                                ? 'border-white/[0.11] bg-white/[0.035] text-zinc-300 hover:border-white/[0.20] hover:text-white'
                                : 'border-white/[0.07] bg-white/[0.018] text-zinc-600 hover:border-white/[0.12] hover:text-zinc-400'
                        }`}
                      >
                        <span className="mr-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-lg border border-current/20 px-1 text-[10px]">
                          {completed ? (
                            <Check size={11} />
                          ) : (
                            item.number
                          )}
                        </span>

                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </nav>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 sm:px-7 sm:py-6">
                {errorMessage && (
                  <p className="mb-4 rounded-2xl border border-red-300/25 bg-red-950/60 px-4 py-3 text-sm font-medium leading-6 text-red-200">
                    {errorMessage}
                  </p>
                )}

                {step === 1 && (
                  <SessionBasicsStep
                    sessionDate={
                      sessionDate
                    }
                    location={location}
                    notes={notes}
                    teamCount={teams.length}
                    onSessionDateChange={
                      setSessionDate
                    }
                    onLocationChange={
                      setLocation
                    }
                    onNotesChange={
                      setNotes
                    }
                    onTeamCountChange={
                      setTeamCount
                    }
                  />
                )}

                {step === 2 && (
                  <SessionParticipantsStep
                    players={players}
                    selectedPlayerIds={
                      selectedPlayerIds
                    }
                    guests={guests}
                    onTogglePlayer={
                      togglePlayer
                    }
                    onAddGuest={addGuest}
                    onRemoveGuest={
                      removeGuest
                    }
                  />
                )}

                {step === 3 && (
                  <SessionTeamsStep
                    teams={teams}
                    players={players}
                    selectedPlayerIds={
                      selectedPlayerIds
                    }
                    guests={guests}
                    assignments={
                      assignments
                    }
                    onTeamChange={(
                      teamId,
                      patch
                    ) =>
                      setTeams(
                        (currentTeams) =>
                          currentTeams.map(
                            (team) =>
                              team.clientId ===
                              teamId
                                ? {
                                    ...team,
                                    ...patch,
                                  }
                                : team
                          )
                      )
                    }
                    onAssign={(
                      participantKey,
                      teamId
                    ) =>
                      setAssignments(
                        (
                          currentAssignments
                        ) => ({
                          ...currentAssignments,
                          [participantKey]:
                            teamId,
                        })
                      )
                    }
                    onDistribute={
                      distributeParticipants
                    }
                  />
                )}
              </div>

              <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.10] bg-[#070a08]/98 px-5 py-4 shadow-[0_-18px_40px_rgba(0,0,0,.28)] sm:px-7">
                <button
                  type="button"
                  onClick={() =>
                    navigateToStep(
                      Math.max(
                        1,
                        step - 1
                      )
                    )
                  }
                  disabled={step === 1}
                  className="flex h-11 items-center gap-2 rounded-2xl border border-white/[0.10] px-4 text-sm font-bold text-zinc-300 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ArrowLeft size={16} />
                  Voltar
                </button>

                {step < 3 ? (
                  <button
                    type="button"
                    onClick={goNext}
                    disabled={!canContinue}
                    className="flex h-11 items-center gap-2 rounded-2xl bg-lime-400 px-5 text-sm font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Continuar
                    <ArrowRight
                      size={16}
                    />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      void saveSession()
                    }
                    disabled={
                      !teamsValid || saving
                    }
                    className="flex h-11 items-center gap-2 rounded-2xl bg-lime-400 px-5 text-sm font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {saving ? (
                      <LoaderCircle
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={16} />
                    )}

                    Salvar racha
                  </button>
                )}
              </footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </ModalPortal>
  );
}
