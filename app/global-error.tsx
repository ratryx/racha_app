'use client';

import { RefreshCw, TriangleAlert } from 'lucide-react';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body className="m-0 bg-[#030605] font-sans text-white">
        <main className="flex min-h-screen items-center justify-center px-4">
          <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#090b0a] p-6 text-center">
            <TriangleAlert
              size={32}
              className="mx-auto text-red-300"
            />

            <h1 className="mt-5 text-2xl font-black">
              O aplicativo encontrou um erro
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-500">
              Recarregue a interface para continuar.
            </p>

            <button
              type="button"
              onClick={reset}
              className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-lime-400 px-5 py-3 font-extrabold text-black"
            >
              <RefreshCw size={17} />
              Recarregar
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
