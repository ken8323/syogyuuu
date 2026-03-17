'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, type TargetAndTransition } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import type { AnimalColors } from '@/components/Piece/animals'
import { Lion, Hawk, Owl, Elephant, Wolf, Rabbit, Boar, Chick, Chicken } from '@/components/Piece/animals'

interface TitleScreenProps {
  hasSavedGame: boolean
  onStartNew: () => void
  onResume: () => void
}

// タイトル文字と虹色
const TITLE_CHARS = ['し', 'ょ', 'う', 'ぎ', 'ゅ', 'ー', '！']
const RAINBOW = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899']

// 動物カラー
const SENTE: AnimalColors = { primary: '#3B82F6', dark: '#1E40AF' }
const GOTE: AnimalColors = { primary: '#EF4444', dark: '#991B1B' }

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
  Component: React.ComponentType<AnimalColors & { isPromoted?: boolean }>
  colors: AnimalColors
  intervalMs: number
  animVariant: keyof typeof ANIM_VARIANTS
}> = [
  { id: 'hawk',     Component: Hawk,     colors: GOTE,  intervalMs: 25000, animVariant: 'wobble' },
  { id: 'owl',      Component: Owl,      colors: SENTE, intervalMs: 20000, animVariant: 'wobble' },
  { id: 'elephant', Component: Elephant, colors: GOTE,  intervalMs: 25000, animVariant: 'nod'    },
  { id: 'wolf',     Component: Wolf,     colors: SENTE, intervalMs: 20000, animVariant: 'shake'  },
  { id: 'rabbit',   Component: Rabbit,   colors: GOTE,  intervalMs: 15000, animVariant: 'jump'   },
  { id: 'boar',     Component: Boar,     colors: SENTE, intervalMs: 25000, animVariant: 'nod'    },
  { id: 'chick',    Component: Chick,    colors: GOTE,  intervalMs: 15000, animVariant: 'nod'    },
  { id: 'chicken',  Component: Chicken,  colors: SENTE, intervalMs: 20000, animVariant: 'shake'  },
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
  Component,
  colors,
  intervalMs,
  animVariant,
  size,
}: {
  Component: React.ComponentType<AnimalColors & { isPromoted?: boolean }>
  colors: AnimalColors
  intervalMs: number
  animVariant: keyof typeof ANIM_VARIANTS
  size: number
}) {
  const { isAnimating, onComplete } = useIdleAnimation(intervalMs)
  const anim = ANIM_VARIANTS[animVariant]

  return (
    <motion.div
      style={{ width: size, height: size }}
      animate={isAnimating ? anim : {}}
      onAnimationComplete={isAnimating ? onComplete : undefined}
    >
      <Component {...colors} />
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
            Component={Lion}
            colors={{ primary: '#F59E0B', dark: '#D97706' }}
            intervalMs={30000}
            animVariant="wobble"
            size={96}
          />
        </motion.div>

        {/* 円形に配置した8体 */}
        {CIRCLE_ANIMALS.map(({ id, Component, colors, intervalMs, animVariant }, i) => {
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
                Component={Component}
                colors={colors}
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
