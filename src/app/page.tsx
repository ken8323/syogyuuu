'use client'

import { useEffect } from 'react'
import { Board } from '@/components/Board'
import { CapturedPieces } from '@/components/CapturedPieces'
import { ControlBar } from '@/components/Controls'
import { PromotionDialog, ForcedPromotionToast, GameOverDialog, MenuDialog } from '@/components/Dialogs'
import { CheckBanner } from '@/components/Notifications'
import { TitleScreen } from '@/components/TitleScreen'
import { useGameStore } from '@/stores/gameStore'
import type { BoardMove, Player, Position, PieceType } from '@/lib/shogi/types'
import { getPieceAt } from '@/lib/shogi/board'

export default function Home() {
  const {
    appState,
    gameState,
    ui,
    startNewGame,
    resumeGame,
    selectPiece,
    selectCapturedPiece,
    deselectPiece,
    movePiece,
    dropPiece,
    undo,
    redo,
    promote,
    toggleMenu,
    toggleMute,
    clearForcedPromotion,
    completeCheckNotify,
    resetGame,
    goToTitle,
    resign,
    completeTurnSwitch,
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
    winner,
    gameOverReason,
  } = gameState

  // turn_switching フェーズ完了を自動でトリガー
  // (#19 手番交代アニメーション実装後はアニメーション完了コールバックに置き換える)
  useEffect(() => {
    if (phase === 'turn_switching') {
      completeTurnSwitch()
    }
  }, [phase, completeTurnSwitch])

  // 保存データの有無: 手の履歴が1手以上あれば続きがある
  const hasSavedGame = gameState.moveHistory.moves.length > 0

  // タイトル画面
  if (appState === 'title') {
    return (
      <TitleScreen
        hasSavedGame={hasSavedGame}
        onStartNew={startNewGame}
        onResume={resumeGame}
      />
    )
  }

  const opponent: Player = currentPlayer === 'sente' ? 'gote' : 'sente'
  const lastMove =
    moveHistory.currentIndex >= 0 ? moveHistory.moves[moveHistory.currentIndex] : null

  const canUndo = moveHistory.currentIndex >= 0 && phase === 'idle'
  const canRedo = moveHistory.currentIndex < moveHistory.moves.length - 1 && phase === 'idle'

  // 成りダイアログ: promotion_check フェーズ時に最後の手の駒種を取得
  // mustPromote/canPromote は成駒に対して false を返すため、
  // promotion_check フェーズ中の piece.type は必ず PieceType（非成駒）
  const promotionPieceType: PieceType | null =
    phase === 'promotion_check' && lastMove?.type === 'move'
      ? (lastMove as BoardMove).piece.type as PieceType
      : null

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
    if (selectedCaptured === pieceType) {
      deselectPiece()
    } else {
      selectCapturedPiece(pieceType)
    }
  }

  return (
    <main className="relative flex h-dvh flex-col items-center justify-center gap-2 overflow-hidden bg-amber-50 p-4">
      {/* メニューダイアログ */}
      <MenuDialog
        isOpen={ui.isMenuOpen}
        onClose={toggleMenu}
        onResign={resign}
        onReset={resetGame}
      />

      {/* 勝敗ダイアログ */}
      <GameOverDialog
        isOpen={phase === 'checkmate'}
        winner={winner}
        gameOverReason={gameOverReason}
        onRematch={resetGame}
        onQuit={goToTitle}
      />

      {/* 成りダイアログ */}
      <PromotionDialog
        isOpen={phase === 'promotion_check'}
        pieceType={promotionPieceType}
        onPromote={promote}
      />

      {/* 王手通知バナー */}
      <CheckBanner
        isVisible={phase === 'check_notify'}
        onDismiss={completeCheckNotify}
      />

      {/* 強制成りトースト（store の ui.forcedPromotionPiece を参照） */}
      <ForcedPromotionToast
        pieceType={ui.forcedPromotionPiece}
        onDismiss={clearForcedPromotion}
      />

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

        {/* 操作バー */}
        <div className="h-[8svh]">
          <ControlBar
            currentPlayer={currentPlayer}
            canUndo={canUndo}
            canRedo={canRedo}
            isMuted={ui.isMuted}
            onUndo={undo}
            onRedo={redo}
            onMenu={toggleMenu}
            onToggleMute={toggleMute}
          />
        </div>
      </div>
    </main>
  )
}
