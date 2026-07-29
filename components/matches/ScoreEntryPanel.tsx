'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  Clock3,
  Goal,
  LoaderCircle,
  Minus,
  Plus,
} from 'lucide-react';

import type {
  FutsalGameEndReason,
  FutsalSessionDetails,
} from '@/types';
import { addFutsalGame } from '@/lib/supabase/matchCenter';
import { getTeamColor } from '@/lib/matchCenter/teamColors';

interface ScoreEntryPanelProps {
  session: FutsalSessionDetails;
  onSaved: () => void | Promise<void>;
}

export function ScoreEntryPanel({
  session,
  onSaved,
}: ScoreEntryPanelProps) {
  const [homeTeamId, setHomeTeamId] = useState(
    session.teams[0]?.id ?? ''
  );
  const [awayTeamId, setAwayTeamId] = useState(
    session.teams[1]?.id ?? ''
  );
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [endedBy, setEndedBy] =
    useState<FutsalGameEndReason>('time_limit');
  const [minutes, setMinutes] = useState(7);
  const [seconds, setSeconds] = useState(0);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (endedBy === 'time_limit') {
      setMinutes(7);
      setSeconds(0);
      setHomeScore((score) => Math.min(score, 1));
      setAwayScore((score) => Math.min(score, 1));
    }
  }, [endedBy]);

  const validationMessage = useMemo(() => {
    if (!homeTeamId || !awayTeamId || homeTeamId === awayTeamId) {
      return 'Escolha dois times diferentes.';
    }

    if (endedBy === 'goal_limit') {
      const validScore =
        (homeScore === 2 && awayScore <= 1) ||
        (awayScore === 2 && homeScore <= 1);

      if (!validScore) {
        return 'Por limite, o placar deve ser 2–0 ou 2–1.';
      }
    } else if (homeScore > 1 || awayScore > 1) {
      return 'Por tempo, o placar máximo é 1–1.';
    }

    const duration = minutes * 60 + seconds;
    if (duration < 1 || duration > 420) {
      return 'A duração deve ficar entre 00:01 e 07:00.';
    }

    return '';
  }, [
    awayScore,
    awayTeamId,
    endedBy,
    homeScore,
    homeTeamId,
    minutes,
    seconds,
  ]);

  async function saveGame() {
    if (validationMessage || saving) {
      setErrorMessage(validationMessage);
      return;
    }

    setSaving(true);
    setErrorMessage('');

    try {
      await addFutsalGame({
        sessionId: session.id,
        homeTeamId,
        awayTeamId,
        homeScore,
        awayScore,
        durationSeconds: minutes * 60 + seconds,
        endedBy,
      });

      setHomeScore(0);
      setAwayScore(0);
      setEndedBy('time_limit');
      setMinutes(7);
      setSeconds(0);
      await onSaved();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível registrar a partida.'
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-lime-400/20 bg-lime-400/[0.055] p-4 sm:p-5">
      <div className="flex items-center gap-2 text-lime-200">
        <Goal size={17} />
        <h3 className="text-sm font-black">Registrar partida</h3>
      </div>

      {errorMessage && (
        <p className="mt-3 rounded-2xl border border-red-300/20 bg-red-950/55 px-3 py-2.5 text-sm text-red-200">
          {errorMessage}
        </p>
      )}

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto_1fr] md:items-end">
        <TeamPicker
          label="Time A"
          teams={session.teams}
          value={homeTeamId}
          excludedTeamId={awayTeamId}
          onChange={setHomeTeamId}
        />

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:pb-1">
          <ScoreStepper
            value={homeScore}
            maximum={endedBy === 'time_limit' ? 1 : 2}
            onChange={setHomeScore}
          />

          <span className="text-xl font-black text-zinc-500">×</span>

          <ScoreStepper
            value={awayScore}
            maximum={endedBy === 'time_limit' ? 1 : 2}
            onChange={setAwayScore}
          />
        </div>

        <TeamPicker
          label="Time B"
          teams={session.teams}
          value={awayTeamId}
          excludedTeamId={homeTeamId}
          onChange={setAwayTeamId}
        />
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="grid grid-cols-2 gap-2">
          <EndReasonButton
            active={endedBy === 'goal_limit'}
            icon={Goal}
            title="2 gols"
            description="Encerrou ao atingir o limite"
            onClick={() => setEndedBy('goal_limit')}
          />

          <EndReasonButton
            active={endedBy === 'time_limit'}
            icon={Clock3}
            title="7 minutos"
            description="Encerrou pelo cronômetro"
            onClick={() => setEndedBy('time_limit')}
          />
        </div>

        <div className="rounded-2xl border border-white/[0.10] bg-black/25 p-3">
          <p className="text-xs font-bold text-zinc-400">Duração</p>

          <div className="mt-2 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <TimeInput
              label="min"
              value={minutes}
              max={7}
              disabled={endedBy === 'time_limit'}
              onChange={setMinutes}
            />
            <span className="text-lg font-black text-zinc-500">:</span>
            <TimeInput
              label="seg"
              value={seconds}
              max={59}
              disabled={endedBy === 'time_limit'}
              onChange={setSeconds}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => void saveGame()}
        disabled={Boolean(validationMessage) || saving}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 text-sm font-black text-black transition hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-35"
      >
        {saving ? (
          <LoaderCircle size={17} className="animate-spin" />
        ) : (
          <Check size={17} />
        )}
        Salvar partida
      </button>
    </section>
  );
}

