'use client';

import {
  FolderPlus,
  LoaderCircle,
} from 'lucide-react';

interface GroupCreatePanelProps {
  value: string;
  creating: boolean;
  onChange: (value: string) => void;
  onSubmit: (
    event: React.FormEvent
  ) => void;
}

export function GroupCreatePanel({
  value,
  creating,
  onChange,
  onSubmit,
}: GroupCreatePanelProps) {
  const normalizedValue = value.trim();
  const canSubmit =
    normalizedValue.length >= 2 &&
    !creating;

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-[24px] border border-white/[0.10] bg-[#090d0a]/95 p-4 shadow-xl shadow-black/20 sm:p-5"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-lime-400/20 bg-lime-400/[0.09] text-lime-300">
          <FolderPlus size={17} />
        </span>

        <div>
          <p className="text-sm font-black text-white">
            Criar novo grupo
          </p>

          <p className="mt-0.5 text-xs leading-5 text-zinc-500">
            Organize um novo elenco no sistema.
          </p>
        </div>
      </div>

      <div className="mt-5 rounded-[18px] border border-white/[0.09] bg-black/30 p-3.5">
        <div className="flex items-center justify-between gap-3">
          <label
            htmlFor="new-group-name"
            className="text-sm font-bold text-zinc-200"
          >
            Nome do grupo
          </label>

          <span className="text-[11px] font-medium tabular-nums text-zinc-600">
            {value.length}/60
          </span>
        </div>

        <p className="mt-1.5 text-xs leading-5 text-zinc-500">
          Use um nome curto e fácil de reconhecer.
        </p>

        <input
          id="new-group-name"
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          placeholder="Ex.: Racha de quinta"
          maxLength={60}
          autoComplete="off"
          className="mt-3 h-12 w-full rounded-2xl border border-white/[0.13] bg-[#060907] px-4 text-base font-semibold text-white outline-none transition placeholder:font-medium placeholder:text-zinc-600 focus:border-lime-400/55 focus:ring-2 focus:ring-lime-400/15"
        />
      </div>

      <button
        type="submit"
        disabled={!canSubmit}
        className={`mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl text-sm font-black transition active:scale-[0.99] ${
          canSubmit
            ? 'bg-lime-400 text-black hover:bg-lime-300'
            : 'cursor-not-allowed border border-white/[0.07] bg-white/[0.035] text-zinc-600'
        }`}
      >
        {creating ? (
          <LoaderCircle
            size={17}
            className="animate-spin"
          />
        ) : (
          <FolderPlus size={17} />
        )}

        {creating
          ? 'Criando grupo...'
          : 'Criar grupo'}
      </button>
    </form>
  );
}
