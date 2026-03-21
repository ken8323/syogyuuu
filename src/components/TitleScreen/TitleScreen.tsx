'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { motion, type TargetAndTransition } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'

interface TitleScreenProps {
  hasSavedGame: boolean
  onStartNew: () => void
  onResume: () => void
}

// タイトル文字と虹色
const TITLE_CHARS = ['し', 'ょ', 'う', 'ぎ', 'ゅ', 'ー', '！']
const RAINBOW = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899']

// アイドルアニメーションのバリエーション
const ANIM_VARIANTS: Record<string, TargetAndTransition> = {
  wobble: { rotate: [0, -8, 8, -5, 5, 0], transition: { duration: 1.2, ease: 'easeInOut' } },
  jump:   { y: [0, -10, 0, -6, 0],        transition: { duration: 0.7, ease: 'easeOut' } },
  shake:  { x: [0, -5, 5, -4, 4, 0],      transition: { duration: 0.6, ease: 'easeInOut' } },
  nod:    { y: [0, 4, -2, 3, 0],           transition: { duration: 0.8, ease: 'easeInOut' } },
}

// 円形配置の8体
const CIRCLE_ANIMALS: Array<{
  id: string
  imageSrc: string
  intervalMs: number
  animVariant: keyof typeof ANIM_VARIANTS
}> = [
  { id: 'hawk',     imageSrc: '/icons/washi.png',     intervalMs: 25000, animVariant: 'wobble' },
  { id: 'owl',      imageSrc: '/icons/fukuro.png',    intervalMs: 20000, animVariant: 'wobble' },
  { id: 'elephant', imageSrc: '/icons/zou.png',       intervalMs: 25000, animVariant: 'nod'    },
  { id: 'wolf',     imageSrc: '/icons/ookami.png',    intervalMs: 20000, animVariant: 'shake'  },
  { id: 'rabbit',   imageSrc: '/icons/rabbit.png',    intervalMs: 15000, animVariant: 'jump'   },
  { id: 'boar',     imageSrc: '/icons/inoshishi.png', intervalMs: 25000, animVariant: 'nod'    },
  { id: 'chick',    imageSrc: '/icons/hiyoko.png',    intervalMs: 15000, animVariant: 'nod'    },
  { id: 'chicken',  imageSrc: '/icons/niwatori.png',  intervalMs: 20000, animVariant: 'shake'  },
]

// パーティクル（固定値）
const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  symbol: i % 3 === 0 ? '🌸' : '✦',
  left: `${(i * 5.7 + 3) % 100}%`,
  delay: (i * 0.35) % 7,
  duration: 5 + (i % 5),
  rotate: i % 2 === 0 ? 360 : -360,
  fontSize: i % 2 === 0 ? '14px' : '10px',
  color: i % 2 === 0 ? '#F59E0B' : '#FCD34D',
}))

const CIRCLE_RADIUS = 110

// アイドルアニメーションフック
function useIdleAnimation(intervalMs: number) {
  const [isAnimating, setIsAnimating] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const schedule = () => {
      const jitter = Math.random() * intervalMs * 0.4
      timerRef.current = setTimeout(() => setIsAnimating(true), intervalMs + jitter)
    }
    timerRef.current = setTimeout(schedule, Math.random() * intervalMs * 0.6)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [intervalMs])

  const onComplete = () => {
    setIsAnimating(false)
    const jitter = Math.random() * intervalMs * 0.4
    timerRef.current = setTimeout(() => setIsAnimating(true), intervalMs + jitter)
  }

  return { isAnimating, onComplete }
}

// アイドルアニメーション付き動物コンポーネント
function IdleAnimal({
  imageSrc,
  alt,
  intervalMs,
  animVariant,
  size,
}: {
  imageSrc: string
  alt: string
  intervalMs: number
  animVariant: keyof typeof ANIM_VARIANTS
  size: number
}) {
  const { isAnimating, onComplete } = useIdleAnimation(intervalMs)
  const anim = ANIM_VARIANTS[animVariant]

  return (
    <motion.div
      className="relative"
      style={{ width: size, height: size }}
      animate={isAnimating ? anim : {}}
      onAnimationComplete={isAnimating ? onComplete : undefined}
    >
      <Image src={imageSrc} alt={alt} width={size} height={size} style={{ objectFit: 'contain', width: '100%', height: '100%' }} />
    </motion.div>
  )
}

export function TitleScreen({ hasSavedGame, onStartNew, onResume }: TitleScreenProps) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-8 overflow-hidden p-4 sm:p-8"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
      }}
    >
      {/* パーティクル */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="pointer-events-none absolute select-none"
          style={{ left: p.left, top: '-24px', fontSize: p.fontSize, color: p.color }}
          animate={{ y: '105vh', opacity: [0, 0.9, 0.9, 0], rotate: p.rotate }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'linear' }}
        >
          {p.symbol}
        </motion.div>
      ))}

      {/* キービジュアル（円形配置） */}
      <div
        className="relative flex items-center justify-center"
        style={{ width: 300, height: 300 }}
      >
        {/* 中央: ライオン */}
        <motion.div
          className="absolute z-10"
          style={{ width: 96, height: 96, left: '50%', top: '50%', marginLeft: -48, marginTop: -48 }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 18 }}
        >
          <IdleAnimal
            imageSrc="/icons/lion.png"
            alt="ライオン"
            intervalMs={30000}
            animVariant="wobble"
            size={96}
          />
        </motion.div>

        {/* 円形に配置した8体 */}
        {CIRCLE_ANIMALS.map(({ id, imageSrc, intervalMs, animVariant }, i) => {
          const angle = (i / CIRCLE_ANIMALS.length) * 2 * Math.PI - Math.PI / 2
          const x = Math.round(Math.cos(angle) * CIRCLE_RADIUS)
          const y = Math.round(Math.sin(angle) * CIRCLE_RADIUS)

          return (
            <motion.div
              key={id}
              className="absolute"
              style={{
                left: `calc(50% + ${x}px)`,
                top: `calc(50% + ${y}px)`,
                marginLeft: -28,
                marginTop: -28,
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 280, damping: 18 }}
            >
              <IdleAnimal
                imageSrc={imageSrc}
                alt={id}
                intervalMs={intervalMs}
                animVariant={animVariant}
                size={56}
              />
            </motion.div>
          )
        })}
      </div>

      {/* タイトルロゴ */}
      <div className="flex gap-0.5">
        {TITLE_CHARS.map((char, i) => (
          <motion.span
            key={i}
            className="text-3xl font-black drop-shadow-sm sm:text-5xl"
            style={{ color: RAINBOW[i % RAINBOW.length] }}
            initial={{ opacity: 0, y: 20, scale: 0.5 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.7 + i * 0.08, type: 'spring', stiffness: 300, damping: 15 }}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* バージョン番号 */}
      <p className="absolute bottom-2 right-3 text-xs text-amber-600/80 select-none">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>

      {/* ボタン */}
      <motion.div
        className="flex w-full max-w-xs flex-col gap-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
      >
        <AnimatedButton
          className="rounded-2xl bg-amber-500 py-5 text-xl font-bold text-white shadow-lg"
          onClick={onStartNew}
        >
          あそぶ！
        </AnimatedButton>

        {hasSavedGame && (
          <AnimatedButton
            className="rounded-2xl border-2 border-amber-400 bg-white py-4 text-lg font-semibold text-amber-700 shadow"
            onClick={onResume}
          >
            つづきから
          </AnimatedButton>
        )}
      </motion.div>
    </main>
  )
}
