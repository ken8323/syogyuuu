import { describe, it, expect } from 'vitest'
import {
  getLegalMoves,
  generateDropCandidates,
  getLegalDrops,
  isInCheck,
} from '../moves'
import {
  createInitialBoard,
  createInitialCapturedPieces,
  addCapturedPiece,
} from '../board'
import type { Board } from '../types'

// 空の盤面を作るヘルパー
function emptyBoard(): Board {
  return Array.from({ length: 9 }, () => Array(9).fill(null))
}

describe('歩兵 (pawn) の移動', () => {
  it('先手の歩は前方1マスに移動できる', () => {
    const board = createInitialBoard()
    const captured = createInitialCapturedPieces()
    // row6 の先手歩から合法手を取得（初期配置では駒がブロックしない）
    const moves = getLegalMoves(board, { row: 6, col: 4 }, captured, 'sente')
    expect(moves).toHaveLength(1)
    expect(moves[0]).toEqual({ row: 5, col: 4 })
  })

  it('先手の歩は後方に移動できない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'pawn', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 前方（row3）のみ。後方（row5）は含まれない
    expect(moves.every(m => m.row < 4)).toBe(true)
    expect(moves.some(m => m.row === 3 && m.col === 4)).toBe(true)
  })

  it('後手の歩は前方（row増加方向）に移動できる', () => {
    const board = emptyBoard()
    board[2][4] = { type: 'pawn', owner: 'gote' }
    board[0][4] = { type: 'king', owner: 'gote' }
    board[8][4] = { type: 'king', owner: 'sente' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 2, col: 4 }, captured, 'gote')
    expect(moves).toHaveLength(1)
    expect(moves[0]).toEqual({ row: 3, col: 4 })
  })
})

describe('香車 (lance) の移動', () => {
  it('先手の香車は前方にスライド移動できる', () => {
    const board = emptyBoard()
    board[6][0] = { type: 'lance', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 6, col: 0 }, captured, 'sente')
    // row5, row4, row3, row2, row1 に移動可能（row0は行き所なし）
    expect(moves.length).toBe(5)
    expect(moves.some(m => m.row === 5 && m.col === 0)).toBe(true)
    expect(moves.some(m => m.row === 1 && m.col === 0)).toBe(true)
  })

  it('先手の香車は途中に味方駒があるとブロックされる', () => {
    const board = emptyBoard()
    board[6][0] = { type: 'lance', owner: 'sente' }
    board[4][0] = { type: 'pawn', owner: 'sente' } // ブロック
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 6, col: 0 }, captured, 'sente')
    // row5 のみ（row4の手前まで）
    expect(moves).toHaveLength(1)
    expect(moves[0]).toEqual({ row: 5, col: 0 })
  })

  it('先手の香車は相手駒は取れるがその先には進めない', () => {
    const board = emptyBoard()
    board[6][0] = { type: 'lance', owner: 'sente' }
    board[4][0] = { type: 'pawn', owner: 'gote' } // 敵駒
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 6, col: 0 }, captured, 'sente')
    // row5, row4（敵駒取り）まで
    expect(moves.some(m => m.row === 4 && m.col === 0)).toBe(true)
    expect(moves.every(m => m.row >= 4)).toBe(true)
  })
})

describe('桂馬 (knight) の移動', () => {
  it('先手の桂馬はL字型にジャンプできる', () => {
    const board = emptyBoard()
    board[8][1] = { type: 'knight', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 8, col: 1 }, captured, 'sente')
    // 桂馬の移動先: { row: 6, col: 0 } と { row: 6, col: 2 }
    expect(moves.length).toBe(2)
    expect(moves.some(m => m.row === 6 && m.col === 0)).toBe(true)
    expect(moves.some(m => m.row === 6 && m.col === 2)).toBe(true)
  })

  it('桂馬は味方駒のマスに移動できない', () => {
    const board = emptyBoard()
    board[8][1] = { type: 'knight', owner: 'sente' }
    board[6][0] = { type: 'pawn', owner: 'sente' } // ブロック
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 8, col: 1 }, captured, 'sente')
    // { row: 6, col: 0 } は味方駒があるので行けない
    expect(moves.some(m => m.row === 6 && m.col === 0)).toBe(false)
    expect(moves.some(m => m.row === 6 && m.col === 2)).toBe(true)
  })
})

describe('銀将 (silver) の移動', () => {
  it('銀将は5方向に移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'silver', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 前・左前・右前・左後・右後 の5方向
    expect(moves).toHaveLength(5)
    expect(moves.some(m => m.row === 3 && m.col === 4)).toBe(true) // 前
    expect(moves.some(m => m.row === 3 && m.col === 3)).toBe(true) // 左前
    expect(moves.some(m => m.row === 3 && m.col === 5)).toBe(true) // 右前
    expect(moves.some(m => m.row === 5 && m.col === 3)).toBe(true) // 左後
    expect(moves.some(m => m.row === 5 && m.col === 5)).toBe(true) // 右後
  })
})

