import type { FutsalTeamColor } from '@/types';

export interface TeamColorOption {
  id: FutsalTeamColor;
  label: string;
  dotClass: string;
  borderClass: string;
  backgroundClass: string;
  textClass: string;
}

export const TEAM_COLOR_OPTIONS: TeamColorOption[] = [
  { id: 'lime', label: 'Verde', dotClass: 'bg-lime-400', borderClass: 'border-lime-400/30', backgroundClass: 'bg-lime-400/[0.09]', textClass: 'text-lime-200' },
  { id: 'cyan', label: 'Azul', dotClass: 'bg-cyan-400', borderClass: 'border-cyan-400/30', backgroundClass: 'bg-cyan-400/[0.09]', textClass: 'text-cyan-100' },
  { id: 'amber', label: 'Amarelo', dotClass: 'bg-amber-300', borderClass: 'border-amber-300/30', backgroundClass: 'bg-amber-300/[0.09]', textClass: 'text-amber-100' },
  { id: 'rose', label: 'Vermelho', dotClass: 'bg-rose-400', borderClass: 'border-rose-400/30', backgroundClass: 'bg-rose-400/[0.09]', textClass: 'text-rose-100' },
  { id: 'violet', label: 'Roxo', dotClass: 'bg-violet-400', borderClass: 'border-violet-400/30', backgroundClass: 'bg-violet-400/[0.09]', textClass: 'text-violet-100' },
  { id: 'orange', label: 'Laranja', dotClass: 'bg-orange-400', borderClass: 'border-orange-400/30', backgroundClass: 'bg-orange-400/[0.09]', textClass: 'text-orange-100' },
];

export function getTeamColor(color: FutsalTeamColor): TeamColorOption {
  return TEAM_COLOR_OPTIONS.find((option) => option.id === color) ?? TEAM_COLOR_OPTIONS[0];
}
