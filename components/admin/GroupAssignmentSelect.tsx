'use client';

import {
  useEffect,
  useState,
} from 'react';
import {
  AnimatePresence,
  motion,
} from 'framer-motion';
import {
  Check,
  ChevronDown,
  Layers3,
  LoaderCircle,
  UserRoundX,
} from 'lucide-react';

import type { Group } from '@/types';

interface GroupAssignmentSelectProps {
  userId: string;
  displayName: string;
  groups: Group[];
  value: string | null;
  disabled: boolean;
  onChange: (
    groupId: string
  ) => void | Promise<void>;
}

export function GroupAssignmentSelect({
  userId,
  displayName,
  groups,
  value,
  disabled,
  onChange,
}: GroupAssignmentSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedGroup =
    groups.find(
      (group) => group.id === value
    ) ?? null;

  useEffect(() => {
    if (disabled) {
      setOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, []);

  function selectGroup(groupId: string) {
    setOpen(false);
    void onChange(groupId);
  }

  return (
    <div className="min-w-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={`group-options-${userId}`}
        disabled={disabled}
        onClick={() =>
          setOpen((current) => !current)
        }
        className={`flex min-h-12 w-full items-center gap-3 rounded-2xl border px-3.5 py-2.5 text-left outline-none transition focus-visible:ring-2 focus-visible:ring-lime-400/20 ${
          open
            ? 'border-lime-400/45 bg-lime-400/[0.075]'
            : 'border-white/[0.12] bg-[#0b100c] hover:border-white/[0.20] hover:bg-white/[0.045]'
        } disabled:cursor-wait disabled:opacity-60`}
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
            selectedGroup
              ? 'border-lime-400/20 bg-lime-400/[0.09] text-lime-300'
              : 'border-amber-300/20 bg-amber-300/[0.075] text-amber-200'
          }`}
        >
          {disabled ? (
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
          ) : selectedGroup ? (
            <Layers3 size={16} />
          ) : (
            <UserRoundX size={16} />
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.11em] text-zinc-500">
            Grupo atual
          </span>

          <span className="mt-0.5 block truncate text-sm font-bold text-white">
            {selectedGroup?.name ??
              'Sem grupo'}
          </span>
        </span>

        <ChevronDown
          size={17}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={`group-options-${userId}`}
            role="listbox"
            aria-label={`Selecionar grupo de ${displayName}`}
            initial={{
              opacity: 0,
              height: 0,
              y: -4,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -4,
            }}
            transition={{
              duration: 0.18,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-2xl border border-white/[0.11] bg-[#070a08] p-1.5 shadow-xl shadow-black/30">
              <GroupOption
                label="Sem grupo"
                description="Oculta cards e partidas desta conta"
                selected={!value}
                danger
                onClick={() =>
                  selectGroup('')
                }
              />

              {groups.map((group) => (
                <GroupOption
                  key={group.id}
                  label={group.name}
                  description="Adicionar jogador a este grupo"
                  selected={
                    group.id === value
                  }
                  onClick={() =>
                    selectGroup(group.id)
                  }
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface GroupOptionProps {
  label: string;
  description: string;
  selected: boolean;
  danger?: boolean;
  onClick: () => void;
}

function GroupOption({
  label,
  description,
  selected,
  danger = false,
  onClick,
}: GroupOptionProps) {
  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
        selected
          ? 'bg-lime-400/[0.11]'
          : 'hover:bg-white/[0.055]'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
          danger
            ? 'border-red-300/15 bg-red-300/[0.06] text-red-200'
            : selected
              ? 'border-lime-400/25 bg-lime-400/[0.12] text-lime-300'
              : 'border-white/[0.09] bg-white/[0.035] text-zinc-400'
        }`}
      >
        {danger ? (
          <UserRoundX size={14} />
        ) : (
          <Layers3 size={14} />
        )}
      </span>

      <span className="min-w-0 flex-1">
        <span
          className={`block truncate text-sm font-bold ${
            danger
              ? 'text-red-100'
              : 'text-white'
          }`}
        >
          {label}
        </span>

        <span className="mt-0.5 block truncate text-xs text-zinc-500">
          {description}
        </span>
      </span>

      {selected && (
        <Check
          size={16}
          className="shrink-0 text-lime-300"
        />
      )}
    </button>
  );
}
