'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { SeasonalBackground } from '@/components/Background'
import type { HandicapLevel } from '@/lib/shogi/types'

interface HandicapSelectScreenProps {
  onSelect: (level: HandicapLevel) => void
  onBack: () => void
}

interface HandicapOption {
  level: HandicapLevel
  label: string
  description: string
  removedPieces: { src: string; name: string }[]
  color: string
}

const OPTIONS: HandicapOption[] = [
  {
    level: 'none',
    label: 'ハンデなし',
    description: 'おたがいおなじじょうけん！',
    removedPieces: [],
    color: 'bg-amber-500',
  },
  {
    level: 'light',
    label: 'ちょっとハンデ',
    description: '赤チームは わし がいないよ',
    removedPieces: [{ src: '/icons/washi.webp', name: 'わし（ひしゃ）' }],
    color: 'bg-green-500',
  },
  {
    level: 'medium',
    label: 'ふつうのハンデ',
    description: '赤チームは わし と ふくろう がいないよ',
    removedPieces: [
      { src: '/icons/washi.webp', name: 'わし（ひしゃ）' },
      { src: '/icons/fukuro.webp', name: 'ふくろう（かく）' },
    ],
    color: 'bg-blue-500',
  },
  {
    level: 'heavy',
    label: 'おおきいハンデ',
    description: '赤チームは わし・ふくろう・いのしし×2 がいないよ',
    removedPieces: [
      { src: '/icons/washi.webp', name: 'わし（ひしゃ）' },
      { src: '/icons/fukuro.webp', name: 'ふくろう（かく）' },
      { src: '/icons/inoshishi.webp', name: 'いのしし（きょう）' },
      { src: '/icons/inoshishi.webp', name: 'いのしし（きょう）' },
    ],
    color: 'bg-purple-500',
  },
]

export function HandicapSelectScreen({ onSelect, onBack }: HandicapSelectScreenProps) {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center gap-6 overflow-hidden p-4 sm:p-8"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #fffbeb 0%, #fef3c7 40%, #fde68a 100%)',
      }}
    >
      <SeasonalBackground />

      {/* タイトル */}
      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <p className="text-sm font-semibold text-amber-700">赤チームに</p>
        <h1 className="text-2xl font-black text-amber-900 sm:text-3xl">ハンデをつける？</h1>
      </motion.div>

      {/* 選択肢 */}
      <motion.div
        className="flex w-full max-w-sm flex-col gap-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {OPTIONS.map((opt, i) => (
          <motion.div
            key={opt.level}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.07 }}
          >
            <AnimatedButton
              className={`w-full rounded-2xl ${opt.color} px-5 py-4 text-left text-white shadow-md`}
              onClick={() => onSelect(opt.level)}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-base font-bold">{opt.label}</p>
                  <p className="text-xs font-medium opacity-90">{opt.description}</p>
                </div>
                {/* 取り除かれる駒のアイコン */}
                {opt.removedPieces.length > 0 && (
                  <div className="flex shrink-0 gap-1">
                    {opt.removedPieces.map((p, j) => (
                      <div
                        key={j}
                        className="relative h-9 w-9 rounded-full bg-white/30 p-0.5"
                      >
                        <Image
                          src={p.src}
                          alt={p.name}
                          width={36}
                          height={36}
                          className="h-full w-full object-contain opacity-40"
                          style={{ filter: 'grayscale(100%)' }}
                        />
                        {/* ✕ マーク */}
                        <span className="absolute inset-0 flex items-center justify-center text-lg font-black text-red-200">
                          ✕
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </AnimatedButton>
          </motion.div>
        ))}
      </motion.div>

      {/* もどるボタン */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <AnimatedButton
          className="rounded-xl border-2 border-amber-300 bg-amber-50 px-6 py-2 text-sm font-semibold text-amber-600 shadow-sm"
          onClick={onBack}
        >
          ← もどる
        </AnimatedButton>
      </motion.div>
    </main>
  )
}
