import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Board, CapturedPieces, GamePhase, GameState, PieceType, Position } from '../lib/shogi/types'
import type { PuzzleDefinition, PuzzleDifficulty } from '../lib/puzzle/puzzleTypes'
import { findPuzzleById, getNextPuzzleId } from '../lib/puzzle/puzzleData'
import { getLegalMoves, getLegalDrops, isInCheck } from '../lib/shogi/moves'
import { isCheckmate, canPromote, mustPromote } from '../lib/shogi/rules'
import { executeMove, executeDrop } from '../lib/shogi/game'
import { getPieceAt } from '../lib/shogi/board'
import { playSound } from '../lib/sound/soundEngine'
import { hapticSelect, hapticPlace, hapticCapture, hapticCheck, hapticCheckmate } from '../lib/haptics'

// ============================================================
// パズル用 GameState を生成
// ============================================================

function createPuzzleGameState(puzzle: PuzzleDefinition): GameState {
  // 盤面をディープコピー
  const board: Board = puzzle.board.map(row => row.map(cell => cell ? { ...cell } : null))

  const capturedPieces: CapturedPieces = {
    sente: { ...puzzle.attackerCaptured },
    gote: {},
  }

  return {
    board,
    capturedPieces,
    currentPlayer: 'sente',
    phase: 'idle',
    selectedPosition: null,
    selectedCaptured: null,
    legalMoves: [],
    moveHistory: { moves: [], currentIndex: -1 },
    isCheck: false,
    winner: null,
    gameOverReason: null,
  }
}

// ============================================================
// ストアの型定義
// ============================================================

interface PuzzleStore {
  // 状態
  currentPuzzleId: string | null
  solvedPuzzleIds: string[]
  moveIndex: number
  gameState: GameState
  phase: GamePhase
  isCorrect: boolean | null       // null=判定前, true=正解, false=不正解
  isAutoPlaying: boolean           // 相手応手の自動再生中
  hintPieces: Position[]           // ヒント対象の駒位置
  isMuted: boolean

  // アクション
  startPuzzle: (puzzleId: string) => void
  selectPiece: (position: Position) => void
  selectCapturedPiece: (pieceType: PieceType) => void
  deselectPiece: () => void
  movePiece: (to: Position) => void
  dropPiece: (to: Position) => void
  promote: (doPromote: boolean) => void
  resetPuzzle: () => void
  goToNextPuzzle: () => string | null
  showHint: () => void
  clearHint: () => void
  toggleMute: () => void
  isSolved: (puzzleId: string) => boolean
  getSolvedCount: (difficulty: PuzzleDifficulty) => number
}

// ============================================================
// 初期 GameState（ストア初期化用）
// ============================================================

const EMPTY_GAME_STATE: GameState = {
  board: Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => null)),
  capturedPieces: { sente: {}, gote: {} },
  currentPlayer: 'sente',
  phase: 'idle',
  selectedPosition: null,
  selectedCaptured: null,
  legalMoves: [],
  moveHistory: { moves: [], currentIndex: -1 },
  isCheck: false,
  winner: null,
  gameOverReason: null,
}

// ============================================================
// ストア実装
// ============================================================

