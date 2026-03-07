'use client'

import type { Board as BoardType, Move, Player, Position } from '@/lib/shogi/types'
import { Square } from './Square'
import { Piece } from '@/components/Piece'

// ============================================================
// 定数
// ============================================================

const DAN_LABELS = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

// ============================================================
// ヘルパー関数
// ============================================================

/**
 * 表示座標 → 内部座標
 * - 先手: そのまま
 * - 後手: row / col を反転（盤面が180度回転した視点）
 */
function toInternalPos(displayRow: number, displayCol: number, currentPlayer: Player): Position {
  if (currentPlayer === 'sente') return { row: displayRow, col: displayCol }
  return { row: 8 - displayRow, col: 8 - displayCol }
}

/** 表示列インデックス → 筋ラベル（数字） */
function colLabel(displayCol: number, currentPlayer: Player): number {
  return currentPlayer === 'sente' ? 9 - displayCol : displayCol + 1
}

/** 表示行インデックス → 段ラベル（漢字） */
function rowLabel(displayRow: number, currentPlayer: Player): string {
  return currentPlayer === 'sente' ? DAN_LABELS[displayRow] : DAN_LABELS[8 - displayRow]
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
}: BoardProps) {
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
            {colLabel(displayCol, currentPlayer)}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* 9x9 盤面グリッド */}
        <div className="grid flex-1 grid-cols-9 border-l-2 border-t-2 border-amber-900">
          {Array.from({ length: 81 }, (_, i) => {
            const displayRow = Math.floor(i / 9)
            const displayCol = i % 9
            const internalPos = toInternalPos(displayRow, displayCol, currentPlayer)
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
                {piece && (
                  <Piece
                    piece={piece}
                    isSelected={isSelected}
                    isOpponent={piece.owner !== currentPlayer}
                  />
                )}
              </Square>
            )
          })}
        </div>

        {/* 段ラベル（一〜九 または 九〜一） */}
        <div className="flex w-6 flex-col border-t-2 border-amber-900">
          {Array.from({ length: 9 }, (_, displayRow) => (
            <div
              key={displayRow}
              className="flex flex-1 items-center justify-center text-xs font-medium text-amber-900"
            >
              {rowLabel(displayRow, currentPlayer)}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

