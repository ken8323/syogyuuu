'use client'

import { useState, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import type { RefObject } from 'react'

type GridRef = RefObject<HTMLDivElement | null>
import type { AnimatingMoveInfo } from '@/lib/shogi/types'
import { Piece } from '@/components/Piece'

interface AnimatingPieceProps {
  animatingMove: AnimatingMoveInfo
  gridRef: GridRef
  onComplete: () => void
}

export function AnimatingPiece({ animatingMove, gridRef, onComplete }: AnimatingPieceProps) {
  const [squareSize, setSquareSize] = useState<{ w: number; h: number } | null>(null)

  // レンダー後・ブラウザ描画前に同期的にサイズを取得する
  useLayoutEffect(() => {
    if (!gridRef.current) return
    const { width, height } = gridRef.current.getBoundingClientRect()
    setSquareSize({ w: width / 9, h: height / 9 })
  }, [gridRef])

  if (!squareSize) return null

  const { piece, from, to, captured } = animatingMove
  const { w: squareW, h: squareH } = squareSize
  const pieceW = squareW - 6
  const pieceH = squareH - 6

  const toX = to.col * squareW + 3
  const toY = to.row * squareH + 3

  // 持ち駒打ち: 目標マスでポップイン（scale 0 → 1）
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

  // 盤上移動: from → to へスライド
  const fromX = from.col * squareW + 3
  const fromY = from.row * squareH + 3
  const deltaX = toX - fromX
  const deltaY = toY - fromY

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
