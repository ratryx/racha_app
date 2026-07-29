'use client';

import {
  FolderCog,
  KeyRound,
  LogOut,
  Pencil,
  Plus,
  ShieldCheck,
} from 'lucide-react';

import type { Group } from '@/types';
import { GroupSwitcher } from './GroupSwitcher';
import { HeaderActionCard } from './HeaderActionCard';

interface DashboardHeaderProps {
  currentGroup: Group | null;
  groups: Group[];
  isAdmin: boolean;
  hasPlayerCard: boolean;
  pendingUsersCount: number;
  onSelectGroup: (groupId: string) => void;
  onSignOut: () => void;
  onOpenGroups: () => void;
  onOpenResetPin: () => void;
  onOpenPostMatch: () => void;
  onOpenPlayerCard: () => void;
}

export function DashboardHeader({
  currentGroup,
  groups,
  isAdmin,
  hasPlayerCard,
  pendingUsersCount,
  onSelectGroup,
  onSignOut,
  onOpenGroups,
  onOpenResetPin,
  onOpenPostMatch,
  onOpenPlayerCard,
}: DashboardHeaderProps) {
  return (
    <div className="relative z-20 mx-auto max-w-[1500px] px-4 pt-4 sm:px-8 sm:pt-6">
      <header className="relative rounded-[28px] border border-white/[0.08] bg-[#050705]/[0.94] shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_8%_10%,rgba(163,230,53,.12),transparent_34%),radial-gradient(circle_at_88%_10%,rgba(34,211,238,.07),transparent_28%),linear-gradient(180deg,rgba(255,255,255,.025),transparent_70%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <div className="relative px-4 py-5 sm:px-6 sm:py-6">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-[9px] font-extrabold uppercase tracking-[0.28em] text-zinc-600 sm:text-[10px]">
                {currentGroup?.name ??
                  'Aguardando grupo'}
              </p>

              <h1 className="font-display mt-2 text-[29px] font-black leading-none tracking-[-0.035em] text-white sm:text-[38px]">
                Racha dos{' '}
                <span className="text-lime-400">
                  Amigos
                </span>
              </h1>

              {isAdmin && groups.length > 0 ? (
                <GroupSwitcher
                  groups={groups}
                  currentGroupId={
                    currentGroup?.id ?? null
                  }
                  onChange={onSelectGroup}
                />
              ) : (
                <p className="mt-2 hidden text-sm text-zinc-500 sm:block">
                  {currentGroup
                    ? 'Gerencie seu card e acompanhe os números do seu grupo.'
                    : 'Seu acesso está ativo. O administrador ainda precisa adicionar sua conta a um grupo.'}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={onSignOut}
              aria-label="Sair"
              title="Sair"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.025] text-zinc-400 transition hover:border-white/15 hover:bg-white/[0.06] hover:text-white active:scale-95"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div
            className={`mt-5 grid gap-2.5 ${
              isAdmin
                ? 'grid-cols-2 xl:grid-cols-4'
                : 'grid-cols-1'
            }`}
          >
            {isAdmin && (
              <>
                <HeaderActionCard
                  icon={FolderCog}
                  eyebrow="Organização"
                  title="Gerenciar grupos"
                  description={
                    pendingUsersCount > 0
                      ? `${pendingUsersCount} aguardando grupo`
                      : 'Criar grupos e mover jogadores'
                  }
                  variant="groups"
                  badge={pendingUsersCount}
                  onClick={onOpenGroups}
                />

                <HeaderActionCard
                  icon={KeyRound}
                  eyebrow="Segurança"
                  title="Redefinir PIN"
                  description="Alterar o acesso de um jogador"
                  variant="neutral"
                  onClick={onOpenResetPin}
                />

                <HeaderActionCard
                  icon={ShieldCheck}
                  eyebrow="Administração"
                  title="Pós-jogo"
                  description={
                    currentGroup
                      ? `Registrar em ${currentGroup.name}`
                      : 'Selecione um grupo'
                  }
                  variant="admin"
                  disabled={!currentGroup}
                  onClick={onOpenPostMatch}
                />
              </>
            )}

            <HeaderActionCard
              icon={hasPlayerCard ? Pencil : Plus}
              eyebrow="Seu jogador"
              title={
                hasPlayerCard
                  ? 'Editar meu card'
                  : 'Criar meu card'
              }
              description={
                hasPlayerCard
                  ? 'Alterar nome, posição e foto'
                  : 'Criar seu único card'
              }
              variant="primary"
              onClick={onOpenPlayerCard}
            />
          </div>
        </div>
      </header>
    </div>
  );
}
