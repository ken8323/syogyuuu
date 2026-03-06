import { describe, it, expect } from 'vitest'
import {
  createInitialBoard,
  cloneBoard,
  getPieceAt,
  setPieceAt,
  removePieceAt,
  findKing,
  addCapturedPiece,
  consumeCapturedPiece,
  createInitialCapturedPieces,
} from '../board'

describe('createInitialBoard', () => {
  it('row0 col4 は後手の王将', () => {
    const board = createInitialBoard()
    const piece = board[0][4]
    expect(piece).not.toBeNull()
    expect(piece?.type).toBe('king')
    expect(piece?.owner).toBe('gote')
  })

  it('row8 col4 は先手の王将', () => {
    const board = createInitialBoard()
    const piece = board[8][4]
    expect(piece).not.toBeNull()
    expect(piece?.type).toBe('king')
    expect(piece?.owner).toBe('sente')
  })

  it('row6 の全マスが先手の歩兵', () => {
    const board = createInitialBoard()
    for (let col = 0; col < 9; col++) {
      const piece = board[6][col]
      expect(piece).not.toBeNull()
      expect(piece?.type).toBe('pawn')
      expect(piece?.owner).toBe('sente')
    }
  })

  it('row2 の全マスが後手の歩兵', () => {
    const board = createInitialBoard()
    for (let col = 0; col < 9; col++) {
      const piece = board[2][col]
      expect(piece).not.toBeNull()
      expect(piece?.type).toBe('pawn')
      expect(piece?.owner).toBe('gote')
    }
  })

  it('呼び出しごとに独立したコピーを返す（変更が他方に影響しない）', () => {
    const board1 = createInitialBoard()
    const board2 = createInitialBoard()
    board1[0][0] = null
    expect(board2[0][0]).not.toBeNull()
    expect(board2[0][0]?.type).toBe('lance')
  })

  it('row3〜row5（四〜六段目）はすべて null', () => {
    const board = createInitialBoard()
    for (let row = 3; row <= 5; row++) {
      for (let col = 0; col < 9; col++) {
        expect(board[row][col]).toBeNull()
      }
    }
  })

  it('後手の飛車は row1 col1 にある', () => {
    const board = createInitialBoard()
    const piece = board[1][1]
    expect(piece?.type).toBe('rook')
    expect(piece?.owner).toBe('gote')
  })

  it('先手の角行は row7 col1 にある', () => {
    const board = createInitialBoard()
    const piece = board[7][1]
    expect(piece?.type).toBe('bishop')
    expect(piece?.owner).toBe('sente')
  })
})

describe('cloneBoard', () => {
  it('クローンは元のボードと同じ内容を持つ', () => {
    const board = createInitialBoard()
    const cloned = cloneBoard(board)
    expect(cloned[0][4]?.type).toBe('king')
    expect(cloned[0][4]?.owner).toBe('gote')
  })

  it('クローンへの変更が元に影響しない', () => {
    const board = createInitialBoard()
    const cloned = cloneBoard(board)
    cloned[0][0] = null
    expect(board[0][0]).not.toBeNull()
    expect(board[0][0]?.type).toBe('lance')
  })

  it('元への変更がクローンに影響しない', () => {
    const board = createInitialBoard()
    const cloned = cloneBoard(board)
    board[8][4] = null
    expect(cloned[8][4]).not.toBeNull()
    expect(cloned[8][4]?.type).toBe('king')
  })
})

describe('getPieceAt', () => {
  it('存在する駒の情報を返す', () => {
    const board = createInitialBoard()
    const piece = getPieceAt(board, { row: 0, col: 4 })
    expect(piece?.type).toBe('king')
    expect(piece?.owner).toBe('gote')
  })

  it('空マスは null を返す', () => {
    const board = createInitialBoard()
    const piece = getPieceAt(board, { row: 4, col: 4 })
    expect(piece).toBeNull()
  })

  it('盤外（row < 0）は null を返す', () => {
    const board = createInitialBoard()
    const piece = getPieceAt(board, { row: -1, col: 0 })
    expect(piece).toBeNull()
  })

  it('盤外（col > 8）は null を返す', () => {
    const board = createInitialBoard()
    const piece = getPieceAt(board, { row: 0, col: 9 })
    expect(piece).toBeNull()
  })
})

