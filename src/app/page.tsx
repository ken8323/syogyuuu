'use client'

import { Board } from '@/components/Board'
import { useGameStore } from '@/stores/gameStore'
import type { Position } from '@/lib/shogi/types'
import { getPieceAt } from '@/lib/shogi/board'

export default function Home() {
  const { gameState, startNewGame, selectPiece, deselectPiece, movePiece, dropPiece } =
    useGameStore()
  const { board, currentPlayer, selectedPosition, legalMoves, moveHistory, phase } = gameState

  const lastMove =
    moveHistory.currentIndex >= 0 ? moveHistory.moves[moveHistory.currentIndex] : null

  const handleSquareClick = (pos: Position) => {
    if (phase === 'idle' || phase === 'piece_selected') {
      const piece = getPieceAt(board, pos)
      if (piece?.owner === currentPlayer) {
        selectPiece(pos)
      } else if (phase === 'piece_selected') {
        const isLegal = legalMoves.some((p) => p.row === pos.row && p.col === pos.col)
        if (isLegal) {
          movePiece(pos)
        } else {
          deselectPiece()
        }
      }
    } else if (phase === 'captured_selected') {
      dropPiece(pos)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-stone-100 p-4">
      <h1 className="text-2xl font-bold text-amber-900">しょうぎゅー！</h1>

      <button
        className="rounded-lg bg-amber-700 px-6 py-2 font-semibold text-white hover:bg-amber-800"
        onClick={startNewGame}
      >
        あそぶ！
      </button>

      {/* 盤面: 高さ基準で正方形にする */}
      <div className="w-[min(65svh,90svw)]">
        <Board
          board={board}
          currentPlayer={currentPlayer}
          selectedPosition={selectedPosition}
          legalMoves={legalMoves}
          lastMove={lastMove}
          onSquareClick={handleSquareClick}
        />
      </div>

      <p className="text-sm font-medium text-amber-800">
        手番: {currentPlayer === 'sente' ? '先手（青）' : '後手（赤）'} / phase: {phase}
      </p>
    </main>
  )
}
