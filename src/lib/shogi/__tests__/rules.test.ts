import { describe, it, expect } from 'vitest'
import {
  isNifu,
  hasNoEscape,
  canPromote,
  mustPromote,
  getPromotedType,
  getDemotedType,
  isInCheck,
  isCheckmate,
  isUchifuzume,
} from '../rules'
import {
  createInitialBoard,
  createInitialCapturedPieces,
  addCapturedPiece,
} from '../board'
import type { Board, Piece } from '../types'

// 空の盤面を作るヘルパー
function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null))
}

describe('isNifu', () => {
  it('同じ筋に先手の歩がある場合 true を返す', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'pawn', owner: 'sente' }
    expect(isNifu(board, 'sente', 4)).toBe(true)
  })

  it('同じ筋に歩がない場合 false を返す', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'pawn', owner: 'sente' }
    expect(isNifu(board, 'sente', 5)).toBe(false)
  })

  it('相手の歩は二歩判定に含まれない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'pawn', owner: 'gote' }
    // 先手の二歩判定では後手の歩はカウントしない
    expect(isNifu(board, 'sente', 4)).toBe(false)
  })

  it('成り歩（と金）は二歩判定に含まれない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'promoted_pawn', owner: 'sente' }
    expect(isNifu(board, 'sente', 4)).toBe(false)
  })
})

describe('hasNoEscape', () => {
  it('先手の歩が row0 に移動すると行き所なし', () => {
    expect(hasNoEscape('pawn', 'sente', { row: 0, col: 4 })).toBe(true)
  })

  it('先手の香車が row0 に移動すると行き所なし', () => {
    expect(hasNoEscape('lance', 'sente', { row: 0, col: 4 })).toBe(true)
  })

  it('先手の桂馬が row1 に移動すると行き所なし', () => {
    expect(hasNoEscape('knight', 'sente', { row: 1, col: 4 })).toBe(true)
  })

  it('先手の桂馬が row0 に移動すると行き所なし', () => {
    expect(hasNoEscape('knight', 'sente', { row: 0, col: 4 })).toBe(true)
  })

  it('先手の歩が row1 に移動しても行き所なしでない', () => {
    expect(hasNoEscape('pawn', 'sente', { row: 1, col: 4 })).toBe(false)
  })

  it('後手の歩が row8 に移動すると行き所なし', () => {
    expect(hasNoEscape('pawn', 'gote', { row: 8, col: 4 })).toBe(true)
  })

  it('後手の桂馬が row7 に移動すると行き所なし', () => {
    expect(hasNoEscape('knight', 'gote', { row: 7, col: 4 })).toBe(true)
  })

  it('後手の桂馬が row6 に移動しても行き所なしでない', () => {
    expect(hasNoEscape('knight', 'gote', { row: 6, col: 4 })).toBe(false)
  })

  it('先手の金将は row0 でも行き所なしでない（金将は行き所なし対象外）', () => {
    expect(hasNoEscape('gold', 'sente', { row: 0, col: 4 })).toBe(false)
  })
})

