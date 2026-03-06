import { describe, it, expect } from 'vitest'
import {
  createInitialGameState,
  executeMove,
  executeDrop,
  undoMove,
  redoMove,
} from '../game'
import {
  createInitialCapturedPieces,
  addCapturedPiece,
  getPieceAt,
} from '../board'
import type { GameState } from '../types'

// 空の盤面を作るヘルパー
function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null))
}

// テスト用の最小GameStateを構築するヘルパー
function makeState(overrides: Partial<GameState> = {}): GameState {
  return {
    ...createInitialGameState(),
    ...overrides,
  }
}

describe('createInitialGameState', () => {
  it('currentPlayer は sente', () => {
    const state = createInitialGameState()
    expect(state.currentPlayer).toBe('sente')
  })

  it('phase は idle', () => {
    const state = createInitialGameState()
    expect(state.phase).toBe('idle')
  })

  it('legalMoves は空配列', () => {
    const state = createInitialGameState()
    expect(state.legalMoves).toHaveLength(0)
  })

  it('moveHistory.currentIndex は -1', () => {
    const state = createInitialGameState()
    expect(state.moveHistory.currentIndex).toBe(-1)
  })

  it('moveHistory.moves は空配列', () => {
    const state = createInitialGameState()
    expect(state.moveHistory.moves).toHaveLength(0)
  })

  it('isCheck は false', () => {
    const state = createInitialGameState()
    expect(state.isCheck).toBe(false)
  })

  it('winner は null', () => {
    const state = createInitialGameState()
    expect(state.winner).toBeNull()
  })
})

describe('executeMove: 基本的な移動', () => {
  it('駒が移動先に正しく配置される', () => {
    const board = emptyBoard()
    board[6][4] = { type: 'pawn', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(getPieceAt(next.board, { row: 5, col: 4 })?.type).toBe('pawn')
    expect(getPieceAt(next.board, { row: 5, col: 4 })?.owner).toBe('sente')
  })

  it('移動元のマスが空になる', () => {
    const board = emptyBoard()
    board[6][4] = { type: 'pawn', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(getPieceAt(next.board, { row: 6, col: 4 })).toBeNull()
  })

  it('currentPlayer が手番交代後に gote に変わる', () => {
    const state = createInitialGameState()
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(next.currentPlayer).toBe('gote')
  })

  it('moveHistory.currentIndex が 0 に増える', () => {
    const state = createInitialGameState()
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(next.moveHistory.currentIndex).toBe(0)
  })

  it('moveHistory.moves に1手が追加される', () => {
    const state = createInitialGameState()
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(next.moveHistory.moves).toHaveLength(1)
  })
})

describe('executeMove: 駒を取る', () => {
  it('敵駒を取ると capturedPieces に追加される', () => {
    const board = emptyBoard()
    board[5][4] = { type: 'pawn', owner: 'gote' }
    board[6][4] = { type: 'rook', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(next.capturedPieces.sente.pawn).toBe(1)
  })

  it('成駒を取ると元の駒種（demoted）として capturedPieces に入る', () => {
    const board = emptyBoard()
    board[5][4] = { type: 'promoted_pawn', owner: 'gote' }
    board[6][4] = { type: 'rook', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const next = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    // promoted_pawn を取ると pawn として持ち駒に入る
    expect(next.capturedPieces.sente.pawn).toBe(1)
    expect(next.capturedPieces.sente.promoted_pawn).toBeUndefined()
  })
})

describe('executeMove: 成り', () => {
  it('promote=true のとき駒が成駒に変わる', () => {
    const board = emptyBoard()
    board[3][4] = { type: 'pawn', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const next = executeMove(state, { row: 3, col: 4 }, { row: 2, col: 4 }, true)
    expect(getPieceAt(next.board, { row: 2, col: 4 })?.type).toBe('promoted_pawn')
  })

  it('promote=false のとき駒の種類は変わらない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'silver', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const next = executeMove(state, { row: 4, col: 4 }, { row: 3, col: 4 }, false)
    expect(getPieceAt(next.board, { row: 3, col: 4 })?.type).toBe('silver')
  })
})

describe('executeDrop', () => {
  it('持ち駒が盤面に配置される', () => {
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board, capturedPieces: captured })
    const next = executeDrop(state, 'pawn', { row: 5, col: 4 })
    expect(getPieceAt(next.board, { row: 5, col: 4 })?.type).toBe('pawn')
    expect(getPieceAt(next.board, { row: 5, col: 4 })?.owner).toBe('sente')
  })

  it('持ち駒の枚数が減る', () => {
    const captured = addCapturedPiece(
      addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn'),
      'sente',
      'pawn',
    )
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board, capturedPieces: captured })
    const next = executeDrop(state, 'pawn', { row: 5, col: 4 })
    expect(next.capturedPieces.sente.pawn).toBe(1)
  })

  it('持ち駒が1枚のときに打つとキーが削除される', () => {
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board, capturedPieces: captured })
    const next = executeDrop(state, 'pawn', { row: 5, col: 4 })
    expect(next.capturedPieces.sente.pawn).toBeUndefined()
  })

  it('手を打つと currentPlayer が切り替わる', () => {
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board, capturedPieces: captured })
    const next = executeDrop(state, 'pawn', { row: 5, col: 4 })
    expect(next.currentPlayer).toBe('gote')
  })
})

