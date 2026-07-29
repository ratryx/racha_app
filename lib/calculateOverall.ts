import { PlayerAggregates, PlayerPosition, CardAttributes } from '@/types';

/**
 * Converte uma média "por partida" numa escala de 0-99 (estilo FIFA),
 * usando uma referência de "excelente" configurável por posição.
 */
function scaleToOvr(perMatch: number, excelente: number): number {
  const base = 40; // todo mundo começa com uma base decente
  const ganho = Math.min((perMatch / excelente) * 55, 59); // até +59 pontos
  return Math.round(Math.min(base + ganho, 99));
}

/**
 * Calcula os 4 atributos do card (ATA, DEF, FIS, HAB) e o Overall
 * a partir das estatísticas agregadas do jogador e da posição dele.
 *
 * A ideia: cada posição tem pesos diferentes pros mesmos números.
 * Um zagueiro que desarma muito pesa mais em DEF do que em ATA,
 * e vice-versa pro atacante.
 */
export function calculatePlayerCard(
  agg: PlayerAggregates,
  position: PlayerPosition
): CardAttributes {
  const jogos = Math.max(agg.matches_played, 1); // evita divisão por 0

  const golsPorJogo = agg.total_goals / jogos;
  const assistPorJogo = agg.total_assists / jogos;
  const desarmesPorJogo = agg.total_tackles / jogos;
  const defesasPorJogo = agg.total_saves / jogos;
  const motmRate = agg.total_motm / jogos;

  // Referências "excelente" por posição — ajuste ao gosto do racha
  const refs: Record<PlayerPosition, { gol: number; assist: number; desarme: number; defesa: number }> = {
    ATA: { gol: 1.2, assist: 0.6, desarme: 0.5, defesa: 0 },
    MEI: { gol: 0.6, assist: 1.0, desarme: 1.0, defesa: 0 },
    LAT: { gol: 0.3, assist: 0.7, desarme: 1.3, defesa: 0 },
    ZAG: { gol: 0.2, assist: 0.3, desarme: 1.8, defesa: 0 },
    GOL: { gol: 0, assist: 0.1, desarme: 0.5, defesa: 3.0 },
  };

  const r = refs[position];

  const ata = scaleToOvr(golsPorJogo, r.gol);
  const hab = scaleToOvr(assistPorJogo, r.assist);
  const def =
    position === 'GOL'
      ? scaleToOvr(defesasPorJogo, r.defesa)
      : scaleToOvr(desarmesPorJogo, r.desarme);
  const fis = scaleToOvr(motmRate * 2 + jogos / 10, 1); // presença + destaque = "físico/consistência"

  // Overall pondera de forma diferente por posição (igual FIFA faz)
  const pesos: Record<PlayerPosition, [number, number, number, number]> = {
    // [ata, def, fis, hab]
    ATA: [0.45, 0.1, 0.2, 0.25],
    MEI: [0.25, 0.2, 0.2, 0.35],
    LAT: [0.15, 0.35, 0.25, 0.25],
    ZAG: [0.1, 0.5, 0.25, 0.15],
    GOL: [0.05, 0.6, 0.2, 0.15],
  };

  const [wAta, wDef, wFis, wHab] = pesos[position];
  const overall = Math.round(ata * wAta + def * wDef + fis * wFis + hab * wHab);

  return { overall, ata, def, fis, hab };
}
