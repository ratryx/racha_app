'use client';

import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  FolderCog,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';

import type {
  Group,
  Player,
  Profile,
} from '@/types';

interface AppMenuSheetProps {
  open: boolean;
  profile: Profile | null;
  player: Player | null;
  currentGroup: Group | null;
  isAdmin: boolean;
  pendingUsersCount: number;
  onClose: () => void;
  onOpenPlayerCard: () => void;
  onOpenGroups: () => void;
  onOpenResetPin: () => void;
  onSignOut: () => void | Promise<void>;
}

export function AppMenuSheet({
  open,
  profile,
  player,
  currentGroup,
  isAdmin,
  pendingUsersCount,
  onClose,
  onOpenPlayerCard,
  onOpenGroups,
  onOpenResetPin,
  onSignOut,
}: AppMenuSheetProps) {
  const displayName =
    player?.nickname ||
    player?.name ||
    profile?.display_name ||
    'Minha conta';

  function runAction(action: () => void) {
    onClose();
    action();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/80 backdrop-blur-sm lg:items-stretch lg:justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.aside
            initial={{
              y: 46,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 46,
              opacity: 0,
            }}
            transition={{
              duration: 0.22,
              ease: [0.22, 1, 0.36, 1],
            }}
            onClick={(event) =>
              event.stopPropagation()
            }
            className="w-full overflow-hidden rounded-t-[30px] border border-white/[0.12] bg-[#070a08]/98 shadow-2xl shadow-black/80 backdrop-blur-2xl lg:h-full lg:max-w-[420px] lg:rounded-none lg:rounded-l-[30px]"
          >
            <div className="mx-auto mt-2 h-1 w-12 rounded-full bg-white/15 lg:hidden" />

            <header className="flex items-start justify-between border-b border-white/[0.10] px-5 pb-5 pt-5 lg:px-7 lg:pt-7">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-lime-400/25 bg-lime-400/[0.10] text-lime-300">
                  <UserRound size={20} />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-lg font-black text-white">
                    {displayName}
                  </p>

                  <p className="mt-1 truncate text-sm font-medium text-zinc-400">
                    {currentGroup?.name ??
                      'Aguardando grupo'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar menu"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.11] text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
              >
                <X size={18} />
              </button>
            </header>

            <div className="max-h-[70vh] overflow-y-auto px-4 py-4 lg:max-h-none lg:px-6 lg:py-6">
              <p className="px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                Minha conta
              </p>

              <div className="mt-2 space-y-2">
                <MenuAction
                  icon={player ? Pencil : Plus}
                  title={
                    player
                      ? 'Editar meu card'
                      : 'Criar meu card'
                  }
                  description={
                    player
                      ? 'Nome, posição e foto'
                      : 'Monte seu card de jogador'
                  }
                  accent="lime"
                  onClick={() =>
                    runAction(onOpenPlayerCard)
                  }
                />
              </div>

              {isAdmin && (
                <>
                  <p className="mt-6 px-2 text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-400">
                    Administração
                  </p>

                  <div className="mt-2 space-y-2">
                    <MenuAction
                      icon={FolderCog}
                      title="Gerenciar grupos"
                      description={
                        pendingUsersCount > 0
                          ? `${pendingUsersCount} contas aguardando grupo`
                          : 'Criar grupos e mover jogadores'
                      }
                      badge={pendingUsersCount}
                      accent="cyan"
                      onClick={() =>
                        runAction(onOpenGroups)
                      }
                    />

                    <MenuAction
                      icon={KeyRound}
                      title="Redefinir PIN"
                      description="Alterar acesso de um jogador"
                      accent="neutral"
                      onClick={() =>
                        runAction(onOpenResetPin)
                      }
                    />

                    <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.065] px-4 py-3">
                      <div className="flex items-center gap-2 text-emerald-200">
                        <ShieldCheck size={16} />
                        <p className="text-sm font-bold">
                          Administrador
                        </p>
                      </div>

                      <p className="mt-1.5 text-xs leading-5 text-zinc-400">
                        As ações de partida ficam na seção
                        Partidas.
                      </p>
                    </div>
                  </div>
                </>
              )}

              <div className="mt-6 border-t border-white/[0.10] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    void onSignOut();
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.055] px-4 py-3 text-left text-red-200 transition hover:border-red-400/35 hover:bg-red-400/[0.09]"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/[0.10]">
                    <LogOut size={17} />
                  </span>

                  <span className="text-sm font-bold">
                    Sair da conta
                  </span>
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface MenuActionProps {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: 'lime' | 'cyan' | 'neutral';
  onClick: () => void;
  badge?: number;
}

function MenuAction({
  icon: Icon,
  title,
  description,
  accent,
  onClick,
  badge = 0,
}: MenuActionProps) {
  const accents = {
    lime: {
      container:
        'border-lime-400/22 hover:border-lime-400/40 hover:bg-lime-400/[0.075]',
      icon: 'bg-lime-400/[0.12] text-lime-300',
    },
    cyan: {
      container:
        'border-cyan-300/20 hover:border-cyan-300/35 hover:bg-cyan-300/[0.07]',
      icon: 'bg-cyan-300/[0.11] text-cyan-200',
    },
    neutral: {
      container:
        'border-white/[0.11] hover:border-white/[0.20] hover:bg-white/[0.065]',
      icon: 'bg-white/[0.07] text-zinc-300',
    },
  }[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex w-full items-center gap-3 rounded-2xl border bg-white/[0.025] px-3 py-3.5 text-left transition ${accents.container}`}
    >
      <span
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accents.icon}`}
      >
        <Icon size={18} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-bold text-white">
          {title}
        </span>

        <span className="mt-1 block text-xs leading-5 text-zinc-400">
          {description}
        </span>
      </span>

      {badge > 0 && (
        <span className="flex min-w-6 items-center justify-center rounded-full bg-amber-300 px-2 py-1 text-[9px] font-black text-black">
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}
