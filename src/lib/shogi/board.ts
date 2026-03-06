import type { Board, CapturedPieces, Piece, PieceType, Player, Position } from './types'

// ============================================================
// 初期盤面配置
// ============================================================

// board[row][col] (0-indexed)
// row=0 が一段目（後手陣）、row=8 が九段目（先手陣）
// col=0 が9筋、col=8 が1筋
//
// export せず、createInitialBoard() 経由で毎回独立したコピーを返す。
// 直接エクスポートすると呼び出し側が参照を共有してしまい、
// 盤面データが汚染されるリスクがある。
const INITIAL_BOARD_DATA: Board = [
  // 一段目（後手）
  [
    { type: 'lance', owner: 'gote' },
    { type: 'knight', owner: 'gote' },
    { type: 'silver', owner: 'gote' },
    { type: 'gold', owner: 'gote' },
    { type: 'king', owner: 'gote' },
    { type: 'gold', owner: 'gote' },
    { type: 'silver', owner: 'gote' },
    { type: 'knight', owner: 'gote' },
    { type: 'lance', owner: 'gote' },
  ],
  // 二段目（後手）
  [
    null,
    { type: 'rook', owner: 'gote' },
    null,
    null,
    null,
    null,
    null,
    { type: 'bishop', owner: 'gote' },
    null,
  ],
  // 三段目（後手の歩）
  Array.from({ length: 9 }, () => ({ type: 'pawn' as const, owner: 'gote' as const })),
  // 四段目（空）
  Array(9).fill(null) as null[],
  // 五段目（空）
  Array(9).fill(null) as null[],
  // 六段目（空）
  Array(9).fill(null) as null[],
  // 七段目（先手の歩）
  Array.from({ length: 9 }, () => ({ type: 'pawn' as const, owner: 'sente' as const })),
  // 八段目（先手）
  [
    null,
    { type: 'bishop', owner: 'sente' },
    null,
    null,
    null,
    null,
    null,
    { type: 'rook', owner: 'sente' },
    null,
  ],
  // 九段目（先手）
  [
    { type: 'lance', owner: 'sente' },
    { type: 'knight', owner: 'sente' },
    { type: 'silver', owner: 'sente' },
    { type: 'gold', owner: 'sente' },
    { type: 'king', owner: 'sente' },
    { type: 'gold', owner: 'sente' },
    { type: 'silver', owner: 'sente' },
    { type: 'knight', owner: 'sente' },
    { type: 'lance', owner: 'sente' },
  ],
]

// 毎回ディープコピーを返すことで、呼び出し側が盤面データを汚染しない
export function createInitialBoard(): Board {
  return structuredClone(INITIAL_BOARD_DATA)
}

// ============================================================
// 盤面ユーティリティ
// ============================================================

// 盤面のディープコピーを返す
export function cloneBoard(board: Board): Board {
  return structuredClone(board)
}

// 指定位置の駒を取得する（範囲外の場合は null）
export function getPieceAt(board: Board, pos: Position): Piece | null {
  return board[pos.row]?.[pos.col] ?? null
}

// 指定位置に駒を配置した新しい盤面を返す（イミュータブル）
export function setPieceAt(board: Board, pos: Position, piece: Piece): Board {
  const next = cloneBoard(board)
  next[pos.row][pos.col] = piece
  return next
}

// 指定位置の駒を除去した新しい盤面を返す（イミュータブル）
export function removePieceAt(board: Board, pos: Position): Board {
  const next = cloneBoard(board)
  next[pos.row][pos.col] = null
  return next
}

// 指定プレイヤーの王の位置を返す（見つからなければ null）
export function findKing(board: Board, player: Player): Position | null {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (piece?.type === 'king' && piece.owner === player) {
        return { row, col }
      }
    }
  }
  return null
}

// ============================================================
// 持ち駒ユーティリティ
// ============================================================

// 空の持ち駒を生成する
export function createInitialCapturedPieces(): CapturedPieces {
  return { sente: {}, gote: {} }
}

// 持ち駒に駒を1枚追加した新しい持ち駒を返す（イミュータブル）
export function addCapturedPiece(
  captured: CapturedPieces,
  player: Player,
  pieceType: PieceType,
): CapturedPieces {
  const current = captured[player][pieceType] ?? 0
  return {
    ...captured,
    [player]: { ...captured[player], [pieceType]: current + 1 },
  }
}

// 持ち駒から駒を1枚使用した新しい持ち駒を返す（イミュータブル）
// 前提条件: captured[player][pieceType] >= 1 であること
// 合法手判定で持ち駒の存在チェックを経てから呼ぶこと
export function consumeCapturedPiece(
  captured: CapturedPieces,
  player: Player,
  pieceType: PieceType,
): CapturedPieces {
  const current = captured[player][pieceType] ?? 0
  const next = { ...captured, [player]: { ...captured[player] } }
  if (current <= 1) {
    delete next[player][pieceType]
  } else {
    next[player][pieceType] = current - 1
  }
  return next
}
