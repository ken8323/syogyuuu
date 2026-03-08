'use client'

import { motion } from 'framer-motion'
import type { Piece as PieceType } from '@/lib/shogi/types'
import type { AnimalColors } from './animals'
import { PIECE_CONFIG, isPromotedType } from './pieceConfig'

// 先手: 青系 / 後手: 赤系
const SENTE_COLORS: AnimalColors = { primary: '#3B82F6', dark: '#1E40AF' }
const GOTE_COLORS: AnimalColors = { primary: '#EF4444', dark: '#991B1B' }

// 将棋駒の五角形（上部が尖った形）
const PIECE_CLIP_PATH = 'polygon(50% 0%, 100% 22%, 100% 100%, 0% 100%, 0% 22%)'

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

  // 背景色
  const bgClass = isSente ? 'bg-blue-50' : 'bg-red-50'

  // clip-path 使用時は ring が効かないため drop-shadow で枠線を表現
  const borderShadow = promoted
    ? 'drop-shadow(0 0 2px #F59E0B) drop-shadow(0 0 2px #F59E0B)'
    : isSente
      ? 'drop-shadow(0 0 1.5px #93C5FD)'
      : 'drop-shadow(0 0 1.5px #FCA5A5)'

  const filterStyle = isSelected
    ? `${borderShadow} drop-shadow(0 0 6px rgba(251,191,36,0.95))`
    : borderShadow

  return (
    <motion.div
      className={`flex h-full w-full flex-col items-center justify-center ${bgClass}`}
      style={{
        clipPath: PIECE_CLIP_PATH,
        rotate: isOpponent ? 180 : 0,
        filter: filterStyle,
      }}
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
