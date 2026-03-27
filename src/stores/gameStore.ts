import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AnimatingMoveInfo, GameState, PieceType, Player, Position, UIState, PromotingInfo } from '../lib/shogi/types'
import { getLegalMoves, getLegalDrops, isInCheck } from '../lib/shogi/moves'
import { getMovablePieces, getRecommendedMove } from '../lib/shogi/hint'
import { isCheckmate, canPromote, mustPromote, getPromotedType } from '../lib/shogi/rules'
import { executeMove, executeDrop, undoMove, redoMove, createInitialGameState } from '../lib/shogi/game'
import { getPieceAt } from '../lib/shogi/board'
import { playSound, soundEngine } from '../lib/sound/soundEngine'
import {
  pickMessage,
  CAPTURE_MESSAGES,
  FIRST_CAPTURE_MESSAGE,
  PROMOTE_MESSAGES,
  MILESTONE_MESSAGES,
} from '../lib/praise'
import {
  hapticSelect,
  hapticPlace,
  hapticCapture,
  hapticPromote,
  hapticCheck,
  hapticCheckmate,
  hapticUndoRedo,
} from '../lib/haptics'

// ============================================================
// ストアの型定義
// ============================================================

interface GameStore {
  // 状態
  appState: 'title' | 'playing' | 'game_over' | 'puzzle_select' | 'puzzle'
  gameState: GameState
  ui: UIState

  // アクション
  startNewGame: () => void
  resumeGame: () => void
  selectPiece: (position: Position) => void
  selectCapturedPiece: (pieceType: PieceType) => void
  deselectPiece: () => void
  movePiece: (to: Position) => void
  dropPiece: (to: Position) => void
  promote: (doPromote: boolean) => void
  undo: () => void
  redo: () => void
  resign: () => void
  resetGame: () => void
  goToTitle: () => void
  goToPuzzleSelect: () => void
  toggleMenu: () => void
  toggleMute: () => void
  completeTurnSwitch: () => void
  completeCheckNotify: () => void
  clearForcedPromotion: () => void
  completeMoveAnimation: () => void
  completePromotion: () => void
  setHint: (level: 1 | 2) => void
  clearHint: () => void
  showHint: () => void
  clearPraise: () => void
  clearTurnChange: () => void
}

// ============================================================
// 初期UI状態
// ============================================================

const INITIAL_UI_STATE: UIState = {
  isMenuOpen: false,
  isAnimating: false,
  forcedPromotionPiece: null,
  isMuted: false,
  animatingMove: null,
  promotingInfo: null,
  hintLevel: 0,
  hintPieces: [],
  hintMoves: [],
  praiseMessage: null,
  hasFirstCapture: false,
  turnChangePlayer: null,
}

