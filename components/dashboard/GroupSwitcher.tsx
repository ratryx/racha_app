'use client';

import {
  useEffect,
  useRef,
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
} from 'lucide-react';

import type { Group } from '@/types';

interface GroupSwitcherProps {
  groups: Group[];
  currentGroupId: string | null;
  onChange: (groupId: string) => void;
}

export function GroupSwitcher({
  groups,
  currentGroupId,
  onChange,
}: GroupSwitcherProps) {
  const [open, setOpen] = useState(false);
  const containerRef =
    useRef<HTMLDivElement>(null);

  const currentGroup =
    groups.find(
      (group) =>
        group.id === currentGroupId
    ) ??
    groups[0] ??
    null;

  useEffect(() => {
    function handlePointerDown(
      event: PointerEvent
    ) {
      if (
        containerRef.current &&
        !containerRef.current.contains(
          event.target as Node
        )
      ) {
        setOpen(false);
      }
    }

    function handleKeyDown(
      event: KeyboardEvent
    ) {
      if (event.key === 'Escape') {
        setOpen(false);
      }
    }

    document.addEventListener(
      'pointerdown',
      handlePointerDown
    );
    document.addEventListener(
      'keydown',
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        'pointerdown',
        handlePointerDown
      );
      document.removeEventListener(
        'keydown',
        handleKeyDown
      );
    };
  }, []);

  if (!currentGroup) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="relative"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.10] bg-black/35 px-3 py-2.5 text-left transition hover:border-lime-400/30 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/[0.10] text-lime-300">
          <Layers3 size={15} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-zinc-400">
            Grupo visualizado
          </span>

          <span className="mt-0.5 block truncate text-sm font-bold text-white">
            {currentGroup.name}
          </span>
        </span>

        <ChevronDown
          size={16}
          className={`shrink-0 text-zinc-400 transition-transform duration-200 group-hover:text-white ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{
              opacity: 0,
              y: -5,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -4,
              scale: 0.985,
            }}
            transition={{
              duration: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-[100] overflow-hidden rounded-2xl border border-white/[0.13] bg-[#080c09]/98 p-1.5 shadow-2xl shadow-black/80 backdrop-blur-2xl"
          >
            <div className="max-h-64 overflow-y-auto">
              {groups.map((group) => {
                const selected =
                  group.id === currentGroup.id;

                return (
                  <button
                    key={group.id}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    onClick={() => {
                      onChange(group.id);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition ${
                      selected
                        ? 'bg-lime-400/[0.12] text-white'
                        : 'text-zinc-300 hover:bg-white/[0.06] hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        selected
                          ? 'border-lime-400/30 bg-lime-400/[0.14] text-lime-300'
                          : 'border-white/[0.10] bg-white/[0.035] text-zinc-400'
                      }`}
                    >
                      <Layers3 size={14} />
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {group.name}
                    </span>

                    {selected && (
                      <Check
                        size={16}
                        className="shrink-0 text-lime-300"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
