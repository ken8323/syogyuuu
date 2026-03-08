'use client'

import { motion } from 'framer-motion'

interface TitleScreenProps {
  hasSavedGame: boolean
  onStartNew: () => void
  onResume: () => void
}

// キービジュアル用の動物絵文字（#20 で SVG に置き換え予定）
const ANIMAL_EMOJIS = ['🦁', '🦅', '🦉', '🐘', '🐺', '🐰', '🐗', '🐤', '🐔']

export function TitleScreen({ hasSavedGame, onStartNew, onResume }: TitleScreenProps) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 bg-amber-50 p-8">
      {/* キービジュアル */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 text-5xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {ANIMAL_EMOJIS.map((emoji, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 300 }}
          >
            {emoji}
          </motion.span>
        ))}
      </motion.div>

      {/* タイトルロゴ */}
      <motion.h1
        className="text-5xl font-black text-amber-800 drop-shadow-sm"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
      >
        しょうぎゅー！
      </motion.h1>

      {/* ボタン */}
      <motion.div
        className="flex flex-col gap-4 w-64"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <button
          className="rounded-2xl bg-amber-500 py-5 text-xl font-bold text-white shadow-lg hover:bg-amber-600 active:scale-95 transition-transform"
          onClick={onStartNew}
        >
          あそぶ！
        </button>

        {hasSavedGame && (
          <button
            className="rounded-2xl bg-white border-2 border-amber-400 py-4 text-lg font-semibold text-amber-700 shadow hover:bg-amber-50 active:scale-95 transition-transform"
            onClick={onResume}
          >
            つづきから
          </button>
        )}
      </motion.div>
    </main>
  )
}
