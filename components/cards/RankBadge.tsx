import { Crown } from 'lucide-react';

interface RankBadgeProps {
  motm: number;
  accent: string;
}

export function RankBadge({ motm, accent }: RankBadgeProps) {
  if (motm <= 0) {
    return null;
  }

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border bg-black/25 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.12em] backdrop-blur-md"
      style={{
        borderColor: `${accent}66`,
        color: accent,
        boxShadow: `inset 0 0 12px ${accent}14`,
      }}
    >
      <Crown size={12} strokeWidth={2.4} />
      {motm}x craque
    </span>
  );
}
