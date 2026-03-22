'use client'

import Image from 'next/image'
import { PIECE_CONFIG } from '@/components/Piece'
import type { PieceType, PromotedPieceType } from '@/lib/shogi/types'

interface MoveDiagramProps {
  pieceType: PieceType | PromotedPieceType
  steps: { dRow: number; dCol: number }[]
  slides: { dRow: number; dCol: number }[]
}

const GRID_SIZE = 5
const CENTER = 2

/**
 * 5×5 ミニ盤面で駒の移動可能方向を図解するコンポーネント
 */
export function MoveDiagram({ pieceType, steps, slides }: MoveDiagramProps) {
  // セルの状態を計算
  const cellStates: ('piece' | 'movable' | null)[][] = Array.from(
    { length: GRID_SIZE },
    () => Array.from({ length: GRID_SIZE }, () => null),
  )

  // 中央に駒
  cellStates[CENTER][CENTER] = 'piece'

  // ステップ（1マス移動）
  for (const { dRow, dCol } of steps) {
    const r = CENTER + dRow
    const c = CENTER + dCol
    if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
      cellStates[r][c] = 'movable'
    }
  }

  // スライド（複数マス移動）
  for (const { dRow, dCol } of slides) {
    for (let i = 1; i < GRID_SIZE; i++) {
      const r = CENTER + dRow * i
      const c = CENTER + dCol * i
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        cellStates[r][c] = 'movable'
      }
    }
  }

  const config = PIECE_CONFIG[pieceType]

  return (
    <div
      className="grid gap-px rounded-sm bg-amber-200 p-px"
      style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)` }}
    >
      {cellStates.flatMap((row, r) =>
        row.map((state, c) => (
          <div
            key={`${r}-${c}`}
            className="relative flex aspect-square items-center justify-center bg-amber-50"
          >
            {state === 'piece' && (
              <div className="relative h-[85%] w-[85%]">
                <Image
                  src={config.imageSrc}
                  alt={config.hiragana}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            )}
            {state === 'movable' && (
              <div className="h-[50%] w-[50%] rounded-full bg-emerald-400/80" />
            )}
          </div>
        )),
      )}
    </div>
  )
}
