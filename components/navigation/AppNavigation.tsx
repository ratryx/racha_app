'use client';

import { motion } from 'framer-motion';
import {
  CreditCard,
  Menu,
  Swords,
  Trophy,
  type LucideIcon,
} from 'lucide-react';

import type { AppSection } from '@/types/navigation';

interface AppNavigationProps {
  activeSection: AppSection;
  pendingUsersCount: number;
  onNavigate: (section: AppSection) => void;
  onOpenMenu: () => void;
  variant: 'desktop' | 'mobile';
}

interface SectionItem {
  id: AppSection;
  label: string;
  icon: LucideIcon;
}

const SECTION_ITEMS: SectionItem[] = [
  {
    id: 'cards',
    label: 'Cards',
    icon: CreditCard,
  },
  {
    id: 'matches',
    label: 'Partidas',
    icon: Swords,
  },
  {
    id: 'rankings',
    label: 'Rankings',
    icon: Trophy,
  },
];

export function AppNavigation({
  activeSection,
  pendingUsersCount,
  onNavigate,
  onOpenMenu,
  variant,
}: AppNavigationProps) {
  if (variant === 'mobile') {
    return (
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-50 border-t border-white/[0.12] bg-[#050806]/95 px-2 pt-2 shadow-[0_-18px_45px_rgba(0,0,0,.38)] backdrop-blur-2xl lg:hidden"
        style={{
          paddingBottom:
            'max(0.65rem, env(safe-area-inset-bottom))',
        }}
      >
        <div className="mx-auto grid max-w-lg grid-cols-4 gap-1">
          {SECTION_ITEMS.map((item) => (
            <MobileItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              active={activeSection === item.id}
              onClick={() =>
                onNavigate(item.id)
              }
            />
          ))}

          <MobileItem
            icon={Menu}
            label="Menu"
            active={false}
            badge={pendingUsersCount}
            onClick={onOpenMenu}
          />
        </div>
      </nav>
    );
  }

  return (
    <nav
      aria-label="Navegação principal"
      className="hidden items-center gap-1 rounded-2xl border border-white/[0.10] bg-black/35 p-1 lg:flex"
    >
      {SECTION_ITEMS.map((item) => (
        <DesktopItem
          key={item.id}
          icon={item.icon}
          label={item.label}
          active={activeSection === item.id}
          onClick={() =>
            onNavigate(item.id)
          }
        />
      ))}

      <span
        aria-hidden="true"
        className="mx-1 h-6 w-px bg-white/[0.10]"
      />

      <DesktopItem
        icon={Menu}
        label="Menu"
        active={false}
        badge={pendingUsersCount}
        onClick={onOpenMenu}
      />
    </nav>
  );
}

interface NavigationItemProps {
  icon: LucideIcon;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: number;
}

function MobileItem({
  icon: Icon,
  label,
  active,
  onClick,
  badge = 0,
}: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex min-h-[62px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-bold transition ${
        active
          ? 'text-lime-300'
          : 'text-zinc-400 active:bg-white/[0.06]'
      }`}
    >
      {active && (
        <motion.span
          layoutId="mobile-navigation-active"
          className="absolute inset-0 rounded-2xl border border-lime-400/25 bg-lime-400/[0.11]"
          transition={{
            type: 'spring',
            stiffness: 480,
            damping: 38,
          }}
        />
      )}

      <span className="relative">
        <Icon size={21} strokeWidth={2.2} />

        {badge > 0 && (
          <span className="absolute -right-3 -top-2 flex min-w-4 items-center justify-center rounded-full bg-amber-300 px-1 py-0.5 text-[8px] font-black leading-none text-black">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>

      <span className="relative">
        {label}
      </span>
    </button>
  );
}

function DesktopItem({
  icon: Icon,
  label,
  active,
  onClick,
  badge = 0,
}: NavigationItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-bold transition ${
        active
          ? 'text-lime-300'
          : 'text-zinc-400 hover:bg-white/[0.055] hover:text-white'
      }`}
    >
      {active && (
        <motion.span
          layoutId="desktop-navigation-active"
          className="absolute inset-0 rounded-xl border border-lime-400/20 bg-lime-400/[0.10]"
          transition={{
            type: 'spring',
            stiffness: 480,
            damping: 38,
          }}
        />
      )}

      <span className="relative">
        <Icon size={16} />

        {badge > 0 && (
          <span className="absolute -right-3 -top-2 flex min-w-4 items-center justify-center rounded-full bg-amber-300 px-1 py-0.5 text-[8px] font-black leading-none text-black">
            {badge > 99 ? '99+' : badge}
          </span>
        )}
      </span>

      <span className="relative">
        {label}
      </span>
    </button>
  );
}
