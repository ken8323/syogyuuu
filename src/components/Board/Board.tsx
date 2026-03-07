'use client'

import type { Board as BoardType, Move, Piece, Player, Position } from '@/lib/shogi/types'
import { Square } from './Square'

// ============================================================
// 定数
// ============================================================

const DAN_LABELS = ['一', '二', '三', '四', '五', '六', '七', '八', '九']

/** #10 で Piece コンポーネントに置き換えるまでの暫定ラベル */
const PIECE_LABEL: Record<string, string> = {
  king: '王',
  rook: '飛',
  bishop: '角',
  gold: '金',
  silver: '銀',
  knight: '桂',
  lance: '香',
  pawn: '歩',
  promoted_rook: '竜',
  promoted_bishop: '馬',
  promoted_silver: '全',
  promoted_knight: '圭',
  promoted_lance: '杏',
  promoted_pawn: 'と',
}

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
                {piece && <PiecePlaceholder piece={piece} currentPlayer={currentPlayer} />}
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

// ============================================================
// 暫定駒表示（#10 の Piece コンポーネントに置き換え予定）
// ============================================================

function PiecePlaceholder({
  piece,
  currentPlayer,
}: {
  piece: Piece
  currentPlayer: Player
}) {
  const isOpponent = piece.owner !== currentPlayer
  return (
    <span
      className={[
        'text-[0.65rem] font-bold leading-none',
        isOpponent ? 'rotate-180' : '',
        piece.owner === 'sente' ? 'text-blue-900' : 'text-red-900',
      ].join(' ')}
    >
      {PIECE_LABEL[piece.type] ?? piece.type}
    </span>
  )
}
