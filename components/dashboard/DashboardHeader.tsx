'use client';

import {
  Menu,
  ShieldCheck,
} from 'lucide-react';

import type { Group } from '@/types';
import type { AppSection } from '@/types/navigation';
import { AppNavigation } from '@/components/navigation/AppNavigation';
import { GroupSwitcher } from './GroupSwitcher';

interface DashboardHeaderProps {
  currentGroup: Group | null;
  groups: Group[];
  isAdmin: boolean;
  activeSection: AppSection;
  pendingUsersCount: number;
  onSelectGroup: (groupId: string) => void;
  onNavigate: (section: AppSection) => void;
  onOpenMenu: () => void;
}

export function DashboardHeader({
  currentGroup,
  groups,
  isAdmin,
  activeSection,
  pendingUsersCount,
  onSelectGroup,
  onNavigate,
  onOpenMenu,
}: DashboardHeaderProps) {
  return (
    <div className="relative z-40 mx-auto max-w-[1500px] px-4 pt-4 sm:px-8 sm:pt-6">
      <header className="relative rounded-[26px] border border-white/[0.11] bg-[#050705]/[0.94] px-4 py-4 shadow-2xl shadow-black/40 backdrop-blur-2xl sm:px-5">
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_4%_0%,rgba(163,230,53,.10),transparent_34%),radial-gradient(circle_at_90%_0%,rgba(34,211,238,.055),transparent_30%)]" />
          <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <div className="relative flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-xl font-black tracking-[-0.025em] text-white sm:text-2xl">
                Racha dos{' '}
                <span className="text-lime-400">
                  Amigos
                </span>
              </h1>

              {isAdmin && (
                <span
                  title="Administrador"
                  className="hidden h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-emerald-400/20 bg-emerald-400/[0.08] text-emerald-300 sm:flex"
                >
                  <ShieldCheck size={13} />
                </span>
              )}
            </div>

            {!isAdmin && (
              <p className="mt-1 truncate text-xs font-medium text-zinc-400">
                {currentGroup?.name ??
                  'Aguardando grupo'}
              </p>
            )}
          </div>

          <div className="hidden lg:block">
            <AppNavigation
              activeSection={activeSection}
              pendingUsersCount={
                pendingUsersCount
              }
              onNavigate={onNavigate}
              onOpenMenu={onOpenMenu}
              variant="desktop"
            />
          </div>

          <button
            type="button"
            onClick={onOpenMenu}
            aria-label="Abrir menu"
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/[0.11] bg-white/[0.035] text-zinc-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white lg:hidden"
          >
            <Menu size={20} />

            {pendingUsersCount > 0 && (
              <span className="absolute -right-1 -top-1 flex min-w-5 items-center justify-center rounded-full border-2 border-[#070a08] bg-amber-300 px-1 py-0.5 text-[8px] font-black leading-none text-black">
                {pendingUsersCount > 99
                  ? '99+'
                  : pendingUsersCount}
              </span>
            )}
          </button>
        </div>

        {isAdmin && groups.length > 0 && (
          <div className="relative mt-3 border-t border-white/[0.09] pt-3 lg:max-w-sm">
            <GroupSwitcher
              groups={groups}
              currentGroupId={
                currentGroup?.id ?? null
              }
              onChange={onSelectGroup}
            />
          </div>
        )}
      </header>
    </div>
  );
}
