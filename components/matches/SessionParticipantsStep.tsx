'use client';

import { useMemo, useState } from 'react';
import {
  Plus,
  Search,
  Shield,
  Trash2,
  UserPlus,
  UsersRound,
  type LucideIcon,
} from 'lucide-react';

import type {
  FutsalParticipantRole,
  PlayerWithCard,
} from '@/types';
import type { GuestDraft } from './sessionCreateTypes';

interface SessionParticipantsStepProps {
  players: PlayerWithCard[];
  selectedPlayerIds: Set<string>;
  guests: GuestDraft[];
  onTogglePlayer: (playerId: string) => void;
  onAddGuest: (guest: GuestDraft) => void;
  onRemoveGuest: (guestId: string) => void;
}

export function SessionParticipantsStep({
  players,
  selectedPlayerIds,
  guests,
  onTogglePlayer,
  onAddGuest,
  onRemoveGuest,
}: SessionParticipantsStepProps) {
  const [search, setSearch] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestRole, setGuestRole] =
    useState<FutsalParticipantRole>('goalkeeper');

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return players;

    return players.filter((player) =>
      [player.name, player.nickname, player.position]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [players, search]);

  function addGuest() {
    const normalizedName = guestName.trim();
    if (normalizedName.length < 2) return;

    onAddGuest({
      clientId: crypto.randomUUID(),
      name: normalizedName,
      role: guestRole,
    });

    setGuestName('');
    setGuestRole('goalkeeper');
  }

  return (
    <div className="space-y-5">
      <div>
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.08] text-cyan-200">
          <UsersRound size={19} />
        </span>
        <h3 className="mt-4 text-xl font-black text-white">
          Quem participou?
        </h3>
        <p className="mt-1.5 text-sm leading-6 text-zinc-400">
          Selecione jogadores do grupo e adicione convidados temporários.
        </p>
      </div>

      <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/[0.11] bg-black/30 px-4 transition focus-within:border-lime-400/40">
        <Search size={17} className="text-zinc-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar jogador..."
          className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-zinc-600"
        />
      </label>

      <div className="grid gap-2 sm:grid-cols-2">
        {filteredPlayers.map((player) => {
          const selected = selectedPlayerIds.has(player.id);

          return (
            <button
              key={player.id}
              type="button"
              onClick={() => onTogglePlayer(player.id)}
              className={`flex items-center gap-3 rounded-[18px] border p-3 text-left transition ${
                selected
                  ? 'border-lime-400/35 bg-lime-400/[0.10]'
                  : 'border-white/[0.09] bg-white/[0.025] hover:border-white/[0.16]'
              }`}
            >
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-xs font-black ${
                  selected
                    ? 'border-lime-400/25 bg-lime-400/[0.13] text-lime-200'
                    : 'border-white/[0.08] bg-black/25 text-zinc-400'
                }`}
              >
                {player.card.overall}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-black text-white">
                  {player.nickname || player.name}
                </span>
                <span className="mt-1 block text-xs font-medium text-zinc-400">
                  {player.position} · OVR {player.card.overall}
                </span>
              </span>

              <span
                className={`h-5 w-5 shrink-0 rounded-full border-2 ${
                  selected
                    ? 'border-lime-300 bg-lime-300 shadow-[inset_0_0_0_4px_#17200d]'
                    : 'border-zinc-600'
                }`}
              />
            </button>
          );
        })}
      </div>

      <div className="rounded-[22px] border border-white/[0.10] bg-[#0a0e0b]/90 p-4">
        <div className="flex items-center gap-2 text-amber-200">
          <UserPlus size={17} />
          <p className="text-sm font-black">Adicionar convidado</p>
        </div>
        <p className="mt-1.5 text-xs leading-5 text-zinc-500">
          O convidado aparece somente nesta sessão e não entra no overall.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
          <input
            value={guestName}
            onChange={(event) => setGuestName(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                addGuest();
              }
            }}
            placeholder="Nome do convidado"
            maxLength={60}
            className="h-12 rounded-2xl border border-white/[0.12] bg-black/35 px-4 text-base font-semibold text-white outline-none transition placeholder:text-zinc-600 focus:border-amber-300/45"
          />

          <div className="grid grid-cols-2 gap-2 sm:w-64">
            <GuestRoleButton
              active={guestRole === 'line'}
              icon={UsersRound}
              label="Linha"
              onClick={() => setGuestRole('line')}
            />
            <GuestRoleButton
              active={guestRole === 'goalkeeper'}
              icon={Shield}
              label="Goleiro"
              onClick={() => setGuestRole('goalkeeper')}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={addGuest}
          disabled={guestName.trim().length < 2}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-amber-300/25 bg-amber-300/[0.09] text-sm font-black text-amber-100 transition hover:bg-amber-300/[0.14] disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={16} />
          Adicionar convidado
        </button>

        {guests.length > 0 && (
          <div className="mt-4 space-y-2">
            {guests.map((guest) => (
              <div
                key={guest.clientId}
                className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/25 px-3 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-amber-300/15 bg-amber-300/[0.07] text-amber-200">
                  {guest.role === 'goalkeeper' ? (
                    <Shield size={15} />
                  ) : (
                    <UsersRound size={15} />
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold text-white">
                    {guest.name}
                  </span>
                  <span className="mt-0.5 block text-xs text-zinc-500">
                    Convidado · {guest.role === 'goalkeeper' ? 'Goleiro' : 'Linha'}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => onRemoveGuest(guest.clientId)}
                  aria-label={`Remover ${guest.name}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-300/15 text-red-200 transition hover:bg-red-300/[0.08]"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function GuestRoleButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 items-center justify-center gap-2 rounded-2xl border text-xs font-black transition ${
        active
          ? 'border-amber-300/35 bg-amber-300/[0.12] text-amber-100'
          : 'border-white/[0.09] bg-white/[0.025] text-zinc-400'
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}
