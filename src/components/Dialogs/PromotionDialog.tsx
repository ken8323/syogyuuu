'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { PieceType, Player, PromotedPieceType } from '@/lib/shogi/types'
import { PIECE_CONFIG } from '@/components/Piece'
import type { AnimalColors } from '@/components/Piece/animals'

// ============================================================
// 成り設定（駒種 → メッセージ・成駒の種類）
// ============================================================

interface PromotionConfig {
  message: string
  promotedType: PromotedPieceType
}

const PROMOTION_CONFIG: Partial<Record<PieceType, PromotionConfig>> = {
  pawn:   { message: 'ひよこがニワトリになれるよ！ なる？', promotedType: 'promoted_pawn'   },
  lance:  { message: 'イノシシがパワーアップできるよ！ なる？', promotedType: 'promoted_lance'  },
  knight: { message: 'うさぎがパワーアップできるよ！ なる？', promotedType: 'promoted_knight' },
  silver: { message: 'オオカミがパワーアップできるよ！ なる？', promotedType: 'promoted_silver' },
  bishop: { message: 'フクロウがパワーアップできるよ！ なる？', promotedType: 'promoted_bishop' },
  rook:   { message: 'たかがパワーアップできるよ！ なる？',   promotedType: 'promoted_rook'   },
}

const SENTE_COLORS: AnimalColors = { primary: '#3B82F6', dark: '#1E40AF' }
const GOTE_COLORS: AnimalColors = { primary: '#EF4444', dark: '#991B1B' }

// ============================================================
// Props
// ============================================================

interface PromotionDialogProps {
  isOpen: boolean
  pieceType: PieceType | null
  /** 成りを行うプレイヤー（駒の色を決定） */
  owner: Player
  onPromote: (doPromote: boolean) => void
}

// ============================================================
// コンポーネント
// ============================================================

export function PromotionDialog({ isOpen, pieceType, owner, onPromote }: PromotionDialogProps) {
  const config = pieceType ? PROMOTION_CONFIG[pieceType] : null
  const colors = owner === 'sente' ? SENTE_COLORS : GOTE_COLORS

  const BeforeAnimal = pieceType ? PIECE_CONFIG[pieceType].AnimalComponent : null
  const AfterAnimal = config ? PIECE_CONFIG[config.promotedType].AnimalComponent : null

  return (
    <AnimatePresence>
      {isOpen && config && BeforeAnimal && AfterAnimal && (
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
            <div className="w-full max-w-sm rounded-3xl bg-white px-4 py-6 shadow-2xl sm:px-8 sm:py-8">
              {/* 変身アニメーション表示 */}
              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="h-16 w-16">
                  <BeforeAnimal {...colors} isPromoted={false} />
                </div>
                <span className="text-2xl text-amber-500">→</span>
                <div className="h-16 w-16">
                  <AfterAnimal {...colors} isPromoted={true} />
                </div>
              </div>

              {/* メッセージ */}
              <p className="mb-8 text-center text-lg font-bold text-stone-800">
                {config.message}
              </p>

              {/* ボタン */}
              <div className="flex flex-col gap-3">
                <button
                  className="min-h-[56px] w-full rounded-2xl bg-blue-500 text-xl font-black text-white shadow-md hover:bg-blue-600 active:scale-95"
                  onClick={() => onPromote(true)}
                >
                  なる！🌟
                </button>
                <button
                  className="min-h-[48px] w-full rounded-2xl bg-stone-200 text-base font-bold text-stone-700 hover:bg-stone-300 active:scale-95"
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
