import type { Board, CapturedPieces, Piece, PieceType, Player, Position, PromotedPieceType } from './types'
import { findKing, getPieceAt, setPieceAt } from './board'
import { generateMoveCandidates, getLegalDrops, getLegalMoves, isInCheck } from './moves'

// ============================================================
// 禁手チェック
// ============================================================

// 二歩判定: 指定の筋に同じプレイヤーの未成の歩が既にあるか
export function isNifu(board: Board, player: Player, col: number): boolean {
  for (let row = 0; row < 9; row++) {
    const piece = getPieceAt(board, { row, col })
    if (piece?.type === 'pawn' && piece.owner === player) return true
  }
  return false
}

// 行き所のない駒判定: 指定位置に移動すると行き所がなくなるか
export function hasNoEscape(
  pieceType: PieceType | PromotedPieceType,
  player: Player,
  pos: Position,
): boolean {
  if (player === 'sente') {
    if ((pieceType === 'pawn' || pieceType === 'lance') && pos.row === 0) return true
    if (pieceType === 'knight' && (pos.row === 0 || pos.row === 1)) return true
  } else {
    if ((pieceType === 'pawn' || pieceType === 'lance') && pos.row === 8) return true
    if (pieceType === 'knight' && (pos.row === 7 || pos.row === 8)) return true
  }
  return false
}

// 打ち歩詰め判定: pos に歩を打った結果、相手が詰みになるか（持ち駒打ち含む脱出手を確認）
export function isUchifuzume(
  board: Board,
  player: Player,
  pos: Position,
  capturedPieces: CapturedPieces,
): boolean {
  const opponent: Player = player === 'sente' ? 'gote' : 'sente'
  // pos に歩を配置した仮盤面で相手が詰みかどうかを判定する
  const next = setPieceAt(board, pos, { type: 'pawn', owner: player })
  return isCheckmate(next, capturedPieces, opponent)
}

// ============================================================
// 王手・詰み判定
// ============================================================

// re-export: isInCheck は moves.ts で実装済み
export { isInCheck }

// 王手をかけている相手駒のリストを返す
export function getCheckingPieces(board: Board, player: Player): Position[] {
  const kingPos = findKing(board, player)
  if (!kingPos) return []

  const opponent: Player = player === 'sente' ? 'gote' : 'sente'
  const checking: Position[] = []

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (!piece || piece.owner !== opponent) continue
      const candidates = generateMoveCandidates(board, { row, col })
      if (candidates.some(p => p.row === kingPos.row && p.col === kingPos.col)) {
        checking.push({ row, col })
      }
    }
  }
  return checking
}

// 詰み判定: 合法手（盤上 + 持ち駒打ち）が1つもないか
export function isCheckmate(
  board: Board,
  capturedPieces: CapturedPieces,
  player: Player,
): boolean {
  // 盤上の手を確認
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (!piece || piece.owner !== player) continue
      if (getLegalMoves(board, { row, col }, capturedPieces, player).length > 0) return false
    }
  }
  // 持ち駒打ちを確認
  const pieceTypes = Object.keys(capturedPieces[player]) as PieceType[]
  for (const pt of pieceTypes) {
    if (getLegalDrops(board, player, pt, capturedPieces).length > 0) return false
  }
  return true
}

// ============================================================
// 成り判定
// ============================================================

// 敵陣かどうかを判定する
function isEnemyTerritory(player: Player, row: number): boolean {
  return player === 'sente' ? row <= 2 : row >= 6
}

// 成り可能か判定する
// 条件: 金将・王将でない、既に成っていない、移動元か移動先が敵陣
export function canPromote(piece: Piece, from: Position, to: Position): boolean {
  const { type, owner } = piece
  if (type === 'gold' || type === 'king') return false
  if (type.startsWith('promoted_')) return false
  return isEnemyTerritory(owner, from.row) || isEnemyTerritory(owner, to.row)
}

// 強制成りか判定する（成らないと行き所がなくなる）
export function mustPromote(piece: Piece, to: Position): boolean {
  const { type, owner } = piece
  if (owner === 'sente') {
    if ((type === 'pawn' || type === 'lance') && to.row === 0) return true
    if (type === 'knight' && to.row <= 1) return true
  } else {
    if ((type === 'pawn' || type === 'lance') && to.row === 8) return true
    if (type === 'knight' && to.row >= 7) return true
  }
  return false
}

// 駒種から成った後の駒種を返す（成れない駒は null）
export function getPromotedType(pieceType: PieceType): PromotedPieceType | null {
  const map: Partial<Record<PieceType, PromotedPieceType>> = {
    pawn: 'promoted_pawn',
    lance: 'promoted_lance',
    knight: 'promoted_knight',
    silver: 'promoted_silver',
    bishop: 'promoted_bishop',
    rook: 'promoted_rook',
  }
  return map[pieceType] ?? null
}

// 成駒から元の駒種を返す（持ち駒化用）
export function getDemotedType(pieceType: PromotedPieceType): PieceType {
  const map: Record<PromotedPieceType, PieceType> = {
    promoted_pawn: 'pawn',
    promoted_lance: 'lance',
    promoted_knight: 'knight',
    promoted_silver: 'silver',
    promoted_bishop: 'bishop',
    promoted_rook: 'rook',
  }
  return map[pieceType]
}
