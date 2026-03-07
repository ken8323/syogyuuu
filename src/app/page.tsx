'use client'

import { Board } from '@/components/Board'
import { CapturedPieces } from '@/components/CapturedPieces'
import { useGameStore } from '@/stores/gameStore'
import type { Player, Position, PieceType } from '@/lib/shogi/types'
import { getPieceAt } from '@/lib/shogi/board'

export default function Home() {
  const {
    gameState,
    startNewGame,
    selectPiece,
    selectCapturedPiece,
    deselectPiece,
    movePiece,
    dropPiece,
  } = useGameStore()
  const {
    board,
    currentPlayer,
    selectedPosition,
    selectedCaptured,
    legalMoves,
    moveHistory,
    phase,
    capturedPieces,
  } = gameState

  const opponent: Player = currentPlayer === 'sente' ? 'gote' : 'sente'
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

  const handleCapturedSelect = (pieceType: PieceType) => {
    if (phase !== 'idle' && phase !== 'captured_selected') return
    // 同じ持ち駒を再タップで解除
    if (selectedCaptured === pieceType) {
      deselectPiece()
    } else {
      selectCapturedPiece(pieceType)
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-2 bg-stone-100 p-4">
      <h1 className="text-2xl font-bold text-amber-900">しょうぎゅー！</h1>

      <button
        className="rounded-lg bg-amber-700 px-6 py-2 font-semibold text-white hover:bg-amber-800"
        onClick={startNewGame}
      >
        あそぶ！
      </button>

      <div className="flex w-[min(65svh,90svw)] flex-col gap-1">
        {/* 相手の持ち駒エリア（上） */}
        <div className="h-[12svh]">
          <CapturedPieces
            capturedPieces={capturedPieces}
            owner={opponent}
            selectedCaptured={selectedCaptured}
            isOwnerTurn={false}
            onSelect={handleCapturedSelect}
          />
        </div>

        {/* 盤面 */}
        <Board
          board={board}
          currentPlayer={currentPlayer}
          selectedPosition={selectedPosition}
          legalMoves={legalMoves}
          lastMove={lastMove}
          onSquareClick={handleSquareClick}
        />

        {/* 自分の持ち駒エリア（下） */}
        <div className="h-[12svh]">
          <CapturedPieces
            capturedPieces={capturedPieces}
            owner={currentPlayer}
            selectedCaptured={selectedCaptured}
            isOwnerTurn={phase === 'idle' || phase === 'captured_selected'}
            onSelect={handleCapturedSelect}
          />
        </div>
      </div>

      <p className="text-sm font-medium text-amber-800">
        手番: {currentPlayer === 'sente' ? '先手（青）' : '後手（赤）'} / phase: {phase}
      </p>
    </main>
  )
}
