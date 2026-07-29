export default function Loading() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030605] px-4 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(163,230,53,.10),transparent_36%)]" />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 animate-ping rounded-full border border-lime-400/20" />
          <div className="absolute inset-2 animate-spin rounded-full border-2 border-zinc-800 border-t-lime-400" />
        </div>

        <p className="mt-5 text-[10px] font-extrabold uppercase tracking-[0.26em] text-lime-400">
          Racha dos amigos
        </p>
        <p className="mt-2 text-sm font-semibold text-zinc-500">
          Preparando o elenco...
        </p>
      </div>
    </main>
  );
}