describe('金将 (gold) の移動', () => {
  it('金将は6方向に移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'gold', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 前・左前・右前・左・右・後 の6方向
    expect(moves).toHaveLength(6)
    expect(moves.some(m => m.row === 3 && m.col === 4)).toBe(true) // 前
    expect(moves.some(m => m.row === 3 && m.col === 3)).toBe(true) // 左前
    expect(moves.some(m => m.row === 3 && m.col === 5)).toBe(true) // 右前
    expect(moves.some(m => m.row === 4 && m.col === 3)).toBe(true) // 左
    expect(moves.some(m => m.row === 4 && m.col === 5)).toBe(true) // 右
    expect(moves.some(m => m.row === 5 && m.col === 4)).toBe(true) // 後
  })
})

describe('飛車 (rook) の移動', () => {
  it('飛車は四方向にスライド移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'rook', owner: 'sente' }
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 前後左右それぞれ最大まで（王のいる行・列は王の手前まで）
    expect(moves.some(m => m.row === 3 && m.col === 4)).toBe(true)
    expect(moves.some(m => m.row === 1 && m.col === 4)).toBe(true)
    expect(moves.some(m => m.row === 5 && m.col === 4)).toBe(true)
    expect(moves.some(m => m.row === 4 && m.col === 0)).toBe(true)
    expect(moves.some(m => m.row === 4 && m.col === 8)).toBe(true)
  })

  it('飛車は味方駒でブロックされる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'rook', owner: 'sente' }
    board[4][2] = { type: 'pawn', owner: 'sente' } // 左のブロック
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // col=2 より左（col=1, col=0）には移動できない
    expect(moves.some(m => m.row === 4 && m.col === 1)).toBe(false)
    expect(moves.some(m => m.row === 4 && m.col === 0)).toBe(false)
    // col=3 には移動できる
    expect(moves.some(m => m.row === 4 && m.col === 3)).toBe(true)
  })

  it('飛車は敵駒を取れるがその先には進めない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'rook', owner: 'sente' }
    board[4][2] = { type: 'pawn', owner: 'gote' } // 敵駒
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // col=2 の敵駒は取れる
    expect(moves.some(m => m.row === 4 && m.col === 2)).toBe(true)
    // col=1, col=0 には進めない
    expect(moves.some(m => m.row === 4 && m.col === 1)).toBe(false)
  })
})

describe('角行 (bishop) の移動', () => {
  it('角行は斜め4方向にスライド移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'bishop', owner: 'sente' }
    board[8][0] = { type: 'king', owner: 'sente' }
    board[0][0] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 左前方向
    expect(moves.some(m => m.row === 3 && m.col === 5)).toBe(true)
    // 右前方向
    expect(moves.some(m => m.row === 3 && m.col === 3)).toBe(true)
    // 左後方向
    expect(moves.some(m => m.row === 5 && m.col === 5)).toBe(true)
    // 右後方向
    expect(moves.some(m => m.row === 5 && m.col === 3)).toBe(true)
  })

  it('角行は味方駒でブロックされ敵駒は取れる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'bishop', owner: 'sente' }
    board[2][2] = { type: 'pawn', owner: 'gote' } // 敵駒（右前）
    board[8][0] = { type: 'king', owner: 'sente' }
    board[0][8] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // row2, col2 は取れる
    expect(moves.some(m => m.row === 2 && m.col === 2)).toBe(true)
    // その先（row1, col1）には進めない
    expect(moves.some(m => m.row === 1 && m.col === 1)).toBe(false)
  })
})

describe('竜王 (promoted_rook) の移動', () => {
  it('竜王は前後左右スライド + 斜め1マスに移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'promoted_rook', owner: 'sente' }
    board[8][0] = { type: 'king', owner: 'sente' }
    board[0][0] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // スライド移動（前）
    expect(moves.some(m => m.row === 0 && m.col === 4)).toBe(true)
    // 斜め1マス（右前）
    expect(moves.some(m => m.row === 3 && m.col === 3)).toBe(true)
    // 斜め1マス（左後）
    expect(moves.some(m => m.row === 5 && m.col === 5)).toBe(true)
    // 斜め2マスには進めない
    expect(moves.some(m => m.row === 2 && m.col === 2)).toBe(false)
  })
})

describe('竜馬 (promoted_bishop) の移動', () => {
  it('竜馬は斜めスライド + 前後左右1マスに移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'promoted_bishop', owner: 'sente' }
    board[8][0] = { type: 'king', owner: 'sente' }
    board[0][0] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 斜めスライド（右前）
    expect(moves.some(m => m.row === 1 && m.col === 1)).toBe(true)
    // 前1マス
    expect(moves.some(m => m.row === 3 && m.col === 4)).toBe(true)
    // 後1マス
    expect(moves.some(m => m.row === 5 && m.col === 4)).toBe(true)
    // 前2マスには進めない（1マス限定）
    expect(moves.some(m => m.row === 2 && m.col === 4)).toBe(false)
  })
})

