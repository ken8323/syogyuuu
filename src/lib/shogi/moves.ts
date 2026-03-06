import type { Board, CapturedPieces, MoveDirection, MovePattern, PieceType, Player, Position, PromotedPieceType } from './types'
import { findKing, getPieceAt, removePieceAt, setPieceAt } from './board'

// ============================================================
// 方向定数（先手基準）
// 先手にとって「前方」= row が減る方向（dRow が負）
// col: 正 = col増加方向（9筋→1筋方向）、負 = col減少方向（1筋→9筋方向）
// ============================================================

const FORWARD: MoveDirection = { dRow: -1, dCol: 0 }
const BACKWARD: MoveDirection = { dRow: +1, dCol: 0 }
// col=0 が9筋（右端）、col=8 が1筋（左端）なので、
// 先手から見て右方向 = col減少（dCol: -1）、左方向 = col増加（dCol: +1）
const RIGHT: MoveDirection = { dRow: 0, dCol: -1 }  // 9筋方向
const LEFT: MoveDirection = { dRow: 0, dCol: +1 }   // 1筋方向
const FORWARD_RIGHT: MoveDirection = { dRow: -1, dCol: -1 }
const FORWARD_LEFT: MoveDirection = { dRow: -1, dCol: +1 }
const BACKWARD_RIGHT: MoveDirection = { dRow: +1, dCol: -1 }
const BACKWARD_LEFT: MoveDirection = { dRow: +1, dCol: +1 }

// ============================================================
// 移動パターン定数
// ============================================================

// 金将・成駒共通の移動パターン（前・左前・右前・左・右・後）
const GOLD_PATTERN: MovePattern = {
  steps: [FORWARD, FORWARD_LEFT, FORWARD_RIGHT, LEFT, RIGHT, BACKWARD],
  slides: [],
}

// 全14駒種の移動パターン（先手基準で定義）
export const MOVE_PATTERNS: Record<PieceType | PromotedPieceType, MovePattern> = {
  // 王将: 全8方向（1マス）
  king: {
    steps: [FORWARD, BACKWARD, LEFT, RIGHT, FORWARD_LEFT, FORWARD_RIGHT, BACKWARD_LEFT, BACKWARD_RIGHT],
    slides: [],
  },

  // 金将: 前・左前・右前・左・右・後（6方向、1マス）
  gold: GOLD_PATTERN,

  // 銀将: 前・左前・右前・左後・右後（5方向、1マス）
  silver: {
    steps: [FORWARD, FORWARD_LEFT, FORWARD_RIGHT, BACKWARD_LEFT, BACKWARD_RIGHT],
    slides: [],
  },

  // 桂馬: 前2段+左右1筋のジャンプ（2方向）
  knight: {
    steps: [
      { dRow: -2, dCol: -1 }, // 左桂
      { dRow: -2, dCol: +1 }, // 右桂
    ],
    slides: [],
  },

  // 歩兵: 前1マス
  pawn: {
    steps: [FORWARD],
    slides: [],
  },

  // 香車: 前方向スライド
  lance: {
    steps: [],
    slides: [FORWARD],
  },

  // 飛車: 前後左右スライド
  rook: {
    steps: [],
    slides: [FORWARD, BACKWARD, LEFT, RIGHT],
  },

  // 角行: 斜め4方向スライド
  bishop: {
    steps: [],
    slides: [FORWARD_LEFT, FORWARD_RIGHT, BACKWARD_LEFT, BACKWARD_RIGHT],
  },

  // 竜王（成飛車）: 斜め4方向1マス + 前後左右スライド
  promoted_rook: {
    steps: [FORWARD_LEFT, FORWARD_RIGHT, BACKWARD_LEFT, BACKWARD_RIGHT],
    slides: [FORWARD, BACKWARD, LEFT, RIGHT],
  },

  // 竜馬（成角行）: 前後左右1マス + 斜め4方向スライド
  promoted_bishop: {
    steps: [FORWARD, BACKWARD, LEFT, RIGHT],
    slides: [FORWARD_LEFT, FORWARD_RIGHT, BACKWARD_LEFT, BACKWARD_RIGHT],
  },

  // 成銀: 金将と同じ
  promoted_silver: GOLD_PATTERN,

  // 成桂: 金将と同じ
  promoted_knight: GOLD_PATTERN,

  // 成香: 金将と同じ
  promoted_lance: GOLD_PATTERN,

  // と金（成歩）: 金将と同じ
  promoted_pawn: GOLD_PATTERN,
}