describe('setPieceAt', () => {
  it('新しい盤面に指定した駒が配置される', () => {
    const board = createInitialBoard()
    const newPiece = { type: 'gold' as const, owner: 'sente' as const }
    const next = setPieceAt(board, { row: 4, col: 4 }, newPiece)
    expect(next[4][4]?.type).toBe('gold')
    expect(next[4][4]?.owner).toBe('sente')
  })

  it('元の盤面は変更されない（イミュータブル）', () => {
    const board = createInitialBoard()
    const newPiece = { type: 'gold' as const, owner: 'sente' as const }
    setPieceAt(board, { row: 4, col: 4 }, newPiece)
    expect(board[4][4]).toBeNull()
  })
})

describe('removePieceAt', () => {
  it('指定した位置の駒が除去された新しい盤面を返す', () => {
    const board = createInitialBoard()
    const next = removePieceAt(board, { row: 0, col: 4 })
    expect(next[0][4]).toBeNull()
  })

  it('元の盤面は変更されない（イミュータブル）', () => {
    const board = createInitialBoard()
    removePieceAt(board, { row: 0, col: 4 })
    expect(board[0][4]?.type).toBe('king')
    expect(board[0][4]?.owner).toBe('gote')
  })
})

describe('findKing', () => {
  it('先手の王の位置を正しく返す', () => {
    const board = createInitialBoard()
    const pos = findKing(board, 'sente')
    expect(pos).toEqual({ row: 8, col: 4 })
  })

  it('後手の王の位置を正しく返す', () => {
    const board = createInitialBoard()
    const pos = findKing(board, 'gote')
    expect(pos).toEqual({ row: 0, col: 4 })
  })

  it('王がいない盤面では null を返す', () => {
    const board = createInitialBoard()
    // 先手の王を除去
    board[8][4] = null
    const pos = findKing(board, 'sente')
    expect(pos).toBeNull()
  })
})

describe('createInitialCapturedPieces', () => {
  it('先手・後手ともに空のオブジェクトを返す', () => {
    const captured = createInitialCapturedPieces()
    expect(captured.sente).toEqual({})
    expect(captured.gote).toEqual({})
  })
})

describe('addCapturedPiece', () => {
  it('持ち駒に最初の1枚を追加すると count が 1 になる', () => {
    const captured = createInitialCapturedPieces()
    const next = addCapturedPiece(captured, 'sente', 'pawn')
    expect(next.sente.pawn).toBe(1)
  })

  it('既に持ち駒がある場合は count が加算される', () => {
    const captured = createInitialCapturedPieces()
    const after1 = addCapturedPiece(captured, 'sente', 'pawn')
    const after2 = addCapturedPiece(after1, 'sente', 'pawn')
    expect(after2.sente.pawn).toBe(2)
  })

  it('元の持ち駒は変更されない（イミュータブル）', () => {
    const captured = createInitialCapturedPieces()
    addCapturedPiece(captured, 'sente', 'pawn')
    expect(captured.sente.pawn).toBeUndefined()
  })

  it('後手の持ち駒も正しく追加される', () => {
    const captured = createInitialCapturedPieces()
    const next = addCapturedPiece(captured, 'gote', 'rook')
    expect(next.gote.rook).toBe(1)
    expect(next.sente.rook).toBeUndefined()
  })
})

describe('consumeCapturedPiece', () => {
  it('count が 2 から 1 に減る', () => {
    const captured = createInitialCapturedPieces()
    const added = addCapturedPiece(addCapturedPiece(captured, 'sente', 'pawn'), 'sente', 'pawn')
    const consumed = consumeCapturedPiece(added, 'sente', 'pawn')
    expect(consumed.sente.pawn).toBe(1)
  })

  it('count が 1 のときに消費するとキーが削除される', () => {
    const captured = createInitialCapturedPieces()
    const added = addCapturedPiece(captured, 'sente', 'pawn')
    const consumed = consumeCapturedPiece(added, 'sente', 'pawn')
    expect(consumed.sente.pawn).toBeUndefined()
  })

  it('元の持ち駒は変更されない（イミュータブル）', () => {
    const captured = createInitialCapturedPieces()
    const added = addCapturedPiece(captured, 'sente', 'pawn')
    consumeCapturedPiece(added, 'sente', 'pawn')
    expect(added.sente.pawn).toBe(1)
  })
})
