'use client'

import { useRef, useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
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

/** チェビシェフ距離ベースのポップイン遅延（ms）を返す */
function legalMoveInDelay(from: Position | null, to: Position): number {
  if (!from) return 0
  const dist = Math.max(Math.abs(to.row - from.row), Math.abs(to.col - from.col))
  return dist * 40
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
  hintPieces: Position[]
  hintMoves: Position[]
  /** 現在の手番プレイヤーが王手されているか */
  isCheck: boolean
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
  hintPieces,
  hintMoves,
  isCheck,
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

  // 王手中の場合、現在手番プレイヤーの王将位置を特定
  let checkKingPosKey: string | null = null
  if (isCheck) {
    outer: for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const p = board[r][c]
        if (p && p.type === 'king' && p.owner === currentPlayer) {
          checkKingPosKey = `${r},${c}`
          break outer
        }
      }
    }
  }

  // ポップアウト逆順のための最大 delay を事前計算
  const maxLegalDelay =
    legalMoves.length > 0 && selectedPosition
      ? Math.max(...legalMoves.map((p) => legalMoveInDelay(selectedPosition, p)))
      : 0

  // 着地アニメーションのキー: 手が変わるたびにユニークな文字列を生成
  // Piece ラッパーの key に使い、isLastMoveTo のマスで Piece を再マウントさせる
  const lastMoveKey = lastMove
    ? lastMove.type === 'move'
      ? `${lastMove.from.row}${lastMove.from.col}-${lastMove.to.row}${lastMove.to.col}`
      : `drop-${lastMove.to.row}${lastMove.to.col}`
    : 'init'
  const hintPieceSet = new Set(hintPieces.map((p) => `${p.row},${p.col}`))
  const hintMoveSet = new Set(hintMoves.map((p) => `${p.row},${p.col}`))

  const lastMoveFrom = lastMove?.type === 'move' ? lastMove.from : null
  const lastMoveTo = lastMove?.to ?? null

  const boardGlow =
    currentPlayer === 'sente'
      ? '0 8px 24px rgba(59, 130, 246, 0.5)'
      : '0 -8px 24px rgba(239, 68, 68, 0.5)'

  return (
    <motion.div
      className="inline-flex flex-col select-none"
      animate={{ boxShadow: boardGlow }}
      transition={{ duration: 0.3 }}
    >
      {/* 筋ラベル（9〜1 または 1〜9） */}
      <div className="flex pr-6">
        {Array.from({ length: 9 }, (_, displayCol) => (
          <div
            key={displayCol}
            className="flex-1 text-center text-sm font-medium text-amber-900"
          >
            {colLabel(displayCol)}
          </div>
        ))}
      </div>

      <div className="flex">
        {/* 9x9 盤面グリッド */}
        <div className="relative flex-1">
          <div
            ref={gridRef}
            className="grid grid-cols-9 border-2 border-amber-900"
            style={{
              boxShadow:
                'inset 3px 3px 6px rgba(255,210,80,0.35), inset -3px -3px 6px rgba(0,0,0,0.28), 0 4px 16px rgba(0,0,0,0.3)',
            }}
          >
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
              const isHintPiece = hintPieceSet.has(posKey)
              const isHintMove = hintMoveSet.has(posKey)
              const isKingInCheck = isCheck && checkKingPosKey === posKey
              const inDelay = isLegalMove ? legalMoveInDelay(selectedPosition, internalPos) : 0
              const outDelay = isLegalMove ? maxLegalDelay - inDelay : 0

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
                  isHintPiece={isHintPiece}
                  isHintMove={isHintMove}
                  legalMoveInDelay={inDelay}
                  legalMoveOutDelay={outDelay}
                  isKingInCheck={isKingInCheck}
                  onClick={() => onSquareClick(internalPos)}
                >
                  {piece && !isAnimatingTarget && (
                    <div
                      key={isLastMoveTo ? `piece-${posKey}-${lastMoveKey}` : `piece-${posKey}`}
                      className="absolute inset-[3px]"
                    >
                      <Piece
                        piece={piece}
                        isSelected={isSelected}
                        isOpponent={piece.owner === 'gote'}
                        isLanding={isLastMoveTo && !isSelected}
                        isKingInCheck={isKingInCheck}
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
        <div className="flex w-6 flex-col">
          {Array.from({ length: 9 }, (_, displayRow) => (
            <div
              key={displayRow}
              className="flex flex-1 items-center justify-center text-sm font-medium text-amber-900"
            >
              {rowLabel(displayRow)}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

