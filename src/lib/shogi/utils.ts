import type { Position, Player } from './types'

// 内部座標 (0-indexed) → 将棋表記（筋: 1-9, 段: 1-9）
export function toSujiDan(pos: Position): { suji: number; dan: number } {
  return { suji: 9 - pos.col, dan: pos.row + 1 }
}

// 将棋表記（筋: 1-9, 段: 1-9）→ 内部座標 (0-indexed)
export function fromSujiDan(suji: number, dan: number): Position {
  return { col: 9 - suji, row: dan - 1 }
}

// 表示用座標変換（手番に応じて描画座標を反転）
// 先手の手番時: そのまま描画
// 後手の手番時: row・col を両方反転して描画（盤面が180度回転した視点）
export function toDisplayPosition(pos: Position, currentPlayer: Player): Position {
  if (currentPlayer === 'sente') return pos
  return { col: 8 - pos.col, row: 8 - pos.row }
}