describe('王将 (king) の移動', () => {
  it('王将は8方向に1マスずつ移動できる', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 王手に入らない8方向すべて（この場合、後手の王が遠いので全8方向可能）
    expect(moves).toHaveLength(8)
    expect(moves.some(m => m.row === 3 && m.col === 4)).toBe(true) // 前
    expect(moves.some(m => m.row === 5 && m.col === 4)).toBe(true) // 後
    expect(moves.some(m => m.row === 4 && m.col === 3)).toBe(true) // 左
    expect(moves.some(m => m.row === 4 && m.col === 5)).toBe(true) // 右
    expect(moves.some(m => m.row === 3 && m.col === 3)).toBe(true) // 右前
    expect(moves.some(m => m.row === 3 && m.col === 5)).toBe(true) // 左前
    expect(moves.some(m => m.row === 5 && m.col === 3)).toBe(true) // 右後
    expect(moves.some(m => m.row === 5 && m.col === 5)).toBe(true) // 左後
  })
})

describe('getLegalMoves: 王手放置チェック', () => {
  it('自玉が王手になる手は合法手に含まれない', () => {
    // 先手の王が row8 col4 にいて、飛車が row0 col4 から王手している状況
    // 先手の歩を row4 col4 に置いてブロックした場合
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'rook', owner: 'gote' }
    board[4][4] = { type: 'pawn', owner: 'sente' } // ブロック駒
    board[0][0] = { type: 'king', owner: 'gote' }
    const captured = createInitialCapturedPieces()
    // 歩を横に動かすと王手になる
    const moves = getLegalMoves(board, { row: 4, col: 4 }, captured, 'sente')
    // 前進（row3 col4）はOK（王手が続く場合は除外されるが、ここでは飛車の前に移動するのでNG）
    // 歩の移動可能先: row3 col4 → そこに移動すると col4 のラインが開くので王手放置になる
    expect(moves.some(m => m.col !== 4)).toBe(false) // col4 以外への移動はない
  })
})

describe('generateDropCandidates', () => {
  it('空のマスの位置をすべて返す', () => {
    const board = emptyBoard()
    board[0][0] = { type: 'pawn', owner: 'sente' }
    const candidates = generateDropCandidates(board)
    // 81 - 1 = 80 マス
    expect(candidates).toHaveLength(80)
    expect(candidates.some(p => p.row === 0 && p.col === 0)).toBe(false)
    expect(candidates.some(p => p.row === 0 && p.col === 1)).toBe(true)
  })

  it('すべてのマスが埋まっている場合は空配列を返す', () => {
    const board = emptyBoard()
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        board[row][col] = { type: 'pawn', owner: 'sente' }
      }
    }
    const candidates = generateDropCandidates(board)
    expect(candidates).toHaveLength(0)
  })
})

describe('getLegalDrops: 二歩 (nifu) チェック', () => {
  it('同じ筋に先手の歩がある場合、その筋には歩を打てない', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'pawn', owner: 'sente' } // 先手の歩
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    const drops = getLegalDrops(board, 'sente', 'pawn', captured)
    // col=4 の空マスには打てない
    expect(drops.every(p => p.col !== 4)).toBe(true)
  })

  it('異なる筋には歩を打てる（二歩でない）', () => {
    const board = emptyBoard()
    board[4][4] = { type: 'pawn', owner: 'sente' }
    board[8][0] = { type: 'king', owner: 'sente' }
    board[0][8] = { type: 'king', owner: 'gote' }
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    const drops = getLegalDrops(board, 'sente', 'pawn', captured)
    // col=3 には打てる（行き所なしの行を除く）
    expect(drops.some(p => p.col === 3 && p.row > 0)).toBe(true)
  })
})

describe('getLegalDrops: 行き所のない駒チェック', () => {
  it('先手の歩は row0 に打てない', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'pawn')
    const drops = getLegalDrops(board, 'sente', 'pawn', captured)
    expect(drops.every(p => p.row !== 0)).toBe(true)
  })

  it('先手の香車は row0 に打てない', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'lance')
    const drops = getLegalDrops(board, 'sente', 'lance', captured)
    expect(drops.every(p => p.row !== 0)).toBe(true)
  })

  it('先手の桂馬は row0 と row1 に打てない', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'king', owner: 'gote' }
    const captured = addCapturedPiece(createInitialCapturedPieces(), 'sente', 'knight')
    const drops = getLegalDrops(board, 'sente', 'knight', captured)
    expect(drops.every(p => p.row !== 0 && p.row !== 1)).toBe(true)
  })
})

describe('isInCheck', () => {
  it('飛車による王手を検出する', () => {
    const board = emptyBoard()
    board[8][4] = { type: 'king', owner: 'sente' }
    board[0][4] = { type: 'rook', owner: 'gote' }
    board[0][0] = { type: 'king', owner: 'gote' }
    expect(isInCheck(board, 'sente')).toBe(true)
  })

  it('王手がかかっていない場合は false を返す', () => {
    const board = createInitialBoard()
    expect(isInCheck(board, 'sente')).toBe(false)
    expect(isInCheck(board, 'gote')).toBe(false)
  })
})
