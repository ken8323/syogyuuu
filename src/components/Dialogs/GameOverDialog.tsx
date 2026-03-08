'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { Player } from '@/lib/shogi/types'

interface GameOverDialogProps {
  isOpen: boolean
  winner: Player | null
  gameOverReason: 'checkmate' | 'resign' | null
  onRematch: () => void
  onQuit: () => void
}

const CONFETTI_COLORS = ['#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#8b5cf6', '#f97316']

const WINNER_LABELS: Record<Player, { team: string; color: string }> = {
  sente: { team: 'あおチーム', color: 'text-blue-600' },
  gote:  { team: 'あかチーム', color: 'text-red-600' },
}

export function GameOverDialog({ isOpen, winner, gameOverReason, onRematch, onQuit }: GameOverDialogProps) {
  const winnerInfo = winner ? WINNER_LABELS[winner] : null
  const headline = gameOverReason === 'resign' ? 'まいった！' : 'つみ！'

  return (
    <AnimatePresence>
      {isOpen && winnerInfo && (
        <>
          {/* オーバーレイ */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* 紙吹雪 */}
          <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
            {CONFETTI_COLORS.flatMap((color, ci) =>
              Array.from({ length: 4 }, (_, i) => {
                const key = ci * 4 + i
                // 素数を使って均等に分散させた横位置（0〜99%）
                const left = `${((key * 37 + 11) % 100)}%`
                // 紙吹雪が一斉に落ちないよう時間差をつける（0〜1.19秒）
                const delay = (key * 0.13) % 1.2
                // 落下速度を少しランダムに変化させる（1.8〜3.0秒）
                const duration = 1.8 + (key % 5) * 0.3
                return (
                  <motion.div
                    key={key}
                    className="absolute top-0 h-3 w-2 rounded-sm"
                    style={{ left, backgroundColor: color }}
                    initial={{ y: -20, opacity: 1, rotate: 0 }}
                    animate={{ y: '100vh', opacity: 0, rotate: 360 * 3 }}
                    transition={{ duration, delay, ease: 'easeIn' }}
                  />
                )
              })
            )}
          </div>

          {/* ダイアログ */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white px-8 py-8 text-center shadow-2xl">
              {/* 見出し */}
              <p className="text-4xl font-black text-amber-500">{headline}</p>
              <p className="mt-2 text-2xl font-bold">
                <span className={winnerInfo.color}>{winnerInfo.team}</span>
                <span className="text-gray-800">のかち！</span>
              </p>

              {/* ボタン */}
              <div className="mt-8 flex flex-col gap-3">
                <button
                  className="rounded-2xl bg-amber-500 py-4 text-lg font-bold text-white shadow hover:bg-amber-600 active:scale-95"
                  onClick={onRematch}
                >
                  もういっかい あそぶ！
                </button>
                <button
                  className="rounded-2xl bg-gray-200 py-3 text-base font-semibold text-gray-600 hover:bg-gray-300 active:scale-95"
                  onClick={onQuit}
                >
                  おわる
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