describe('canPromote', () => {
  it('先手の歩が敵陣（row2）に入る手は成れる', () => {
    const piece: Piece = { type: 'pawn', owner: 'sente' }
    expect(canPromote(piece, { row: 3, col: 4 }, { row: 2, col: 4 })).toBe(true)
  })

  it('先手の歩が敵陣（row2）から出る手は成れる', () => {
    const piece: Piece = { type: 'pawn', owner: 'sente' }
    expect(canPromote(piece, { row: 2, col: 4 }, { row: 3, col: 4 })).toBe(true)
  })

  it('先手の歩が敵陣外（row3→row4）への移動は成れない', () => {
    const piece: Piece = { type: 'pawn', owner: 'sente' }
    expect(canPromote(piece, { row: 4, col: 4 }, { row: 3, col: 4 })).toBe(false)
  })

  it('金将は成れない', () => {
    const piece: Piece = { type: 'gold', owner: 'sente' }
    expect(canPromote(piece, { row: 3, col: 4 }, { row: 2, col: 4 })).toBe(false)
  })

  it('王将は成れない', () => {
    const piece: Piece = { type: 'king', owner: 'sente' }
    expect(canPromote(piece, { row: 3, col: 4 }, { row: 2, col: 4 })).toBe(false)
  })

  it('既に成っている駒（promoted_pawn）は成れない', () => {
    const piece: Piece = { type: 'promoted_pawn', owner: 'sente' }
    expect(canPromote(piece, { row: 3, col: 4 }, { row: 2, col: 4 })).toBe(false)
  })

  it('後手の歩が敵陣（row6）に入る手は成れる', () => {
    const piece: Piece = { type: 'pawn', owner: 'gote' }
    expect(canPromote(piece, { row: 5, col: 4 }, { row: 6, col: 4 })).toBe(true)
  })
})

describe('mustPromote', () => {
  it('先手の歩が row0 に移動するのは強制成り', () => {
    const piece: Piece = { type: 'pawn', owner: 'sente' }
    expect(mustPromote(piece, { row: 0, col: 4 })).toBe(true)
  })

  it('先手の桂馬が row1 に移動するのは強制成り', () => {
    const piece: Piece = { type: 'knight', owner: 'sente' }
    expect(mustPromote(piece, { row: 1, col: 4 })).toBe(true)
  })

  it('先手の桂馬が row2 に移動するのは強制成りでない', () => {
    const piece: Piece = { type: 'knight', owner: 'sente' }
    expect(mustPromote(piece, { row: 2, col: 4 })).toBe(false)
  })

  it('後手の歩が row8 に移動するのは強制成り', () => {
    const piece: Piece = { type: 'pawn', owner: 'gote' }
    expect(mustPromote(piece, { row: 8, col: 4 })).toBe(true)
  })

  it('後手の桂馬が row7 に移動するのは強制成り', () => {
    const piece: Piece = { type: 'knight', owner: 'gote' }
    expect(mustPromote(piece, { row: 7, col: 4 })).toBe(true)
  })

  it('先手の金将は row0 でも強制成りでない', () => {
    const piece: Piece = { type: 'gold', owner: 'sente' }
    expect(mustPromote(piece, { row: 0, col: 4 })).toBe(false)
  })
})

describe('getPromotedType', () => {
  it('歩は promoted_pawn になる', () => {
    expect(getPromotedType('pawn')).toBe('promoted_pawn')
  })

  it('飛車は promoted_rook になる', () => {
    expect(getPromotedType('rook')).toBe('promoted_rook')
  })

  it('角行は promoted_bishop になる', () => {
    expect(getPromotedType('bishop')).toBe('promoted_bishop')
  })

  it('銀将は promoted_silver になる', () => {
    expect(getPromotedType('silver')).toBe('promoted_silver')
  })

  it('桂馬は promoted_knight になる', () => {
    expect(getPromotedType('knight')).toBe('promoted_knight')
  })

  it('香車は promoted_lance になる', () => {
    expect(getPromotedType('lance')).toBe('promoted_lance')
  })

  it('王将は null を返す（成れない）', () => {
    expect(getPromotedType('king')).toBeNull()
  })

  it('金将は null を返す（成れない）', () => {
    expect(getPromotedType('gold')).toBeNull()
  })
})

describe('getDemotedType', () => {
  it('promoted_pawn は pawn に戻る', () => {
    expect(getDemotedType('promoted_pawn')).toBe('pawn')
  })

  it('promoted_rook は rook に戻る', () => {
    expect(getDemotedType('promoted_rook')).toBe('rook')
  })

  it('promoted_bishop は bishop に戻る', () => {
    expect(getDemotedType('promoted_bishop')).toBe('bishop')
  })

  it('promoted_silver は silver に戻る', () => {
    expect(getDemotedType('promoted_silver')).toBe('silver')
  })

  it('promoted_knight は knight に戻る', () => {
    expect(getDemotedType('promoted_knight')).toBe('knight')
  })

  it('promoted_lance は lance に戻る', () => {
    expect(getDemotedType('promoted_lance')).toBe('lance')
  })
})