// ============================================================
// ユーティリティ関数
// ============================================================

// 駒種から移動パターンを取得する
export function getMovePattern(pieceType: PieceType | PromotedPieceType): MovePattern {
  return MOVE_PATTERNS[pieceType]
}

// 後手の場合に dRow・dCol を反転して返す
// 後手の視点では盤面が180度回転しているため、全方向が逆になる
export function applyPlayerDirection(dir: MoveDirection, player: Player): MoveDirection {
  if (player === 'sente') return dir
  return { dRow: -dir.dRow, dCol: -dir.dCol }
}

// ============================================================
// 合法手生成
// ============================================================

// 座標が盤内（0-8）かどうかを判定する
function isInBounds(pos: Position): boolean {
  return pos.row >= 0 && pos.row <= 8 && pos.col >= 0 && pos.col <= 8
}

// 行き所のない駒かどうかを判定する（指定位置に移動すると行き所がなくなるか）
function isNowhereToGo(pieceType: PieceType | PromotedPieceType, player: Player, pos: Position): boolean {
  if (player === 'sente') {
    if ((pieceType === 'pawn' || pieceType === 'lance') && pos.row === 0) return true
    if (pieceType === 'knight' && (pos.row === 0 || pos.row === 1)) return true
  } else {
    if ((pieceType === 'pawn' || pieceType === 'lance') && pos.row === 8) return true
    if (pieceType === 'knight' && (pos.row === 7 || pos.row === 8)) return true
  }
  return false
}

// 指定プレイヤーの王に王手がかかっているか判定する
export function isInCheck(board: Board, player: Player): boolean {
  const kingPos = findKing(board, player)
  if (!kingPos) return false

  const opponent: Player = player === 'sente' ? 'gote' : 'sente'

  // 相手の全駒の移動候補に自玉の位置が含まれるか確認
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (!piece || piece.owner !== opponent) continue

      const candidates = generateMoveCandidates(board, { row, col })
      if (candidates.some(p => p.row === kingPos.row && p.col === kingPos.col)) {
        return true
      }
    }
  }
  return false
}

// 駒の移動パターンから移動候補を生成する（盤外・味方駒・経路チェック済み）
export function generateMoveCandidates(board: Board, pos: Position): Position[] {
  const piece = getPieceAt(board, pos)
  if (!piece) return []

  const pattern = getMovePattern(piece.type)
  const candidates: Position[] = []

  // ステップ移動（1マス）
  for (const dir of pattern.steps) {
    const applied = applyPlayerDirection(dir, piece.owner)
    const target: Position = { row: pos.row + applied.dRow, col: pos.col + applied.dCol }
    if (!isInBounds(target)) continue
    const targetPiece = getPieceAt(board, target)
    if (targetPiece?.owner === piece.owner) continue // 味方駒
    candidates.push(target)
  }

  // スライド移動（何マスでも）
  for (const dir of pattern.slides) {
    const applied = applyPlayerDirection(dir, piece.owner)
    let current: Position = { row: pos.row + applied.dRow, col: pos.col + applied.dCol }
    while (isInBounds(current)) {
      const targetPiece = getPieceAt(board, current)
      if (targetPiece?.owner === piece.owner) break // 味方駒でブロック
      candidates.push(current)
      if (targetPiece) break // 敵駒を取ったら停止
      current = { row: current.row + applied.dRow, col: current.col + applied.dCol }
    }
  }

  return candidates
}

