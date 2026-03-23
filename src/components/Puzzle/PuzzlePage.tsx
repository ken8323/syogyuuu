'use client'

import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Board } from '@/components/Board'
import { CapturedPieces } from '@/components/CapturedPieces'
import { PromotionDialog } from '@/components/Dialogs'
import { PuzzleControlBar } from './PuzzleControlBar'
import { PuzzleSolvedDialog } from './PuzzleSolvedDialog'
import { usePuzzleStore } from '@/stores/puzzleStore'
import { getPieceAt } from '@/lib/shogi/board'
import { findPuzzleById, hasNextPuzzle as checkHasNextPuzzle } from '@/lib/puzzle/puzzleData'
import type { Position, PieceType } from '@/lib/shogi/types'

interface PuzzlePageProps {
  onBack: () => void
}

export function PuzzlePage({ onBack }: PuzzlePageProps) {
  const {
    currentPuzzleId,
    gameState,
    phase,
    isCorrect,
    isAutoPlaying,
    hintPieces,
    selectPiece,
    selectCapturedPiece,
    deselectPiece,
    movePiece,
    dropPiece,
    promote,
    resetPuzzle,
    goToNextPuzzle,
    showHint,
  } = usePuzzleStore()

  const {
    board,
    currentPlayer,
    selectedPosition,
    selectedCaptured,
    legalMoves,
    moveHistory,
    capturedPieces,
    isCheck,
  } = gameState

  const puzzle = currentPuzzleId ? findPuzzleById(currentPuzzleId) : null

  // turn_switching フェーズ自動完了（パズルでは即座に遷移）
  useEffect(() => {
    if (gameState.phase === 'turn_switching') {
      usePuzzleStore.setState(state => ({
        gameState: { ...state.gameState, phase: 'idle' },
        phase: 'idle',
      }))
    }
  }, [gameState.phase])

  // 不正解時に2秒後自動リセット
  useEffect(() => {
    if (isCorrect === false) {
      const timer = setTimeout(() => {
        resetPuzzle()
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isCorrect, resetPuzzle])

  const lastMove =
    moveHistory.currentIndex >= 0 ? moveHistory.moves[moveHistory.currentIndex] : null

  // 成りダイアログ用: パズルでは executeMove 前に promotion_check に入るため、
  // lastMove ではなく selectedPosition から駒種を取得する
  const promotionPieceType: PieceType | null = (() => {
    if (phase !== 'promotion_check') return null
    // selectedPosition に成り対象の駒がある
    if (selectedPosition) {
      const piece = getPieceAt(board, selectedPosition)
      if (piece) return piece.type as PieceType
    }
    return null
  })()

  const handleSquareClick = (pos: Position) => {
    if (isAutoPlaying || isCorrect !== null) return

    if (phase === 'idle' || phase === 'piece_selected') {
      const piece = getPieceAt(board, pos)
      if (piece?.owner === 'sente') {
        if (selectedPosition && selectedPosition.row === pos.row && selectedPosition.col === pos.col) {
          deselectPiece()
        } else {
          selectPiece(pos)
        }
      } else if (phase === 'piece_selected') {
        const isLegal = legalMoves.some(p => p.row === pos.row && p.col === pos.col)
        if (isLegal) {
          movePiece(pos)
        } else {
          deselectPiece()
        }
      }
    } else if (phase === 'captured_selected') {
      const isLegal = legalMoves.some(p => p.row === pos.row && p.col === pos.col)
      if (isLegal) {
        dropPiece(pos)
      }
    }
  }

  const handleCapturedSelect = (pieceType: PieceType) => {
    if (isAutoPlaying || isCorrect !== null) return
    if (phase !== 'idle' && phase !== 'captured_selected') return

    if (selectedCaptured === pieceType) {
      deselectPiece()
    } else {
      selectCapturedPiece(pieceType)
    }
  }

  const handleNext = () => {
    const nextId = goToNextPuzzle()
    if (!nextId) {
      onBack()
    }
  }

  const hasNextPuzzle = currentPuzzleId ? checkHasNextPuzzle(currentPuzzleId) : false

  return (
    <main className="relative flex h-dvh flex-col items-center justify-center gap-2 overflow-hidden bg-amber-50 p-4">
      {/* パズル情報バー */}
      {puzzle && (
        <motion.div
          className="text-center text-lg font-bold text-amber-800"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {puzzle.title}
        </motion.div>
      )}

      {/* 不正解トースト */}
      <AnimatePresence>
        {isCorrect === false && (
          <motion.div
            className="fixed left-1/2 top-16 z-50 -translate-x-1/2 rounded-2xl bg-red-500 px-6 py-3 text-lg font-bold text-white shadow-lg"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
          >
            ざんねん！もういちど やってみよう
          </motion.div>
        )}
      </AnimatePresence>

      {/* 正解ダイアログ */}
      <PuzzleSolvedDialog
        isOpen={isCorrect === true}
        hasNextPuzzle={hasNextPuzzle}
        onNext={handleNext}
        onBack={onBack}
      />

      {/* 成りダイアログ */}
      <PromotionDialog
        isOpen={phase === 'promotion_check'}
        pieceType={promotionPieceType}
        owner="sente"
        onPromote={promote}
      />

      <div className="flex w-[min(65svh,90svw)] flex-col gap-1">
        {/* 後手（玉方）の表示はないが盤面バランスのために空間確保 */}
        <div className="h-[6svh]" />

        {/* 盤面 */}
        <Board
          board={board}
          currentPlayer={currentPlayer}
          selectedPosition={selectedPosition}
          legalMoves={legalMoves}
          lastMove={lastMove}
          onSquareClick={handleSquareClick}
          animatingMove={null}
          onAnimationComplete={() => {}}
          promotingInfo={null}
          onPromotionComplete={() => {}}
          hintPieces={hintPieces}
          hintMoves={[]}
          isCheck={isCheck}
        />

        {/* 先手（攻め方）の持ち駒 */}
        <div className="h-[12svh]">
          <CapturedPieces
            capturedPieces={capturedPieces}
            owner="sente"
            selectedCaptured={selectedCaptured}
            isOwnerTurn={currentPlayer === 'sente' && (phase === 'idle' || phase === 'captured_selected') && !isAutoPlaying && isCorrect === null}
            onSelect={handleCapturedSelect}
          />
        </div>

        {/* コントロールバー */}
        <div className="h-[8svh]">
          <PuzzleControlBar
            onReset={resetPuzzle}
            onHint={showHint}
            onBack={onBack}
          />
        </div>
      </div>
    </main>
  )
}
