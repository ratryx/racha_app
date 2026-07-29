export interface CardTier {
  name: string;
  borderFrom: string;
  borderTo: string;
  glow: string;
  accent: string;
  bg: string;
}

/**
 * Define a "raridade" visual do card com base no overall, igual o FUT faz
 * com bronze/prata/ouro/especial. Puramente estético — não afeta o cálculo
 * de overall em si (que fica em calculateOverall.ts).
 */
export function getCardTier(overall: number): CardTier {
  if (overall >= 80) {
    return {
      name: 'Especial',
      borderFrom: '#60a5fa',
      borderTo: '#a78bfa',
      glow: 'rgba(96,165,250,0.45)',
      accent: '#93c5fd',
      bg: 'linear-gradient(160deg, #0f172a 0%, #1e1b4b 55%, #000 100%)',
    };
  }
  if (overall >= 65) {
    return {
      name: 'Ouro',
      borderFrom: '#fde047',
      borderTo: '#b45309',
      glow: 'rgba(250,204,21,0.4)',
      accent: '#facc15',
      bg: 'linear-gradient(160deg, #292417 0%, #1a1611 55%, #000 100%)',
    };
  }
  if (overall >= 50) {
    return {
      name: 'Prata',
      borderFrom: '#e5e7eb',
      borderTo: '#6b7280',
      glow: 'rgba(209,213,219,0.35)',
      accent: '#d1d5db',
      bg: 'linear-gradient(160deg, #27272a 0%, #18181b 55%, #000 100%)',
    };
  }
  return {
    name: 'Bronze',
    borderFrom: '#d97757',
    borderTo: '#7c3f2a',
    glow: 'rgba(217,119,87,0.3)',
    accent: '#e0a181',
    bg: 'linear-gradient(160deg, #241a15 0%, #17110d 55%, #000 100%)',
  };
}

/** Path do escudo (viewBox 260x380), reutilizado no clip-path e na borda SVG. */
export const SHIELD_PATH =
  'M130 0 C55 0 0 22 0 65 L0 262 C0 312 38 344 84 360 L130 380 L176 360 C222 344 260 312 260 262 L260 65 C260 22 205 0 130 0 Z';