// 盤上の駒の完全な合法手リストを返す
export function getLegalMoves(
  board: Board,
  pos: Position,
  _capturedPieces: CapturedPieces,
  currentPlayer: Player,
): Position[] {
  const piece = getPieceAt(board, pos)
  if (!piece || piece.owner !== currentPlayer) return []

  const candidates = generateMoveCandidates(board, pos)

  return candidates.filter(target => {
    // 行き所のない駒チェック
    if (isNowhereToGo(piece.type, currentPlayer, target)) return false

    // 王手放置チェック: 仮に移動した盤面で自玉に王手がかかるか
    const next = setPieceAt(removePieceAt(board, pos), target, piece)
    if (isInCheck(next, currentPlayer)) return false

    return true
  })
}

// 打ち歩詰め判定用: 指定プレイヤーが脱出できるか（盤上の手 + 持ち駒打ちを確認）
// getLegalDrops の打ち歩詰めチェックから呼ばれるため、
// 持ち駒打ちの判定では打ち歩詰め再チェックを行わず無限ループを防ぐ
function canEscape(board: Board, player: Player, capturedPieces: CapturedPieces): boolean {
  // 盤上の手で脱出できるか
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const piece = board[row][col]
      if (!piece || piece.owner !== player) continue
      if (getLegalMoves(board, { row, col }, capturedPieces, player).length > 0) return true
    }
  }

  // 持ち駒打ちで脱出できるか（打ち歩詰め再チェックは省略）
  const pieceTypes = Object.keys(capturedPieces[player]) as PieceType[]
  const emptyCandidates = generateDropCandidates(board)
  for (const pt of pieceTypes) {
    for (const target of emptyCandidates) {
      if (isNowhereToGo(pt, player, target)) continue
      // 二歩チェック
      if (pt === 'pawn') {
        let nifu = false
        for (let r = 0; r < 9; r++) {
          const p = getPieceAt(board, { row: r, col: target.col })
          if (p?.type === 'pawn' && p.owner === player) { nifu = true; break }
        }
        if (nifu) continue
      }
      // 王手放置チェック
      const next = setPieceAt(board, target, { type: pt, owner: player })
      if (!isInCheck(next, player)) return true
    }
  }
  return false
}

// 持ち駒を打てるマスの候補を生成する（駒がないマスのみ）
export function generateDropCandidates(board: Board): Position[] {
  const candidates: Position[] = []
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (!getPieceAt(board, { row, col })) {
        candidates.push({ row, col })
      }
    }
  }
  return candidates
}

// 持ち駒の合法打ち先リストを返す
export function getLegalDrops(
  board: Board,
  player: Player,
  pieceType: PieceType,
  capturedPieces: CapturedPieces,
): Position[] {
  const opponent: Player = player === 'sente' ? 'gote' : 'sente'
  const candidates = generateDropCandidates(board)

  return candidates.filter(target => {
    // 行き所のない駒チェック
    if (isNowhereToGo(pieceType, player, target)) return false

    // 二歩チェック: 同じ筋に未成の歩がすでにあるか
    if (pieceType === 'pawn') {
      for (let row = 0; row < 9; row++) {
        const p = getPieceAt(board, { row, col: target.col })
        if (p?.type === 'pawn' && p.owner === player) return false
      }
    }

    const droppedPiece = { type: pieceType, owner: player }
    const next = setPieceAt(board, target, droppedPiece)

    // 打ち歩詰めチェック: 歩を打って相手が一切脱出できなくなるか
    // 盤上の手だけでなく持ち駒打ちによる脱出も考慮する
    if (pieceType === 'pawn' && !canEscape(next, opponent, capturedPieces)) return false

    // 王手放置チェック: 打った後に自玉に王手がかかるか
    if (isInCheck(next, player)) return false

    return true
  })
}
