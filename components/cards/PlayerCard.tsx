'use client';

import {
  useMemo,
  useRef,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from 'framer-motion';
import { UserRound } from 'lucide-react';
import type { PlayerWithCard } from '@/types';
import { RankBadge } from './RankBadge';
import {
  CARD_HEIGHT,
  CARD_PATH,
  CARD_WIDTH,
  INNER_CARD_PATH,
  getCardTier,
} from '@/lib/cardTier';

interface PlayerCardProps {
  player: PlayerWithCard;
  onClick?: () => void;
  interactiveTilt?: boolean;
}

interface DisplayStat {
  label: 'PAC' | 'SHO' | 'PAS' | 'DRI' | 'DEF' | 'PHY';
  value: number;
}

export function PlayerCard({
  player,
  onClick,
  interactiveTilt = true,
}: PlayerCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const tier = getCardTier(player.card.overall);
  const frameId = `frame-${player.id.replaceAll('-', '').slice(0, 12)}`;


  const idleDelay = useMemo(() => {
    const seed = player.id
      .split('')
      .reduce(
        (total, character) => total + character.charCodeAt(0),
        0
      );

    return (seed % 10) / 10;
  }, [player.id]);

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rotateX = useSpring(
    useTransform(pointerY, [-0.5, 0.5], [8.5, -8.5]),
    { stiffness: 245, damping: 25, mass: 0.52 }
  );
  const rotateY = useSpring(
    useTransform(pointerX, [-0.5, 0.5], [-8.5, 8.5]),
    { stiffness: 245, damping: 25, mass: 0.52 }
  );

  const shineX = useTransform(pointerX, [-0.5, 0.5], ['7%', '93%']);
  const shineY = useTransform(pointerY, [-0.5, 0.5], ['3%', '88%']);
  const pointerShine = useMotionTemplate`radial-gradient(circle at ${shineX} ${shineY}, ${tier.shine} 0%, transparent 47%)`;


  const displayName = player.nickname?.trim() || player.name;
  const nameSizeClass =
    displayName.length >= 12
      ? 'text-[21px]'
      : displayName.length >= 9
        ? 'text-[23px]'
        : 'text-[27px]';

  const displayStats = useMemo(() => createDisplayStats(player), [player]);
  const leftStats = displayStats.slice(0, 3);
  const rightStats = displayStats.slice(3);

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!interactiveTilt || reduceMotion || event.pointerType !== 'mouse') {
      return;
    }

    const rect = cardRef.current?.getBoundingClientRect();

    if (!rect) {
      return;
    }

    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function resetTilt() {
    pointerX.set(0);
    pointerY.set(0);
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (!onClick || (event.key !== 'Enter' && event.key !== ' ')) {
      return;
    }

    event.preventDefault();
    onClick();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.46, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: CARD_WIDTH, height: CARD_HEIGHT }}
      className="relative shrink-0"
    >
      <motion.div
        animate={
          reduceMotion
            ? undefined
            : {
                y: [0, -4, 0],
                rotateZ: [0, 0.12, 0, -0.1, 0],
              }
        }
        transition={
          reduceMotion
            ? undefined
            : {
                duration: 6.8,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: idleDelay,
              }
        }
        style={{
          width: CARD_WIDTH,
          height: CARD_HEIGHT,
          willChange: reduceMotion ? 'auto' : 'transform',
        }}
      >
        <motion.div
          ref={cardRef}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          aria-label={onClick ? `Abrir card de ${displayName}` : undefined}
          onKeyDown={handleKeyDown}
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
          onPointerCancel={resetTilt}
          onClick={onClick}
          style={{
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            rotateX: interactiveTilt && !reduceMotion ? rotateX : 0,
            rotateY: interactiveTilt && !reduceMotion ? rotateY : 0,
            transformPerspective: 1250,
            transformStyle: 'preserve-3d',
            filter: `drop-shadow(0 16px 24px ${tier.glow})`,
            willChange: interactiveTilt ? 'transform' : 'auto',
          }}
          whileHover={
            interactiveTilt && !reduceMotion
              ? { scale: 1.025, y: -3 }
              : undefined
          }
          whileTap={{ scale: 0.985 }}
          className={`relative select-none outline-none ${
            onClick
              ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-lime-400/80'
              : ''
          }`}
        >
          <div
            className="absolute inset-x-7 bottom-[-11px] h-10 rounded-[50%] blur-xl"
            style={{ background: tier.glow }}
          />

          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              clipPath: `path('${CARD_PATH}')`,
              background: tier.surface,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-90"
              style={{ backgroundImage: tier.pattern }}
            />

            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-[61%]"
              style={{
                background:
                  'linear-gradient(180deg, rgba(255,255,255,.10), transparent 34%, rgba(0,0,0,.20) 100%)',
              }}
            />

            <motion.div
              className="pointer-events-none absolute inset-0"
              style={{
                background: pointerShine,
                mixBlendMode: 'screen',
              }}
            />

            <div className="player-card-sheen pointer-events-none absolute inset-[-38%] opacity-65" />

            <div
              className="absolute left-[23px] top-[55px] z-20 flex w-[78px] flex-col items-center text-center"
              style={{ color: tier.text }}
            >
              <span
                className="font-score text-[54px] font-black leading-none tracking-[-0.07em] tabular-nums"
                style={{ textShadow: `0 3px 18px ${tier.glow}` }}
              >
                {player.card.overall}
              </span>
              <span className="mt-2.5 text-[13px] font-black uppercase leading-none tracking-[0.18em]">
                {player.position}
              </span>
              <span
                className="mt-2 max-w-[78px] text-[8px] font-extrabold uppercase leading-[1.35] tracking-[0.18em]"
                style={{ color: tier.mutedText }}
              >
                {tier.eyebrow}
              </span>
            </div>

            {player.aggregates.total_motm > 0 && (
              <div className="absolute left-[19px] top-[224px] z-20 w-[92px] scale-[0.88]">
                <RankBadge
                  motm={player.aggregates.total_motm}
                  accent={tier.accent}
                />
              </div>
            )}

            <div
              className="absolute right-[7px] top-[43px] z-10 h-[214px] w-[197px] overflow-hidden"
              style={{
                clipPath:
                  'polygon(24% 0, 100% 0, 100% 80%, 82% 100%, 7% 93%, 0 24%)',
                WebkitMaskImage:
                  'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, black 0%, black 70%, transparent 100%)',
              }}
            >
              {player.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={player.photo_url}
                  alt={player.name}
                  draggable={false}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover object-top"
                  style={{ filter: 'contrast(1.08) saturate(1.06)' }}
                />
              ) : (
                <div
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    color: tier.accent,
                    background:
                      'radial-gradient(circle at 50% 35%, rgba(255,255,255,.13), transparent 56%)',
                  }}
                >
                  <UserRound size={90} strokeWidth={1.05} />
                </div>
              )}

              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, ${tier.accentMuted}22, transparent 34%, transparent 72%, ${tier.accent}18)`,
                  mixBlendMode: 'screen',
                }}
              />
            </div>

            <div className="absolute inset-x-[24px] top-[258px] z-20 text-center">
              <div
                className="mx-auto mb-2 h-px w-[74%]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tier.accent}, transparent)`,
                  boxShadow: `0 0 12px ${tier.glow}`,
                }}
              />
              <h3
                className={`font-display truncate font-black uppercase leading-none tracking-[0.02em] ${nameSizeClass}`}
                style={{
                  color: tier.text,
                  textShadow: '0 2px 10px rgba(0,0,0,.68)',
                }}
              >
                {displayName}
              </h3>
              <p
                className="mt-1 text-[7px] font-extrabold uppercase leading-none tracking-[0.20em]"
                style={{ color: tier.mutedText }}
              >
                {tier.name} · Racha dos amigos
              </p>
            </div>

            <div className="absolute left-1/2 top-[305px] z-20 w-[154px] -translate-x-1/2">
              <div
                className="mb-[6px] h-px w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tier.accent}45, transparent)`,
                }}
              />

              <div className="grid grid-cols-2 gap-x-[12px]">
                <StatColumn stats={leftStats} align="left" />
                <StatColumn stats={rightStats} align="right" />
              </div>

              <div
                className="mt-[6px] h-px w-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${tier.accent}32, transparent)`,
                }}
              />
            </div>
          </div>

          <svg
            viewBox={`0 0 ${CARD_WIDTH} ${CARD_HEIGHT}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <defs>
              <linearGradient id={frameId} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={tier.frameFrom} />
                <stop offset="26%" stopColor={tier.frameMiddle} />
                <stop offset="52%" stopColor={tier.frameFrom} />
                <stop offset="78%" stopColor={tier.frameMiddle} />
                <stop offset="100%" stopColor={tier.frameTo} />
              </linearGradient>
              <filter
                id={`${frameId}-glow`}
                x="-35%"
                y="-35%"
                width="170%"
                height="170%"
              >
                <feGaussianBlur stdDeviation="3.2" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            <path
              d={CARD_PATH}
              fill="none"
              stroke={`url(#${frameId})`}
              strokeWidth="7"
              strokeLinejoin="round"
              filter={`url(#${frameId}-glow)`}
            />
            <path
              d={INNER_CARD_PATH}
              fill="none"
              stroke={tier.innerFrame}
              strokeOpacity="0.68"
              strokeWidth="1.2"
            />

            <path
              d="M83 31 C104 36 125 25 143 9 C161 25 182 36 203 31"
              fill="none"
              stroke={tier.accent}
              strokeOpacity="0.66"
              strokeWidth="1.25"
            />
            <path
              d="M24 100 C16 169 20 241 30 286"
              fill="none"
              stroke={tier.accentBright}
              strokeOpacity="0.36"
              strokeWidth="1.15"
            />
            <path
              d="M262 100 C270 169 266 241 256 286"
              fill="none"
              stroke={tier.accentBright}
              strokeOpacity="0.36"
              strokeWidth="1.15"
            />
            <path
              d="M37 294 C48 338 75 368 108 390"
              fill="none"
              stroke={tier.accent}
              strokeOpacity="0.40"
              strokeWidth="1.1"
            />
            <path
              d="M249 294 C238 338 211 368 178 390"
              fill="none"
              stroke={tier.accent}
              strokeOpacity="0.40"
              strokeWidth="1.1"
            />

            <circle cx="21" cy="107" r="2" fill={tier.accentBright} opacity="0.85" />
            <circle cx="265" cy="107" r="2" fill={tier.accentBright} opacity="0.85" />
          </svg>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

function StatColumn({
  stats,
  align,
}: {
  stats: DisplayStat[];
  align: 'left' | 'right';
}) {
  return (
    <div className="space-y-[5px]">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`flex items-center gap-[5px] leading-none ${
            align === 'right' ? 'justify-end' : 'justify-start'
          }`}
        >
          <span
            className="w-[25px] text-right text-[16px] font-black leading-none tracking-[-0.035em] tabular-nums text-white"
            style={{ textShadow: '0 1px 5px rgba(0,0,0,.85)' }}
          >
            {stat.value}
          </span>
          <span
            className="w-[23px] text-left text-[8px] font-extrabold uppercase leading-none tracking-[0.08em] text-white/[0.72]"
            style={{ textShadow: '0 1px 4px rgba(0,0,0,.9)' }}
          >
            {stat.label}
          </span>
        </div>
      ))}
    </div>
  );
}

function createDisplayStats(player: PlayerWithCard): DisplayStat[] {
  const { ata, def, fis, hab } = player.card;

  return [
    { label: 'PAC', value: clampStat(fis * 0.58 + hab * 0.42) },
    { label: 'SHO', value: clampStat(ata) },
    { label: 'PAS', value: clampStat(hab * 0.78 + ata * 0.22) },
    { label: 'DRI', value: clampStat(hab) },
    { label: 'DEF', value: clampStat(def) },
    { label: 'PHY', value: clampStat(fis) },
  ];
}

function clampStat(value: number): number {
  return Math.max(1, Math.min(99, Math.round(value)));
}