export const usePuzzleStore = create<PuzzleStore>()(
  persist(
    (set, get) => ({
      // 初期状態
      currentPuzzleId: null,
      solvedPuzzleIds: [],
      moveIndex: 0,
      gameState: EMPTY_GAME_STATE,
      phase: 'idle',
      isCorrect: null,
      isAutoPlaying: false,
      hintPieces: [],
      isMuted: false,

      // ============================================================
      // パズル開始
      // ============================================================

      startPuzzle: (puzzleId: string) => {
        const puzzle = findPuzzleById(puzzleId)
        if (!puzzle) return

        set({
          currentPuzzleId: puzzleId,
          moveIndex: 0,
          gameState: createPuzzleGameState(puzzle),
          phase: 'idle',
          isCorrect: null,
          isAutoPlaying: false,
          hintPieces: [],
        })
      },

      // ============================================================
      // 駒の選択
      // ============================================================

      selectPiece: (position: Position) => {
        const { gameState, isAutoPlaying, isCorrect, isMuted } = get()
        if (isAutoPlaying || isCorrect !== null) return
        if (gameState.currentPlayer !== 'sente') return

        const piece = getPieceAt(gameState.board, position)
        if (!piece || piece.owner !== 'sente') return

        const legalMoves = getLegalMoves(gameState.board, position, gameState.capturedPieces, gameState.currentPlayer)
        if (legalMoves.length === 0) return

        hapticSelect(isMuted)

        set({
          gameState: {
            ...gameState,
            phase: 'piece_selected',
            selectedPosition: position,
            selectedCaptured: null,
            legalMoves,
          },
          phase: 'piece_selected',
          hintPieces: [],
        })
      },

      selectCapturedPiece: (pieceType: PieceType) => {
        const { gameState, isAutoPlaying, isCorrect, isMuted } = get()
        if (isAutoPlaying || isCorrect !== null) return
        if (gameState.currentPlayer !== 'sente') return

        const count = gameState.capturedPieces.sente[pieceType] ?? 0
        if (count === 0) return

        const legalDrops = getLegalDrops(gameState.board, gameState.currentPlayer, pieceType, gameState.capturedPieces)
        if (legalDrops.length === 0) return

        hapticSelect(isMuted)

        set({
          gameState: {
            ...gameState,
            phase: 'captured_selected',
            selectedPosition: null,
            selectedCaptured: pieceType,
            legalMoves: legalDrops,
          },
          phase: 'captured_selected',
          hintPieces: [],
        })
      },

      deselectPiece: () => {
        const { gameState } = get()
        set({
          gameState: {
            ...gameState,
            phase: 'idle',
            selectedPosition: null,
            selectedCaptured: null,
            legalMoves: [],
          },
          phase: 'idle',
        })
      },

      // ============================================================
      // 駒の移動
      // ============================================================

      movePiece: (to: Position) => {
        const state = get()
        const { gameState, moveIndex, currentPuzzleId, isMuted } = state
        if (!currentPuzzleId) return

        const from = gameState.selectedPosition
        if (!from) return

        const puzzle = findPuzzleById(currentPuzzleId)
        if (!puzzle) return

        const piece = getPieceAt(gameState.board, from)
        if (!piece) return

        // 成り判定
        const canProm = canPromote(piece, from, to)
        const forced = mustPromote(piece, to)

        if (canProm && !forced) {
          // 成り選択が必要 — movePiece の移動先を保持するため gameState に記録
          set({
            gameState: {
              ...gameState,
              phase: 'promotion_check',
              legalMoves: [to],  // 移動先を保持
            },
            phase: 'promotion_check',
          })
          return
        }

        const doPromote = forced
        const newGameState = executeMove(gameState, from, to, doPromote)

        // 効果音・触覚
        const captured = getPieceAt(gameState.board, to)
        if (captured) {
          hapticCapture(isMuted)
          playSound('capture')
        } else {
          hapticPlace(isMuted)
          playSound('place')
        }

        handleMoveResult(set, get, newGameState, moveIndex, puzzle, to, from, doPromote)
      },

      dropPiece: (to: Position) => {
        const state = get()
        const { gameState, moveIndex, currentPuzzleId, isMuted } = state
        if (!currentPuzzleId) return

        const pieceType = gameState.selectedCaptured
        if (!pieceType) return

        const puzzle = findPuzzleById(currentPuzzleId)
        if (!puzzle) return

        const newGameState = executeDrop(gameState, pieceType, to)

        hapticPlace(isMuted)
        playSound('place')

        handleMoveResult(set, get, newGameState, moveIndex, puzzle, to, null, false, pieceType)
      },

      promote: (doPromote: boolean) => {
        const state = get()
        const { gameState, moveIndex, currentPuzzleId, isMuted } = state
        if (!currentPuzzleId) return

        const from = gameState.selectedPosition
        if (!from) return

        const puzzle = findPuzzleById(currentPuzzleId)
        if (!puzzle) return

        // promotion_check 時に legalMoves[0] に移動先を保持している
        const to = gameState.legalMoves[0]
        if (!to) return

        const newGameState = executeMove(gameState, from, to, doPromote)

        const captured = getPieceAt(gameState.board, to)
        if (captured) {
          hapticCapture(isMuted)
          playSound('capture')
        } else {
          hapticPlace(isMuted)
          playSound('place')
        }

        handleMoveResult(set, get, newGameState, moveIndex, puzzle, to, from, doPromote)
      },

      // ============================================================
      // パズルリセット
      // ============================================================

      resetPuzzle: () => {
        const { currentPuzzleId } = get()
        if (!currentPuzzleId) return

        const puzzle = findPuzzleById(currentPuzzleId)
        if (!puzzle) return

        set({
          moveIndex: 0,
          gameState: createPuzzleGameState(puzzle),
          phase: 'idle',
          isCorrect: null,
          isAutoPlaying: false,
          hintPieces: [],
        })
      },

      // ============================================================
      // 次のパズルへ
      // ============================================================

      goToNextPuzzle: () => {
        const { currentPuzzleId } = get()
        if (!currentPuzzleId) return null

        const nextId = getNextPuzzleId(currentPuzzleId)
        if (!nextId) return null

        const puzzle = findPuzzleById(nextId)
        if (!puzzle) return null

        set({
          currentPuzzleId: nextId,
          moveIndex: 0,
          gameState: createPuzzleGameState(puzzle),
          phase: 'idle',
          isCorrect: null,
          isAutoPlaying: false,
          hintPieces: [],
        })

        return nextId
      },

      // ============================================================
      // ヒント
      // ============================================================

      showHint: () => {
        const { currentPuzzleId, moveIndex } = get()
        if (!currentPuzzleId) return

        const puzzle = findPuzzleById(currentPuzzleId)
        if (!puzzle) return

        const step = puzzle.solution[moveIndex]
        if (!step) return

        if (step.from) {
          set({ hintPieces: [step.from] })
        } else {
          set({ hintPieces: [step.to] })
        }
      },

      clearHint: () => {
        set({ hintPieces: [] })
      },

      toggleMute: () => {
        set(state => ({ isMuted: !state.isMuted }))
      },

      isSolved: (puzzleId: string) => {
        return get().solvedPuzzleIds.includes(puzzleId)
      },

      getSolvedCount: (difficulty: PuzzleDifficulty) => {
        const { solvedPuzzleIds } = get()
        return solvedPuzzleIds.filter(id => id.startsWith(difficulty)).length
      },
    }),
    {
      name: 'shogyuu_puzzle_state',
      partialize: (state) => ({
        solvedPuzzleIds: state.solvedPuzzleIds,
        isMuted: state.isMuted,
      }),
    },
  ),
)

