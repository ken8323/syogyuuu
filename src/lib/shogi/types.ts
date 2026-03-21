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
  | 'promoting'
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
  gameOverReason: 'checkmate' | 'resign' | null
}

export interface AnimatingMoveInfo {
  piece: Piece
  from: Position | null  // null = 持ち駒打ち
  to: Position
  captured: Piece | null
  pendingPhase: 'idle' | 'turn_switching' | 'promotion_check'
  promote: boolean
  isForcedPromote: boolean
  undoRedo?: 'undo' | 'redo'
}

export interface PromotingInfo {
  position: Position
  pieceType: PieceType
  isForcedPromote: boolean
}

export interface UIState {
  isMenuOpen: boolean
  isAnimating: boolean
  /** 強制成りトースト通知用（表示後に clearForcedPromotion() で null に戻す） */
  forcedPromotionPiece: PieceType | null
  /** 効果音ミュート */
  isMuted: boolean
  /** 移動アニメーション中の情報（null = アニメーションなし） */
  animatingMove: AnimatingMoveInfo | null
  /** 成りアニメーション中の情報（null = アニメーションなし） */
  promotingInfo: PromotingInfo | null
  /** ヒントレベル（0=なし, 1=脈動のみ, 2=脈動+合法手表示） */
  hintLevel: 0 | 1 | 2
  /** ヒント対象の駒の位置（hintLevel>=1 で使用） */
  hintPieces: Position[]
  /** おすすめ手の合法手（hintLevel=2 で使用） */
  hintMoves: Position[]
  /** 現在表示中のほめメッセージ（null = 非表示） */
  praiseMessage: string | null
  /** 対局内で初めて駒を取ったか */
  hasFirstCapture: boolean
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

