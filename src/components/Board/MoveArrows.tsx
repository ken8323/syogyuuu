'use client'

import type { Piece } from '@/lib/shogi/types'
import { MOVE_PATTERNS } from '@/lib/shogi/moves'

// (dRow, dCol) → 3x3グリッドの位置とユニコード矢印のマッピング
// dRow/dColは正規化（Math.sign）済みで扱う
const GRID_ARROWS = [
  { dRow: -1, dCol: -1, gridCol: 1, gridRow: 1, arrow: '↖' },
  { dRow: -1, dCol:  0, gridCol: 2, gridRow: 1, arrow: '↑' },
  { dRow: -1, dCol: +1, gridCol: 3, gridRow: 1, arrow: '↗' },
  { dRow:  0, dCol: -1, gridCol: 1, gridRow: 2, arrow: '←' },
  // (2,2) = 中央 = 駒の位置
  { dRow:  0, dCol: +1, gridCol: 3, gridRow: 2, arrow: '→' },
  { dRow: +1, dCol: -1, gridCol: 1, gridRow: 3, arrow: '↙' },
  { dRow: +1, dCol:  0, gridCol: 2, gridRow: 3, arrow: '↓' },
  { dRow: +1, dCol: +1, gridCol: 3, gridRow: 3, arrow: '↘' },
] as const

interface MoveArrowsProps {
  piece: Piece
}

/**
 * 選択駒の移動可能方向を矢印で示すオーバーレイ。
 * Square の absolute inset-0 に配置する想定。
 *
 * 桂馬の跳び（dRow=-2）は Math.sign で正規化して ↖/↗ として表示する。
 * 正確な到達マスは合法手ハイライト（緑丸）で補完するため、
 * 矢印は「大まかな方向」を示す程度で許容。
 */
export function MoveArrows({ piece }: MoveArrowsProps) {
  const pattern = MOVE_PATTERNS[piece.type]

  // 全方向（steps + slides）を正規化して方向セットを構築
  const activeDirections = new Set<string>()
  for (const dir of [...pattern.steps, ...pattern.slides]) {
    const dRow = Math.sign(dir.dRow)
    const dCol = Math.sign(dir.dCol)
    if (dRow === 0 && dCol === 0) continue
    activeDirections.add(`${dRow},${dCol}`)
  }

  return (
    <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
      {GRID_ARROWS.map(({ dRow, dCol, gridCol, gridRow, arrow }) => {
        const isActive = activeDirections.has(`${dRow},${dCol}`)
        return (
          <div
            key={`${dRow},${dCol}`}
            style={{ gridColumn: gridCol, gridRow: gridRow }}
            className={[
              'flex items-center justify-center text-[0.55rem] font-black leading-none',
              isActive ? 'text-yellow-500 opacity-90' : 'opacity-0',
            ].join(' ')}
          >
            {arrow}
          </div>
        )
      })}
    </div>
  )
}
