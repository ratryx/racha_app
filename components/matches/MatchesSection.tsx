'use client';

import { useMemo, useState } from 'react';
import {
  History,
  LoaderCircle,
  Plus,
  Swords,
} from 'lucide-react';

import type {
  FutsalSessionDetails,
  Group,
  PlayerWithCard,
} from '@/types';
import { useMatchCenter } from '@/hooks/useMatchCenter';
import { FutsalRulesPanel } from './FutsalRulesPanel';
import { SessionCard } from './SessionCard';
import { SessionCreateModal } from './SessionCreateModal';
import { SessionDetailsModal } from './SessionDetailsModal';

interface MatchesSectionProps {
  isAdmin: boolean;
  group: Group;
  players: PlayerWithCard[];
  onOpenPostMatch: () => void;
}

export function MatchesSection({
  isAdmin,
  group,
  players,
  onOpenPostMatch,
}: MatchesSectionProps) {
  const matchCenter = useMatchCenter(group.id);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedSessionId, setSelectedSessionId] =
    useState<string | null>(null);

  const selectedSession = useMemo<FutsalSessionDetails | null>(
    () =>
      matchCenter.sessions.find(
        (session) => session.id === selectedSessionId
      ) ?? null,
    [matchCenter.sessions, selectedSessionId]
  );

  async function refreshAndSelect(sessionId?: string) {
    if (sessionId) setSelectedSessionId(sessionId);
    await matchCenter.reload();
  }

  return (
    <section className="space-y-4">
      <div className="relative overflow-hidden rounded-[28px] border border-white/[0.11] bg-[#070b08]/90 p-5 shadow-2xl shadow-black/25 backdrop-blur-xl sm:p-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(163,230,53,.14),transparent_38%),radial-gradient(circle_at_92%_15%,rgba(34,211,238,.07),transparent_34%)]" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lime-300">
              <Swords size={17} />
              <p className="text-[11px] font-bold uppercase tracking-[0.14em]">
                Central de partidas
              </p>
            </div>

            <h2 className="mt-4 max-w-3xl text-3xl font-black leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              Times, placares e classificação de cada racha.
            </h2>

            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-zinc-300/80">
              Registre os times definidos no dia, convidados, partidas de até
              sete minutos e a classificação de{' '}
              <strong className="text-white">{group.name}</strong>.
            </p>
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-2xl bg-lime-400 px-5 text-sm font-black text-black transition hover:bg-lime-300 active:scale-[0.98]"
            >
              <Plus size={17} />
              Criar novo racha
            </button>
          )}
        </div>
      </div>

      <FutsalRulesPanel />

      {matchCenter.errorMessage && (
        <p className="rounded-2xl border border-red-300/20 bg-red-950/55 px-4 py-3 text-sm text-red-200">
          {matchCenter.errorMessage}
        </p>
      )}

      <div className="rounded-[24px] border border-white/[0.10] bg-black/25 p-4 backdrop-blur-xl sm:p-5">
        <div className="flex items-center gap-2 text-zinc-200">
          <History size={17} />
          <h3 className="text-base font-black">Histórico de rachas</h3>
        </div>
        <p className="mt-1.5 text-sm text-zinc-500">
          Sessões ativas e finalizadas do grupo.
        </p>

        {matchCenter.loading ? (
          <div className="flex min-h-60 items-center justify-center text-sm font-semibold text-zinc-400">
            <LoaderCircle size={18} className="mr-2 animate-spin" />
            Carregando sessões...
          </div>
        ) : matchCenter.sessions.length === 0 ? (
          <div className="flex min-h-60 flex-col items-center justify-center text-center">
            <Swords size={28} className="text-zinc-600" />
            <p className="mt-4 text-base font-black text-white">
              Nenhum racha registrado
            </p>
            <p className="mt-1.5 max-w-sm text-sm leading-6 text-zinc-500">
              {isAdmin
                ? 'Crie a primeira sessão para salvar times e placares.'
                : 'O administrador ainda não registrou nenhuma sessão.'}
            </p>
          </div>
        ) : (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {matchCenter.sessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onOpen={() => setSelectedSessionId(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      {isAdmin && (
        <SessionCreateModal
          open={createOpen}
          group={group}
          players={players}
          onClose={() => setCreateOpen(false)}
          onCreated={refreshAndSelect}
        />
      )}

      <SessionDetailsModal
        open={Boolean(selectedSession)}
        session={selectedSession}
        isAdmin={isAdmin}
        onClose={() => setSelectedSessionId(null)}
        onChanged={() =>
          refreshAndSelect(selectedSessionId ?? undefined)
        }
        onOpenPostMatch={onOpenPostMatch}
      />
    </section>
  );
}
