import type { MoveDirection, MovePattern, PieceType, Player, PromotedPieceType } from './types'

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