// ============================================================
// ストア実装
// ============================================================

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      appState: 'title',
      gameState: createInitialGameState(),
      ui: INITIAL_UI_STATE,

      // ============================================================
      // ゲーム開始・再開
      // ============================================================

      startNewGame: () => {
        set(state => ({
          appState: 'playing',
          gameState: createInitialGameState(),
          ui: { ...INITIAL_UI_STATE, isMuted: state.ui.isMuted },
        }))
      },

      resumeGame: () => {
        // persistミドルウェアによりローカルストレージから盤面が復元済み
        // フェーズを強制的に idle にリセットして対局を再開する
        set(state => ({
          appState: 'playing',
          gameState: {
            ...state.gameState,
            phase: 'idle',
            selectedPosition: null,
            selectedCaptured: null,
            legalMoves: [],
          },
          ui: { ...INITIAL_UI_STATE, isMuted: state.ui.isMuted },
        }))
      },

      // ============================================================
      // 駒の選択
      // ============================================================

      selectPiece: (position: Position) => {
        const { gameState } = get()
        const { phase, board, capturedPieces, currentPlayer } = gameState

        // idle か piece_selected の時のみ有効
        if (phase !== 'idle' && phase !== 'piece_selected') return

        const piece = getPieceAt(board, position)
        if (!piece || piece.owner !== currentPlayer) return

        const legalMoves = getLegalMoves(board, position, capturedPieces, currentPlayer)

        playSound('select')
        hapticSelect(get().ui.isMuted)
        set(state => ({
          gameState: {
            ...state.gameState,
            phase: 'piece_selected',
            selectedPosition: position,
            selectedCaptured: null,
            legalMoves,
          },
        }))
      },

      selectCapturedPiece: (pieceType: PieceType) => {
        const { gameState } = get()
        const { phase, board, capturedPieces, currentPlayer } = gameState

        // idle か captured_selected の時のみ有効
        if (phase !== 'idle' && phase !== 'captured_selected') return

        // 持ち駒に1枚以上あるか確認
        const count = capturedPieces[currentPlayer][pieceType] ?? 0
        if (count < 1) return

        const legalMoves = getLegalDrops(board, currentPlayer, pieceType, capturedPieces)

        playSound('select')
        hapticSelect(get().ui.isMuted)
        set(state => ({
          gameState: {
            ...state.gameState,
            phase: 'captured_selected',
            selectedPosition: null,
            selectedCaptured: pieceType,
            legalMoves,
          },
        }))
      },

      deselectPiece: () => {
        set(state => ({
          gameState: {
            ...state.gameState,
            phase: 'idle',
            selectedPosition: null,
            selectedCaptured: null,
            legalMoves: [],
          },
        }))
      },

      // ============================================================
      // 駒の移動
      // ============================================================

      movePiece: (to: Position) => {
        const { gameState } = get()
        const { phase, selectedPosition, legalMoves, board } = gameState

        if (phase !== 'piece_selected' || !selectedPosition) return

        // 合法手チェック
        const isLegal = legalMoves.some(p => p.row === to.row && p.col === to.col)
        if (!isLegal) return

        const piece = getPieceAt(board, selectedPosition)
        if (!piece) return

        const from = selectedPosition
        const captured = getPieceAt(board, to)

        // 成り・手番遷移先を決定
        let promote = false
        let isForcedPromote = false
        let pendingPhase: AnimatingMoveInfo['pendingPhase'] = 'turn_switching'

        if (mustPromote(piece, to)) {
          promote = true
          isForcedPromote = true
          pendingPhase = 'turn_switching'
          playSound('forced_promote')
          hapticPromote(get().ui.isMuted)
        } else if (canPromote(piece, from, to)) {
          promote = false
          pendingPhase = 'promotion_check'
          playSound(captured ? 'capture' : 'place')
          if (captured) {
            hapticCapture(get().ui.isMuted)
          } else {
            hapticPlace(get().ui.isMuted)
          }
        } else {
          promote = false
          pendingPhase = 'turn_switching'
          playSound(captured ? 'capture' : 'place')
          if (captured) {
            hapticCapture(get().ui.isMuted)
          } else {
            hapticPlace(get().ui.isMuted)
          }
        }

        // 移動を実行（盤面を即時更新）
        const nextState = executeMove(gameState, from, to, promote)

        // 捕獲時のほめメッセージ
        let praiseMessage: string | null = null
        let hasFirstCapture = get().ui.hasFirstCapture
        if (captured) {
          if (!hasFirstCapture) {
            praiseMessage = FIRST_CAPTURE_MESSAGE
            hasFirstCapture = true
          } else {
            praiseMessage = pickMessage(CAPTURE_MESSAGES, get().ui.praiseMessage)
          }
        }

        // 強制成り時のほめメッセージ（捕獲と重複した場合は成りを優先）
        if (isForcedPromote) {
          praiseMessage = pickMessage(PROMOTE_MESSAGES, get().ui.praiseMessage)
        }

        set(state => ({
          gameState: {
            ...nextState,
            phase: 'moving',
          },
          ui: {
            ...state.ui,
            animatingMove: { piece, from, to, captured, pendingPhase, promote, isForcedPromote },
            ...(praiseMessage !== null ? { praiseMessage, hasFirstCapture } : { hasFirstCapture }),
          },
        }))
      },

      // ============================================================
      // 持ち駒を打つ
      // ============================================================

      dropPiece: (to: Position) => {
        const { gameState } = get()
        const { phase, selectedCaptured, legalMoves, currentPlayer } = gameState

        if (phase !== 'captured_selected' || !selectedCaptured) return

        // 合法手チェック
        const isLegal = legalMoves.some(p => p.row === to.row && p.col === to.col)
        if (!isLegal) return

        const nextState = executeDrop(gameState, selectedCaptured, to)
        playSound('drop')
        hapticPlace(get().ui.isMuted)

        set(state => ({
          gameState: {
            ...nextState,
            phase: 'moving',
          },
          ui: {
            ...state.ui,
            animatingMove: {
              piece: { type: selectedCaptured, owner: currentPlayer },
              from: null,
              to,
              captured: null,
              pendingPhase: 'turn_switching',
              promote: false,
              isForcedPromote: false,
            },
          },
        }))
      },

      // ============================================================
      // 成り選択
      // ============================================================

      promote: (doPromote: boolean) => {
        const { gameState } = get()
        const { phase, moveHistory } = gameState

        if (phase !== 'promotion_check') return

        if (doPromote) {
          // 直前の手（非成り）を取り消し、成りで再実行する
          const undone = undoMove(gameState)
          // undoMove によって currentPlayer が戻るので、元の from/to を取得する
          const lastMove = moveHistory.moves[moveHistory.currentIndex]
          if (!lastMove || lastMove.type !== 'move') return

          const reExecuted = executeMove(undone, lastMove.from, lastMove.to, true)
          playSound('promote')
          hapticPromote(get().ui.isMuted)
          const promotingInfo: PromotingInfo = {
            position: lastMove.to,
            pieceType: lastMove.piece.type as PieceType,
            isForcedPromote: false,
          }
          const promoteMsg = pickMessage(PROMOTE_MESSAGES, get().ui.praiseMessage)
          set(state => ({
            gameState: {
              ...reExecuted,
              phase: 'promoting',
            },
            ui: {
              ...state.ui,
              promotingInfo,
              praiseMessage: promoteMsg,
            },
          }))
        } else {
          // 成らない: 既に実行済みの非成り手をそのまま確定
          set(state => ({
            gameState: {
              ...state.gameState,
              phase: 'turn_switching',
            },
          }))
        }
      },

      // ============================================================
      // 手番交代完了
      // ============================================================

      completeTurnSwitch: () => {
        const { gameState } = get()
        const { phase, board, capturedPieces, currentPlayer, moveHistory } = gameState

        if (phase !== 'turn_switching') return

        // 10手ごとのマイルストーンほめメッセージ（既に別のほめメッセージが表示中でなければ）
        const moveCount = moveHistory.currentIndex + 1
        if (moveCount > 0 && moveCount % 10 === 0 && !get().ui.praiseMessage) {
          const milestoneMsg = pickMessage(MILESTONE_MESSAGES, get().ui.praiseMessage)
          set(state => ({ ui: { ...state.ui, praiseMessage: milestoneMsg } }))
        }

        // currentPlayer は executeMove/executeDrop で既に切り替わっている
        if (isCheckmate(board, capturedPieces, currentPlayer)) {
          const opponent: Player = currentPlayer === 'sente' ? 'gote' : 'sente'
          playSound('victory')
          hapticCheckmate(get().ui.isMuted)
          set(state => ({
            appState: 'game_over',
            gameState: {
              ...state.gameState,
              phase: 'checkmate',
              winner: opponent,
              isCheck: true,
              gameOverReason: 'checkmate',
            },
          }))
        } else if (isInCheck(board, currentPlayer)) {
          playSound('check')
          hapticCheck(get().ui.isMuted)
          set(state => ({
            gameState: {
              ...state.gameState,
              phase: 'check_notify',
              isCheck: true,
            },
          }))
        } else {
          set(state => ({
            gameState: {
              ...state.gameState,
              phase: 'idle',
              isCheck: false,
            },
            ui: {
              ...state.ui,
              turnChangePlayer: currentPlayer,
            },
          }))
        }
      },

      // ============================================================
      // 王手通知完了
      // ============================================================

      completeCheckNotify: () => {
        const { gameState } = get()
        if (gameState.phase !== 'check_notify') return

        set(state => ({
          gameState: {
            ...state.gameState,
            phase: 'idle',
          },
        }))
      },

      // ============================================================
      // Undo / Redo
      // ============================================================

      undo: () => {
        const { gameState } = get()
        const { phase, moveHistory } = gameState

        if (phase !== 'idle') return
        if (moveHistory.currentIndex < 0) return

        const move = moveHistory.moves[moveHistory.currentIndex]
        const nextState = undoMove(gameState)
        playSound('undo')
        hapticUndoRedo(get().ui.isMuted)

        if (move.type === 'move') {
          // BoardMove undo: 駒が to→from へ逆スライド
          set((state) => ({
            gameState: { ...nextState, phase: 'moving', isCheck: false },
            ui: {
              ...state.ui,
              hintLevel: 0, hintPieces: [], hintMoves: [],
              animatingMove: {
                piece: move.piece,
                from: move.to,
                to: move.from,
                captured: move.captured,
                pendingPhase: 'idle',
                promote: false,
                isForcedPromote: false,
                undoRedo: 'undo',
              },
            },
          }))
        } else {
          // DropMove undo: 打った駒がポップアウト（from=to=move.to）
          set((state) => ({
            gameState: { ...nextState, phase: 'moving', isCheck: false },
            ui: {
              ...state.ui,
              hintLevel: 0, hintPieces: [], hintMoves: [],
              animatingMove: {
                piece: move.piece,
                from: move.to,
                to: move.to,
                captured: null,
                pendingPhase: 'idle',
                promote: false,
                isForcedPromote: false,
                undoRedo: 'undo',
              },
            },
          }))
        }
      },

      redo: () => {
        const { gameState } = get()
        const { phase, moveHistory } = gameState

        if (phase !== 'idle') return
        if (moveHistory.currentIndex >= moveHistory.moves.length - 1) return

        const move = moveHistory.moves[moveHistory.currentIndex + 1]
        const nextState = redoMove(gameState)
        playSound('redo')
        hapticUndoRedo(get().ui.isMuted)

        if (move.type === 'move') {
          // BoardMove redo: 正方向スライド（成り済みの駒タイプで表示）
          const movedPieceType = move.promoted
            ? (getPromotedType(move.piece.type as PieceType) ?? move.piece.type)
            : move.piece.type
          set((state) => ({
            gameState: { ...nextState, phase: 'moving', isCheck: false },
            ui: {
              ...state.ui,
              hintLevel: 0, hintPieces: [], hintMoves: [],
              animatingMove: {
                piece: { type: movedPieceType, owner: move.piece.owner },
                from: move.from,
                to: move.to,
                captured: move.captured,
                pendingPhase: 'idle',
                promote: false,
                isForcedPromote: false,
                undoRedo: 'redo',
              },
            },
          }))
        } else {
          // DropMove redo: 既存 pop-in（from=null）
          set((state) => ({
            gameState: { ...nextState, phase: 'moving', isCheck: false },
            ui: {
              ...state.ui,
              hintLevel: 0, hintPieces: [], hintMoves: [],
              animatingMove: {
                piece: move.piece,
                from: null,
                to: move.to,
                captured: null,
                pendingPhase: 'idle',
                promote: false,
                isForcedPromote: false,
                undoRedo: 'redo',
              },
            },
          }))
        }
      },

      // ============================================================
      // 投了・リセット
      // ============================================================

      resign: () => {
        const { gameState } = get()
        const opponent: Player = gameState.currentPlayer === 'sente' ? 'gote' : 'sente'

        set(state => ({
          appState: 'game_over',
          gameState: {
            ...state.gameState,
            phase: 'checkmate',
            winner: opponent,
            gameOverReason: 'resign',
          },
          ui: {
            ...state.ui,
            isMenuOpen: false,
          },
        }))
      },

      goToTitle: () => {
        set(state => ({
          appState: 'title',
          gameState: createInitialGameState(),
          ui: { ...INITIAL_UI_STATE, isMuted: state.ui.isMuted },
        }))
      },

      goToPuzzleSelect: () => {
        set({ appState: 'puzzle_select' })
      },

      resetGame: () => {
        set(state => ({
          appState: 'playing',
          gameState: createInitialGameState(),
          ui: { ...INITIAL_UI_STATE, isMuted: state.ui.isMuted },
        }))
      },

      // ============================================================
      // メニュー開閉
      // ============================================================

      toggleMenu: () => {
        set(state => ({
          ui: {
            ...state.ui,
            isMenuOpen: !state.ui.isMenuOpen,
          },
        }))
      },

      clearForcedPromotion: () => {
        set(state => ({
          ui: { ...state.ui, forcedPromotionPiece: null },
        }))
      },

      toggleMute: () => {
        const { ui } = get()
        const nextMuted = !ui.isMuted
        soundEngine.setMuted(nextMuted)
        set(state => ({
          ui: { ...state.ui, isMuted: nextMuted },
        }))
      },

      // ============================================================
      // 移動アニメーション完了
      // ============================================================

      completeMoveAnimation: () => {
        const { ui } = get()
        if (!ui.animatingMove) return

        const { pendingPhase, isForcedPromote, piece, to } = ui.animatingMove

        if (isForcedPromote) {
          // 強制成り: promoting フェーズを経由してアニメーション再生
          const promotingInfo: PromotingInfo = {
            position: to,
            pieceType: piece.type as PieceType,
            isForcedPromote: true,
          }
          set(state => ({
            gameState: {
              ...state.gameState,
              phase: 'promoting',
            },
            ui: {
              ...state.ui,
              animatingMove: null,
              promotingInfo,
            },
          }))
        } else {
          set(state => ({
            gameState: {
              ...state.gameState,
              phase: pendingPhase,
            },
            ui: {
              ...state.ui,
              animatingMove: null,
            },
          }))
        }
      },

      completePromotion: () => {
        const { ui } = get()
        if (!ui.promotingInfo) return

        const { isForcedPromote, pieceType } = ui.promotingInfo

        set(state => ({
          gameState: {
            ...state.gameState,
            phase: 'turn_switching',
          },
          ui: {
            ...state.ui,
            promotingInfo: null,
            ...(isForcedPromote ? { forcedPromotionPiece: pieceType } : {}),
          },
        }))
      },

      // ============================================================
      // ヒント
      // ============================================================

      setHint: (level: 1 | 2) => {
        const { gameState } = get()
        const { board, capturedPieces, currentPlayer } = gameState

        if (level === 1) {
          const hintPieces = getMovablePieces(board, capturedPieces, currentPlayer)
          set(state => ({
            ui: { ...state.ui, hintLevel: 1, hintPieces, hintMoves: [] },
          }))
        } else {
          const result = getRecommendedMove(board, capturedPieces, currentPlayer)
          if (!result) return
          set(state => ({
            ui: {
              ...state.ui,
              hintLevel: 2,
              hintPieces: [result.piece],
              hintMoves: result.moves,
            },
          }))
        }
      },

      clearHint: () => {
        set(state => ({
          ui: { ...state.ui, hintLevel: 0, hintPieces: [], hintMoves: [] },
        }))
      },

      showHint: () => {
        const { gameState } = get()
        const { board, capturedPieces, currentPlayer } = gameState
        const result = getRecommendedMove(board, capturedPieces, currentPlayer)
        if (!result) return
        set(state => ({
          ui: {
            ...state.ui,
            hintLevel: 2,
            hintPieces: [result.piece],
            hintMoves: result.moves,
          },
        }))
      },

      clearPraise: () => {
        set(state => ({ ui: { ...state.ui, praiseMessage: null } }))
      },

      clearTurnChange: () => {
        set(state => ({ ui: { ...state.ui, turnChangePlayer: null } }))
      },
    }),

    // ============================================================
    // 永続化設定
    // ============================================================
    {
      name: 'shogyuu_game_state',
      partialize: (state) => ({
        gameState: {
          board: state.gameState.board,
          capturedPieces: state.gameState.capturedPieces,
          currentPlayer: state.gameState.currentPlayer,
          moveHistory: state.gameState.moveHistory,
        },
        ui: {
          isMuted: state.ui.isMuted,
        },
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as {
          gameState: Pick<GameState, 'board' | 'capturedPieces' | 'currentPlayer' | 'moveHistory'>
          ui?: { isMuted?: boolean }
        }
        const isMuted = persisted.ui?.isMuted ?? false
        soundEngine.setMuted(isMuted)
        return {
          ...currentState,
          gameState: {
            ...currentState.gameState,
            board: persisted.gameState.board,
            capturedPieces: persisted.gameState.capturedPieces,
            currentPlayer: persisted.gameState.currentPlayer,
            moveHistory: persisted.gameState.moveHistory,
            // 一時的なUI状態はリセット
            phase: 'idle',
            selectedPosition: null,
            selectedCaptured: null,
            legalMoves: [],
            isCheck: false,
            winner: null,
            gameOverReason: null,
          },
          ui: {
            ...currentState.ui,
            isMuted,
          },
        }
      },
    },
  ),
)
