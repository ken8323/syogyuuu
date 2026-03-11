import type { Board, CapturedPieces, Player, Position } from './types'
import { getLegalMoves } from './moves'
import { getPieceAt } from './board'

/**
 * 現在の手番プレイヤーが動かせる全駒の位置を返す（hintLevel=1 用）
 */
export function getMovablePieces(
  board: Board,
  capturedPieces: CapturedPieces,
  currentPlayer: Player,
): Position[] {
  const result: Position[] = []
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = getPieceAt(board, { row, col })
      if (!piece || piece.owner !== currentPlayer) continue
      const moves = getLegalMoves(board, { row, col }, capturedPieces, currentPlayer)
      if (moves.length > 0) {
        result.push({ row, col })
      }
    }
  }
  return result
}

/**
 * おすすめ駒と合法手を返す（hintLevel=2 用）
 * 優先度:
 *   1. 相手の駒を取れる手を持つ駒
 *   2. 前方に進める手を持つ駒（先手: row 減少方向、後手: row 増加方向）
 *   3. 最初に見つかった合法手を持つ駒
 */
export function getRecommendedMove(
  board: Board,
  capturedPieces: CapturedPieces,
  currentPlayer: Player,
): { piece: Position; moves: Position[] } | null {
  type Candidate = {
    pos: Position
    moves: Position[]
    hasCapture: boolean
    hasForward: boolean
  }

  const candidates: Candidate[] = []

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = getPieceAt(board, { row, col })
      if (!piece || piece.owner !== currentPlayer) continue

      const moves = getLegalMoves(board, { row, col }, capturedPieces, currentPlayer)
      if (moves.length === 0) continue

      const hasCapture = moves.some((to) => {
        const target = getPieceAt(board, to)
        return target !== null && target.owner !== currentPlayer
      })

      // 前方: 先手は row が減る方向、後手は row が増える方向
      const forwardRow = currentPlayer === 'sente' ? row - 1 : row + 1
      const hasForward = moves.some((to) => to.row === forwardRow)

      candidates.push({ pos: { row, col }, moves, hasCapture, hasForward })
    }
  }

  if (candidates.length === 0) return null

  const best =
    candidates.find((c) => c.hasCapture) ??
    candidates.find((c) => c.hasForward) ??
    candidates[0]

  return { piece: best.pos, moves: best.moves }
}
