'use client'

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

        return (
          <div
            key={pieceType}
            className="relative flex h-full max-h-[52px] flex-1 cursor-pointer items-center justify-center"
            onClick={() => isClickable && onSelect(pieceType)}
          >
            <div
              className={[
                'flex h-full w-full flex-col items-center justify-center rounded-sm transition-opacity',
                // 色分け（先手=青系、後手=赤系）
                isSente ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-red-50 ring-1 ring-red-200',
                // 選択中: 金色ハイライト
                isSelected ? 'ring-2 ring-yellow-400 bg-yellow-50' : '',
                // 0枚: グレーアウト
                !hasCount ? 'opacity-30' : '',
                isClickable ? 'hover:brightness-95' : 'cursor-default',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <span className="text-base leading-none">{PIECE_CONFIG[pieceType].emoji}</span>
              <span className={`text-[8px] font-bold leading-none ${isSente ? 'text-blue-900' : 'text-red-900'}`}>
                {PIECE_CONFIG[pieceType].hiragana}
              </span>
            </div>

            {/* 枚数バッジ */}
            {hasCount && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-700 text-[9px] font-bold text-white">
                {count}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
