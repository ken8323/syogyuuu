'use client'

import { useState, useLayoutEffect } from 'react'
import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import type { RefObject } from 'react'

type GridRef = RefObject<HTMLDivElement | null>
import type { AnimatingMoveInfo, PieceType, PromotedPieceType } from '@/lib/shogi/types'
import { getDemotedType } from '@/lib/shogi/rules'
import { Piece } from '@/components/Piece'

// 持ち駒エリアの駒表示順（CapturedPieces と同じ順序）
const CAPTURED_PIECE_ORDER: PieceType[] = ['gold', 'silver', 'knight', 'lance', 'rook', 'bishop', 'pawn']

interface AnimatingPieceProps {
  animatingMove: AnimatingMoveInfo
  gridRef: GridRef
  onComplete: () => void
}

export function AnimatingPiece({ animatingMove, gridRef, onComplete }: AnimatingPieceProps) {
  const [squareSize, setSquareSize] = useState<{
    w: number; h: number; gridWidth: number; gridHeight: number
  } | null>(null)

  // レンダー後・ブラウザ描画前に同期的にサイズを取得する
  useLayoutEffect(() => {
    if (!gridRef.current) return
    const { width, height } = gridRef.current.getBoundingClientRect()
    setSquareSize({ w: width / 9, h: height / 9, gridWidth: width, gridHeight: height })
  }, [gridRef])

  if (!squareSize) return null

  const { piece, from, to, captured, undoRedo } = animatingMove
  const { w: squareW, h: squareH, gridWidth, gridHeight } = squareSize
  const pieceW = squareW - 6
  const pieceH = squareH - 6

  const toX = to.col * squareW + 3
  const toY = to.row * squareH + 3

  // 持ち駒打ち / Redo DropMove: 目標マスでポップイン（scale 0 → 1）
  if (from === null) {
    return (
      <motion.div
        style={{
          position: 'absolute',
          left: toX,
          top: toY,
          width: pieceW,
          height: pieceH,
          pointerEvents: 'none',
          zIndex: 20,
        }}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20 }}
        onAnimationComplete={onComplete}
      >
        <Piece piece={piece} isOpponent={piece.owner === 'gote'} />
      </motion.div>
    )
  }

  const fromX = from.col * squareW + 3
  const fromY = from.row * squareH + 3

  // Undo DropMove: 同位置でポップアウト（scale 1 → 0）
  if (undoRedo === 'undo' && from.row === to.row && from.col === to.col) {
    return (
      <motion.div
        style={{
          position: 'absolute',
          left: fromX,
          top: fromY,
          width: pieceW,
          height: pieceH,
          pointerEvents: 'none',
          zIndex: 20,
        }}
        animate={{ scale: 0 }}
        transition={{ duration: 0.2, ease: 'easeIn' }}
        onAnimationComplete={onComplete}
      >
        <Piece piece={piece} isOpponent={piece.owner === 'gote'} />
      </motion.div>
    )
  }

  const deltaX = toX - fromX
  const deltaY = toY - fromY

  // Undo BoardMove: 逆スライド（from=move.to → to=move.from）
  if (undoRedo === 'undo') {
    // 捕獲返還: 持ち駒エリアの概算座標から from（=move.to）へ飛び込み
    let captureReturnEl: ReactNode = null
    if (captured) {
      const capturedAreaHeight = window.innerHeight * 0.12  // 12svh
      const gap = 4  // gap-1

      const demotedType: PieceType = captured.type.toString().startsWith('promoted_')
        ? getDemotedType(captured.type as PromotedPieceType)
        : (captured.type as PieceType)
      const slotIndex = CAPTURED_PIECE_ORDER.indexOf(demotedType)
      const capturedAreaWidth = gridWidth + 24  // グリッド幅 + 段ラベル幅
      const slotWidth = capturedAreaWidth / CAPTURED_PIECE_ORDER.length
      const slotCenterX = slotIndex * slotWidth + slotWidth / 2

      // captured.owner === 'sente': 後手持ち駒エリア（TOP）から
      // captured.owner === 'gote':  先手持ち駒エリア（BOTTOM）から
      const fromTop = captured.owner === 'sente'
      const captureStartX = slotCenterX - pieceW / 2
      const captureStartY = fromTop
        ? -(capturedAreaHeight / 2 + gap) - pieceH / 2
        : gridHeight + gap + capturedAreaHeight / 2 - pieceH / 2

      captureReturnEl = (
        <motion.div
          style={{
            position: 'absolute',
            left: captureStartX,
            top: captureStartY,
            width: pieceW,
            height: pieceH,
            pointerEvents: 'none',
            zIndex: 18,
          }}
          animate={{
            x: fromX - captureStartX,
            y: fromY - captureStartY,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Piece piece={captured} isOpponent={captured.owner === 'gote'} />
        </motion.div>
      )
    }

    return (
      <>
        {captureReturnEl}
        <motion.div
          style={{
            position: 'absolute',
            left: fromX,
            top: fromY,
            width: pieceW,
            height: pieceH,
            pointerEvents: 'none',
            zIndex: 20,
          }}
          animate={{ x: deltaX, y: deltaY }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
        >
          <Piece piece={piece} isOpponent={piece.owner === 'gote'} />
        </motion.div>
      </>
    )
  }

  // Redo BoardMove: 正方向スライド（通常より短い 0.25s）
  if (undoRedo === 'redo') {
    return (
      <>
        {captured && (
          <motion.div
            style={{
              position: 'absolute',
              left: toX,
              top: toY,
              width: pieceW,
              height: pieceH,
              pointerEvents: 'none',
              zIndex: 19,
            }}
            animate={{ scale: 0.3, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Piece piece={captured} isOpponent={captured.owner === 'gote'} />
          </motion.div>
        )}
        <motion.div
          style={{
            position: 'absolute',
            left: fromX,
            top: fromY,
            width: pieceW,
            height: pieceH,
            pointerEvents: 'none',
            zIndex: 20,
          }}
          animate={{ x: deltaX, y: deltaY }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          onAnimationComplete={onComplete}
        >
          <Piece piece={piece} isOpponent={piece.owner === 'gote'} />
        </motion.div>
      </>
    )
  }

  // 通常移動: from → to へスプリングスライド
  const isKnight = piece.type === 'knight'

  return (
    <>
      {/* 取られる駒: スケール縮小 + フェードアウト */}
      {captured && (
        <motion.div
          style={{
            position: 'absolute',
            left: toX,
            top: toY,
            width: pieceW,
            height: pieceH,
            pointerEvents: 'none',
            zIndex: 19,
          }}
          animate={{ scale: 0.3, opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <Piece piece={captured} isOpponent={captured.owner === 'gote'} />
        </motion.div>
      )}

      {/* 移動する駒: from → to へアニメーション */}
      <motion.div
        style={{
          position: 'absolute',
          left: fromX,
          top: fromY,
          width: pieceW,
          height: pieceH,
          pointerEvents: 'none',
          zIndex: 20,
        }}
        animate={{
          x: deltaX,
          // 桂馬: 放物線軌道（弧を描いてぴょんと跳ねる）
          y: isKnight
            ? [0, deltaY / 2 - squareH * 0.8, deltaY]
            : deltaY,
        }}
        transition={
          isKnight
            ? {
                x: { duration: 0.35, ease: 'linear' },
                y: { duration: 0.35, times: [0, 0.45, 1], ease: ['easeOut', 'easeIn'] },
              }
            : { type: 'spring', stiffness: 300, damping: 25 }
        }
        onAnimationComplete={onComplete}
      >
        <Piece piece={piece} isOpponent={piece.owner === 'gote'} />
      </motion.div>
    </>
  )
}
