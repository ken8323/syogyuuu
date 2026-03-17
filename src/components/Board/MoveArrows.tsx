'use client'

import type { Piece } from '@/lib/shogi/types'
import { MOVE_PATTERNS } from '@/lib/shogi/moves'

// ── 方向キー（dRow,dCol）→ CSS回転角（0° = 右向き矢印）──────────────
const DIRECTION_ROTATION: Record<string, number> = {
  '-1,-1': 225, // ↖
  '-1,0':  270, // ↑
  '-1,1':  315, // ↗
  '0,-1':  180, // ←
  '0,1':     0, // →
  '1,-1':  135, // ↙
  '1,0':    90, // ↓
  '1,1':    45, // ↘
}

// 3x3グリッドにおける各方向の配置
const DIRECTION_GRID: Record<string, { col: number; row: number }> = {
  '-1,-1': { col: 1, row: 1 },
  '-1,0':  { col: 2, row: 1 },
  '-1,1':  { col: 3, row: 1 },
  '0,-1':  { col: 1, row: 2 },
  '0,1':   { col: 3, row: 2 },
  '1,-1':  { col: 1, row: 3 },
  '1,0':   { col: 2, row: 3 },
  '1,1':   { col: 3, row: 3 },
}

// ── 3Dブロック矢印 SVG（右向きを基準にCSSで回転）──────────────────
function BlockArrow({ rotation }: { rotation: number }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <svg viewBox="0 0 22 18" width="85%" height="85%">
        {/* 奥行きフェイス（暗いティール、下にオフセット） */}
        <polygon
          points="1,10 13,10 13,7 21,13 13,19 13,16 1,16"
          fill="#5A9E9C"
          stroke="#8B2020"
          strokeWidth="0.8"
          strokeLinejoin="round"
        />
        {/* 表面フェイス（明るいミント、上に配置） */}
        <polygon
          points="1,7 13,7 13,4 21,10 13,16 13,13 1,13"
          fill="#C2E8E6"
          stroke="#8B2020"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// ── MoveArrows ────────────────────────────────────────────────────────
interface MoveArrowsProps {
  piece: Piece
}

/**
 * 選択駒の移動可能方向を3Dブロック矢印で示すオーバーレイ。
 * inset: -100% で駒マスを中心に 3×3 マス分の領域を覆う。
 * 後手（gote）は移動方向を全反転して正しい向きで表示する。
 */
export function MoveArrows({ piece }: MoveArrowsProps) {
  const pattern = MOVE_PATTERNS[piece.type]
  const isGote = piece.owner === 'gote'

  // 有効方向セット（後手は dRow・dCol を反転）
  const activeDirections = new Set<string>()
  for (const dir of [...pattern.steps, ...pattern.slides]) {
    let dRow = Math.sign(dir.dRow)
    let dCol = Math.sign(dir.dCol)
    if (dRow === 0 && dCol === 0) continue
    if (isGote) {
      dRow = -dRow
      dCol = -dCol
    }
    activeDirections.add(`${dRow},${dCol}`)
  }

  return (
    <div
      className="pointer-events-none absolute grid grid-cols-3 grid-rows-3 z-10"
      style={{ inset: '-100%' }}
    >
      {Object.entries(DIRECTION_GRID).map(([key, { col, row }]) => {
        const isActive = activeDirections.has(key)
        return (
          <div key={key} style={{ gridColumn: col, gridRow: row }}>
            {isActive && <BlockArrow rotation={DIRECTION_ROTATION[key]} />}
          </div>
        )
      })}
    </div>
  )
}
