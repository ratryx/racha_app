import type {
  CardAttributes,
  PlayerAggregates,
  PlayerPosition,
} from '@/types';

const BASE_OVERALL = 55;
const MAX_OVERALL = 95;
const FULL_CONFIDENCE_MATCHES = 8;

function clamp(value: number, min = 1, max = 99): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}

function progressScore(
  perMatch: number,
  excellentReference: number
): number {
  if (excellentReference <= 0 || perMatch <= 0) {
    return 0;
  }

  // Curva com retorno decrescente: números muito altos não explodem o OVR.
  const normalized = perMatch / excellentReference;
  return Math.tanh(normalized * 0.9);
}

function confidence(matches: number): number {
  if (matches <= 0) {
    return 0;
  }

  return Math.min(matches / FULL_CONFIDENCE_MATCHES, 1);
}

export function calculatePlayerCard(
  aggregates: PlayerAggregates,
  position: PlayerPosition
): CardAttributes {
  const matches = Math.max(aggregates.matches_played, 0);
  const divisor = Math.max(matches, 1);

  const goalsPerMatch = aggregates.total_goals / divisor;
  const assistsPerMatch = aggregates.total_assists / divisor;
  const savesPerMatch = aggregates.total_saves / divisor;
  const motmRate = aggregates.total_motm / divisor;

  const goalReference: Record<PlayerPosition, number> = {
    ATA: 1.1,
    MEI: 0.65,
    LAT: 0.4,
    ZAG: 0.25,
    GOL: 0.08,
  };

  const assistReference: Record<PlayerPosition, number> = {
    ATA: 0.65,
    MEI: 0.95,
    LAT: 0.75,
    ZAG: 0.35,
    GOL: 0.12,
  };

  const saveReference: Record<PlayerPosition, number> = {
    ATA: 1,
    MEI: 1,
    LAT: 1,
    ZAG: 1,
    GOL: 4.5,
  };

  const goalScore = progressScore(
    goalsPerMatch,
    goalReference[position]
  );

  const assistScore = progressScore(
    assistsPerMatch,
    assistReference[position]
  );

  const saveScore =
    position === 'GOL'
      ? progressScore(savesPerMatch, saveReference[position])
      : 0;

  const consistencyScore =
    Math.min(matches / 12, 1) * 0.65 +
    Math.min(motmRate / 0.35, 1) * 0.35;

  const weights: Record<
    PlayerPosition,
    {
      goals: number;
      assists: number;
      saves: number;
      consistency: number;
    }
  > = {
    ATA: {
      goals: 0.6,
      assists: 0.3,
      saves: 0,
      consistency: 0.1,
    },
    MEI: {
      goals: 0.35,
      assists: 0.55,
      saves: 0,
      consistency: 0.1,
    },
    LAT: {
      goals: 0.3,
      assists: 0.45,
      saves: 0,
      consistency: 0.25,
    },
    ZAG: {
      goals: 0.25,
      assists: 0.3,
      saves: 0,
      consistency: 0.45,
    },
    GOL: {
      goals: 0.025,
      assists: 0.025,
      saves: 0.75,
      consistency: 0.2,
    },
  };

  const weight = weights[position];

  const performance =
    goalScore * weight.goals +
    assistScore * weight.assists +
    saveScore * weight.saves +
    consistencyScore * weight.consistency;

  // Com poucas partidas, aproxima o resultado da base e evita OVR inflado.
  const reliablePerformance = performance * confidence(matches);
  const overall = clamp(
    BASE_OVERALL +
      reliablePerformance * (MAX_OVERALL - BASE_OVERALL),
    BASE_OVERALL,
    MAX_OVERALL
  );

  const ata = clamp(
    45 +
      goalScore * 39 +
      assistScore * 11 +
      consistencyScore * 5,
    45,
    95
  );

  const hab = clamp(
    45 +
      assistScore * 37 +
      goalScore * 10 +
      consistencyScore * 8,
    45,
    95
  );

  const def =
    position === 'GOL'
      ? clamp(45 + saveScore * 45 + consistencyScore * 5, 45, 95)
      : clamp(
          48 +
            consistencyScore * 27 +
            assistScore * 10 +
            goalScore * 5,
          45,
          90
        );

  const fis = clamp(
    50 +
      Math.min(matches / 10, 1) * 25 +
      Math.min(motmRate / 0.35, 1) * 15,
    50,
    90
  );

  return {
    overall,
    ata,
    def,
    fis,
    hab,
  };
}
