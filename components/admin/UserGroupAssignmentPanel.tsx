'use client';

import {
  Search,
} from 'lucide-react';

import type {
  AdminUserOverview,
  Group,
} from '@/types';
import { GroupAssignmentSelect } from './GroupAssignmentSelect';

interface UserGroupAssignmentPanelProps {
  users: AdminUserOverview[];
  groups: Group[];
  totalUsers: number;
  pendingUsersCount: number;
  search: string;
  changingUserId: string | null;
  onSearchChange: (value: string) => void;
  onMembershipChange: (
    userId: string,
    groupId: string
  ) => void | Promise<void>;
}

export function UserGroupAssignmentPanel({
  users,
  groups,
  totalUsers,
  pendingUsersCount,
  search,
  changingUserId,
  onSearchChange,
  onMembershipChange,
}: UserGroupAssignmentPanelProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-[24px] border border-white/[0.11] bg-[#090d0a]/95 shadow-xl shadow-black/20">
      <div className="border-b border-white/[0.10] p-4 sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-black text-white">
              Jogadores cadastrados
            </p>

            <p className="mt-1.5 text-sm leading-6 text-zinc-400">
              <strong className="font-bold text-white">
                {totalUsers}
              </strong>{' '}
              contas cadastradas
              <span className="mx-2 text-zinc-700">
                •
              </span>
              <strong className="font-bold text-amber-200">
                {pendingUsersCount}
              </strong>{' '}
              sem grupo
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <label
              htmlFor="group-user-search"
              className="text-sm font-bold text-zinc-200"
            >
              Buscar jogador
            </label>

            <div className="mt-2 flex h-12 items-center gap-3 rounded-2xl border border-white/[0.13] bg-black/40 px-4 transition focus-within:border-lime-400/45 focus-within:ring-2 focus-within:ring-lime-400/10">
              <Search
                size={17}
                className="shrink-0 text-zinc-400"
              />

              <input
                id="group-user-search"
                value={search}
                onChange={(event) =>
                  onSearchChange(
                    event.target.value
                  )
                }
                placeholder="Nome, telefone ou grupo"
                className="min-w-0 flex-1 bg-transparent text-base font-medium text-white outline-none placeholder:text-zinc-600"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/[0.08]">
        {users.map((user) => {
          const displayName =
            user.player_nickname ||
            user.player_name ||
            user.display_name ||
            user.phone ||
            'Usuário sem nome';

          const changing =
            changingUserId === user.id;

          return (
            <article
              key={user.id}
              className={`p-4 transition sm:p-5 ${
                user.group_id === null
                  ? 'bg-amber-300/[0.025]'
                  : 'hover:bg-white/[0.02]'
              }`}
            >
              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(290px,370px)] xl:items-center">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-base font-black text-white">
                      {displayName}
                    </p>

                    {user.role === 'admin' && (
                      <span className="rounded-full border border-emerald-300/25 bg-emerald-300/[0.09] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.10em] text-emerald-200">
                        Admin
                      </span>
                    )}

                    {!user.group_id && (
                      <span className="rounded-full border border-amber-300/30 bg-amber-300/[0.10] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.10em] text-amber-200">
                        Sem grupo
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 break-words text-sm leading-5 text-zinc-400">
                    {user.phone ??
                      'Telefone não informado'}
                  </p>

                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {user.player_name
                      ? `Card: ${user.player_name}`
                      : 'Card ainda não criado'}
                  </p>
                </div>

                <GroupAssignmentSelect
                  userId={user.id}
                  displayName={displayName}
                  groups={groups}
                  value={user.group_id}
                  disabled={changing}
                  onChange={(groupId) =>
                    onMembershipChange(
                      user.id,
                      groupId
                    )
                  }
                />
              </div>
            </article>
          );
        })}

        {!users.length && (
          <div className="px-5 py-16 text-center">
            <p className="text-base font-semibold text-zinc-300">
              Nenhum jogador encontrado
            </p>

            <p className="mt-1 text-sm text-zinc-500">
              Ajuste o termo usado na busca.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
