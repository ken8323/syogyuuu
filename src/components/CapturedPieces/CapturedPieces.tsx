'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import type { CapturedPieces as CapturedPiecesType, PieceType, Player } from '@/lib/shogi/types'
import { PIECE_CONFIG } from '@/components/Piece'

// 表示順（金/銀/桂/香/飛/角/歩）
const PIECE_ORDER: PieceType[] = ['gold', 'silver', 'knight', 'lance', 'rook', 'bishop', 'pawn']

interface CapturedPiecesProps {
  capturedPieces: CapturedPiecesType
  /** このエリアの所有プレイヤー */
  owner: Player
  /** 現在選択中の持ち駒の種類 */
  selectedCaptured: PieceType | null
  /** このエリアのプレイヤーが手番か */
  isOwnerTurn: boolean
  /** 持ち駒タップ時のハンドラ */
  onSelect: (pieceType: PieceType) => void
}

export function CapturedPieces({
  capturedPieces,
  owner,
  selectedCaptured,
  isOwnerTurn,
  onSelect,
}: CapturedPiecesProps) {
  const pieces = capturedPieces[owner]
  const isSente = owner === 'sente'

  return (
    <div className="flex h-full w-full items-center justify-around px-1">
      {PIECE_ORDER.map((pieceType) => {
        const count = pieces[pieceType] ?? 0
        const hasCount = count > 0
        const isSelected = isOwnerTurn && selectedCaptured === pieceType
        const isClickable = isOwnerTurn && hasCount
        const { imageSrc, hiragana } = PIECE_CONFIG[pieceType]

        return (
          <motion.div
            key={pieceType}
            className="relative flex h-full max-h-[52px] flex-1 cursor-pointer items-center justify-center"
            animate={{ scale: isSelected ? 1.12 : 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            onClick={() => isClickable && onSelect(pieceType)}
          >
            <div
              className={[
                'flex h-full w-full flex-col items-center justify-center rounded-sm transition-opacity',
                // 色分け（先手=青系、後手=赤系）
                isSente ? 'ring-1 ring-[#7A9CB8]' : 'ring-1 ring-[#B87A7A]',
                // 選択中: 金色ハイライト
                isSelected ? 'ring-2 ring-yellow-400 bg-yellow-50' : '',
                // 0枚: グレーアウト
                !hasCount ? 'opacity-30' : '',
                isClickable ? 'hover:brightness-95' : 'cursor-not-allowed',
              ]
                .filter(Boolean)
                .join(' ')}
              style={{ backgroundColor: isSelected ? undefined : (isSente ? '#C8D8E4' : '#E4C8C8') }}
            >
              <div
                className="flex h-full w-full flex-col items-center justify-center"
                style={isSente ? undefined : { transform: 'rotate(180deg)' }}
              >
                <div className="relative w-full flex-1 min-h-0 p-0.5">
                  <Image src={imageSrc} alt={hiragana} fill style={{ objectFit: 'contain' }} />
                </div>
                <span className={`text-[8px] font-bold leading-none pb-0.5 ${isSente ? 'text-[#2C4A5E]' : 'text-[#5E2C2C]'}`}>
                  {hiragana}
                </span>
              </div>
            </div>

            {/* 枚数バッジ（後手は180度回転＋位置反転） */}
            {hasCount && (
              <span
                className={`absolute flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[9px] font-bold text-white ${
                  isSente ? '-right-0.5 -top-0.5' : '-bottom-0.5 -left-0.5'
                }`}
                style={isSente ? undefined : { transform: 'rotate(180deg)' }}
              >
                {count}
              </span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}
