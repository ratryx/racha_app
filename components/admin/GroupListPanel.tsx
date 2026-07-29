'use client';

import {
  Check,
  Edit3,
  Eye,
  X,
  Users,
} from 'lucide-react';

import type { Group } from '@/types';

interface GroupListPanelProps {
  groups: Group[];
  currentGroupId: string | null;
  groupCounts: Map<string, number>;
  renamingGroupId: string | null;
  renameValue: string;
  onRenameValueChange: (
    value: string
  ) => void;
  onStartRename: (group: Group) => void;
  onCancelRename: () => void;
  onConfirmRename: (
    groupId: string
  ) => void | Promise<void>;
  onSelectGroup: (groupId: string) => void;
}

export function GroupListPanel({
  groups,
  currentGroupId,
  groupCounts,
  renamingGroupId,
  renameValue,
  onRenameValueChange,
  onStartRename,
  onCancelRename,
  onConfirmRename,
  onSelectGroup,
}: GroupListPanelProps) {
  return (
    <section className="rounded-[24px] border border-white/[0.11] bg-[#0a0e0b]/90 p-3 shadow-lg shadow-black/15">
      <div className="mb-3 flex items-center justify-between px-1 py-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-zinc-300">
            Grupos ativos
          </p>

          <p className="mt-1 text-xs text-zinc-500">
            Escolha qual grupo visualizar.
          </p>
        </div>

        <span className="rounded-full border border-white/[0.10] bg-white/[0.05] px-2.5 py-1 text-xs font-bold tabular-nums text-zinc-300">
          {groups.length}
        </span>
      </div>

      <div className="space-y-2.5">
        {groups.map((group) => {
          const selected =
            group.id === currentGroupId;
          const renaming =
            group.id === renamingGroupId;

          return (
            <article
              key={group.id}
              className={`rounded-[18px] border p-3.5 transition ${
                selected
                  ? 'border-lime-400/35 bg-lime-400/[0.09]'
                  : 'border-white/[0.09] bg-black/25 hover:border-white/[0.15]'
              }`}
            >
              {renaming ? (
                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    void onConfirmRename(
                      group.id
                    );
                  }}
                  className="space-y-2"
                >
                  <label
                    htmlFor={`rename-group-${group.id}`}
                    className="block text-xs font-semibold text-zinc-300"
                  >
                    Novo nome
                  </label>

                  <div className="flex gap-2">
                    <input
                      id={`rename-group-${group.id}`}
                      value={renameValue}
                      onChange={(event) =>
                        onRenameValueChange(
                          event.target.value
                        )
                      }
                      maxLength={60}
                      autoFocus
                      className="h-11 min-w-0 flex-1 rounded-xl border border-white/[0.13] bg-black/45 px-3 text-base font-semibold text-white outline-none transition focus:border-lime-400/55 focus:ring-2 focus:ring-lime-400/15"
                    />

                    <button
                      type="button"
                      onClick={onCancelRename}
                      aria-label="Cancelar alteração"
                      className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/[0.11] text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      <X size={16} />
                    </button>

                    <button
                      type="submit"
                      disabled={
                        renameValue.trim().length < 2
                      }
                      aria-label="Salvar novo nome"
                      className="flex h-11 w-11 items-center justify-center rounded-xl bg-lime-400 text-black transition hover:bg-lime-300 disabled:opacity-40"
                    >
                      <Check size={16} />
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-base font-bold text-white">
                        {group.name}
                      </p>

                      <p className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                        <Users size={13} />
                        {groupCounts.get(
                          group.id
                        ) ?? 0}{' '}
                        membros
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onStartRename(group)
                      }
                      aria-label={`Renomear ${group.name}`}
                      title="Renomear grupo"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.09] text-zinc-400 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white"
                    >
                      <Edit3 size={15} />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      onSelectGroup(group.id)
                    }
                    className={`mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                      selected
                        ? 'border-lime-400/35 bg-lime-400/[0.12] text-lime-200'
                        : 'border-white/[0.10] bg-white/[0.025] text-zinc-300 hover:border-white/[0.18] hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <Eye size={15} />
                    {selected
                      ? 'Grupo em exibição'
                      : 'Visualizar grupo'}
                  </button>
                </>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
