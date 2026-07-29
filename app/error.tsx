'use client';

import { useEffect } from 'react';
import { RefreshCw, TriangleAlert } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erro da aplicação:', error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030605] px-4 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#090b0a]/95 p-6 text-center shadow-2xl shadow-black/50">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-red-400/20 bg-red-400/10 text-red-300">
          <TriangleAlert size={24} />
        </span>

        <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.24em] text-red-300">
          Erro inesperado
        </p>

        <h1 className="font-display mt-2 text-3xl font-black uppercase text-white">
          Não foi possível carregar
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          Tente novamente. Caso o problema continue, atualize a página e
          verifique sua conexão.
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 font-extrabold text-black transition hover:bg-lime-300"
        >
          <RefreshCw size={17} />
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