function TeamPicker({
  label,
  teams,
  value,
  excludedTeamId,
  onChange,
}: {
  label: string;
  teams: FutsalSessionDetails['teams'];
  value: string;
  excludedTeamId: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-bold text-zinc-400">{label}</p>

      <div className="grid gap-2">
        {teams.map((team) => {
          const color = getTeamColor(team.color);
          const selected = value === team.id;
          const disabled = excludedTeamId === team.id;

          return (
            <button
              key={team.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(team.id)}
              className={`flex min-h-11 items-center gap-3 rounded-xl border px-3 text-left text-sm font-bold transition ${
                selected
                  ? `${color.borderClass} ${color.backgroundClass} ${color.textClass}`
                  : 'border-white/[0.09] bg-black/25 text-zinc-400'
              } disabled:cursor-not-allowed disabled:opacity-25`}
            >
              <span className={`h-3 w-3 rounded-full ${color.dotClass}`} />
              <span className="truncate">{team.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScoreStepper({
  value,
  maximum,
  onChange,
}: {
  value: number;
  maximum: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="flex items-center justify-center gap-1 rounded-2xl border border-white/[0.10] bg-black/30 p-1">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-white/[0.08]"
      >
        <Minus size={15} />
      </button>

      <span className="w-8 text-center text-2xl font-black tabular-nums text-white">
        {value}
      </span>

      <button
        type="button"
        onClick={() => onChange(Math.min(maximum, value + 1))}
        className="flex h-9 w-9 items-center justify-center rounded-xl text-zinc-300 transition hover:bg-white/[0.08]"
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function EndReasonButton({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean;
  icon: typeof Goal;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition ${
        active
          ? 'border-lime-400/35 bg-lime-400/[0.11]'
          : 'border-white/[0.09] bg-black/25'
      }`}
    >
      <Icon
        size={16}
        className={active ? 'text-lime-300' : 'text-zinc-500'}
      />
      <p className="mt-2 text-sm font-black text-white">{title}</p>
      <p className="mt-1 text-[11px] leading-4 text-zinc-500">
        {description}
      </p>
    </button>
  );
}

function TimeInput({
  label,
  value,
  max,
  disabled,
  onChange,
}: {
  label: string;
  value: number;
  max: number;
  disabled: boolean;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(
            Math.max(
              0,
              Math.min(max, Number(event.target.value) || 0)
            )
          )
        }
        className="h-10 w-full rounded-xl border border-white/[0.10] bg-[#070a08] px-2 text-center text-base font-black tabular-nums text-white outline-none disabled:opacity-50"
      />
      <span className="mt-1 block text-center text-[9px] font-bold uppercase tracking-[0.11em] text-zinc-600">
        {label}
      </span>
    </label>
  );
}
