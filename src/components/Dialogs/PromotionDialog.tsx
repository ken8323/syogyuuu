'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { PieceType } from '@/lib/shogi/types'

// ============================================================
// 成り設定（駒種 → メッセージ・絵文字）
// ============================================================

interface PromotionConfig {
  message: string
  beforeEmoji: string
  afterEmoji: string
}

const PROMOTION_CONFIG: Partial<Record<PieceType, PromotionConfig>> = {
  pawn:   { message: 'ひよこがニワトリになれるよ！ なる？', beforeEmoji: '🐤', afterEmoji: '🐔' },
  lance:  { message: 'イノシシがパワーアップできるよ！ なる？', beforeEmoji: '🐗', afterEmoji: '🐗✨' },
  knight: { message: 'うさぎがパワーアップできるよ！ なる？', beforeEmoji: '🐰', afterEmoji: '🐰✨' },
  silver: { message: 'オオカミがパワーアップできるよ！ なる？', beforeEmoji: '🐺', afterEmoji: '🐺✨' },
  bishop: { message: 'フクロウがパワーアップできるよ！ なる？', beforeEmoji: '🦉', afterEmoji: '🦉✨' },
  rook:   { message: 'たかがパワーアップできるよ！ なる？',   beforeEmoji: '🦅', afterEmoji: '🦅✨' },
}

// ============================================================
// Props
// ============================================================

interface PromotionDialogProps {
  isOpen: boolean
  pieceType: PieceType | null
  onPromote: (doPromote: boolean) => void
}

// ============================================================
// コンポーネント
// ============================================================

export function PromotionDialog({ isOpen, pieceType, onPromote }: PromotionDialogProps) {
  const config = pieceType ? PROMOTION_CONFIG[pieceType] : null

  return (
    <AnimatePresence>
      {isOpen && config && (
        <>
          {/* 半透明オーバーレイ（タップしても閉じない） */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* ダイアログ */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <div className="w-full max-w-sm rounded-3xl bg-white px-8 py-8 shadow-2xl">
              {/* 変身アニメーション表示 */}
              <div className="mb-6 flex items-center justify-center gap-4 text-5xl">
                <span>{config.beforeEmoji}</span>
                <span className="text-2xl text-amber-500">→</span>
                <span>{config.afterEmoji}</span>
              </div>

              {/* メッセージ */}
              <p className="mb-8 text-center text-lg font-bold text-stone-800">
                {config.message}
              </p>

              {/* ボタン */}
              <div className="flex flex-col gap-3">
                <button
                  className="min-h-[56px] w-full rounded-2xl bg-amber-500 text-xl font-black text-white shadow-md active:scale-95"
                  onClick={() => onPromote(true)}
                >
                  なる！🌟
                </button>
                <button
                  className="min-h-[48px] w-full rounded-2xl bg-stone-200 text-base font-bold text-stone-600 active:scale-95"
                  onClick={() => onPromote(false)}
                >
                  ならない
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
