'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PieceType } from '@/lib/shogi/types'

// 強制成りが発生しうるのは歩・香・桂のみ（行き所のない駒ルール）
// 銀・角・飛は任意成りのみのため、このマップに含まれない
const FORCED_PROMOTION_MESSAGES: Partial<Record<PieceType, string>> = {
  pawn:   'ひよこがニワトリになったよ！🐔',
  lance:  'イノシシがパワーアップしたよ！🐗✨',
  knight: 'うさぎがパワーアップしたよ！🐰✨',
}

interface ForcedPromotionToastProps {
  /** トースト表示中の駒種。null = 非表示 */
  pieceType: PieceType | null
  onDismiss: () => void
}

export function ForcedPromotionToast({ pieceType, onDismiss }: ForcedPromotionToastProps) {
  // 0.8秒後に自動で閉じる
  useEffect(() => {
    if (!pieceType) return
    const timer = setTimeout(onDismiss, 800)
    return () => clearTimeout(timer)
  }, [pieceType, onDismiss])

  const message = pieceType ? FORCED_PROMOTION_MESSAGES[pieceType] : null

  return (
    <AnimatePresence>
      {pieceType && message && (
        <motion.div
          className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-2xl bg-amber-500 px-6 py-3 text-base font-bold text-white shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.25 }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
