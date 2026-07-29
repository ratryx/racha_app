'use client';

import { useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { PlayerWithCard } from '@/types';
import { RankBadge } from './RankBadge';
import { getCardTier, SHIELD_PATH } from '@/lib/cardTier';

interface PlayerCardProps {
  player: PlayerWithCard;
  onClick?: () => void;
}

const CARD_W = 260;
const CARD_H = 380;

/**
 * Card em formato de escudo (estilo FUT/appito), com tilt 3D via Framer
 * Motion + brilho holográfico que segue o mouse. A "raridade" (borda/glow)
 * muda de cor conforme o overall (bronze/prata/ouro/especial) — ver
 * lib/cardTier.ts.
 *
 * O corte em forma de escudo é feito com clip-path: path(...), então o
 * card mantém tamanho fixo (260x380) e é escalado via CSS quando precisa
 * ficar menor (ex: dentro do carrossel mobile) — escalar não deforma o
 * clip-path porque ele é aplicado antes da transform.
 */
export function PlayerCard({ player, onClick }: PlayerCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tier = getCardTier(player.card.overall);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), {
    stiffness: 200,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 200,
    damping: 20,
  });

  const shineX = useTransform(mouseX, [-0.5, 0.5], ['10%', '90%']);
  const shineY = useTransform(mouseY, [-0.5, 0.5], ['0%', '80%']);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  const { overall, ata, def, fis, hab } = player.card;

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 1200,
        width: CARD_W,
        height: CARD_H,
        filter: `drop-shadow(0 12px 28px ${tier.glow})`,
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative cursor-pointer select-none shrink-0"
    >
      {/* preenchimento + conteúdo, cortados no formato de escudo */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{
          clipPath: `path('${SHIELD_PATH}')`,
          background: tier.bg,
        }}
      >
        {/* brilho holográfico que segue o mouse */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(circle at ${shineX} ${shineY}, ${tier.glow}, transparent 55%)`,
            mixBlendMode: 'screen',
          }}
        />
        {/* textura diagonal sutil, tipo crystal do FUT */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(115deg, #fff 0px, #fff 1px, transparent 1px, transparent 14px)',
          }}
        />

        {/* topo: overall + posição */}
        <div className="absolute top-6 left-6 flex flex-col items-center">
          <span className="text-3xl font-extrabold leading-none" style={{ color: tier.accent }}>
            {overall}
          </span>
          <span className="text-xs font-semibold tracking-wide text-zinc-300 mt-1">
            {player.position}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-zinc-500 mt-1">
            {tier.name}
          </span>
        </div>

        {/* foto do jogador */}
        <div
          className="mx-auto w-[130px] h-[130px] rounded-full overflow-hidden border-2 mt-8"
          style={{ borderColor: tier.accent }}
        >
          {player.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={player.photo_url}
              alt={player.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-zinc-800 flex items-center justify-center text-zinc-500 text-xs text-center px-2">
              sem foto
            </div>
          )}
        </div>

        {/* nome */}
        <div className="mt-3 text-center px-4">
          <h3 className="text-lg font-bold text-white tracking-wide truncate">
            {player.nickname ?? player.name}
          </h3>
        </div>

        {/* linha divisória */}
        <div
          className="mx-auto mt-2 h-px w-32 opacity-40"
          style={{ background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)` }}
        />

        {/* atributos 2x2 */}
        <div className="mt-3 px-8 grid grid-cols-2 gap-x-6 gap-y-2">
          <Attribute label="ATA" value={ata} color={tier.accent} />
          <Attribute label="FIS" value={fis} color={tier.accent} />
          <Attribute label="DEF" value={def} color={tier.accent} />
          <Attribute label="HAB" value={hab} color={tier.accent} />
        </div>

        {/* faixa inferior: destaque (craque do jogo) */}
        <div className="absolute bottom-6 w-full flex justify-center">
          <RankBadge motm={player.aggregates.total_motm} />
        </div>
      </div>

      {/* borda do escudo (SVG por cima, não é cortada pelo clip-path) */}
      <svg
        viewBox={`0 0 ${CARD_W} ${CARD_H}`}
        className="absolute inset-0 pointer-events-none"
        style={{ width: CARD_W, height: CARD_H }}
      >
        <defs>
          <linearGradient id={`border-${player.id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={tier.borderFrom} />
            <stop offset="100%" stopColor={tier.borderTo} />
          </linearGradient>
        </defs>
        <path
          d={SHIELD_PATH}
          fill="none"
          stroke={`url(#border-${player.id})`}
          strokeWidth={4}
        />
      </svg>
    </motion.div>
  );
}

function Attribute({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex items-baseline gap-1.5">
      <span className="font-bold text-sm" style={{ color }}>
        {value}
      </span>
      <span className="text-zinc-400 text-[10px] tracking-wider">{label}</span>
    </div>
  );
}