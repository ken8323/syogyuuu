'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import type { AnimatingMoveInfo, Board as BoardType, Move, Player, Position, PromotingInfo } from '@/lib/shogi/types'
import { Square } from './Square'
import { Piece } from '@/components/Piece'
import { MoveArrows } from './MoveArrows'
import { AnimatingPiece } from './AnimatingPiece'
import { PromotionEffect } from '@/components/Piece/PromotionEffect'

// ============================================================
// 定数
// ============================================================

const DAN_LABELS = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 表示座標 → 内部座標
 * 盤面は常に先手視点で固定（向かい合って1台で遊ぶため回転しない）
 */
function toInternalPos(displayRow: number, displayCol: number): Position {
  return { row: displayRow, col: displayCol }
}

/** 表示列インデックス → 筋ラベル（9〜1 固定） */
function colLabel(displayCol: number): number {
  return 9 - displayCol
}

/** 表示行インデックス → 段ラベル（一〜九 固定） */
function rowLabel(displayRow: number): string {
  return DAN_LABELS[displayRow]
}

// ============================================================
// 型定義
// ============================================================

interface BoardProps {
  board: BoardType
  currentPlayer: Player
  selectedPosition: Position | null
  legalMoves: Position[]
  lastMove: Move | null
  onSquareClick: (pos: Position) => void
  animatingMove: AnimatingMoveInfo | null
  onAnimationComplete: () => void
  promotingInfo: PromotingInfo | null
  onPromotionComplete: () => void
}

// ============================================================
// Board コンポーネント
// ============================================================

export function Board({
  board,
  currentPlayer,
  selectedPosition,
  legalMoves,
  lastMove,
  onSquareClick,
  animatingMove,
  onAnimationComplete,
  promotingInfo,
  onPromotionComplete,
}: BoardProps) {
  const gridRef = useRef<HTMLDivElement>(null)
  const [squareSize, setSquareSize] = useState<{ w: number; h: number } | null>(null)

  useLayoutEffect(() => {
    if (!gridRef.current) return
    const { width, height } = gridRef.current.getBoundingClientRect()
    setSquareSize({ w: width / 9, h: height / 9 })
  }, [gridRef])

  // Set に変換しておくことでO(1)ルックアップを実現
  const legalMoveSet = new Set(legalMoves.map((p) => `${p.row},${p.col}`))

  const lastMoveFrom = lastMove?.type === 'move' ? lastMove.from : null
  const lastMoveTo = lastMove?.to ?? null

  return (
    <div className="inline-flex flex-col select-none">
      {/* 筋ラベル（9〜1 または 1〜9） */}
      <div className="flex pr-6">
        {Array.from({ length: 9 }, (_, displayCol) => (
          <div
            key={displayCol}
            className="flex-1 text-center text-xs font-medium text-amber-900"
          >
            {colLabel(displayCol)}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* 9x9 盤面グリッド */}
        <div className="relative flex-1">
          <div ref={gridRef} className="grid grid-cols-9 border-l-2 border-t-2 border-amber-900">
            {Array.from({ length: 81 }, (_, i) => {
              const displayRow = Math.floor(i / 9)
              const displayCol = i % 9
              const internalPos = toInternalPos(displayRow, displayCol)
              const posKey = `${internalPos.row},${internalPos.col}`

              const piece = board[internalPos.row][internalPos.col]
              const isSelected =
                selectedPosition?.row === internalPos.row &&
                selectedPosition?.col === internalPos.col
              const isLegalMove = legalMoveSet.has(posKey)
              const isCapturable =
                isLegalMove && piece !== null && piece.owner !== currentPlayer
              const isLastMoveFrom =
                lastMoveFrom?.row === internalPos.row &&
                lastMoveFrom?.col === internalPos.col
              const isLastMoveTo =
                lastMoveTo?.row === internalPos.row &&
                lastMoveTo?.col === internalPos.col

              // アニメーション中は移動先マスの駒を非表示（AnimatingPiece が代わりに表示）
              const isAnimatingTarget =
                animatingMove !== null &&
                animatingMove.to.row === internalPos.row &&
                animatingMove.to.col === internalPos.col

              return (
                <Square
                  key={posKey}
                  isSelected={isSelected}
                  isLegalMove={isLegalMove}
                  isCapturable={isCapturable}
                  isLastMoveFrom={isLastMoveFrom}
                  isLastMoveTo={isLastMoveTo}
                  onClick={() => onSquareClick(internalPos)}
                >
                  {piece && !isAnimatingTarget && (
                    <div className="absolute inset-[3px]">
                      <Piece
                        piece={piece}
                        isSelected={isSelected}
                        isOpponent={piece.owner === 'gote'}
                      />
                    </div>
                  )}
                  {isSelected && piece && <MoveArrows piece={piece} />}
                </Square>
              )
            })}
          </div>

          {/* 移動アニメーション overlay */}
          {animatingMove && (
            <AnimatingPiece
              animatingMove={animatingMove}
              gridRef={gridRef}
              onComplete={onAnimationComplete}
            />
          )}

          {/* 成りアニメーション overlay */}
          {promotingInfo && squareSize && (
            <PromotionEffect
              position={promotingInfo.position}
              squareSize={squareSize}
              isForcedPromote={promotingInfo.isForcedPromote}
              onComplete={onPromotionComplete}
            />
          )}
        </div>

        {/* 段ラベル（一〜九 または 九〜一） */}
        <div className="flex w-6 flex-col border-t-2 border-amber-900">
          {Array.from({ length: 9 }, (_, displayRow) => (
            <div
              key={displayRow}
              className="flex flex-1 items-center justify-center text-xs font-medium text-amber-900"
            >
              {rowLabel(displayRow)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

