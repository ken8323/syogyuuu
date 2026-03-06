// ============================================================
// 駒の型定義
// ============================================================

export type PieceType =
  | 'king'
  | 'rook'
  | 'bishop'
  | 'gold'
  | 'silver'
  | 'knight'
  | 'lance'
  | 'pawn'

export type PromotedPieceType =
  | 'promoted_rook'
  | 'promoted_bishop'
  | 'promoted_silver'
  | 'promoted_knight'
  | 'promoted_lance'
  | 'promoted_pawn'

export type Player = 'sente' | 'gote'

export interface Piece {
  type: PieceType | PromotedPieceType
  owner: Player
}

// ============================================================
// 盤面の型定義
// ============================================================

// 内部では全て 0-indexed で管理する
// row: 0-8（0=一段目/後手陣最奥、8=九段目/先手陣最奥）
// col: 0-8（0=9筋/右端、8=1筋/左端）
export interface Position {
  col: number
  row: number
}

// 9x9 の2次元配列。null は駒なし
// board[row][col] で参照（全て 0-indexed）
export type Board = (Piece | null)[][]

export interface CapturedPieces {
  sente: Partial<Record<PieceType, number>>
  gote: Partial<Record<PieceType, number>>
}

// ============================================================
// 手（Move）の型定義
// ============================================================

export interface BoardMove {
  type: 'move'
  from: Position
  to: Position
  piece: Piece
  captured: Piece | null
  promoted: boolean
}

export interface DropMove {
  type: 'drop'
  to: Position
  piece: Piece
}

export type Move = BoardMove | DropMove

// ============================================================
// ゲーム状態の型定義
// ============================================================

export type GamePhase =
  | 'idle'
  | 'piece_selected'
  | 'captured_selected'
  | 'moving'
  | 'promotion_check'
  | 'turn_switching'
  | 'check_notify'
  | 'checkmate'

export interface MoveHistory {
  moves: Move[]
  currentIndex: number
}

export interface GameState {
  board: Board
  capturedPieces: CapturedPieces
  currentPlayer: Player
  phase: GamePhase
  selectedPosition: Position | null
  selectedCaptured: PieceType | null
  legalMoves: Position[]
  moveHistory: MoveHistory
  isCheck: boolean
  winner: Player | null
}

export interface UIState {
  isMenuOpen: boolean
  isAnimating: boolean
}

// ============================================================
// 駒の移動ルール定義
// ============================================================

// 相対的な移動方向（先手基準で定義）
// 先手にとって「前方」= row が減る方向（dRow が負）
// 後手の場合は dRow, dCol を両方反転して適用する
export interface MoveDirection {
  dCol: number
  dRow: number
}

export interface MovePattern {
  steps: MoveDirection[]
  slides: MoveDirection[]
}

// ============================================================
// 初期盤面配置
// ============================================================

// board[row][col] (0-indexed)
// row=0 が一段目（後手陣）、row=8 が九段目（先手陣）
// col=0 が9筋、col=8 が1筋
export const INITIAL_BOARD: Board = [
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
