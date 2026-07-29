'use client';

import { UsersRound } from 'lucide-react';

interface EmptyGroupStateProps {
  isAdmin: boolean;
  hasPlayerCard: boolean;
  onOpenGroups: () => void;
  onOpenCard: () => void;
}

export function EmptyGroupState({
  isAdmin,
  hasPlayerCard,
  onOpenGroups,
  onOpenCard,
}: EmptyGroupStateProps) {
  return (
    <section className="mx-auto flex min-h-[460px] max-w-2xl flex-col items-center justify-center rounded-[28px] border border-white/[0.08] bg-black/25 px-6 py-14 text-center backdrop-blur-md">
      <span className="flex h-16 w-16 items-center justify-center rounded-3xl border border-lime-400/20 bg-lime-400/[0.08] text-lime-400">
        <UsersRound size={28} />
      </span>

      <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.24em] text-lime-400/70">
        Cadastro concluído
      </p>

      <h2 className="font-display mt-3 text-3xl font-black uppercase text-white sm:text-4xl">
        {isAdmin
          ? 'Nenhum grupo ativo'
          : 'Aguardando grupo'}
      </h2>

      <p className="mt-3 max-w-lg text-sm leading-6 text-zinc-500">
        {isAdmin
          ? 'Crie um grupo para começar a organizar os jogadores.'
          : 'Os cards, rankings e partidas ficam disponíveis depois que o administrador adicionar sua conta a um grupo.'}
      </p>

      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {isAdmin && (
          <button
            type="button"
            onClick={onOpenGroups}
            className="rounded-2xl bg-lime-400 px-5 py-3 text-sm font-extrabold text-black transition hover:bg-lime-300"
          >
            Gerenciar grupos
          </button>
        )}

        <button
          type="button"
          onClick={onOpenCard}
          className="rounded-2xl border border-white/10 bg-white/[0.05] px-5 py-3 text-sm font-extrabold text-white transition hover:border-lime-400/30 hover:bg-lime-400/[0.08]"
        >
          {hasPlayerCard
            ? 'Editar meu card'
            : 'Criar meu card'}
        </button>
      </div>
    </section>
  );
}