describe('isInCheck（rules.ts 経由）', () => {
  it('飛車による王手を検出する', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'rook', owner: 'gote' }
    board[0][0] = { type: 'king', owner: 'gote' }
    expect(isInCheck(board, 'sente')).toBe(true)
  })

  it('初期盤面では王手がかかっていない', () => {
    const board = createInitialBoard()
    expect(isInCheck(board, 'sente')).toBe(false)
    expect(isInCheck(board, 'gote')).toBe(false)
  })
})

describe('isCheckmate', () => {
  it('詰みの盤面を正しく検出する', () => {
    // 先手の王（row8 col4）が後手の飛車・金で詰んでいる状況を構築
    // 王の周囲を全て封じる
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    // 後手の金で逃げ道を塞ぐ
    board[7][3] = { type: 'gold', owner: 'gote' }
    board[7][4] = { type: 'gold', owner: 'gote' }
    board[7][5] = { type: 'gold', owner: 'gote' }
    board[8][3] = { type: 'gold', owner: 'gote' }
    board[8][5] = { type: 'gold', owner: 'gote' }
    // 後手の飛車で王手
    board[6][4] = { type: 'rook', owner: 'gote' }
    board[0][0] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    expect(isCheckmate(board, captured, 'sente')).toBe(true)
  })

  it('詰みでない場合は false を返す', () => {
    const board = createInitialBoard()
    const captured = createInitialCapturedPieces()
    expect(isCheckmate(board, captured, 'sente')).toBe(false)
  })

  it('王手でなくても合法手がなければ詰み', () => {
    // 先手の王だけ。後手の駒に包囲されて動けない状況
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    // 全8方向を後手の金で封鎖（王手はかけずに包囲）
    board[7][3] = { type: 'gold', owner: 'gote' }
    board[7][4] = { type: 'gold', owner: 'gote' }
    board[7][5] = { type: 'gold', owner: 'gote' }
    board[8][3] = { type: 'gold', owner: 'gote' }
    board[8][5] = { type: 'gold', owner: 'gote' }
    // 飛車で王手
    board[6][4] = { type: 'rook', owner: 'gote' }
    board[0][0] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    expect(isCheckmate(board, captured, 'sente')).toBe(true)
  })
})

describe('isUchifuzume', () => {
  it('歩を打って相手が詰む場合は打ち歩詰め（true）', () => {
    // 後手の王（row0 col4）が逃げられない状況で先手が歩を打つケース
    const board = emptyBoard()
    board[0][4] = { type: 'king', owner: 'gote' }
    // 逃げ道を塞ぐ
    board[0][3] = { type: 'gold', owner: 'sente' }
    board[0][5] = { type: 'gold', owner: 'sente' }
    board[1][3] = { type: 'gold', owner: 'sente' }
    board[1][5] = { type: 'gold', owner: 'sente' }
    // row1 col4 に歩を打って詰み（打ち歩詰め）
    board[8][4] = { type: 'king', owner: 'sente' }
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    // pos = { row: 1, col: 4 } に歩を打つ
    expect(isUchifuzume(board, 'sente', { row: 1, col: 4 }, captured)).toBe(true)
  })

  it('歩を打っても相手に逃げ道がある場合は打ち歩詰めでない（false）', () => {
    const board = emptyBoard()
    board[0][4] = { type: 'king', owner: 'gote' }
    board[8][4] = { type: 'king', owner: 'sente' }
    // 逃げ道が開いている（側面は空き）
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    expect(isUchifuzume(board, 'sente', { row: 1, col: 4 }, captured)).toBe(false)
  })
})