describe('undoMove', () => {
  it('moveHistory.currentIndex が -1 のときは状態を変えない', () => {
    const state = createInitialGameState()
    const result = undoMove(state)
    expect(result).toBe(state)
  })

  it('undoすると盤面が1手前の状態に戻る', () => {
    const state = createInitialGameState()
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    const undone = undoMove(after)
    expect(getPieceAt(undone.board, { row: 6, col: 4 })?.type).toBe('pawn')
    expect(getPieceAt(undone.board, { row: 5, col: 4 })).toBeNull()
  })

  it('undoすると移動元のマスに駒が戻る', () => {
    const state = createInitialGameState()
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    const undone = undoMove(after)
    expect(getPieceAt(undone.board, { row: 6, col: 4 })?.owner).toBe('sente')
  })

  it('undoすると currentPlayer が元に戻る', () => {
    const state = createInitialGameState()
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    const undone = undoMove(after)
    expect(undone.currentPlayer).toBe('sente')
  })

  it('undoすると moveHistory.currentIndex が 1 減る', () => {
    const state = createInitialGameState()
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(after.moveHistory.currentIndex).toBe(0)
    const undone = undoMove(after)
    expect(undone.moveHistory.currentIndex).toBe(-1)
  })

  it('取られた駒が盤面に戻り、持ち駒から除去される', () => {
    const board = emptyBoard()
    board[5][4] = { type: 'pawn', owner: 'gote' }
    board[6][4] = { type: 'rook', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const state = makeState({ board })
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    expect(after.capturedPieces.sente.pawn).toBe(1)
    const undone = undoMove(after)
    expect(getPieceAt(undone.board, { row: 5, col: 4 })?.type).toBe('pawn')
    expect(getPieceAt(undone.board, { row: 5, col: 4 })?.owner).toBe('gote')
    expect(undone.capturedPieces.sente.pawn).toBeUndefined()
  })
})

describe('redoMove', () => {
  it('redo できる手がない場合は状態を変えない', () => {
    const state = createInitialGameState()
    const result = redoMove(state)
    expect(result).toBe(state)
  })

  it('undoした手をredoすると元の移動が再実行される', () => {
    const state = createInitialGameState()
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    const undone = undoMove(after)
    const redone = redoMove(undone)
    expect(getPieceAt(redone.board, { row: 5, col: 4 })?.type).toBe('pawn')
    expect(getPieceAt(redone.board, { row: 6, col: 4 })).toBeNull()
  })

  it('redoすると currentPlayer が再び切り替わる', () => {
    const state = createInitialGameState()
    const after = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    const undone = undoMove(after)
    expect(undone.currentPlayer).toBe('sente')
    const redone = redoMove(undone)
    expect(redone.currentPlayer).toBe('gote')
  })
})

describe('executeMove after undo: redo履歴がクリアされる', () => {
  it('undoした後に新しい手を指すとredo履歴が削除される', () => {
    const state = createInitialGameState()
    const step1 = executeMove(state, { row: 6, col: 4 }, { row: 5, col: 4 }, false)
    const step2 = executeMove(step1, { row: 2, col: 4 }, { row: 3, col: 4 }, false)
    // step1 の状態まで戻す（2手undo）
    const undone1 = undoMove(step2)
    const undone2 = undoMove(undone1)
    expect(undone2.moveHistory.currentIndex).toBe(-1)
    expect(undone2.moveHistory.moves).toHaveLength(2) // 履歴は残っている
    // 新しい手を指す
    const newStep = executeMove(undone2, { row: 6, col: 6 }, { row: 5, col: 6 }, false)
    // redo できる手はなくなる（moves が1手のみになる）
    expect(newStep.moveHistory.moves).toHaveLength(1)
    expect(newStep.moveHistory.currentIndex).toBe(0)
  })
})
