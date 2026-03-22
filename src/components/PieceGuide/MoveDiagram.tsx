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
  const cellStates: ('piece' | 'step' | 'slide' | null)[][] = Array.from(
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
      cellStates[r][c] = 'step'
    }
  }

  // スライド（複数マス移動）
  for (const { dRow, dCol } of slides) {
    for (let i = 1; i < GRID_SIZE; i++) {
      const r = CENTER + dRow * i
      const c = CENTER + dCol * i
      if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
        cellStates[r][c] = 'slide'
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
            {state === 'step' && (
              <div className="h-[50%] w-[50%] rounded-full bg-emerald-400/80" />
            )}
            {state === 'slide' && (
              <div className="flex items-center justify-center">
                <div className="h-[50%] w-[50%] rounded-full bg-emerald-400/80" />
                {/* 端のマスに三角マーカーを表示（「どこまでも進める」の視覚表現） */}
                {isEdgeSlide(r, c, slides) && (
                  <div
                    className="absolute text-emerald-500 text-[8px] font-bold"
                    style={getArrowPosition(r, c)}
                  >
                    ▶
                  </div>
                )}
              </div>
            )}
          </div>
        )),
      )}
    </div>
  )
}

/** スライド方向の端のマスかどうかを判定 */
function isEdgeSlide(
  r: number,
  c: number,
  slides: { dRow: number; dCol: number }[],
): boolean {
  for (const { dRow, dCol } of slides) {
    // この方向の最も遠いマスかチェック
    const nextR = r + dRow
    const nextC = c + dCol
    if (nextR < 0 || nextR >= GRID_SIZE || nextC < 0 || nextC >= GRID_SIZE) {
      // 次のマスが盤外 = このマスが端
      // かつ、中央からこの方向に辿ったマスであることを確認
      const stepsFromCenter = Math.max(Math.abs(r - CENTER), Math.abs(c - CENTER))
      if (stepsFromCenter > 0) {
        const expectedR = CENTER + dRow * stepsFromCenter
        const expectedC = CENTER + dCol * stepsFromCenter
        if (expectedR === r && expectedC === c) return true
      }
    }
  }
  return false
}

/** 端マスの矢印位置（方向に応じて配置） */
function getArrowPosition(r: number, c: number): React.CSSProperties {
  const dRow = r - CENTER
  const dCol = c - CENTER
  // 方向に応じた角度
  const angle = Math.atan2(dCol, dRow) * (180 / Math.PI) - 90
  return {
    transform: `rotate(${angle}deg)`,
  }
}
