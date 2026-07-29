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
  ArrowRightLeft,
  Check,
  Edit3,
  Eye,
  FolderPlus,
  LoaderCircle,
  Search,
  ShieldCheck,
  UserMinus,
  Users,
  X,
} from 'lucide-react';

import type {
  AdminUserOverview,
  Group,
} from '@/types';
import {
  assignUserToGroup,
  createGroup,
  getAdminUsers,
  removeUserFromGroup,
  renameGroup,
} from '@/lib/supabase/queries';

interface GroupAdminModalProps {
  open: boolean;
  groups: Group[];
  currentGroupId: string | null;
  onClose: () => void;
  onChanged: () => void | Promise<void>;
  onSelectGroup: (groupId: string) => void;
}

export function GroupAdminModal({
  open,
  groups,
  currentGroupId,
  onClose,
  onChanged,
  onSelectGroup,
}: GroupAdminModalProps) {
  const [users, setUsers] =
    useState<AdminUserOverview[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newGroupName, setNewGroupName] =
    useState('');
  const [search, setSearch] = useState('');
  const [errorMessage, setErrorMessage] =
    useState('');
  const [changingUserId, setChangingUserId] =
    useState<string | null>(null);
  const [renamingGroupId, setRenamingGroupId] =
    useState<string | null>(null);
  const [renameValue, setRenameValue] =
    useState('');

  async function loadUsers() {
    setLoading(true);
    setErrorMessage('');

    try {
      setUsers(await getAdminUsers());
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível carregar os usuários.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      void loadUsers();
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return users;
    }

    return users.filter((user) => {
      const text = [
        user.display_name,
        user.player_name,
        user.player_nickname,
        user.phone,
        user.group_name,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return text.includes(term);
    });
  }, [search, users]);

  const pendingUsers = useMemo(
    () =>
      users.filter(
        (user) => user.group_id === null
      ),
    [users]
  );

  const groupCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const user of users) {
      if (!user.group_id) {
        continue;
      }

      counts.set(
        user.group_id,
        (counts.get(user.group_id) ?? 0) + 1
      );
    }

    return counts;
  }, [users]);

  async function handleCreateGroup(
    event: React.FormEvent
  ) {
    event.preventDefault();
    setErrorMessage('');
    setCreating(true);

    try {
      const group = await createGroup(newGroupName);
      setNewGroupName('');
      await onChanged();
      onSelectGroup(group.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível criar o grupo.'
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleMembershipChange(
    userId: string,
    groupId: string
  ) {
    setChangingUserId(userId);
    setErrorMessage('');

    try {
      if (groupId) {
        await assignUserToGroup(
          userId,
          groupId
        );
      } else {
        await removeUserFromGroup(userId);
      }

      await Promise.all([
        loadUsers(),
        onChanged(),
      ]);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível alterar o grupo.'
      );
    } finally {
      setChangingUserId(null);
    }
  }

  function startRename(group: Group) {
    setRenamingGroupId(group.id);
    setRenameValue(group.name);
  }

  async function handleRename(groupId: string) {
    setErrorMessage('');

    try {
      await renameGroup(groupId, renameValue);
      setRenamingGroupId(null);
      setRenameValue('');
      await onChanged();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível renomear o grupo.'
      );
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/80 backdrop-blur-sm sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            initial={{
              y: 42,
              opacity: 0,
              scale: 0.985,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 42,
              opacity: 0,
              scale: 0.985,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[28px] border border-white/10 bg-[#080b09] shadow-2xl shadow-black/70 sm:max-h-[91vh] sm:rounded-[28px]"
          >
            <header className="flex shrink-0 items-start justify-between border-b border-white/[0.07] px-5 py-5 sm:px-7">
              <div>
                <div className="flex items-center gap-2 text-emerald-400">
                  <ShieldCheck size={15} />
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.24em]">
                    Administração
                  </p>
                </div>

                <h2 className="font-display mt-2 text-3xl font-black uppercase text-white">
                  Grupos e jogadores
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Crie grupos e organize quem participa
                  de cada racha.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-zinc-500 transition hover:bg-white/5 hover:text-white"
              >
                <X size={18} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {errorMessage && (
                <p className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {errorMessage}
                </p>
              )}

              <div className="grid gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
                <aside className="space-y-4">
                  <form
                    onSubmit={handleCreateGroup}
                    className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-center gap-2 text-lime-400">
                      <FolderPlus size={16} />
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em]">
                        Novo grupo
                      </p>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={newGroupName}
                        onChange={(event) =>
                          setNewGroupName(
                            event.target.value
                          )
                        }
                        placeholder="Ex.: Racha de quinta"
                        maxLength={60}
                        className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-zinc-700 focus:border-lime-400/50"
                      />

                      <button
                        type="submit"
                        disabled={
                          creating ||
                          newGroupName.trim().length < 2
                        }
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-lime-400 text-black transition hover:bg-lime-300 disabled:opacity-40"
                      >
                        {creating ? (
                          <LoaderCircle
                            size={17}
                            className="animate-spin"
                          />
                        ) : (
                          <FolderPlus size={17} />
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="rounded-[22px] border border-white/[0.08] bg-white/[0.025] p-3">
                    <div className="mb-3 flex items-center justify-between px-1">
                      <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-600">
                        Grupos ativos
                      </p>

                      <span className="text-xs tabular-nums text-zinc-600">
                        {groups.length}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {groups.map((group) => {
                        const selected =
                          group.id === currentGroupId;
                        const renaming =
                          group.id ===
                          renamingGroupId;

                        return (
                          <article
                            key={group.id}
                            className={`rounded-2xl border p-3 transition ${
                              selected
                                ? 'border-lime-400/30 bg-lime-400/[0.07]'
                                : 'border-white/[0.07] bg-black/20'
                            }`}
                          >
                            {renaming ? (
                              <div className="flex gap-2">
                                <input
                                  value={renameValue}
                                  onChange={(event) =>
                                    setRenameValue(
                                      event.target.value
                                    )
                                  }
                                  maxLength={60}
                                  autoFocus
                                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm font-bold text-white outline-none focus:border-lime-400/40"
                                />

                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRename(
                                      group.id
                                    )
                                  }
                                  disabled={
                                    renameValue.trim()
                                      .length < 2
                                  }
                                  className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime-400 text-black disabled:opacity-40"
                                >
                                  <Check size={15} />
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-extrabold text-white">
                                      {group.name}
                                    </p>

                                    <p className="mt-1 flex items-center gap-1.5 text-[10px] text-zinc-600">
                                      <Users size={12} />
                                      {groupCounts.get(
                                        group.id
                                      ) ?? 0}{' '}
                                      membros
                                    </p>
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      startRename(group)
                                    }
                                    aria-label={`Renomear ${group.name}`}
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-zinc-600 transition hover:bg-white/5 hover:text-white"
                                  >
                                    <Edit3 size={14} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() =>
                                    onSelectGroup(
                                      group.id
                                    )
                                  }
                                  className={`mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-xs font-extrabold transition ${
                                    selected
                                      ? 'border-lime-400/30 bg-lime-400/10 text-lime-300'
                                      : 'border-white/[0.08] text-zinc-400 hover:border-white/15 hover:text-white'
                                  }`}
                                >
                                  <Eye size={14} />
                                  {selected
                                    ? 'Visualizando'
                                    : 'Visualizar grupo'}
                                </button>
                              </>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  </div>
                </aside>

                <section className="min-w-0 rounded-[22px] border border-white/[0.08] bg-white/[0.025]">
                  <div className="border-b border-white/[0.07] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-zinc-600">
                          Contas cadastradas
                        </p>

                        <p className="mt-1 text-sm text-zinc-400">
                          <strong className="text-white">
                            {users.length}
                          </strong>{' '}
                          contas ·{' '}
                          <strong className="text-amber-300">
                            {pendingUsers.length}
                          </strong>{' '}
                          aguardando grupo
                        </p>
                      </div>

                      <label className="flex min-w-0 items-center gap-2 rounded-xl border border-white/[0.08] bg-black/20 px-3 py-2 sm:w-64">
                        <Search
                          size={15}
                          className="shrink-0 text-zinc-600"
                        />
                        <input
                          value={search}
                          onChange={(event) =>
                            setSearch(
                              event.target.value
                            )
                          }
                          placeholder="Buscar jogador..."
                          className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-zinc-700"
                        />
                      </label>
                    </div>
                  </div>

                  {loading ? (
                    <div className="flex min-h-72 items-center justify-center text-sm text-zinc-600">
                      <LoaderCircle
                        size={18}
                        className="mr-2 animate-spin"
                      />
                      Carregando usuários...
                    </div>
                  ) : (
                    <div className="divide-y divide-white/[0.06]">
                      {filteredUsers.map((user) => {
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
                            className={`p-4 transition ${
                              user.group_id === null
                                ? 'bg-amber-400/[0.025]'
                                : ''
                            }`}
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <p className="truncate text-sm font-extrabold text-white">
                                    {displayName}
                                  </p>

                                  {user.role ===
                                    'admin' && (
                                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/[0.07] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-emerald-300">
                                      Admin
                                    </span>
                                  )}

                                  {!user.group_id && (
                                    <span className="rounded-full border border-amber-400/20 bg-amber-400/[0.07] px-2 py-0.5 text-[8px] font-extrabold uppercase tracking-[0.15em] text-amber-300">
                                      Sem grupo
                                    </span>
                                  )}
                                </div>

                                <p className="mt-1 truncate text-[11px] text-zinc-600">
                                  {user.phone ??
                                    'Telefone não informado'}
                                  {user.player_name
                                    ? ` · Card: ${user.player_name}`
                                    : ' · Card ainda não criado'}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 sm:w-[285px]">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-black/20 text-zinc-500">
                                  {changing ? (
                                    <LoaderCircle
                                      size={16}
                                      className="animate-spin"
                                    />
                                  ) : user.group_id ? (
                                    <ArrowRightLeft
                                      size={16}
                                    />
                                  ) : (
                                    <Users size={16} />
                                  )}
                                </span>

                                <select
                                  value={
                                    user.group_id ?? ''
                                  }
                                  disabled={changing}
                                  onChange={(event) =>
                                    handleMembershipChange(
                                      user.id,
                                      event.target.value
                                    )
                                  }
                                  className="h-10 min-w-0 flex-1 rounded-xl border border-white/[0.08] bg-[#0b0e0c] px-3 text-sm font-bold text-white outline-none transition focus:border-lime-400/40 disabled:opacity-50"
                                >
                                  <option value="">
                                    Sem grupo
                                  </option>

                                  {groups.map((group) => (
                                    <option
                                      key={group.id}
                                      value={group.id}
                                    >
                                      {group.name}
                                    </option>
                                  ))}
                                </select>

                                {user.group_id && (
                                  <button
                                    type="button"
                                    disabled={changing}
                                    onClick={() =>
                                      handleMembershipChange(
                                        user.id,
                                        ''
                                      )
                                    }
                                    aria-label={`Remover ${displayName} do grupo`}
                                    title="Remover do grupo"
                                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/15 text-red-300/70 transition hover:border-red-400/30 hover:bg-red-400/[0.06] hover:text-red-300 disabled:opacity-40"
                                  >
                                    <UserMinus
                                      size={16}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>
                          </article>
                        );
                      })}

                      {!filteredUsers.length && (
                        <div className="px-5 py-14 text-center text-sm text-zinc-600">
                          Nenhum usuário encontrado.
                        </div>
                      )}
                    </div>
                  )}
                </section>
              </div>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
