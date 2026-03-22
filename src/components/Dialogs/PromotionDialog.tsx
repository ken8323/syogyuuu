'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import type { PieceType, Player, PromotedPieceType } from '@/lib/shogi/types'
import { AnimatedButton } from '@/components/ui/AnimatedButton'
import { PIECE_CONFIG } from '@/components/Piece'

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

  const beforeImageSrc = pieceType ? PIECE_CONFIG[pieceType].imageSrc : null
  const afterImageSrc = config ? PIECE_CONFIG[config.promotedType].imageSrc : null
  const beforeHiragana = pieceType ? PIECE_CONFIG[pieceType].hiragana : ''
  const afterHiragana = config ? PIECE_CONFIG[config.promotedType].hiragana : ''

  const ringClass = owner === 'sente' ? 'ring-blue-300' : 'ring-red-300'
  const isGote = owner === 'gote'

  return (
    <AnimatePresence>
      {isOpen && config && beforeImageSrc && afterImageSrc && (
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
              {/* 変身アニメーション表示 + メッセージ（後手は180度回転） */}
              <div style={isGote ? { transform: 'rotate(180deg)' } : undefined}>
                <div className="mb-6 flex items-center justify-center gap-4">
                  <div className={`relative h-16 w-16 rounded-lg ring-2 ${ringClass}`}>
                    <Image src={beforeImageSrc} alt={beforeHiragana} fill style={{ objectFit: 'contain' }} />
                  </div>
                  <span className="text-2xl text-amber-500">→</span>
                  <div className={`relative h-16 w-16 rounded-lg ring-2 ring-amber-400`}>
                    <Image src={afterImageSrc} alt={afterHiragana} fill style={{ objectFit: 'contain' }} />
                  </div>
                </div>

                {/* メッセージ */}
                <p className="mb-8 text-center text-lg font-bold text-stone-800">
                  {config.message}
                </p>
              </div>

              {/* ボタン（回転しない） */}
              <div className="flex flex-col gap-3">
                <AnimatedButton
                  className="min-h-[56px] w-full rounded-2xl bg-blue-500 text-xl font-black text-white shadow-md hover:bg-blue-600"
                  onClick={() => onPromote(true)}
                >
                  なる！🌟
                </AnimatedButton>
                <AnimatedButton
                  className="min-h-[48px] w-full rounded-2xl bg-stone-200 text-base font-bold text-stone-700 hover:bg-stone-300"
                  onClick={() => onPromote(false)}
                >
                  ならない
                </AnimatedButton>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
