'use client'

import { useEffect, useState } from 'react'
import { Board } from '@/components/Board'
import { CapturedPieces } from '@/components/CapturedPieces'
import { ControlBar } from '@/components/Controls'
import { PromotionDialog, ForcedPromotionToast, GameOverDialog, MenuDialog } from '@/components/Dialogs'
import { CheckBanner, PraiseMessage, TurnChangeToast } from '@/components/Notifications'
import { TitleScreen } from '@/components/TitleScreen'
import { PieceGuideDialog } from '@/components/PieceGuide'
import { PuzzleSelectScreen, PuzzlePage } from '@/components/Puzzle'
import { SeasonalBackground } from '@/components/Background'
import { useGameStore } from '@/stores/gameStore'
import { usePuzzleStore } from '@/stores/puzzleStore'
import { useHintTimer } from '@/hooks/useHintTimer'
import type { BoardMove, Position, PieceType } from '@/lib/shogi/types'
import { getPieceAt } from '@/lib/shogi/board'

export default function Home() {
  const [isGuideOpen, setIsGuideOpen] = useState(false)

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
    goToPuzzleSelect,
    resign,
    completeTurnSwitch,
    completeMoveAnimation,
    completePromotion,
    setHint,
    clearHint,
    showHint,
    clearPraise,
    clearTurnChange,
  } = useGameStore()

  const puzzleSolvedIds = usePuzzleStore(s => s.solvedPuzzleIds)
  const startPuzzle = usePuzzleStore(s => s.startPuzzle)
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
    isCheck,
  } = gameState

  // ヒントタイマー（10秒/15秒無操作でヒント表示）
  useHintTimer({
    phase,
    isMenuOpen: ui.isMenuOpen,
    onLevel1: () => setHint(1),
    onLevel2: () => setHint(2),
    onClear: clearHint,
  })

  // turn_switching フェーズ完了を自動でトリガー
  // (#19 手番交代アニメーション実装後はアニメーション完了コールバックに置き換える)
  useEffect(() => {
    if (phase === 'turn_switching') {
      completeTurnSwitch()
    }
  }, [phase, completeTurnSwitch])

  // 保存データの有無: 手の履歴が1手以上あれば続きがある
  const hasSavedGame = gameState.moveHistory.moves.length > 0

  // パズル選択画面
  if (appState === 'puzzle_select') {
    return (
      <PuzzleSelectScreen
        solvedPuzzleIds={puzzleSolvedIds}
        onSelectPuzzle={(puzzleId) => {
          startPuzzle(puzzleId)
          useGameStore.setState({ appState: 'puzzle' })
        }}
        onBack={goToTitle}
      />
    )
  }

  // パズル対局画面
  if (appState === 'puzzle') {
    return (
      <PuzzlePage
        onBack={goToPuzzleSelect}
      />
    )
  }

  // タイトル画面
  if (appState === 'title') {
    return (
      <>
        <TitleScreen
          hasSavedGame={hasSavedGame}
          onStartNew={startNewGame}
          onResume={resumeGame}
          onOpenGuide={() => setIsGuideOpen(true)}
          onOpenPuzzle={goToPuzzleSelect}
        />
        <PieceGuideDialog isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      </>
    )
  }

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
        // 選択中の駒を再タップ → 選択解除
        if (selectedPosition && selectedPosition.row === pos.row && selectedPosition.col === pos.col) {
          deselectPiece()
        } else {
          selectPiece(pos)
        }
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
      <SeasonalBackground />
      {/* メニューダイアログ */}
      <MenuDialog
        isOpen={ui.isMenuOpen}
        onClose={toggleMenu}
        onResign={resign}
        onReset={resetGame}
        onOpenGuide={() => {
          toggleMenu()
          setIsGuideOpen(true)
        }}
      />

      {/* 駒の動き方ヘルプ */}
      <PieceGuideDialog isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />

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
        owner={
          phase === 'promotion_check' && lastMove?.type === 'move'
            ? (lastMove as BoardMove).piece.owner
            : currentPlayer
        }
        onPromote={promote}
      />

      {/* 王手通知バナー */}
      <CheckBanner
        isVisible={phase === 'check_notify'}
        currentPlayer={currentPlayer}
        onDismiss={completeCheckNotify}
      />

      {/* 強制成りトースト（store の ui.forcedPromotionPiece を参照） */}
      <ForcedPromotionToast
        pieceType={ui.forcedPromotionPiece}
        onDismiss={clearForcedPromotion}
      />

      <div className="flex w-[min(65svh,90svw)] flex-col gap-1">
        {/* 後手の持ち駒エリア（上・固定） */}
        <div className="h-[12svh]">
          <CapturedPieces
            capturedPieces={capturedPieces}
            owner="gote"
            selectedCaptured={selectedCaptured}
            isOwnerTurn={currentPlayer === 'gote' && (phase === 'idle' || phase === 'captured_selected')}
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
          animatingMove={ui.animatingMove}
          onAnimationComplete={completeMoveAnimation}
          promotingInfo={ui.promotingInfo}
          onPromotionComplete={completePromotion}
          hintPieces={ui.hintPieces}
          hintMoves={ui.hintMoves}
          isCheck={isCheck}
        />

        {/* 先手の持ち駒エリア（下・固定） */}
        <div className="h-[12svh]">
          <CapturedPieces
            capturedPieces={capturedPieces}
            owner="sente"
            selectedCaptured={selectedCaptured}
            isOwnerTurn={currentPlayer === 'sente' && (phase === 'idle' || phase === 'captured_selected')}
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
            canShowHint={phase === 'idle' && !ui.isMenuOpen}
            onUndo={undo}
            onRedo={redo}
            onMenu={toggleMenu}
            onToggleMute={toggleMute}
            onShowHint={showHint}
          />
        </div>
      </div>

      {/* ほめメッセージ（画面中央にオーバーレイ） */}
      <PraiseMessage message={ui.praiseMessage} onDismiss={clearPraise} />

      {/* 手番交代トースト */}
      <TurnChangeToast player={ui.turnChangePlayer} onDismiss={clearTurnChange} />
    </main>
  )
}
