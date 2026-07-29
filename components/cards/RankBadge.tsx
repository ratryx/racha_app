import { Crown } from 'lucide-react';

export function RankBadge({ motm }: { motm: number }) {
  if (motm === 0) return null;

  return (
    <div className="flex items-center gap-1 bg-zinc-800/80 border border-lime-400/40 rounded-full px-3 py-1">
      <Crown size={14} className="text-lime-400" />
      <span className="text-xs text-lime-300 font-medium">{motm}x craque</span>
    </div>
  );
}
