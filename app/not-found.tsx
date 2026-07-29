import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030605] px-4 text-white">
      <section className="w-full max-w-md rounded-[28px] border border-white/10 bg-[#090b0a]/95 p-6 text-center shadow-2xl shadow-black/50">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03] text-zinc-400">
          <SearchX size={24} />
        </span>

        <p className="mt-5 text-[9px] font-extrabold uppercase tracking-[0.24em] text-lime-400">
          Página não encontrada
        </p>

        <h1 className="font-display mt-2 text-3xl font-black uppercase">
          Você saiu do campo
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-zinc-500">
          O endereço informado não existe.
        </p>

        <Link
          href="/"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-lime-400 px-4 py-3 font-extrabold text-black transition hover:bg-lime-300"
        >
          <ArrowLeft size={17} />
          Voltar ao elenco
        </Link>
      </section>
    </main>
  );
}
