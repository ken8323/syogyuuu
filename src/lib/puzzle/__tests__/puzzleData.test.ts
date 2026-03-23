import { describe, it, expect } from 'vitest'
import { PUZZLES_1TE, PUZZLES_3TE } from '../puzzleData'
import type { PuzzleDefinition } from '../puzzleTypes'
import type { Board, CapturedPieces } from '@/lib/shogi/types'
import { executeMove, executeDrop } from '@/lib/shogi/game'
import { isCheckmate } from '@/lib/shogi/rules'
import { isInCheck } from '@/lib/shogi/moves'
import { getLegalMoves, getLegalDrops } from '@/lib/shogi/moves'
import { getPieceAt } from '@/lib/shogi/board'

function createPuzzleGameState(puzzle: PuzzleDefinition): GameState {
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

describe('1手詰めパズル', () => {
  PUZZLES_1TE.forEach((puzzle) => {
    it(`${puzzle.id}: 正解手で詰みになる`, () => {
      let state = createPuzzleGameState(puzzle)
      const step = puzzle.solution[0]

      // 正解手を実行
      if (step.from) {
        state = executeMove(state, step.from, step.to, step.promote ?? false)
      } else if (step.pieceType) {
        state = executeDrop(state, step.pieceType, step.to)
      }

      // 詰み判定
      const mated = isCheckmate(state.board, state.capturedPieces, state.currentPlayer)
      expect(mated).toBe(true)
    })

    it(`${puzzle.id}: 正解手が合法手に含まれる`, () => {
      const state = createPuzzleGameState(puzzle)
      const step = puzzle.solution[0]

      if (step.from) {
        // 盤上移動: 移動元に先手の駒があり、移動先が合法手に含まれる
        const piece = getPieceAt(state.board, step.from)
        expect(piece).not.toBeNull()
        expect(piece!.owner).toBe('sente')
        const moves = getLegalMoves(state.board, step.from, state.capturedPieces, 'sente')
        expect(moves.some(m => m.row === step.to.row && m.col === step.to.col)).toBe(true)
      } else if (step.pieceType) {
        // 持ち駒打ち: 持ち駒があり、打てる場所に含まれる
        expect((state.capturedPieces.sente[step.pieceType] ?? 0) > 0).toBe(true)
        const drops = getLegalDrops(state.board, 'sente', step.pieceType, state.capturedPieces)
        expect(drops.some(d => d.row === step.to.row && d.col === step.to.col)).toBe(true)
      }
    })
  })
})

describe('3手詰めパズル', () => {
  PUZZLES_3TE.forEach((puzzle) => {
    it(`${puzzle.id}: 3手で詰みになる`, () => {
      let state = createPuzzleGameState(puzzle)

      // 1手目（先手）
      const step1 = puzzle.solution[0]
      if (step1.from) {
        state = executeMove(state, step1.from, step1.to, step1.promote ?? false)
      } else if (step1.pieceType) {
        state = executeDrop(state, step1.pieceType, step1.to)
      }

      // 1手目で王手になっていること
      expect(isInCheck(state.board, state.currentPlayer)).toBe(true)
      // 1手目で詰みではないこと（3手詰めなので）
      expect(isCheckmate(state.board, state.capturedPieces, state.currentPlayer)).toBe(false)

      // 2手目（後手の応手）
      const step2 = puzzle.solution[1]
      if (step2.from) {
        state = executeMove(state, step2.from, step2.to, step2.promote ?? false)
      } else if (step2.pieceType) {
        state = executeDrop(state, step2.pieceType, step2.to)
      }

      // 3手目（先手）
      const step3 = puzzle.solution[2]
      if (step3.from) {
        state = executeMove(state, step3.from, step3.to, step3.promote ?? false)
      } else if (step3.pieceType) {
        state = executeDrop(state, step3.pieceType, step3.to)
      }

      // 3手目で詰み
      const mated = isCheckmate(state.board, state.capturedPieces, state.currentPlayer)
      expect(mated).toBe(true)
    })

    it(`${puzzle.id}: 各手が合法手`, () => {
      let state = createPuzzleGameState(puzzle)

      for (let i = 0; i < puzzle.solution.length; i++) {
        const step = puzzle.solution[i]
        const player = state.currentPlayer

        if (step.from) {
          const piece = getPieceAt(state.board, step.from)
          expect(piece).not.toBeNull()
          expect(piece!.owner).toBe(player)
          const moves = getLegalMoves(state.board, step.from, state.capturedPieces, player)
          expect(moves.some(m => m.row === step.to.row && m.col === step.to.col)).toBe(true)
          state = executeMove(state, step.from, step.to, step.promote ?? false)
        } else if (step.pieceType) {
          const count = state.capturedPieces[player][step.pieceType] ?? 0
          expect(count).toBeGreaterThan(0)
          const drops = getLegalDrops(state.board, player, step.pieceType, state.capturedPieces)
          expect(drops.some(d => d.row === step.to.row && d.col === step.to.col)).toBe(true)
          state = executeDrop(state, step.pieceType, step.to)
        }
      }
    })
  })
})
