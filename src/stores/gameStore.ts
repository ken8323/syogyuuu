import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { GameState, PieceType, Player, Position, UIState } from '../lib/shogi/types'
import { getLegalMoves, getLegalDrops, isInCheck } from '../lib/shogi/moves'
import { isCheckmate, canPromote, mustPromote } from '../lib/shogi/rules'
import { executeMove, executeDrop, undoMove, redoMove, createInitialGameState } from '../lib/shogi/game'
import { getPieceAt } from '../lib/shogi/board'

// ============================================================
// ストアの型定義
// ============================================================

interface GameStore {
  // 状態
  appState: 'title' | 'playing' | 'game_over'
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
  toggleMenu: () => void
  completeTurnSwitch: () => void
  completeCheckNotify: () => void
  clearForcedPromotion: () => void
}

// ============================================================
// 初期UI状態
// ============================================================

const INITIAL_UI_STATE: UIState = {
  isMenuOpen: false,
  isAnimating: false,
  forcedPromotionPiece: null,
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
        set({
          appState: 'playing',
          gameState: createInitialGameState(),
          ui: INITIAL_UI_STATE,
        })
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
          ui: INITIAL_UI_STATE,
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

        // 強制成りチェック
        if (mustPromote(piece, to)) {
          // 強制成り: 成りで実行して手番交代へ
          const nextState = executeMove(gameState, from, to, true)
          set(state => ({
            gameState: {
              ...nextState,
              phase: 'turn_switching',
            },
            ui: { ...state.ui, forcedPromotionPiece: piece.type as PieceType },
          }))
          return
        }

        // 任意成りチェック
        if (canPromote(piece, from, to)) {
          // 成り選択のためにまず非成りで手を実行して履歴に追加
          const nextState = executeMove(gameState, from, to, false)
          set({
            gameState: {
              ...nextState,
              phase: 'promotion_check',
            },
          })
          return
        }

        // 成りなし: 手番交代へ
        const nextState = executeMove(gameState, from, to, false)
        set({
          gameState: {
            ...nextState,
            phase: 'turn_switching',
          },
        })
      },

      // ============================================================
      // 持ち駒を打つ
      // ============================================================

      dropPiece: (to: Position) => {
        const { gameState } = get()
        const { phase, selectedCaptured, legalMoves } = gameState

        if (phase !== 'captured_selected' || !selectedCaptured) return

        // 合法手チェック
        const isLegal = legalMoves.some(p => p.row === to.row && p.col === to.col)
        if (!isLegal) return

        const nextState = executeDrop(gameState, selectedCaptured, to)
        set({
          gameState: {
            ...nextState,
            phase: 'turn_switching',
          },
        })
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
          set({
            gameState: {
              ...reExecuted,
              phase: 'turn_switching',
            },
          })
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
        const { phase, board, capturedPieces, currentPlayer } = gameState

        if (phase !== 'turn_switching') return

        // currentPlayer は executeMove/executeDrop で既に切り替わっている
        if (isCheckmate(board, capturedPieces, currentPlayer)) {
          const opponent: Player = currentPlayer === 'sente' ? 'gote' : 'sente'
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

        const nextState = undoMove(gameState)
        set({
          gameState: {
            ...nextState,
            phase: 'idle',
            isCheck: false,
          },
        })
      },

      redo: () => {
        const { gameState } = get()
        const { phase, moveHistory } = gameState

        if (phase !== 'idle') return
        if (moveHistory.currentIndex >= moveHistory.moves.length - 1) return

        const nextState = redoMove(gameState)
        set({
          gameState: {
            ...nextState,
            phase: 'idle',
            isCheck: false,
          },
        })
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
        set({
          appState: 'title',
          gameState: createInitialGameState(),
          ui: INITIAL_UI_STATE,
        })
      },

      resetGame: () => {
        set({
          appState: 'playing',
          gameState: createInitialGameState(),
          ui: INITIAL_UI_STATE,
        })
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
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as { gameState: Pick<GameState, 'board' | 'capturedPieces' | 'currentPlayer' | 'moveHistory'> }
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
        }
      },
    },
  ),
)
