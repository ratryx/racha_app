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
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface MatchDatePickerProps {
  value: string;
  onChange: (value: string) => void;
}

const WEEKDAYS = [
  'Seg',
  'Ter',
  'Qua',
  'Qui',
  'Sex',
  'Sáb',
  'Dom',
];

function dateToValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(
    date.getMonth() + 1
  ).padStart(2, '0');
  const day = String(
    date.getDate()
  ).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function valueToDate(
  value: string
): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(
    value
  );

  if (!match) {
    return null;
  }

  const date = new Date(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    12
  );

  return Number.isNaN(date.getTime())
    ? null
    : date;
}

function startOfMonth(date: Date): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    1,
    12
  );
}

function addMonths(
  date: Date,
  amount: number
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth() + amount,
    1,
    12
  );
}

function formatSelectedDate(
  value: string
): string {
  const date = valueToDate(value);

  if (!date) {
    return 'Selecionar data';
  }

  return new Intl.DateTimeFormat(
    'pt-BR',
    {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }
  ).format(date);
}

function formatMonth(date: Date): string {
  const label = new Intl.DateTimeFormat(
    'pt-BR',
    {
      month: 'long',
      year: 'numeric',
    }
  ).format(date);

  return (
    label.charAt(0).toUpperCase() +
    label.slice(1)
  );
}

export function MatchDatePicker({
  value,
  onChange,
}: MatchDatePickerProps) {
  const selectedDate =
    valueToDate(value);
  const today = useMemo(
    () => new Date(),
    []
  );
  const todayValue = dateToValue(today);

  const [open, setOpen] =
    useState(false);
  const [visibleMonth, setVisibleMonth] =
    useState(() =>
      startOfMonth(
        selectedDate ?? today
      )
    );

  useEffect(() => {
    const nextDate =
      valueToDate(value);

    if (nextDate) {
      setVisibleMonth(
        startOfMonth(nextDate)
      );
    }
  }, [value]);

  const calendarDays = useMemo(() => {
    const year =
      visibleMonth.getFullYear();
    const month =
      visibleMonth.getMonth();
    const firstDay = new Date(
      year,
      month,
      1,
      12
    );
    const mondayOffset =
      (firstDay.getDay() + 6) % 7;
    const gridStart = new Date(
      year,
      month,
      1 - mondayOffset,
      12
    );

    return Array.from(
      { length: 42 },
      (_, index) =>
        new Date(
          gridStart.getFullYear(),
          gridStart.getMonth(),
          gridStart.getDate() +
            index,
          12
        )
    );
  }, [visibleMonth]);

  function chooseDate(date: Date) {
    onChange(dateToValue(date));
    setVisibleMonth(
      startOfMonth(date)
    );
    setOpen(false);
  }

  return (
    <div className="rounded-[22px] border border-white/[0.10] bg-black/30 p-4 transition focus-within:border-lime-400/35">
      <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
        <CalendarDays size={15} />
        Data do racha
      </div>

      <button
        type="button"
        aria-expanded={open}
        onClick={() =>
          setOpen((current) => !current)
        }
        className={`mt-3 flex min-h-14 w-full items-center gap-3 rounded-2xl border px-4 text-left transition ${
          open
            ? 'border-lime-400/45 bg-lime-400/[0.075] ring-2 ring-lime-400/10'
            : 'border-white/[0.12] bg-[#060907] hover:border-white/[0.20]'
        }`}
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/[0.09] text-lime-300">
          <CalendarDays size={17} />
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.11em] text-zinc-500">
            Data selecionada
          </span>

          <span className="mt-0.5 block truncate text-sm font-black capitalize text-white sm:text-base">
            {formatSelectedDate(value)}
          </span>
        </span>

        {value && (
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-lime-400/[0.12] text-lime-300">
            <Check size={15} />
          </span>
        )}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              y: -6,
            }}
            animate={{
              opacity: 1,
              height: 'auto',
              y: 0,
            }}
            exit={{
              opacity: 0,
              height: 0,
              y: -6,
            }}
            transition={{
              duration: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="overflow-hidden"
          >
            <div className="mt-3 overflow-hidden rounded-[20px] border border-white/[0.11] bg-[#080c09] shadow-2xl shadow-black/35">
              <div className="flex items-center justify-between border-b border-white/[0.08] px-3 py-3">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (month) =>
                        addMonths(
                          month,
                          -1
                        )
                    )
                  }
                  aria-label="Mês anterior"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="text-center">
                  <p className="text-sm font-black text-white">
                    {formatMonth(
                      visibleMonth
                    )}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      chooseDate(today)
                    }
                    className="mt-0.5 text-[11px] font-bold text-lime-300 transition hover:text-lime-200"
                  >
                    Ir para hoje
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setVisibleMonth(
                      (month) =>
                        addMonths(
                          month,
                          1
                        )
                    )
                  }
                  aria-label="Próximo mês"
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.09] text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className="p-3 sm:p-4">
                <div className="grid grid-cols-7 gap-1">
                  {WEEKDAYS.map(
                    (weekday) => (
                      <span
                        key={weekday}
                        className="py-1 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-zinc-500"
                      >
                        {weekday}
                      </span>
                    )
                  )}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                  {calendarDays.map(
                    (date) => {
                      const dateValue =
                        dateToValue(date);
                      const selected =
                        dateValue === value;
                      const isToday =
                        dateValue ===
                        todayValue;
                      const outsideMonth =
                        date.getMonth() !==
                        visibleMonth.getMonth();

                      return (
                        <button
                          key={dateValue}
                          type="button"
                          onClick={() =>
                            chooseDate(date)
                          }
                          className={`relative flex aspect-square min-h-9 items-center justify-center rounded-xl text-xs font-bold tabular-nums transition sm:text-sm ${
                            selected
                              ? 'bg-lime-400 text-black shadow-[0_0_22px_rgba(163,230,53,.20)]'
                              : isToday
                                ? 'border border-cyan-300/35 bg-cyan-300/[0.08] text-cyan-100'
                                : outsideMonth
                                  ? 'text-zinc-700 hover:bg-white/[0.04] hover:text-zinc-400'
                                  : 'text-zinc-300 hover:bg-white/[0.07] hover:text-white'
                          }`}
                        >
                          {date.getDate()}

                          {isToday &&
                            !selected && (
                              <span className="absolute bottom-1 h-1 w-1 rounded-full bg-cyan-300" />
                            )}
                        </button>
                      );
                    }
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
