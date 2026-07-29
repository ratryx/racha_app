'use client';

import {
  useEffect,
  useMemo,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from 'framer-motion';
import {
  Activity,
  CalendarDays,
  Crown,
  Edit3,
  LoaderCircle,
  MapPin,
  Shield,
  Sparkles,
  Target,
  Trophy,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';

import type {
  PlayerMatchHistory,
  PlayerPosition,
  PlayerWithCard,
} from '@/types';
import { getPlayerMatchHistory } from '@/lib/supabase/queries';
import { getCardTier } from '@/lib/cardTier';

interface PlayerDetailsModalProps {
  open: boolean;
  player: PlayerWithCard | null;
  canEdit: boolean;
  onClose: () => void;
  onEdit: () => void;
}

export function PlayerDetailsModal({
  open,
  player,
  canEdit,
  onClose,
  onEdit,
}: PlayerDetailsModalProps) {
  const dragControls = useDragControls();
  const [history, setHistory] = useState<PlayerMatchHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!open || !player) {
      return;
    }

    let active = true;

    setLoading(true);
    setErrorMessage('');

    getPlayerMatchHistory(player.id)
      .then((result) => {
        if (active) {
          setHistory(result);
        }
      })
      .catch((error) => {
        if (active) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : 'Não foi possível carregar o histórico.'
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [open, player]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, open]);

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 120 || info.velocity.y > 850) {
      onClose();
    }
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    dragControls.start(event);
  }

  return (
    <AnimatePresence>
      {open && player && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-label={`Perfil de ${getDisplayName(player)}`}
            onClick={(event) => event.stopPropagation()}
            initial={{ y: 48, opacity: 0, scale: 0.985 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 52, opacity: 0, scale: 0.985 }}
            transition={{ type: 'spring', stiffness: 320, damping: 31 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.72 }}
            dragSnapToOrigin
            onDragEnd={handleDragEnd}
            className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[30px] border border-white/10 bg-[#080a09] shadow-2xl shadow-black/70 sm:max-h-[90vh] sm:rounded-[30px]"
          >
            <div
              onPointerDown={startDrag}
              className="flex cursor-grab justify-center py-2 active:cursor-grabbing sm:hidden"
              style={{ touchAction: 'none' }}
            >
              <span className="h-1.5 w-12 rounded-full bg-white/15" />
            </div>

            <header className="flex shrink-0 items-center justify-between border-b border-white/[0.07] px-5 pb-4 pt-2 sm:px-7 sm:py-5">
              <div>
                <p className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-lime-400">
                  Perfil do jogador
                </p>
                <h2 className="font-display mt-1 text-2xl font-black uppercase tracking-[0.02em] text-white">
                  Números completos
                </h2>
              </div>

              <div className="flex items-center gap-2">
                {canEdit && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="flex h-10 items-center gap-2 rounded-xl border border-lime-400/25 bg-lime-400/[0.08] px-3 text-sm font-extrabold text-lime-300 transition hover:border-lime-400/45 hover:bg-lime-400/[0.14]"
                  >
                    <Edit3 size={15} />
                    <span className="hidden sm:inline">Editar card</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-zinc-500 transition hover:bg-white/5 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto">
              <PlayerHero player={player} />

              <div className="grid gap-5 px-4 pb-6 pt-5 sm:px-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:px-7">
                <section className="space-y-5">
                  <div>
                    <SectionTitle
                      eyebrow="Carreira"
                      title="Totais do jogador"
                    />

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <TotalStat
                        icon={CalendarDays}
                        label="Partidas"
                        value={player.aggregates.matches_played}
                      />
                      <TotalStat
                        icon={Target}
                        label="Gols"
                        value={player.aggregates.total_goals}
                      />
                      <TotalStat
                        icon={Sparkles}
                        label="Assistências"
                        value={player.aggregates.total_assists}
                      />
                      <TotalStat
                        icon={Activity}
                        label="Desarmes"
                        value={player.aggregates.total_tackles}
                      />
                      <TotalStat
                        icon={Shield}
                        label="Defesas"
                        value={player.aggregates.total_saves}
                      />
                      <TotalStat
                        icon={Crown}
                        label="Craques"
                        value={player.aggregates.total_motm}
                        emphasized
                      />
                    </div>
                  </div>

                  <AveragePanel player={player} />
                </section>

                <section className="min-w-0">
                  <SectionTitle
                    eyebrow="Últimas partidas"
                    title="Histórico recente"
                  />

                  <div className="mt-3">
                    {loading ? (
                      <div className="flex min-h-48 items-center justify-center rounded-[22px] border border-white/[0.07] bg-white/[0.02] text-sm font-semibold text-zinc-600">
                        <LoaderCircle
                          size={18}
                          className="mr-2 animate-spin"
                        />
                        Carregando histórico...
                      </div>
                    ) : errorMessage ? (
                      <p className="rounded-[22px] border border-red-500/20 bg-red-500/10 px-4 py-4 text-sm text-red-300">
                        {errorMessage}
                      </p>
                    ) : history.length === 0 ? (
                      <div className="flex min-h-48 flex-col items-center justify-center rounded-[22px] border border-dashed border-white/[0.09] bg-white/[0.015] px-5 text-center">
                        <Trophy size={26} className="text-zinc-700" />
                        <p className="mt-3 font-bold text-zinc-300">
                          Nenhuma partida registrada
                        </p>
                        <p className="mt-1 max-w-sm text-sm leading-relaxed text-zinc-600">
                          O histórico aparecerá depois que o administrador lançar
                          o primeiro pós-jogo.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {history.map((match) => (
                          <MatchHistoryRow
                            key={match.id}
                            match={match}
                            position={player.position}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PlayerHero({ player }: { player: PlayerWithCard }) {
  const tier = getCardTier(player.card.overall);
  const focus = getPositionFocus(player.position, player);
  const displayName = getDisplayName(player);

  return (
    <section
      className="relative overflow-hidden border-b border-white/[0.07] px-5 py-5 sm:px-7 sm:py-7"
      style={{ background: tier.surface }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-75"
        style={{ backgroundImage: tier.pattern }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/55" />

      <div className="relative flex items-center gap-4 sm:gap-6">
        <div
          className="relative h-[118px] w-[96px] shrink-0 overflow-hidden rounded-[24px] border sm:h-[142px] sm:w-[116px]"
          style={{
            borderColor: `${tier.accent}55`,
            boxShadow: `0 16px 34px ${tier.glow}`,
          }}
        >
          {player.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photo_url}
              alt={player.name}
              className="h-full w-full object-cover object-top"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-black/30 text-white/35">
              <UserRound size={46} strokeWidth={1.2} />
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/[0.05]" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="rounded-full border px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em]"
              style={{
                borderColor: `${tier.accent}45`,
                background: `${tier.accent}12`,
                color: tier.accent,
              }}
            >
              {tier.name}
            </span>

            <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] font-extrabold uppercase tracking-[0.16em] text-zinc-400">
              {player.position}
            </span>
          </div>

          <h3 className="font-display mt-3 truncate text-[34px] font-black uppercase leading-none tracking-[0.01em] text-white sm:text-[48px]">
            {displayName}
          </h3>

          <p className="mt-2 truncate text-sm text-zinc-400">
            {player.name}
          </p>

          <div className="mt-4 flex flex-wrap items-end gap-5">
            <div>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">
                Overall
              </p>
              <p
                className="mt-1 text-4xl font-black leading-none tabular-nums sm:text-5xl"
                style={{
                  color: tier.text,
                  textShadow: `0 4px 22px ${tier.glow}`,
                }}
              >
                {player.card.overall}
              </p>
            </div>

            <div className="min-w-0">
              <p className="text-[8px] font-extrabold uppercase tracking-[0.2em] text-zinc-500">
                Destaque da posição
              </p>
              <p className="mt-1 truncate text-lg font-black text-white sm:text-xl">
                {focus.value}
                <span className="ml-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-500">
                  {focus.label}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AveragePanel({ player }: { player: PlayerWithCard }) {
  const matches = player.aggregates.matches_played;

  return (
    <div className="rounded-[22px] border border-white/[0.07] bg-white/[0.02] p-4">
      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-600">
        Média por partida
      </p>

      <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-4">
        <AverageValue
          label="Gols"
          value={average(player.aggregates.total_goals, matches)}
        />
        <AverageValue
          label="Assistências"
          value={average(player.aggregates.total_assists, matches)}
        />
        <AverageValue
          label="Desarmes"
          value={average(player.aggregates.total_tackles, matches)}
        />
        <AverageValue
          label="Defesas"
          value={average(player.aggregates.total_saves, matches)}
        />
      </div>
    </div>
  );
}

function MatchHistoryRow({
  match,
  position,
}: {
  match: PlayerMatchHistory;
  position: PlayerPosition;
}) {
  const hasNumbers =
    match.goals > 0 ||
    match.assists > 0 ||
    match.tackles > 0 ||
    match.saves > 0;

  const focusValue =
    position === 'GOL'
      ? match.saves
      : position === 'ZAG' || position === 'LAT'
        ? match.tackles
        : position === 'MEI'
          ? match.assists
          : match.goals;

  const focusLabel =
    position === 'GOL'
      ? 'defesas'
      : position === 'ZAG' || position === 'LAT'
        ? 'desarmes'
        : position === 'MEI'
          ? 'assist.'
          : 'gols';

  return (
    <article className="rounded-[20px] border border-white/[0.07] bg-white/[0.02] p-3.5 transition hover:border-white/[0.12] hover:bg-white/[0.035]">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-black/30 text-zinc-400">
          <CalendarDays size={17} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-extrabold capitalize text-white">
                {formatMatchDate(match.match_date)}
              </p>

              <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-zinc-600">
                {match.location ? (
                  <>
                    <MapPin size={11} />
                    {match.location}
                  </>
                ) : (
                  'Racha da terça'
                )}
              </p>
            </div>

            <div className="text-right">
              <p className="text-lg font-black tabular-nums text-white">
                {focusValue}
              </p>
              <p className="text-[8px] font-extrabold uppercase tracking-[0.12em] text-zinc-600">
                {focusLabel}
              </p>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {match.goals > 0 && (
              <HistoryBadge label={`${match.goals} GOL`} />
            )}
            {match.assists > 0 && (
              <HistoryBadge label={`${match.assists} ASS`} />
            )}
            {match.tackles > 0 && (
              <HistoryBadge label={`${match.tackles} DES`} />
            )}
            {match.saves > 0 && (
              <HistoryBadge label={`${match.saves} DEF`} />
            )}
            {match.is_motm && (
              <HistoryBadge label="CRAQUE" emphasized />
            )}
            {!hasNumbers && !match.is_motm && (
              <span className="text-[9px] font-bold uppercase tracking-[0.13em] text-zinc-700">
                Participou sem números
              </span>
            )}
          </div>

          {match.notes && (
            <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-zinc-600">
              {match.notes}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-extrabold uppercase tracking-[0.22em] text-lime-400">
        {eyebrow}
      </p>
      <h3 className="font-display mt-1 text-xl font-black uppercase tracking-[0.02em] text-white">
        {title}
      </h3>
    </div>
  );
}

function TotalStat({
  icon: Icon,
  label,
  value,
  emphasized = false,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  emphasized?: boolean;
}) {
  return (
    <div
      className={`rounded-[18px] border p-3 ${
        emphasized
          ? 'border-amber-300/20 bg-amber-300/[0.06]'
          : 'border-white/[0.07] bg-white/[0.02]'
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <Icon
          size={15}
          className={emphasized ? 'text-amber-300' : 'text-lime-400'}
        />
        <strong className="text-xl font-black tabular-nums text-white">
          {value}
        </strong>
      </div>

      <p className="mt-3 text-[8px] font-extrabold uppercase tracking-[0.15em] text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function AverageValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-2xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-1 text-[8px] font-extrabold uppercase tracking-[0.14em] text-zinc-600">
        {label}
      </p>
    </div>
  );
}

function HistoryBadge({
  label,
  emphasized = false,
}: {
  label: string;
  emphasized?: boolean;
}) {
  return (
    <span
      className={`rounded-lg border px-2 py-1 text-[8px] font-extrabold uppercase tracking-[0.12em] ${
        emphasized
          ? 'border-amber-300/30 bg-amber-300/10 text-amber-200'
          : 'border-white/[0.07] bg-black/25 text-zinc-400'
      }`}
    >
      {label}
    </span>
  );
}

function getDisplayName(player: PlayerWithCard): string {
  return player.nickname?.trim() || player.name;
}

function average(total: number, matches: number): string {
  if (matches <= 0) {
    return '0,0';
  }

  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(total / matches);
}

function formatMatchDate(date: string): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(`${date}T12:00:00`));
}

function getPositionFocus(
  position: PlayerPosition,
  player: PlayerWithCard
): {
  label: string;
  value: number;
} {
  if (position === 'GOL') {
    return {
      label: 'defesas',
      value: player.aggregates.total_saves,
    };
  }

  if (position === 'ZAG' || position === 'LAT') {
    return {
      label: 'desarmes',
      value: player.aggregates.total_tackles,
    };
  }

  if (position === 'MEI') {
    return {
      label: 'assistências',
      value: player.aggregates.total_assists,
    };
  }

  return {
    label: 'gols',
    value: player.aggregates.total_goals,
  };
}
