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
  LoaderCircle,
  ShieldCheck,
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
import { GroupCreatePanel } from './GroupCreatePanel';
import { GroupListPanel } from './GroupListPanel';
import { UserGroupAssignmentPanel } from './UserGroupAssignmentPanel';

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
  const [loading, setLoading] =
    useState(false);
  const [creating, setCreating] =
    useState(false);
  const [newGroupName, setNewGroupName] =
    useState('');
  const [search, setSearch] =
    useState('');
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

  const pendingUsersCount = useMemo(
    () =>
      users.filter(
        (user) => user.group_id === null
      ).length,
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
      const group =
        await createGroup(newGroupName);

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

      const selectedGroup =
        groups.find(
          (group) => group.id === groupId
        ) ?? null;

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId
            ? {
                ...user,
                group_id: groupId || null,
                group_name:
                  selectedGroup?.name ?? null,
              }
            : user
        )
      );

      await onChanged();
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

  function cancelRename() {
    setRenamingGroupId(null);
    setRenameValue('');
  }

  async function handleRename(
    groupId: string
  ) {
    setErrorMessage('');

    try {
      const renamedGroup =
        await renameGroup(
          groupId,
          renameValue
        );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.group_id === groupId
            ? {
                ...user,
                group_name:
                  renamedGroup.name,
              }
            : user
        )
      );

      cancelRename();
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
          className="fixed inset-0 z-[70] flex items-end justify-center bg-black/85 backdrop-blur-md sm:items-center sm:p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.section
            initial={{
              y: 34,
              opacity: 0,
              scale: 0.99,
            }}
            animate={{
              y: 0,
              opacity: 1,
              scale: 1,
            }}
            exit={{
              y: 34,
              opacity: 0,
              scale: 0.99,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="flex max-h-[96vh] w-full max-w-6xl flex-col overflow-hidden rounded-t-[30px] border border-white/[0.13] bg-[#070a08]/98 shadow-2xl shadow-black/80 sm:max-h-[92vh] sm:rounded-[30px]"
          >
            <header className="flex shrink-0 items-start justify-between border-b border-white/[0.10] px-5 py-5 sm:px-7 sm:py-6">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-emerald-200">
                  <ShieldCheck size={16} />

                  <p className="text-[11px] font-bold uppercase tracking-[0.15em]">
                    Administração
                  </p>
                </div>

                <h2 className="mt-2 text-2xl font-black tracking-[-0.025em] text-white sm:text-3xl">
                  Grupos e jogadores
                </h2>

                <p className="mt-2 max-w-xl text-sm leading-6 text-zinc-400">
                  Crie grupos, veja quem está aguardando
                  e mova cada jogador sem sair desta tela.
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.12] bg-white/[0.03] text-zinc-300 transition hover:bg-white/[0.08] hover:text-white"
              >
                <X size={19} />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
              {errorMessage && (
                <p className="mb-4 rounded-2xl border border-red-300/25 bg-red-950/65 px-4 py-3 text-sm font-medium text-red-200">
                  {errorMessage}
                </p>
              )}

              {loading ? (
                <div className="flex min-h-[420px] items-center justify-center text-sm font-semibold text-zinc-300">
                  <LoaderCircle
                    size={19}
                    className="mr-2 animate-spin"
                  />
                  Carregando jogadores...
                </div>
              ) : (
                <div className="grid gap-5 xl:grid-cols-[380px_minmax(0,1fr)]">
                  <aside className="space-y-4">
                    <GroupCreatePanel
                      value={newGroupName}
                      creating={creating}
                      onChange={setNewGroupName}
                      onSubmit={
                        handleCreateGroup
                      }
                    />

                    <GroupListPanel
                      groups={groups}
                      currentGroupId={
                        currentGroupId
                      }
                      groupCounts={groupCounts}
                      renamingGroupId={
                        renamingGroupId
                      }
                      renameValue={renameValue}
                      onRenameValueChange={
                        setRenameValue
                      }
                      onStartRename={startRename}
                      onCancelRename={
                        cancelRename
                      }
                      onConfirmRename={
                        handleRename
                      }
                      onSelectGroup={
                        onSelectGroup
                      }
                    />
                  </aside>

                  <UserGroupAssignmentPanel
                    users={filteredUsers}
                    groups={groups}
                    totalUsers={users.length}
                    pendingUsersCount={
                      pendingUsersCount
                    }
                    search={search}
                    changingUserId={
                      changingUserId
                    }
                    onSearchChange={setSearch}
                    onMembershipChange={
                      handleMembershipChange
                    }
                  />
                </div>
              )}
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
