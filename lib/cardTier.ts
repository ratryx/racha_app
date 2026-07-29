export interface CardTier {
  id: 'bronze' | 'silver' | 'gold' | 'elite' | 'legend';
  name: string;
  eyebrow: string;
  accent: string;
  accentBright: string;
  accentMuted: string;
  text: string;
  mutedText: string;
  frameFrom: string;
  frameMiddle: string;
  frameTo: string;
  innerFrame: string;
  glow: string;
  shine: string;
  surface: string;
  pattern: string;
}

export function getCardTier(overall: number): CardTier {
  if (overall >= 85) {
    return {
      id: 'legend',
      name: 'Lenda',
      eyebrow: 'Racha Icon',
      accent: '#f0d9ff',
      accentBright: '#67e8f9',
      accentMuted: '#8b5cf6',
      text: '#ffffff',
      mutedText: '#d8b4fe',
      frameFrom: '#ffffff',
      frameMiddle: '#67e8f9',
      frameTo: '#a855f7',
      innerFrame: '#e879f9',
      glow: 'rgba(168, 85, 247, 0.50)',
      shine: 'rgba(103, 232, 249, 0.42)',
      surface:
        'radial-gradient(circle at 76% 17%, rgba(34,211,238,.34), transparent 34%), radial-gradient(circle at 20% 72%, rgba(217,70,239,.30), transparent 43%), linear-gradient(150deg, #1b1033 0%, #101a35 50%, #030712 100%)',
      pattern:
        'repeating-linear-gradient(128deg, rgba(255,255,255,.075) 0 1px, transparent 1px 19px), repeating-radial-gradient(circle at 50% 47%, rgba(255,255,255,.055) 0 1px, transparent 1px 18px)',
    };
  }

  if (overall >= 75) {
    return {
      id: 'elite',
      name: 'Elite',
      eyebrow: 'Edição Noturna',
      accent: '#baf7ff',
      accentBright: '#22d3ee',
      accentMuted: '#2563eb',
      text: '#f3fdff',
      mutedText: '#93c5fd',
      frameFrom: '#ecfeff',
      frameMiddle: '#22d3ee',
      frameTo: '#1d4ed8',
      innerFrame: '#60a5fa',
      glow: 'rgba(34, 211, 238, 0.40)',
      shine: 'rgba(165, 243, 252, 0.36)',
      surface:
        'radial-gradient(circle at 78% 17%, rgba(34,211,238,.27), transparent 34%), radial-gradient(circle at 19% 73%, rgba(37,99,235,.28), transparent 44%), linear-gradient(150deg, #071b2c 0%, #0c1733 51%, #030712 100%)',
      pattern:
        'repeating-linear-gradient(130deg, rgba(255,255,255,.065) 0 1px, transparent 1px 19px), radial-gradient(circle at 50% 48%, transparent 0 39%, rgba(34,211,238,.07) 39.5% 40.5%, transparent 41% 100%)',
    };
  }

  if (overall >= 65) {
    return {
      id: 'gold',
      name: 'Ouro',
      eyebrow: 'Prime',
      accent: '#fff0a6',
      accentBright: '#facc15',
      accentMuted: '#a16207',
      text: '#fff9df',
      mutedText: '#d8bc6d',
      frameFrom: '#fff8c7',
      frameMiddle: '#e9bc45',
      frameTo: '#855313',
      innerFrame: '#d9a92e',
      glow: 'rgba(250, 204, 21, 0.35)',
      shine: 'rgba(255, 243, 176, 0.34)',
      surface:
        'radial-gradient(circle at 76% 16%, rgba(250,204,21,.24), transparent 35%), radial-gradient(circle at 18% 74%, rgba(146,98,28,.28), transparent 44%), linear-gradient(150deg, #30250d 0%, #191408 52%, #080705 100%)',
      pattern:
        'repeating-linear-gradient(122deg, rgba(255,255,255,.06) 0 1px, transparent 1px 19px), radial-gradient(circle at 50% 48%, transparent 0 39%, rgba(250,204,21,.065) 39.5% 40.5%, transparent 41% 100%)',
    };
  }

  if (overall >= 55) {
    return {
      id: 'silver',
      name: 'Prata',
      eyebrow: 'Clássico',
      accent: '#ffffff',
      accentBright: '#d4d4d8',
      accentMuted: '#71717a',
      text: '#ffffff',
      mutedText: '#c7c7cf',
      frameFrom: '#ffffff',
      frameMiddle: '#b5b5bd',
      frameTo: '#4b4b55',
      innerFrame: '#e4e4e7',
      glow: 'rgba(228, 228, 231, 0.30)',
      shine: 'rgba(255, 255, 255, 0.30)',
      surface:
        'radial-gradient(circle at 76% 17%, rgba(255,255,255,.19), transparent 34%), radial-gradient(circle at 18% 74%, rgba(161,161,170,.18), transparent 43%), linear-gradient(150deg, #36363c 0%, #19191d 52%, #08080a 100%)',
      pattern:
        'repeating-linear-gradient(126deg, rgba(255,255,255,.065) 0 1px, transparent 1px 18px), radial-gradient(circle at 50% 48%, transparent 0 39%, rgba(255,255,255,.055) 39.5% 40.5%, transparent 41% 100%)',
    };
  }

  return {
    id: 'bronze',
    name: 'Bronze',
    eyebrow: 'Fundador',
    accent: '#ffd0ae',
    accentBright: '#ea965c',
    accentMuted: '#8b4b2d',
    text: '#fff5ed',
    mutedText: '#d9a98a',
    frameFrom: '#ffe0c6',
    frameMiddle: '#c97a49',
    frameTo: '#60301e',
    innerFrame: '#c97947',
    glow: 'rgba(201, 121, 71, 0.30)',
    shine: 'rgba(255, 208, 173, 0.28)',
    surface:
      'radial-gradient(circle at 76% 17%, rgba(233,139,79,.24), transparent 35%), radial-gradient(circle at 18% 74%, rgba(139,75,45,.27), transparent 44%), linear-gradient(150deg, #2c1a12 0%, #18100c 52%, #080605 100%)',
    pattern:
      'repeating-linear-gradient(124deg, rgba(255,255,255,.05) 0 1px, transparent 1px 19px), radial-gradient(circle at 50% 48%, transparent 0 39%, rgba(233,139,79,.06) 39.5% 40.5%, transparent 41% 100%)',
  };
}

export const CARD_WIDTH = 286;
export const CARD_HEIGHT = 430;

/** Moldura inspirada em cards de futebol, com coroa central e laterais recortadas. */
export const CARD_PATH =
  'M143 4 C132 17 121 19 110 8 C102 26 87 31 68 25 C43 18 22 31 15 55 C10 72 12 93 14 114 L23 279 C25 329 57 370 101 399 L143 426 L185 399 C229 370 261 329 263 279 L272 114 C274 93 276 72 271 55 C264 31 243 18 218 25 C199 31 184 26 176 8 C165 19 154 17 143 4 Z';

export const INNER_CARD_PATH =
  'M143 16 C132 27 120 28 108 19 C99 34 85 39 67 34 C48 29 31 39 25 58 C21 73 23 92 24 112 L33 276 C35 320 63 355 105 382 L143 405 L181 382 C223 355 251 320 253 276 L262 112 C263 92 265 73 261 58 C255 39 238 29 219 34 C201 39 187 34 178 19 C166 28 154 27 143 16 Z';