// ============================================================
// 手の結果を判定するヘルパー
// ============================================================

function handleMoveResult(
  set: (partial: Partial<PuzzleStore> | ((state: PuzzleStore) => Partial<PuzzleStore>)) => void,
  get: () => PuzzleStore,
  newGameState: GameState,
  moveIndex: number,
  puzzle: PuzzleDefinition,
  to: Position,
  from: Position | null,
  doPromote: boolean,
  dropPieceType?: PieceType,
) {
  const solution = puzzle.solution
  const currentStep = solution[moveIndex]
  const { isMuted } = get()

  // 手が正解手順と一致するかチェック
  const isStepCorrect = checkStepMatch(currentStep, from, to, doPromote, dropPieceType)

  if (puzzle.difficulty === '1te') {
    // 1手詰め: 指した手で詰みかどうか
    const checkmate = isCheckmate(newGameState.board, newGameState.capturedPieces, newGameState.currentPlayer)

    if (checkmate) {
      hapticCheckmate(isMuted)
      playSound('victory')
      markSolved(set, get, puzzle.id, newGameState)
    } else {
      playSound('place')
      set({
        gameState: { ...newGameState, phase: 'idle' },
        phase: 'idle',
        isCorrect: false,
      })
    }
  } else {
    // 3手詰め
    if (!isStepCorrect) {
      set({
        gameState: { ...newGameState, phase: 'idle' },
        phase: 'idle',
        isCorrect: false,
      })
      return
    }

    const nextMoveIndex = moveIndex + 1

    if (nextMoveIndex >= solution.length) {
      // 最後の手（3手目）: 詰みチェック
      const checkmate = isCheckmate(newGameState.board, newGameState.capturedPieces, newGameState.currentPlayer)
      if (checkmate) {
        hapticCheckmate(isMuted)
        playSound('victory')
        markSolved(set, get, puzzle.id, newGameState)
      } else {
        set({
          gameState: { ...newGameState, phase: 'idle' },
          phase: 'idle',
          isCorrect: false,
        })
      }
      return
    }

    // 正解手だが途中（1手目）: 相手の応手を自動再生
    const opponentStep = solution[nextMoveIndex]
    if (!opponentStep) return

    // 王手通知
    const inCheck = isInCheck(newGameState.board, newGameState.currentPlayer)
    if (inCheck) {
      hapticCheck(isMuted)
      playSound('check')
    }

    set({
      gameState: { ...newGameState, phase: 'idle' },
      phase: 'idle',
      moveIndex: nextMoveIndex,
      isAutoPlaying: true,
    })

    // 0.5秒後に相手の応手を実行
    setTimeout(() => {
      const state = get()
      if (state.currentPuzzleId !== puzzle.id) return

      let autoGameState: GameState
      if (opponentStep.from) {
        autoGameState = executeMove(state.gameState, opponentStep.from, opponentStep.to, opponentStep.promote ?? false)
      } else if (opponentStep.pieceType) {
        autoGameState = executeDrop(state.gameState, opponentStep.pieceType, opponentStep.to)
      } else {
        return
      }

      hapticPlace(state.isMuted)
      playSound('place')

      set({
        gameState: { ...autoGameState, phase: 'idle' },
        phase: 'idle',
        moveIndex: nextMoveIndex + 1,
        isAutoPlaying: false,
      })
    }, 500)
  }
}

function checkStepMatch(
  step: { from: Position | null; to: Position; pieceType?: PieceType; promote?: boolean } | undefined,
  from: Position | null,
  to: Position,
  promote: boolean,
  dropPieceType?: PieceType,
): boolean {
  if (!step) return false

  if (step.to.row !== to.row || step.to.col !== to.col) return false

  if (step.from === null) {
    return from === null && step.pieceType === dropPieceType
  }

  if (!from || step.from.row !== from.row || step.from.col !== from.col) return false

  if (step.promote && !promote) return false

  return true
}

function markSolved(
  set: (partial: Partial<PuzzleStore> | ((state: PuzzleStore) => Partial<PuzzleStore>)) => void,
  get: () => PuzzleStore,
  puzzleId: string,
  newGameState: GameState,
) {
  const { solvedPuzzleIds } = get()
  const newSolved = solvedPuzzleIds.includes(puzzleId)
    ? solvedPuzzleIds
    : [...solvedPuzzleIds, puzzleId]

  set({
    gameState: { ...newGameState, phase: 'checkmate' },
    phase: 'checkmate',
    isCorrect: true,
    solvedPuzzleIds: newSolved,
  })
}
