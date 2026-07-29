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
      (group) => group.id === currentGroupId
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

    function handleKeyDown(event: KeyboardEvent) {
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
      className="relative mt-4 max-w-[440px]"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() =>
          setOpen((current) => !current)
        }
        className="group flex w-full items-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.035] p-2.5 text-left shadow-lg shadow-black/10 transition hover:border-lime-400/25 hover:bg-white/[0.055] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lime-400/50"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/15 bg-lime-400/[0.08] text-lime-400">
          <Layers3 size={17} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[8px] font-extrabold uppercase tracking-[0.2em] text-zinc-600">
            Visualizando grupo
          </span>

          <span className="mt-1 block truncate text-sm font-black text-white">
            {currentGroup.name}
          </span>
        </span>

        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-zinc-500 transition group-hover:bg-white/[0.05] group-hover:text-white">
          <ChevronDown
            size={17}
            className={`transition-transform duration-200 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{
              opacity: 0,
              y: -6,
              scale: 0.985,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -5,
              scale: 0.985,
            }}
            transition={{
              duration: 0.16,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="absolute inset-x-0 top-[calc(100%+8px)] z-[90] overflow-hidden rounded-2xl border border-white/[0.1] bg-[#090d0a]/95 p-1.5 shadow-2xl shadow-black/70 backdrop-blur-2xl"
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
                        ? 'bg-lime-400/[0.10] text-white'
                        : 'text-zinc-400 hover:bg-white/[0.045] hover:text-white'
                    }`}
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${
                        selected
                          ? 'border-lime-400/25 bg-lime-400/[0.12] text-lime-400'
                          : 'border-white/[0.07] bg-white/[0.025] text-zinc-600'
                      }`}
                    >
                      <Layers3 size={14} />
                    </span>

                    <span className="min-w-0 flex-1 truncate text-sm font-bold">
                      {group.name}
                    </span>

                    {selected && (
                      <Check
                        size={16}
                        className="shrink-0 text-lime-400"
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
