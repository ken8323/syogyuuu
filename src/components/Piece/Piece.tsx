'use client'

import { motion } from 'framer-motion'
import type { Piece as PieceType } from '@/lib/shogi/types'
import type { AnimalColors } from './animals'
import { PIECE_CONFIG, isPromotedType } from './pieceConfig'

// 先手: 青系 / 後手: 赤系
const SENTE_COLORS: AnimalColors = { primary: '#3B82F6', dark: '#1E40AF' }
const GOTE_COLORS: AnimalColors = { primary: '#EF4444', dark: '#991B1B' }

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
  const colors = isSente ? SENTE_COLORS : GOTE_COLORS

  const { AnimalComponent, hiragana } = config

  // 成駒: 金色枠 / 通常: 先後の色枠
  const ringClass = promoted
    ? 'ring-2 ring-yellow-400'
    : isSente
      ? 'ring-1 ring-blue-300'
      : 'ring-1 ring-red-300'

  // 背景色
  const bgClass = isSente ? 'bg-blue-50' : 'bg-red-50'

  return (
    <motion.div
      className={`flex h-full w-full flex-col items-center justify-center rounded-sm ${ringClass} ${bgClass}`}
      style={{
        // 後手の駒は上下反転
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
      <div className="w-full flex-1 min-h-0 p-0.5">
        <AnimalComponent {...colors} isPromoted={promoted} />
      </div>
      <span className={`text-[8px] font-bold leading-none pb-0.5 ${isSente ? 'text-blue-900' : 'text-red-900'}`}>
        {hiragana}
      </span>
    </motion.div>
  )
}
