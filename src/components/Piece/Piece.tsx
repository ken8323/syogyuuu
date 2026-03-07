'use client'

import { motion } from 'framer-motion'
import type { Piece as PieceType } from '@/lib/shogi/types'
import { PIECE_CONFIG, isPromotedType } from './pieceConfig'

interface PieceProps {
  piece: PieceType
  /** 選択中: 光彩 + バウンスアニメーション */
  isSelected?: boolean
  /** 相手の駒: 180度回転表示 */
  isOpponent?: boolean
}

export function Piece({ piece, isSelected = false, isOpponent = false }: PieceProps) {
  const config = PIECE_CONFIG[piece.type]
  const promoted = isPromotedType(piece.type)
  const isSente = piece.owner === 'sente'

  // 成駒: 金色枠 / 通常: 先後の色枠
  const ringClass = promoted
    ? 'ring-2 ring-yellow-400'
    : isSente
      ? 'ring-1 ring-blue-300'
      : 'ring-1 ring-red-300'

  // 先手=青系、後手=赤系
  const colorClass = isSente
    ? 'bg-blue-50 text-blue-900'
    : 'bg-red-50 text-red-900'

  return (
    <motion.div
      className={`flex h-full w-full flex-col items-center justify-center rounded-sm ${ringClass} ${colorClass}`}
      style={{
        // 後手の駒は上下反転（盤面座標変換と連動）
        rotate: isOpponent ? 180 : 0,
        // 選択中: 金色の光彩
        filter: isSelected ? 'drop-shadow(0 0 5px rgba(251,191,36,0.95))' : 'none',
      }}
      // 選択中: 上下バウンスアニメーション
      animate={{ y: isSelected ? [0, -4, 0] : 0 }}
      transition={
        isSelected
          ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
          : { duration: 0.15 }
      }
    >
      <span className="text-base leading-none">{config.emoji}</span>
      <span className="text-[9px] font-bold leading-none">{config.hiragana}</span>
    </motion.div>
  )
}
